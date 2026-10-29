import { createContext, useContext, useLayoutEffect, useRef } from "react";

export const SinglePageListingContext = createContext(null);
export const ListingSectionContext = createContext(null);

// Keep the original section's validation and payload builder as the source of truth.
export const useRegisterListingSection = (onSave) => {
  const section = useContext(ListingSectionContext);
  const callback = useRef(onSave);
  useLayoutEffect(() => { callback.current = onSave; });
  useLayoutEffect(() => {
    if (!section) return;
    return section.register((options) => callback.current(options));
  }, [section]);
  return Boolean(section);
};

export const useSinglePageListing = () => useContext(SinglePageListingContext);
