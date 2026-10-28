"use client";

import { useState } from "react";
import { updateListingPriceApi } from "../api/vehicleListingApi";

const periods = ["daily", "weekly", "monthly"];

export default function ListingPriceEditor({ listing, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const rental = listing.listingType === "RENT";

  const startEditing = () => {
    const rates = listing.pricing?.rentalPrices || {};
    const hasRates = periods.some((period) => Number(rates[period]) > 0);
    setValues(rental
      ? Object.fromEntries(periods.map((period) => [period, rates[period] ?? (period === "daily" && !hasRates ? listing.pricing?.price ?? "" : "")]))
      : { price: listing.pricing?.price ?? "" });
    setError("");
    setEditing(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    const keys = rental ? periods : ["price"];
    const numbers = Object.fromEntries(keys.map((key) => [key, values[key] === "" ? null : Number(values[key])]));
    if (keys.some((key) => numbers[key] !== null && (!Number.isFinite(numbers[key]) || numbers[key] <= 0)) ||
      !keys.some((key) => numbers[key] > 0)) {
      setError("Enter a price greater than zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await updateListingPriceApi(listing._id, rental ? { rentalPrices: numbers } : { price: numbers.price });
      setEditing(false);
      onSaved?.(result);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to update price. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) return (
    <button type="button" onClick={startEditing} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
      Edit Price
    </button>
  );

  return (
    <form onSubmit={save} className="w-full min-w-[180px] space-y-2" onClick={(event) => event.stopPropagation()}>
      <p className="text-xs text-slate-500">Edit price ({listing.pricing?.currency})</p>
      {(rental ? periods : ["price"]).map((key) => (
        <label key={key} className="block text-xs font-medium capitalize text-slate-700">
          {key}
          <input type="number" inputMode="decimal" min="0.001" step="any" required={!rental}
            value={values[key] ?? ""} disabled={saving}
            onChange={(event) => setValues({ ...values, [key]: event.target.value })}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1 text-sm" />
        </label>
      ))}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button type="button" disabled={saving} onClick={() => setEditing(false)} className="rounded border border-slate-200 px-3 py-2 text-xs">Cancel</button>
      </div>
    </form>
  );
}

