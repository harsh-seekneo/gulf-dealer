const COUNTRY_DIAL_CODES = {
  Bahrain: "+973",
  BH: "+973",
  "Saudi Arabia": "+966",
  SA: "+966",
  "United Arab Emirates": "+971",
  UAE: "+971",
  AE: "+971",
  Kuwait: "+965",
  KW: "+965",
  Oman: "+968",
  OM: "+968",
  Qatar: "+974",
  QA: "+974",
};

export const formatPhoneNumber = (value, countryOrCode = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const explicitDial = raw.match(/^\+\d{1,4}/)?.[0];
  const fallbackDial = COUNTRY_DIAL_CODES[String(countryOrCode || "").trim()] || "+973";
  const dialCode = explicitDial || fallbackDial;
  const digits = raw.replace(/^\+\d{1,4}/, "").replace(/\D/g, "");
  const local = digits.startsWith(dialCode.replace(/\D/g, ""))
    ? digits.slice(dialCode.replace(/\D/g, "").length)
    : digits;

  const grouped =
    local.length === 8
      ? `${local.slice(0, 4)} ${local.slice(4)}`
      : local.replace(/(\d{3,4})(?=\d)/g, "$1 ").trim();

  return `${dialCode} ${grouped}`.trim();
};
