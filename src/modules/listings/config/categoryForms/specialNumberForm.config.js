export const specialNumberFormConfig = {
  key: "SPECIAL_NUMBER",
  label: "Special Number",

  // No Sale/Rent/Condition toggle needed — Step 2 handles
  // Sale/Auction directly for this category, and the admin form
  // reads these two flags to skip condition entirely.
  hasCondition: false,
  defaultListingType: "SALE",

  vehicleInfoFields: [
    { name: "title", label: "Listing Title", type: "text", required: true, span: 2, placeholder: "e.g. VIP Plate 5-Digit Bahrain Classic" },
    { name: "sellerType", label: "Seller Type", type: "select", required: true, options: ["Individual", "Business"] },
    { name: "registrationCountry", label: "Registration Country", type: "countrySelect", required: true },
    { name: "plateNumber", label: "Plate Number", type: "text", required: true, placeholder: "e.g. 99999" },
    { name: "plateType", label: "Plate Type", type: "select", required: true, options: ["Private Plate", "Commercial Plate", "Motorcycle Plate", "Government Plate"] },
    { name: "plateCategory", label: "Plate Category", type: "select", required: true, options: ["Premium", "Standard", "Classic", "VIP"] },
    { name: "platePrefix", label: "Plate Prefix / Code", type: "text", placeholder: "e.g. A, B, AA" },
    { name: "numberPattern", label: "Number Pattern", type: "select", required: true, options: ["Repeated", "Sequential", "Mirror", "Random", "Ascending", "Descending"] },
    { name: "numberOfDigits", label: "Number of Digits", type: "select", required: true, options: ["1 Digit", "2 Digits", "3 Digits", "4 Digits", "5 Digits", "6 Digits", "7 Digits"] },
    { name: "description", label: "Description", type: "textarea", required: true, span: 2, placeholder: "Provide an accurate highlight of this premium plate combination..." },
  ],

  // Special Number has no engine/mechanical specs at all — this
  // stays empty on purpose so Step 5 / the admin "Specifications"
  // section renders nothing, which is correct for this category.
  specsFields: [],

  featureGroups: [
    { key: "plateBenefits", label: "Plate Benefits", options: ["VIP Number", "Easy-to-Remember", "Premium Number", "Repeated Digits", "Sequential Digits", "Lucky Number"] },
    { key: "registrationFeatures", label: "Registration Features", options: ["Transferable", "Valid Registration", "Government Approved", "Road Legal", "Ready for Transfer", "Immediate Ownership"] },
  ],

  hasAreaField: true,
};