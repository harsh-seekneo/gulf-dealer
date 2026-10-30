import { Children, createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, ChevronDown, ListChecks, Loader2, Search, X } from "lucide-react";

const SelectionContext = createContext(null);

const OptionLogo = ({ src, label, small = false }) => (
  <span aria-hidden="true" className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white font-semibold text-slate-500 ${small ? "h-6 w-6 text-[9px]" : "h-10 w-10 text-xs"}`}>
    <span>{String(label).slice(0, 2).toUpperCase()}</span>
    {src && <img key={src} src={src} alt="" className="absolute inset-0 h-full w-full bg-white object-contain p-1" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
  </span>
);

export const ModalSelect = ({ children, value, onChange, disabled, className, label = "Select an option", fallback, loading = false, ...props }) => {
  const flow = useContext(SelectionContext);
  const id = useId();
  const ref = useRef(null);
  const options = Children.toArray(children).filter((child) => child?.props && String(child.props.value ?? "") !== "").map((child) => ({ value: String(child.props.value), label: child.props.children, disabled: child.props.disabled, logo: child.props["data-logo"] }));
  const showLogos = options.some((option) => Boolean(option.logo));
  useLayoutEffect(() => {
    if (!flow) return;
    flow.register(id, { options, value: String(value ?? ""), onChange, disabled, label, loading, showLogos, element: ref.current });
  });
  const unregister = flow?.unregister;
  useEffect(() => () => unregister?.(id), [unregister, id]);
  if (!flow) return fallback || <select {...props} value={value} onChange={onChange} disabled={disabled} className={className}>{children}</select>;
  const selected = options.find((item) => item.value === String(value ?? ""));
  return <button ref={ref} type="button" data-listing-select={id} {...props} aria-label={label} aria-haspopup="dialog" onClick={() => flow.open(id)} disabled={disabled} className={`${className} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100`}>
    <span className="flex min-w-0 items-center gap-2">{selected?.logo && <OptionLogo src={selected.logo} label={selected.label} small />}<span className={`truncate ${selected ? "" : "text-slate-500"}`}>{selected?.label || `Select ${label.toLowerCase()}`}</span></span><ChevronDown size={16} className="shrink-0 text-slate-400" />
  </button>;
};

const SelectionFlowProvider = ({ children }) => {
  const entries = useRef(new Map());
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recentField, setRecentField] = useState(null);
  const [revision, setRevision] = useState(0);
  const pendingNext = useRef(null);
  const dialog = useRef(null);
  const summary = useRef(null);
  const origin = useRef(null);
  const activeRef = useRef(null);
  activeRef.current = active;
  const signatures = useRef(new Map());
  const register = useCallback((id, entry) => {
    const signature = JSON.stringify([entry.options, entry.value, entry.disabled, entry.loading]);
    const changed = signatures.current.get(id) !== signature;
    signatures.current.set(id, signature);
    entries.current.set(id, entry);
    if (changed && activeRef.current) setRevision((current) => current + 1);
  }, []);
  const unregister = useCallback((id) => { entries.current.delete(id); signatures.current.delete(id); }, []);
  const close = useCallback(() => { setActive(null); pendingNext.current = null; origin.current?.focus(); }, []);
  const ordered = useCallback(() => Array.from(document.querySelectorAll("[data-listing-select]")).map((node) => node.dataset.listingSelect).filter((id) => entries.current.has(id) && !entries.current.get(id).disabled), []);
  const move = useCallback((direction) => {
    const ids = ordered();
    const next = ids[ids.indexOf(active) + direction];
    setQuery("");
    if (next) setActive(next); else close();
  }, [active, close, ordered]);
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") {
        const elements = Array.from(dialog.current?.querySelectorAll("button:not(:disabled), input") || []);
        const first = elements[0]; const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); };
    // The listener reads the current close handler on each dialog change.
  }, [active, close]);
  useEffect(() => {
    if (!pendingNext.current) return;
    const selected = pendingNext.current;
    pendingNext.current = null;
    if (selected === "__OTHER__" || selected.toLowerCase() === "other") { close(); return; }
    move(1);
  }, [revision, close, move]);
  useEffect(() => {
    if (!active) return;
    const ids = ordered();
    const chips = Array.from(summary.current?.children || []);
    const chip = summary.current?.querySelector('[aria-current="step"]') || chips.findLast((node) => ids.indexOf(node.dataset.fieldId) < ids.indexOf(active)) || chips[0];
    chip?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, revision, ordered, detailsOpen]);
  const entry = entries.current.get(active);
  const selections = ordered().map((id) => {
    const field = entries.current.get(id);
    const selected = field.options.find((option) => option.value === field.value);
    return selected ? { id, field, selected } : null;
  }).filter(Boolean);
  // Children register their latest dependent options in layout effects. A render
  // after opening/advancing picks up those entries without fetching anything here.
  const value = { register, unregister, open: (id) => { origin.current = entries.current.get(id)?.element; setQuery(""); setActive(id); } };
  return <SelectionContext.Provider value={value}>
    {children}
    {active && entry && createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="listing-picker-title" className="dealer-selection-dialog flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[90dvh] sm:max-h-[760px] sm:rounded-2xl">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
            <button type="button" aria-label="Previous field" onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><ArrowLeft size={20} /></button>
            <div className="min-w-0 flex-1"><p className="text-xs font-medium text-blue-700">Vehicle details</p><h2 id="listing-picker-title" className="truncate text-xl font-semibold text-slate-950">{entry.label}</h2></div>
            <button type="button" aria-label="Close selection" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={20} /></button>
          </header>
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="dealer-selection-search shrink-0 px-4 pt-5 sm:px-6">
                <div className="relative"><Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input key={active} autoFocus aria-label={`Search ${entry.label}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${entry.label.toLowerCase()}…`} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-50" /></div>
                <p className="mt-3 text-xs text-slate-500">Choose an option to continue automatically.</p>
              </div>
              <div className={`grid min-h-0 flex-1 ${entry.showLogos ? "grid-cols-1 min-[360px]:grid-cols-2" : "grid-cols-2"} content-start gap-3 overflow-y-auto p-4 sm:p-6`}>
                {entry.loading && <p role="status" className="col-span-2 flex items-center justify-center gap-2 py-6 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading options…</p>}
                {!entry.loading && entry.options.filter((option) => String(option.label).toLowerCase().includes(query.toLowerCase())).map((option) => (
                  <button type="button" key={option.value} disabled={option.disabled} onClick={() => { entry.onChange({ target: { value: option.value } }); setRecentField(active); setDetailsOpen(false); pendingNext.current = option.value; setRevision((current) => current + 1); }} aria-pressed={entry.value === option.value} className={`flex min-h-14 items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-sm font-medium transition disabled:opacity-40 ${entry.value === option.value ? "border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"}`}>
                    <span className="flex min-w-0 items-center gap-3">{entry.showLogos && <OptionLogo src={option.logo} label={option.label} />}<span className="min-w-0 break-words">{option.label}</span></span>
                    {entry.value === option.value && <Check size={17} className="shrink-0 text-blue-600" />}
                  </button>
                ))}
                {!entry.loading && !entry.options.some((option) => String(option.label).toLowerCase().includes(query.toLowerCase())) && <p className="col-span-2 py-8 text-center text-sm text-slate-500">No matching options available.</p>}
              </div>
            </div>
            {selections.length > 0 && <aside className="flex shrink-0 flex-col border-t border-slate-200 bg-slate-50 md:w-64 md:border-l md:border-t-0">
              <div className="hidden shrink-0 px-5 pb-3 pt-5 md:block"><div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><ListChecks size={18} /></div><h3 className="font-semibold text-slate-900">Your vehicle so far</h3><p className="mt-1 text-xs leading-5 text-slate-500">{selections.length} details selected. Click any detail to edit.</p></div>
              <button type="button" aria-expanded={detailsOpen} aria-controls="listing-selection-summary" onClick={() => setDetailsOpen((open) => !open)} className="flex w-full items-center gap-3 px-4 py-3 text-left md:hidden">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><ListChecks size={19} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">Your selections <span className="ml-1 text-xs font-normal text-slate-500">({selections.length})</span></span><span className="block truncate text-xs text-slate-500">{(() => { const recent = selections.find((item) => item.id === recentField) || selections[0]; return recent ? `${recent.field.label}: ${recent.selected.label}` : "Tap to review and edit"; })()}</span></span>
                <ChevronDown size={18} className={`shrink-0 text-slate-500 transition ${detailsOpen ? "rotate-180" : ""}`} />
              </button>
              <nav id="listing-selection-summary" ref={summary} aria-label="Selected vehicle details" className={`${detailsOpen ? "grid" : "hidden"} max-h-48 grid-cols-2 gap-2 overflow-y-auto px-4 pb-4 md:flex md:max-h-none md:min-h-0 md:flex-1 md:flex-col md:gap-1 md:px-3 md:pb-5`}>
                {selections.map(({ id, field, selected }) => (
                  <button key={id} type="button" data-field-id={id} aria-label={`Edit ${field.label}: ${selected.label}`} aria-current={id === active ? "step" : undefined} onClick={() => { setQuery(""); setActive(id); setDetailsOpen(false); }} className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${id === active ? "border-blue-200 bg-white shadow-sm" : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"}`}>
                    {selected.logo && <OptionLogo src={selected.logo} label={selected.label} small />}
                    <span className="min-w-0 flex-1"><span className="block text-[11px] text-slate-500">{field.label}</span><span className="block break-words text-sm font-medium text-slate-800">{selected.label}</span></span>
                    <Check size={14} className="hidden shrink-0 text-blue-500 md:block" />
                  </button>
                ))}
              </nav>
            </aside>}
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
            <button type="button" onClick={close} className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Back to form</button>
            <button type="button" onClick={() => move(1)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Next field</button>
          </footer>
        </div>
      </div>, document.body)}
  </SelectionContext.Provider>;
};

export default SelectionFlowProvider;
