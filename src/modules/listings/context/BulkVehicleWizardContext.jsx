import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { submitSingleBulkListingApi } from "../api/bulkListingApi";

import {
  getListingByIdApi,
  saveListingStepApi,
  saveListingMediaApi,
} from "../api/vehicleListingApi";
import { clearListingFormState } from "../hooks/useListingFormState";
import { createBulkDraftListingApi, getBulkListingFormApi } from "../api/bulkListingApi";
import {
  getListingWizardFormType,
  getStepPosition,
  getWizardStepSequence,
} from "../config/wizardSteps.config";

const BulkVehicleWizardContext = createContext(null);

// Dealer's own business plan already replaces the Plan step entirely —
// the subscription is fixed to whatever is tied to their Dealer profile
// (dealer.businessSubscriptionRef), never chosen per-vehicle.
const scrollWizardToTop = () => {
  requestAnimationFrame(() => {
    const scrollArea = document.querySelector("[data-wizard-scroll-area]");
    if (scrollArea) {
      scrollArea.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

export const BulkVehicleWizardProvider = ({ children, subscriptionId: providedSubscriptionId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const draftCreationPromiseRef = useRef(null);
  const listingLoadRef = useRef(null);
  const persistedListingRef = useRef(null);
  const formLoadRef = useRef(null);
  const requestKeyRef = useRef(null);

  const subscriptionId = providedSubscriptionId || searchParams.get("subscriptionId") || "";
  const listingId = searchParams.get("listingId") || "";
  if (!requestKeyRef.current) requestKeyRef.current = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const requestedStep = Number(searchParams.get("step")) || 1;

  const [listing, setListing] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateUrl = useCallback(
    (nextListingId, nextStep) => {
      setSearchParams({
        subscriptionId,
        listingId: nextListingId,
        step: String(nextStep),
      });
    },
    [subscriptionId, setSearchParams]
  );

  useEffect(() => {
    let isMounted = true;
    clearListingFormState();

    const initialize = async () => {
      try {
        setIsInitializing(true);
        setInitError("");

        if (listingId) {
          // Creating the draft already returned its data. Updating the URL must
          // not refetch it and remount every field on the single-page form.
          if (String(persistedListingRef.current?._id) === listingId) return;
          if (listingLoadRef.current?.id !== listingId) {
            const pending = { id: listingId, promise: getListingByIdApi(listingId) };
            listingLoadRef.current = pending;
            pending.promise.catch(() => { if (listingLoadRef.current === pending) listingLoadRef.current = null; });
          }
          const existingListing = await listingLoadRef.current.promise;
          if (isMounted) {
            persistedListingRef.current = existingListing;
            setListing(existingListing);
          }
        } else {
          if (!subscriptionId) {
            throw new Error("No business plan found for this dealer account");
          }

          if (formLoadRef.current?.id !== subscriptionId) {
            const pending = { id: subscriptionId, promise: getBulkListingFormApi(subscriptionId) };
            formLoadRef.current = pending;
            pending.promise.catch(() => { if (formLoadRef.current === pending) formLoadRef.current = null; });
          }
          const emptyForm = await formLoadRef.current.promise;
          if (isMounted) {
            persistedListingRef.current = null;
            setListing(emptyForm);
          }
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Unable to load this vehicle listing";
          setInitError(message);
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId, listingId]);

  // Called only from an explicit Save Draft or Publish action, never on mount,
  // category selection, field changes, navigation, or unload.
  const ensureListing = useCallback(async () => {
    if (persistedListingRef.current?._id) return persistedListingRef.current;
    if (!draftCreationPromiseRef.current) {
      const pending = createBulkDraftListingApi(subscriptionId, requestKeyRef.current);
      draftCreationPromiseRef.current = pending;
      pending.catch(() => { if (draftCreationPromiseRef.current === pending) draftCreationPromiseRef.current = null; });
    }
    const created = await draftCreationPromiseRef.current;
    persistedListingRef.current = created;
    setListing((previous) => ({ ...created, ...previous, _id: created._id, listingId: created.listingId, planLimitsSnapshot: created.planLimitsSnapshot }));
    return created;
  }, [subscriptionId]);

  const markDraftSaved = useCallback(() => {
    const id = persistedListingRef.current?._id;
    if (id) setSearchParams({ subscriptionId, listingId: id }, { replace: true });
  }, [setSearchParams, subscriptionId]);

  const listingFormType = getListingWizardFormType(listing);
  const activeStepSequence = getWizardStepSequence(listingFormType);
  const totalSteps = activeStepSequence.length;
  const currentStepIndex = activeStepSequence.indexOf(requestedStep);
  const currentStep =
    currentStepIndex === -1
      ? activeStepSequence.find((step) => step > requestedStep) ||
        activeStepSequence[activeStepSequence.length - 1]
      : requestedStep;
  const currentStepPosition = getStepPosition(currentStep, listingFormType);

  const goToStepIndex = useCallback(
    (index) => {
      if (!listing?._id) return;
      const clampedIndex = Math.max(0, Math.min(index, activeStepSequence.length - 1));
      updateUrl(listing._id, activeStepSequence[clampedIndex]);
      scrollWizardToTop();
    },
    [activeStepSequence, listing, updateUrl]
  );

  const goNext = useCallback(async () => {
    const index = activeStepSequence.indexOf(currentStep);

    if (currentStep === 10) {
      if (listing.status !== "DRAFT") {
        showToast("Listing changes saved", "success");
        navigate(`/vehicles/${listing._id}`);
        return;
      }

      try {
        const submittedListing = await submitSingleBulkListingApi(listing._id);
        setListing(submittedListing || listing);
        showToast("Vehicle submitted for admin review", "success");
        updateUrl((submittedListing || listing)._id, 11);
        scrollWizardToTop();
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Listing saved as draft, but couldn't be submitted for review yet.";
        showToast(message, "error");
      }
      return;
    }

    if (index === activeStepSequence.length - 1) return;

    goToStepIndex(index + 1);
  }, [activeStepSequence, currentStep, goToStepIndex, listing, navigate, showToast, updateUrl]);

  const goPrevious = useCallback(() => {
    const index = activeStepSequence.indexOf(currentStep);
    goToStepIndex(index - 1);
  }, [activeStepSequence, currentStep, goToStepIndex]);

  const saveStep = useCallback(
    async (step, payload, { advance = true } = {}) => {
      const persisted = await ensureListing();

      setIsSaving(true);

      try {
        const updatedListing = await saveListingStepApi(persisted._id, step, payload);
        setListing(updatedListing);

        if (advance) goNext();

        return updatedListing;
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to save. Please check your input and try again.";
        showToast(message, "error");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [ensureListing, goNext, showToast]
  );

  const saveMedia = useCallback(
    async (formData, { advance = true } = {}) => {
      const persisted = await ensureListing();

      setIsSaving(true);

      try {
        const updatedListing = await saveListingMediaApi(persisted._id, formData);
        setListing(updatedListing);

        if (advance) goNext();

        return updatedListing;
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to upload media. Please try again.";
        showToast(message, "error");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [ensureListing, goNext, showToast]
  );

  const saveDraft = useCallback(() => {
    navigate(`/vehicles?subscriptionId=${subscriptionId}`);
  }, [navigate, subscriptionId]);

  const value = {
    listing,
    ensureListing,
    markDraftSaved,
    selectCategory: (category) => setListing((previous) => ({ ...previous, category })),
    currentStep,
    totalSteps,
    currentStepPosition,
    listingFormType,
    isInitializing,
    initError,
    isSaving,
    goToStep: (step) => goToStepIndex(activeStepSequence.indexOf(step)),
    goNext,
    goPrevious,
    saveStep,
    saveMedia,
    saveDraft,
    submitListing: goNext,
    updateListingPreview: (patch) => {
      setListing((previous) => (previous ? { ...previous, ...patch } : previous));
    },
    subscriptionId,
  };

  return (
    <BulkVehicleWizardContext.Provider value={value}>
      {children}
    </BulkVehicleWizardContext.Provider>
  );
};

export const useBulkVehicleWizard = () => {
  const context = useContext(BulkVehicleWizardContext);

  if (!context) {
    throw new Error("useBulkVehicleWizard must be used within a BulkVehicleWizardProvider");
  }

  return context;
};
