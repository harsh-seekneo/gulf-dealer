const FORM_TYPE_BY_CATEGORY_KEY = {
  "special-number": "SPECIAL_NUMBER",
  "special-numbers": "SPECIAL_NUMBER",
  "heavy-equipments": "HEAVY_EQUIPMENT",
  "heavy-equipment": "HEAVY_EQUIPMENT",
  "commercial-vehicles": "COMMERCIAL",
  "commercial-vehicle": "COMMERCIAL",
  motorcycles: "MOTORBIKE",
  motorcycle: "MOTORBIKE",
  buggy: "BUGGY",
  buggies: "BUGGY",
  caravan: "CARAVAN",
  caravans: "CARAVAN",
  cars: "CAR",
  car: "CAR",
};

const normalizeToken = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toTitleCase = (value = "") =>
  String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const isPresent = (value) => value !== undefined && value !== null && value !== "";

const firstPresent = (listing, keys = []) => {
  for (const key of keys) {
    const value =
      listing?.[key] ??
      listing?.vehicleInfo?.[key] ??
      listing?.specs?.[key] ??
      listing?.category?.[key];

    if (isPresent(value)) return value;
  }

  return "";
};

const compactNumber = (value) => {
  const number = Number(String(value).replace(/,/g, ""));

  if (!Number.isFinite(number)) return "";

  return number.toLocaleString("en-US");
};

const withUnit = (value, unit) => {
  if (!isPresent(value)) return "";

  const text = String(value).trim();
  if (!text) return "";
  if (/[a-z]/i.test(text)) return toTitleCase(text);

  const formatted = compactNumber(text);
  return formatted ? `${formatted} ${unit}` : "";
};

const formatPlain = (value) => (isPresent(value) ? toTitleCase(value) : "");

const formatMileage = (listing) => {
  const mileage = firstPresent(listing, ["mileage"]);
  const metric = String(firstPresent(listing, ["mileageMetric"]) || "").toUpperCase();

  if (!isPresent(mileage)) return "";

  return metric === "ENGINE_HOURS"
    ? withUnit(mileage, "hrs")
    : withUnit(mileage, "km");
};

const limitMeta = (items = []) =>
  items
    .map((item) => (typeof item === "number" ? String(item) : item))
    .filter(Boolean)
    .slice(0, 4);

export const getListingCardFormType = (listing = {}, categoryKey = "") => {
  const directFormType = String(
    listing?.vehicleFormType || listing?.category?.vehicleFormType || "",
  ).toUpperCase();

  if (directFormType) return directFormType;

  const normalizedKey = normalizeToken(categoryKey || listing?.category?.key || listing?.category?.name);
  return FORM_TYPE_BY_CATEGORY_KEY[normalizedKey] || "CAR";
};

export const getListingCardTitle = (listing = {}, categoryKey = "") => {
  const formType = getListingCardFormType(listing, categoryKey);
  const plateNumber = firstPresent(listing, ["plateNumber"]);

  if (formType === "SPECIAL_NUMBER" && plateNumber) {
    return `Plate Number: ${plateNumber}`;
  }

  return listing?.title || listing?.vehicleInfo?.title || "Listing";
};

export const getListingCardMeta = (listing = {}, categoryKey = "") => {
  const formType = getListingCardFormType(listing, categoryKey);

  if (formType === "SPECIAL_NUMBER") {
    return limitMeta([
      firstPresent(listing, ["plateType"]),
      firstPresent(listing, ["plateCategory"]),
      firstPresent(listing, ["numberPattern"]),
      firstPresent(listing, ["numberOfDigits"]),
    ].map(formatPlain));
  }

  if (formType === "CARAVAN") {
    return limitMeta([
      formatPlain(firstPresent(listing, ["type", "bodyType"])),
      formatPlain(firstPresent(listing, ["sleepingCapacity"])),
      formatPlain(firstPresent(listing, ["seatingCapacity", "seats"])),
      withUnit(firstPresent(listing, ["grossWeight", "weight"]), "kg"),
    ]);
  }

  if (formType === "BUGGY") {
    return limitMeta([
      formatPlain(firstPresent(listing, ["type", "bodyType"])),
      withUnit(firstPresent(listing, ["engineCapacity"]), "cc"),
      formatPlain(firstPresent(listing, ["seatingCapacity", "seats"])),
      formatPlain(firstPresent(listing, ["driveType", "transmission"])),
    ]);
  }

  if (formType === "HEAVY_EQUIPMENT") {
    return limitMeta([
      formatPlain(firstPresent(listing, ["type", "equipmentType"])),
      withUnit(firstPresent(listing, ["operatingHours"]), "hrs"),
      withUnit(firstPresent(listing, ["enginePowerHp", "enginePower", "horsepower"]), "hp"),
      withUnit(firstPresent(listing, ["operatingWeight", "grossVehicleWeight", "weight"]), "kg"),
    ]);
  }

  if (formType === "COMMERCIAL") {
    return limitMeta([
      formatPlain(firstPresent(listing, ["vehicleType", "type"])),
      formatPlain(firstPresent(listing, ["bodyType"])),
      withUnit(firstPresent(listing, ["grossVehicleWeight"]), "kg"),
      formatPlain(firstPresent(listing, ["transmission", "fuelType"])),
    ]);
  }

  if (formType === "MOTORBIKE") {
    return limitMeta([
      formatPlain(firstPresent(listing, ["bikeCategory", "type"])),
      withUnit(firstPresent(listing, ["engineCapacity"]), "cc"),
      formatMileage(listing),
      formatPlain(firstPresent(listing, ["transmission", "fuelType"])),
    ]);
  }

  return limitMeta([
    formatPlain(firstPresent(listing, ["year", "manufacturingYear"])),
    formatPlain(firstPresent(listing, ["fuelType"])),
    formatMileage(listing),
    formatPlain(firstPresent(listing, ["transmission"])),
  ]);
};
