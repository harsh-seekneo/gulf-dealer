// Isolated development fixture: all API calls use synthetic local data.
import React from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { MemoryRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../src/modules/auth/context/authContextCore";
import { ToastProvider } from "../src/context/ToastContext";
import AddVehiclePage from "../src/modules/listings/pages/AddVehiclePage";
import api, { refreshClient } from "../src/services/apiClient";
import "../src/index.css";
const category = { _id: "car", name: "Cars", parentCategory: "VEHICLE", vehicleFormType: "CAR" };
let listing = { _id: "fixture-listing", listingId: "QA-1", category, listingType: "SALE", condition: "USED", status: "DRAFT", isBulkListing: true, listingSource: "DEALER_BUSINESS", subscriptionUsed: "qa-plan", planLimitsSnapshot: { maxPhotosSnapshot: 3, maxVideosSnapshot: 0 }, vehicleInfo: { title: "2024 Toyota Corolla", brand: "toyota", catalogModel: "corolla", manufacturingYear: 2024, bodyType: "sedan", fuelType: "Petrol", transmission: "Automatic", engineCapacity: "2000", mileage: 5000, exteriorColor: "white", vinNumber: "JTDBR32E720123456", description: "A well maintained vehicle.", mobileNumber: "+973 36001234", whatsappNumber: "+973 36001234", contactEmail: "qa@example.com" }, specs: { seats: "5", numberOfCylinders: "4" }, features: { comfort: ["Air Conditioning", "Bluetooth"] }, location: { country: "Bahrain", governorate: "Capital Governorate", city: "Manama" }, pricing: { price: 5000, currency: "BHD" }, media: { featuredImage: { key: "fixture.jpg", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240'%3E%3Crect width='400' height='240' fill='%230d9488'/%3E%3C/svg%3E" }, images: [] } };
const fresh = new URLSearchParams(window.location.search).has("new");
const seeded = new URLSearchParams(window.location.search).has("complete");
const originalListing = structuredClone(listing);
const emptyForm = { status: "DRAFT", currentStep: 1, isBulkListing: true, listingSource: "DEALER_BUSINESS", subscriptionUsed: "qa-plan", planLimitsSnapshot: { maxPhotosSnapshot: 3, maxVideosSnapshot: 0 }, vehicleInfo: {}, specs: {}, features: {}, location: {}, pricing: {}, media: {} };
const requests = [];
axios.defaults.adapter = async (config) => { requests.push({ method: config.method, url: config.url }); return response(config, {}); };
const response = (config, data) => ({ data: { data }, status: 200, statusText: "OK", headers: {}, config });
refreshClient.defaults.adapter = async (config) => response(config, { accessToken: "local-fixture" });
api.defaults.adapter = async (config) => {
  requests.push({ method: config.method, url: config.url, data: config.data });
  const url = config.url;
  if (url.endsWith("/bulk/qa-plan/form")) {
    const form = seeded ? structuredClone(originalListing) : structuredClone(emptyForm);
    delete form._id;
    delete form.listingId;
    if (new URLSearchParams(window.location.search).has("upload")) form.media = { images: [] };
    return response(config, form);
  }
  if (config.method === "post" && url === "/vehicle-listings/bulk") {
    listing = { ...structuredClone(emptyForm), _id: "fixture-listing", listingId: "QA-1" };
    return response(config, structuredClone(listing));
  }
  if (url.endsWith("/images/direct/start")) return response(config, { key: "vehicle-listings/media/images/fixture-listing/qa.jpg", url: originalListing.media.featuredImage.url, uploadUrl: "https://storage.example.test/fixture" });
  if (url.endsWith("/images/direct/complete")) { const data = JSON.parse(config.data); listing.media = { ...listing.media, featuredImage: data.featuredImage || listing.media.featuredImage, images: [...(listing.media.images || []), ...(data.images || [])] }; return response(config, structuredClone(listing)); }

  if (url.includes("categories/options")) return response(config, config.params.parentCategory === "EQUIPMENT" ? [] : [category, { _id: "plate", name: "Special Numbers", vehicleFormType: "SPECIAL_NUMBER" }]);
  if (url.includes("brands/options")) return response(config, [{ _id: "toyota", name: "Toyota", brandLogo: { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Ccircle cx='24' cy='24' r='19' fill='white' stroke='%23dc2626' stroke-width='3'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='18' fill='%23dc2626'%3ET%3C/text%3E%3C/svg%3E" } }, { _id: "honda", name: "Honda" }]);
  if (url.includes("models/options")) return response(config, [{ _id: config.params.brand === "honda" ? "civic" : "corolla", name: config.params.brand === "honda" ? "Civic" : "Corolla" }]);
  if (url.includes("variants/options")) return response(config, [{ _id: "gxr", name: "GXR" }]);
  if (url.includes("facet-options/options")) return response(config, [{ value: "sedan", label: "Sedan" }]);
  if (url.includes("listing-attributes/options")) return response(config, []);
  if (url.endsWith("/draft-inputs")) { listing.savedDraftInputs = JSON.parse(config.data); return response(config, { _id: listing._id, status: listing.status }); }
  if (url.endsWith("submit-single")) { listing.status = "PUBLISHED"; return response(config, structuredClone(listing)); }
  const step = Number(url.match(/step\/(\d+)/)?.[1]);
  if (step) { const data = JSON.parse(config.data); const section = { 4: "vehicleInfo", 5: "specs", 6: "features", 8: "location", 9: "pricing" }[step]; if (step === 1) listing.category = data.category === "plate" ? { _id: "plate", name: "Special Numbers", vehicleFormType: "SPECIAL_NUMBER" } : category; else if (step === 2) Object.assign(listing, data); else listing[section] = { ...listing[section], ...data }; }
  return response(config, structuredClone(listing));
};
export function RequestLog() { const [show, setShow] = React.useState(false); return <aside className="mt-10"><button onClick={() => setShow(!show)}>Inspect fixture requests</button>{show && <pre>{JSON.stringify(requests, null, 2)}</pre>}</aside>; }
function FixtureNavigation() {
  const location = useLocation();
  return <aside className="mt-6 flex flex-wrap gap-4 text-sm"><Link to="/vehicles">Leave form</Link><Link to="/listings/add-vehicle?subscriptionId=qa-plan">New form</Link><Link to="/listings/add-vehicle?subscriptionId=qa-plan&listingId=fixture-listing">Open saved draft</Link><output data-testid="fixture-location">{location.pathname}{location.search}</output></aside>;
}
createRoot(document.getElementById("root")).render(<React.StrictMode><MemoryRouter initialEntries={[fresh ? "/listings/add-vehicle?subscriptionId=qa-plan" : "/listings/add-vehicle?subscriptionId=qa-plan&listingId=fixture-listing"]}><AuthContext.Provider value={{ user: { fullName: "QA Dealer", dealerProfile: { businessName: "QA Motors" }, countryIso: "BH", countryCode: "+973", phone: "36001234", email: "qa@example.com" } }}><ToastProvider><main className="min-h-screen bg-slate-50 p-4 sm:p-8"><Routes><Route path="/listings/add-vehicle" element={<AddVehiclePage />} /><Route path="/vehicles" element={<h1>My Listings</h1>} /><Route path="/vehicles/:id" element={<h1>Listing details</h1>} /></Routes><RequestLog /><FixtureNavigation /></main></ToastProvider></AuthContext.Provider></MemoryRouter></React.StrictMode>);
