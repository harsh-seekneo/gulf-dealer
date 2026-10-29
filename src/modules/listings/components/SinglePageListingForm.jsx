import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBulkVehicleWizard } from "../context/BulkVehicleWizardContext";
import { ListingSectionContext, SinglePageListingContext, useSinglePageListing } from "../context/SinglePageListingContext";
import { useToast } from "../../../context/ToastContext";
import { submitSingleBulkListingApi, saveDealerDraftInputsApi } from "../api/bulkListingApi";
import { clearListingFormState } from "../hooks/useListingFormState";
import SelectionFlowProvider from "./formFields/SelectionFlowProvider";
import "./singlePageListing.css";
import Step1Category from "./steps/Step1Category";
import Step2ListingType from "./steps/Step2ListingType";
import Step4VehicleInfo from "./steps/Step4VehicleInfo";
import Step5Specs from "./steps/Step5Specs";
import Step6Features from "./steps/Step6Features";
import Step7Media from "./steps/Step7Media";
import Step8Location from "./steps/Step8Location";
import Step9Pricing from "./steps/Step9Pricing";

const useFormWizard = () => {
  const wizard = useBulkVehicleWizard();
  const page = useSinglePageListing();
  return {
    ...wizard,
    singlePage: true,
    saveCategory: (category) => wizard.selectCategory(category),
    isSaving: wizard.isSaving || page.busy,
    saveStep: page.collectStep,
    saveMedia: page.saveMedia,
  };
};

const Section = ({ step, register, children }) => {
  const value = useMemo(() => ({ register: (callback) => register(step, callback) }), [register, step]);
  return <ListingSectionContext.Provider value={value}>
    <section id={`listing-section-${step}`} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">{children}</section>
  </ListingSectionContext.Provider>;
};

const SinglePageListingForm = () => {
  const wizard = useBulkVehicleWizard();
  const { showToast } = useToast();
  const callbacks = useRef(new Map());
  const payloads = useRef(new Map());
  const formInputs = useRef({});
  const busyRef = useRef(false);
  const savedPayloads = useRef(new Map());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(null);
  const categoryId = wizard.listing?.category?._id || wizard.listing?.category || "";
  const isPlate = wizard.listingFormType === "SPECIAL_NUMBER";
  const register = useCallback((step, callback) => {
    callbacks.current.set(step, callback);
    return () => callbacks.current.delete(step);
  }, []);
  const collectStep = useCallback(async (step, payload) => {
    payloads.current.set(step, payload);
    return wizard.listing;
  }, [wizard.listing]);
  const { saveMedia: persistMedia } = wizard;
  const saveMedia = useCallback((data) => persistMedia(data, { advance: false }), [persistMedia]);

  const save = async (publish) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    payloads.current.clear();
    const steps = [1, 2, 4, ...(!isPlate ? [5] : []), 6, 8, 9];
    try {
      // Validate everything before uploads or submission. Each section still uses
      // its original validator; an invalid section never produces a payload.
      let firstInvalid;
      for (const step of steps) {
        await callbacks.current.get(step)?.({ validateOnly: true, draft: !publish });
        if (!payloads.current.has(step)) { firstInvalid ??= step; if (publish) break; }
      }
      if (publish && firstInvalid) {
        document.getElementById(`listing-section-${firstInvalid}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setMessage("Please complete the highlighted details before publishing.");
        return;
      }
      const mediaValid = await callbacks.current.get(7)?.({ validateOnly: true, draft: !publish });
      if (publish && !mediaValid) {
        document.getElementById("listing-section-7")?.scrollIntoView({ behavior: "smooth", block: "start" });
        setMessage("Please add the required media before publishing.");
        return;
      }
      if (!publish && wizard.listing.status === "DRAFT") {
        const persisted = await wizard.ensureListing();
        await saveDealerDraftInputsApi(persisted._id, { categoryId, fields: formInputs.current });
      }
      for (const step of steps) {
        if (!payloads.current.has(step)) continue;
        const payload = payloads.current.get(step);
        const signature = JSON.stringify([categoryId, payload]);
        if (savedPayloads.current.get(step) === signature) continue;
        await wizard.saveStep(step, payload, { advance: false });
        savedPayloads.current.set(step, signature);
      }
      if (mediaValid) {
        const mediaSaved = await callbacks.current.get(7)?.({ draft: !publish });
        if (!mediaSaved) { setMessage("Media could not be saved. Your other details are saved; please retry."); return; }
      }
      if (!publish) {
        wizard.markDraftSaved();
        setMessage(firstInvalid || !mediaValid ? "Draft saved, including incomplete details. Complete the highlighted fields before publishing." : "Draft saved. You can continue from My Listings.");
        showToast("Draft saved", "success");
        return;
      }
      if (wizard.listing.status !== "DRAFT") {
        setMessage("Listing changes saved.");
        showToast("Listing changes saved", "success");
        return;
      }
      const persisted = await wizard.ensureListing();
      const result = await submitSingleBulkListingApi(persisted._id);
      clearListingFormState(persisted._id);
      setCompleted(result);
      showToast(result.status === "PUBLISHED" ? "Your listing is live" : "Listing submitted for review", "success");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Unable to save. Please retry.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (wizard.isInitializing) return <div className="flex min-h-64 items-center justify-center gap-3"><Loader2 className="animate-spin" />Loading vehicle…</div>;
  if (wizard.initError) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6"><p>{wizard.initError}</p><Link className="mt-4 inline-block underline" to="/vehicles">Back to Listings</Link></div>;
  if (completed) return <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
    <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600" />
    <h1 className="mt-4 text-2xl font-bold">{completed.status === "PUBLISHED" ? "Your listing is live!" : "Listing submitted"}</h1>
    <p className="mt-2 text-slate-600">{completed.status === "PUBLISHED" ? "Your vehicle has been published successfully." : "Your listing has been submitted for admin review."}</p>
    <div className="mt-6 flex flex-wrap justify-center gap-3"><Link className="rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white" to={`/vehicles/${completed._id}`}>View Listing</Link><Link className="rounded-lg border px-4 py-3" to="/vehicles">My Listings</Link></div>
  </div>;

  const page = { busy, collectStep, saveMedia, formInputs,
    initialInputs: String(wizard.listing.savedDraftInputs?.categoryId) === String(categoryId) ? wizard.listing.savedDraftInputs.fields : {},
  };
  return <SinglePageListingContext.Provider value={page}>
    <SelectionFlowProvider>
      <div className="dealer-listing-compact w-full min-w-0 max-w-none space-y-4 pb-6" data-wizard-scroll-area>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Link to="/vehicles" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} />My Listings</Link><h1 className="text-2xl font-bold text-slate-950">{wizard.listing.status === "DRAFT" ? "Add Vehicle" : "Edit Vehicle"}</h1><p className="mt-1 text-sm text-slate-500">All details on one page. Select an option to move to the next field.</p></div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{wizard.listing._id ? wizard.listing.status.replaceAll("_", " ") : "Not saved"}</span>
        </div>
        <fieldset disabled={busy || wizard.isSaving} className="min-w-0 space-y-4 disabled:opacity-75">
          <Section step={1} register={register}><Step1Category useWizardHook={useFormWizard} /></Section>
          {categoryId && <div key={categoryId} className="space-y-4">
            <Section step={2} register={register}><Step2ListingType useWizardHook={useFormWizard} /></Section>
            <Section step={4} register={register}><Step4VehicleInfo useWizardHook={useFormWizard} /></Section>
            {!isPlate && <Section step={5} register={register}><Step5Specs useWizardHook={useFormWizard} /></Section>}
            <Section step={6} register={register}><Step6Features useWizardHook={useFormWizard} /></Section>
            <Section step={7} register={register}><Step7Media useWizardHook={useFormWizard} /></Section>
            <Section step={8} register={register}><Step8Location useWizardHook={useFormWizard} /></Section>
            <Section step={9} register={register}><Step9Pricing useWizardHook={useFormWizard} /></Section>
          </div>}
        </fieldset>
        <div className="sticky bottom-0 z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          {message && <p role="status" className="mb-3 text-sm text-slate-700">{message}</p>}
          <div className="flex items-center justify-between gap-3"><p className="hidden text-xs text-slate-500 sm:block">Save your progress or publish when you’re ready.</p><div className="ml-auto flex gap-3"><button type="button" onClick={() => save(false)} disabled={busy || wizard.isSaving || !categoryId} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold disabled:opacity-50">Save Draft</button><button type="button" onClick={() => save(true)} disabled={busy || wizard.isSaving || !categoryId} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{busy && <Loader2 size={16} className="animate-spin" />}{busy ? "Saving…" : wizard.listing.status === "DRAFT" ? "Publish Listing" : "Save Changes"}</button></div></div>
        </div>
      </div>
    </SelectionFlowProvider>
  </SinglePageListingContext.Provider>;
};

export default SinglePageListingForm;
