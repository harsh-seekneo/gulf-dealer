"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import { getCategoryOptionsApi } from "../../api/catalogApi";
import CategoryIcon from "../CategoryIcon";
import WizardFooterNav from "../WizardFooterNav";
import { scrollElementIntoWizardView } from "../../utils/wizardScroll";

const CATEGORY_KEYS = {
  CARS: "cars",
  BIKES: "motorcycles",
  COMMERCIAL: "commercial-vehicles",
  HEAVY: "heavy-equipments",
  BUGGY: "buggy",
  CARAVAN: "caravan",
  SPECIAL_NUMBER: "special-number",
};

const CANONICAL_CATEGORY_ORDER = [
  CATEGORY_KEYS.CARS,
  CATEGORY_KEYS.BIKES,
  CATEGORY_KEYS.COMMERCIAL,
  CATEGORY_KEYS.HEAVY,
  CATEGORY_KEYS.BUGGY,
  CATEGORY_KEYS.CARAVAN,
  CATEGORY_KEYS.SPECIAL_NUMBER,
];

const categoryDisplayLabels = {
  [CATEGORY_KEYS.CARS]: "Cars",
  [CATEGORY_KEYS.BIKES]: "Motorcycles",
  [CATEGORY_KEYS.COMMERCIAL]: "Commercial Vehicles",
  [CATEGORY_KEYS.HEAVY]: "Heavy Equipment",
  [CATEGORY_KEYS.BUGGY]: "Buggies",
  [CATEGORY_KEYS.CARAVAN]: "Caravans",
  [CATEGORY_KEYS.SPECIAL_NUMBER]: "Special Numbers",
};

const vehicleFormTypeCategoryKeys = {
  CAR: CATEGORY_KEYS.CARS,
  MOTORBIKE: CATEGORY_KEYS.BIKES,
  COMMERCIAL: CATEGORY_KEYS.COMMERCIAL,
  HEAVY_EQUIPMENT: CATEGORY_KEYS.HEAVY,
  BUGGY: CATEGORY_KEYS.BUGGY,
  CARAVAN: CATEGORY_KEYS.CARAVAN,
  SPECIAL_NUMBER: CATEGORY_KEYS.SPECIAL_NUMBER,
};

const searchCategoryAliases = {
  car: CATEGORY_KEYS.CARS,
  cars: CATEGORY_KEYS.CARS,
  vehicle: CATEGORY_KEYS.CARS,
  vehicles: CATEGORY_KEYS.CARS,
  motercycle: CATEGORY_KEYS.BIKES,
  motercycles: CATEGORY_KEYS.BIKES,
  motorcycle: CATEGORY_KEYS.BIKES,
  motorcycles: CATEGORY_KEYS.BIKES,
  commercial: CATEGORY_KEYS.COMMERCIAL,
  "commercial-vehicle": CATEGORY_KEYS.COMMERCIAL,
  "commercial-vehicles": CATEGORY_KEYS.COMMERCIAL,
  equipment: CATEGORY_KEYS.HEAVY,
  equipments: CATEGORY_KEYS.HEAVY,
  "heavy-equipment": CATEGORY_KEYS.HEAVY,
  "heavy-equipments": CATEGORY_KEYS.HEAVY,
  buggy: CATEGORY_KEYS.BUGGY,
  buggies: CATEGORY_KEYS.BUGGY,
  caravan: CATEGORY_KEYS.CARAVAN,
  caravans: CATEGORY_KEYS.CARAVAN,
  carvaan: CATEGORY_KEYS.CARAVAN,
  "special-number": CATEGORY_KEYS.SPECIAL_NUMBER,
  "special-numbers": CATEGORY_KEYS.SPECIAL_NUMBER,
  "number-plate": CATEGORY_KEYS.SPECIAL_NUMBER,
};

const normalizeSearchToken = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const resolveSearchCategoryKey = (categoryKey) => {
  const normalizedCategory = normalizeSearchToken(categoryKey);
  return searchCategoryAliases[normalizedCategory] || null;
};

const getCategoryDisplayLabel = (category = {}) => {
  const categoryKey =
    vehicleFormTypeCategoryKeys[category.vehicleFormType] ||
    resolveSearchCategoryKey(category.key || category.value || category.label || category.name);

  return categoryDisplayLabels[categoryKey] || category.label || category.name || "";
};

const getCategoryOrderIndex = (category = {}) => {
  const categoryKey =
    vehicleFormTypeCategoryKeys[category.vehicleFormType] ||
    resolveSearchCategoryKey(category.key || category.value || category.label || category.name);
  const index = CANONICAL_CATEGORY_ORDER.indexOf(categoryKey);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const sortCategoriesByCanonicalOrder = (categories = []) =>
  [...categories].sort((first, second) => {
    const orderDifference = getCategoryOrderIndex(first) - getCategoryOrderIndex(second);
    if (orderDifference !== 0) return orderDifference;

    return String(first.label || first.name || "").localeCompare(
      String(second.label || second.name || "")
    );
  });

const Step1Category = ({ useWizardHook = useBulkVehicleWizard }) => {
  const st = (value) => value;
  const {
    listing,
    isSaving,
    saveStep,
    goPrevious,
    saveDraft,
  } = useWizardHook();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    listing?.category?._id || listing?.category || ""
  );

  const [showValidation, setShowValidation] = useState(false);
  const categoryGridRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const [vehicleCategories, equipmentCategories] =
          await Promise.all([
            getCategoryOptionsApi({
              parentCategory: "VEHICLE",
              status: "ACTIVE",
            }),
            getCategoryOptionsApi({
              parentCategory: "EQUIPMENT",
              status: "ACTIVE",
            }),
          ]);

        const categoryMap = new Map();

        [
          ...(vehicleCategories || []),
          ...(equipmentCategories || []),
        ].forEach((category) => {
          if (category?._id) {
            categoryMap.set(category._id, category);
          }
        });

        if (isMounted) {
          setCategories(sortCategoriesByCanonicalOrder(Array.from(categoryMap.values())));
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Unable to load categories";

          setLoadError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowValidation(false);
  };

  const handleNext = async () => {
    if (!selectedCategoryId) {
      setShowValidation(true);
      scrollElementIntoWizardView(categoryGridRef.current);
      return;
    }

    await saveStep(1, {
      category: selectedCategoryId,
    });
  };

  const getCategorySubtitle = (category) => {
    if (category?.subtitle) {
      return category.subtitle;
    }

    if (category?.brands) {
      if (Array.isArray(category.brands)) {
        return category.brands.join(", ");
      }

      return category.brands;
    }

    if (category?.shortDescription) {
      return category.shortDescription;
    }

    const name = String(category?.name || "")
      .trim()
      .toLowerCase();

    const subtitleMap = {
      car: "BMW, Audi, Mercedes",
      cars: "BMW, Audi, Mercedes",

      motercycle: "Honda, Hero, Suzuki",
      motercycles: "Honda, Hero, Suzuki",
      motorcycle: "Honda, Hero, Suzuki",
      motorcycles: "Honda, Hero, Suzuki",

      "heavy equipment": "Benz, Volvo",
      "heavy equipments": "Benz, Volvo",

      "special number": "BMW, Audi, Mercedes",
      "special numbers": "BMW, Audi, Mercedes",

      buggy: "Honda, Hero, Suzuki",

      caravan: "Benz, Volvo",
      carvaan: "Benz, Volvo",

      "commercial vehicle": "Benz, Volvo",
      "commercial vehicles": "Benz, Volvo",

      "showroom & dealer": "Benz, Volvo",
      "showrooms & dealers": "Benz, Volvo",
    };

    return subtitleMap[name] || "";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center px-4 py-12 sm:min-h-[300px] sm:py-16">
        <Loader2
          size={22}
          className="animate-spin text-slate-400 sm:h-6 sm:w-6"
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-0 sm:p-5">
        {loadError}
      </div>
    );
  }

  const sortedCategories = sortCategoriesByCanonicalOrder(categories);

  return (
    <div className="flex min-h-full w-full min-w-0 flex-col px-3 pb-4 sm:px-5 md:px-6 lg:px-0">
      {/* =========================================================
          HEADING
      ========================================================= */}
      <div className="w-full">
        <h2 className="text-[19px] font-bold leading-tight text-slate-950 sm:text-[22px] md:text-[24px]">
          Select a Category
        </h2>

        <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:mt-2 sm:text-[15px] sm:leading-6 md:text-[16px]">
          Choose what you would like to list.
        </p>
      </div>

      {/* =========================================================
          CATEGORY GRID
      ========================================================= */}
      <div
        ref={categoryGridRef}
        className={`
          mt-4
          grid
          w-full
          grid-cols-2
          gap-2
          sm:mt-6
          sm:gap-3
          md:grid-cols-3
          lg:grid-cols-4

          ${
            showValidation && !selectedCategoryId
              ? "rounded-xl ring-2 ring-red-400 ring-offset-2"
              : ""
          }
        `}
      >
        {sortedCategories.map((category) => {
          const isSelected =
            selectedCategoryId === category._id;

          const _subtitle = getCategorySubtitle(category);
          const categoryLabel = getCategoryDisplayLabel(category);

          return (
            <button
              key={category._id}
              type="button"
              onClick={() => handleSelect(category._id)}
              className={`
                group
                flex
                min-w-0
                min-h-[96px]
                flex-col
                items-start
                rounded-xl
                bg-white
                p-2
                text-left
                transition-all
                duration-200

                sm:min-h-[112px]
                sm:rounded-2xl
                sm:p-3

                md:min-h-[120px]

                ${
                  isSelected
                    ? "border-2 border-blue-600 shadow-sm"
                    : "border border-slate-200 hover:border-slate-300 active:border-slate-400"
                }
              `}
            >
              {/* =================================================
                  CATEGORY IMAGE
              ================================================= */}
              <div
                className={`
                  flex
                  h-9
                  w-11
                  shrink-0
                  overflow-hidden
                  rounded-md
                  bg-slate-100

                  sm:h-11
                  sm:w-[52px]
                  sm:rounded-lg

                  md:h-12
                  md:w-14

                  ${
                    isSelected
                      ? "ring-1 ring-blue-100"
                      : ""
                  }
                `}
              >
                {category?.categoryImage?.url ? (
                  <img
                    src={category.categoryImage.url}
                    alt={categoryLabel || "Category"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CategoryIcon
                      name={categoryLabel}
                      size={16}
                      className={
                        isSelected
                          ? "text-blue-600"
                          : "text-slate-500"
                      }
                    />
                  </div>
                )}
              </div>

              {/* =================================================
                  CATEGORY NAME
              ================================================= */}
              <p
                className={`
                  mt-1.5
                  w-full
                  truncate
                  text-[12px]
                  font-bold
                  leading-4

                  sm:mt-2
                  sm:text-[14px]
                  sm:leading-5

                  ${
                    isSelected
                      ? "text-slate-950"
                      : "text-slate-900"
                  }
                `}
                title={st(categoryLabel)}
              >
                {st(categoryLabel)}
              </p>

            </button>
          );
        })}

        {/* =========================================================
            EMPTY STATE
        ========================================================= */}
        {categories.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-5 text-center text-[13px] text-slate-400 sm:p-8 sm:text-sm">
            No categories available right now
          </div>
        )}
      </div>

      {/* =========================================================
          VALIDATION
      ========================================================= */}
      {showValidation && !selectedCategoryId && (
        <p className="mt-3 text-xs font-medium text-red-600">
          Please select a category to continue
        </p>
      )}

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <div className="mt-auto pt-5 sm:pt-7">
        <WizardFooterNav
          isFirstStep
          onPrevious={goPrevious}
          onSaveDraft={saveDraft}
          onNext={handleNext}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default Step1Category;
