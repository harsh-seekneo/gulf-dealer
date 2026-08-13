export const GULF_COUNTRIES = [
  {
    name: "Bahrain",
    governorates: [
      { name: "Capital Governorate", cities: ["Manama", "Juffair", "Adliya"] },
      { name: "Muharraq Governorate", cities: ["Muharraq", "Arad", "Busaiteen"] },
      { name: "Northern Governorate", cities: ["Hamad Town", "A'ali", "Sitra"] },
      { name: "Southern Governorate", cities: ["Riffa", "Isa Town", "Zallaq"] },
    ],
  },
  {
    name: "UAE",
    governorates: [
      { name: "Dubai", cities: ["Deira", "Jumeirah", "Al Barsha", "Business Bay"] },
      { name: "Abu Dhabi", cities: ["Al Reem Island", "Khalifa City", "Al Mushrif"] },
      { name: "Sharjah", cities: ["Al Majaz", "Al Nahda", "Muwaileh"] },
    ],
  },
  {
    name: "Saudi Arabia",
    governorates: [
      { name: "Riyadh Region", cities: ["Riyadh", "Al Kharj", "Diriyah"] },
      { name: "Makkah Region", cities: ["Jeddah", "Makkah", "Taif"] },
      { name: "Eastern Province", cities: ["Dammam", "Khobar", "Dhahran"] },
    ],
  },
  {
    name: "Qatar",
    governorates: [
      { name: "Doha", cities: ["West Bay", "Al Sadd", "The Pearl"] },
      { name: "Al Rayyan", cities: ["Al Waab", "Muaither", "Al Gharrafa"] },
    ],
  },
  {
    name: "Kuwait",
    governorates: [
      { name: "Al Asimah", cities: ["Kuwait City", "Sharq", "Dasman"] },
      { name: "Hawalli", cities: ["Salmiya", "Hawalli", "Bayan"] },
    ],
  },
  {
    name: "Oman",
    governorates: [
      { name: "Muscat", cities: ["Ruwi", "Qurum", "Al Khuwair"] },
      { name: "Dhofar", cities: ["Salalah", "Taqah"] },
    ],
  },
];

// Optional 4th location tier ("Area"), used only by categories whose
// config sets `hasAreaField: true` (Buggy, Caravan, Special Number).
// Kept as a flat lookup by city name so it doesn't require restructuring
// the existing 3-tier GULF_COUNTRIES data every other category relies on.
export const AREAS_BY_CITY = {
  Manama: ["Adliya", "Juffair", "Seef", "Hoora"],
  Riffa: ["East Riffa", "West Riffa", "Riffa Views"],
  Dubai: ["Deira", "Jumeirah", "Al Barsha", "Business Bay"],
  "Abu Dhabi": ["Al Reem Island", "Khalifa City", "Al Mushrif"],
  Riyadh: ["Al Olaya", "Al Malaz", "Diplomatic Quarter"],
  Doha: ["West Bay", "Al Sadd", "The Pearl"],
  "Kuwait City": ["Sharq", "Dasman", "Salmiya"],
};