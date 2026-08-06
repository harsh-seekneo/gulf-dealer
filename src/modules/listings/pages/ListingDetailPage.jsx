import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";

import { getListingDetailApi } from "../api/listingDetailApi";
import { listingsApi } from "../api/listingsApi";
import { useToast } from "../../../context/ToastContext";

import { carFormConfig } from "../config/categoryForms/carForm.config";
import { commercialFormConfig } from "../config/categoryForms/commercialForm.config";
import { heavyEquipmentFormConfig } from "../config/categoryForms/heavyEquipmentForm.config";
import { motorbikeFormConfig } from "../config/categoryForms/motorbikeForm.config";

import ListingHeroGallery from "../components/detail/ListingHeroGallery";
import ListingHeaderStats from "../components/detail/ListingHeaderStats";
import EditableFieldSection from "../components/detail/EditableFieldSection";
import FeaturesDisplay from "../components/detail/FeaturesDisplay";
import CustomerInquiries from "../components/detail/CustomerInquiries";
import SellerInfoCard from "../components/detail/SellerInfoCard";
import { submitSingleBulkListingApi } from "../api/bulkListingApi";

const configByFormType = {
  CAR: carFormConfig,
  COMMERCIAL: commercialFormConfig,
  HEAVY_EQUIPMENT: heavyEquipmentFormConfig,
  MOTORBIKE: motorbikeFormConfig,
};

const EDITABLE_STATUSES = ["DRAFT", "PENDING_REVIEW", "REJECTED"];

const EXCLUDED_VEHICLE_INFO_FIELDS = new Set(["title", "brand", "catalogModel", "manufacturingYear", "description"]);

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [leadsCount, setLeadsCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingSold, setIsTogglingSold] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const data = await getListingDetailApi(listingId);
      setListing(data);
    } catch (error) {
      setLoadError(error.response?.data?.message || "Unable to load this listing");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const handleSectionSaved = (updatedListing) => {
    setListing(updatedListing);
  };

  const handleToggleSold = async () => {
    setIsTogglingSold(true);

    try {
      await listingsApi.toggleSold(listingId);
      showToast(
        listing?.isSold ? "Listing unmarked as sold" : "Listing marked as sold",
        "success"
      );
      await fetchListing();
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update listing", "error");
    } finally {
      setIsTogglingSold(false);
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);

    try {
      await submitSingleBulkListingApi(listingId);
      showToast("Vehicle submitted for admin review", "success");
      await fetchListing();
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to submit for review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      await listingsApi.deleteVehicle(listingId);
      showToast("Listing deleted", "success");
      navigate("/vehicles");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete listing", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={26} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError || "Listing not found"}
        </div>
      </div>
    );
  }

  const formType = listing.category?.vehicleFormType || "CAR";
  const config = configByFormType[formType] || carFormConfig;
  const categoryId = listing.category?._id || listing.category;

  const canEdit = EDITABLE_STATUSES.includes(listing.status);
  const isPublished = listing.status === "PUBLISHED";

  const vehicleInfoFields = config.vehicleInfoFields.filter(
    (field) => !EXCLUDED_VEHICLE_INFO_FIELDS.has(field.name)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={() => navigate("/vehicles")}
        className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        My Listings
      </button>

      <ListingHeroGallery media={listing.media} />
      <ListingHeaderStats listing={listing} />

      <div className="mt-5 flex flex-wrap gap-3">
        {isPublished && (
          <button
            type="button"
            onClick={handleToggleSold}
            disabled={isTogglingSold}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              listing.isSold
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isTogglingSold ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {listing.isSold ? "Unmark as Sold" : "Mark as Sold"}
          </button>
        )}

        {listing.status === "DRAFT" && (
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Submit for Review
          </button>
        )}

        {canEdit && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>

      <div className="mt-6 space-y-5">
        <EditableFieldSection
          title="Vehicle Information"
          step={4}
          fields={vehicleInfoFields}
          sourceData={listing.vehicleInfo}
          categoryId={categoryId}
          listingId={listingId}
          canEdit={canEdit}
          onSaved={handleSectionSaved}
        />

        <EditableFieldSection
          title={config.engineSectionTitle || `${config.label} Specifications`}
          step={5}
          fields={config.specsFields}
          sourceData={listing.specs}
          categoryId={categoryId}
          listingId={listingId}
          canEdit={canEdit}
          onSaved={handleSectionSaved}
        />

        <EditableFieldSection
          title="Description"
          step={4}
          fields={config.vehicleInfoFields.filter((field) => field.name === "description")}
          sourceData={listing.vehicleInfo}
          categoryId={categoryId}
          listingId={listingId}
          canEdit={canEdit}
          onSaved={handleSectionSaved}
          gridLayout="sm:grid-cols-1"
        />


        <FeaturesDisplay config={config} features={listing.features} />

        <CustomerInquiries listingId={listingId} onCountLoaded={setLeadsCount} />

        <SellerInfoCard listing={listing} />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete this listing?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This listing will be permanently deleted. This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;