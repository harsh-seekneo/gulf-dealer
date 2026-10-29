import { useLayoutEffect, useState } from "react";
import { useSinglePageListing } from "../context/SinglePageListingContext";

// Inputs exist only in this mounted form. Back/reload restores no unsaved edits.
export const useListingFormState = (name, initialValue) => {
  const page = useSinglePageListing();
  const key = name.replace(/[^A-Za-z0-9_]/g, "_");
  const [value, setValue] = useState(() => Object.hasOwn(page?.initialInputs || {}, key)
    ? page.initialInputs[key]
    : typeof initialValue === "function" ? initialValue() : initialValue);
  const inputs = page?.formInputs;
  useLayoutEffect(() => {
    if (!inputs) return;
    const values = inputs.current;
    values[key] = value;
    return () => { if (values[key] === value) delete values[key]; };
  }, [inputs, key, value]);
  return [value, setValue];
};

// Remove values left by the previous session-storage autosave implementation.
// Explicitly saved server drafts are unaffected.
export const clearListingFormState = (listingId) => {
  try {
    const prefix = listingId ? `gic:dealer-form:${listingId}:` : "gic:dealer-form:";
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(prefix)) sessionStorage.removeItem(key);
  } catch { /* Storage may be unavailable. */ }
};
