import { useEffect, useState } from "react";
import ColorSwatchField from "./ColorSwatchField";
import ToggleGroupField from "./ToggleGroupField";
import { getBrandOptionsApi, getCatalogModelOptionsApi } from "../../api/catalogApi";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear + 1 - i);

const GULF_COUNTRIES = ["Bahrain", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Oman"];

const baseInputClass =
  "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const DynamicField = ({ field, value, onChange, error, form, categoryId }) => {
  const errorClass = error ? "border-red-400 ring-2 ring-red-400 ring-offset-1" : "border-slate-300";

  const [brandOptions, setBrandOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  useEffect(() => {
    if (field.type !== "brandSelect" || !categoryId) return;
    getBrandOptionsApi({ category: categoryId, status: "ACTIVE" })
      .then((data) => setBrandOptions(data || []))
      .catch(() => setBrandOptions([]));
  }, [field.type, categoryId]);

  useEffect(() => {
    if (field.type !== "modelSelect" || !categoryId || !form?.brand) {
      setModelOptions([]);
      return;
    }
    getCatalogModelOptionsApi({ category: categoryId, brand: form.brand, status: "ACTIVE" })
      .then((data) => setModelOptions(data || []))
      .catch(() => setModelOptions([]));
  }, [field.type, categoryId, form?.brand]);

  switch (field.type) {
    case "text":
    case "number":
      return (
        <input
          type={field.type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${baseInputClass} ${errorClass}`}
        />
      );

    case "vin":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          maxLength={17}
          placeholder="Enter 17-digit VIN"
          className={`${baseInputClass} ${errorClass} font-mono uppercase`}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className={`${baseInputClass} ${errorClass}`}
        />
      );

    case "textarea":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${baseInputClass} ${errorClass} h-auto resize-none py-2.5`}
        />
      );

    case "select":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${baseInputClass} ${errorClass}`}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );

    case "yearSelect":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${baseInputClass} ${errorClass}`}>
          <option value="">Select year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      );

    case "countrySelect":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${baseInputClass} ${errorClass}`}>
          <option value="">Select country</option>
          {GULF_COUNTRIES.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      );

    case "brandSelect":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={!categoryId} className={`${baseInputClass} ${errorClass} disabled:bg-slate-100`}>
          <option value="">Select brand</option>
          {brandOptions.map((brand) => (
            <option key={brand._id} value={brand._id}>{brand.name}</option>
          ))}
        </select>
      );

    case "modelSelect":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={!form?.brand} className={`${baseInputClass} ${errorClass} disabled:bg-slate-100`}>
          <option value="">Select model</option>
          {modelOptions.map((model) => (
            <option key={model._id} value={model._id}>{model.name}</option>
          ))}
        </select>
      );

    case "yesNoSelect":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${baseInputClass} ${errorClass}`}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );

    case "toggle2":
    case "toggle3":
      return <ToggleGroupField value={value} onChange={onChange} options={field.options} error={error} />;

    case "colorSwatch":
      return <ColorSwatchField value={value} onChange={onChange} swatches={field.swatches} error={error} />;

    case "toggleSwitch":
      return (
        <label className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-800">{field.label}</p>
            {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${value ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </label>
      );

    default:
      return null;
  }
};

export default DynamicField;