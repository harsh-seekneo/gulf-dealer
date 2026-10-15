export default function StatCard({
  icon: Icon,
  value,
  label,
  shortLabel,
  iconColor = "text-blue-600",
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-1 text-center sm:px-3">
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />

      <p className="mt-1.5 max-w-full truncate text-lg font-bold leading-none text-slate-900 sm:mt-2 sm:text-2xl lg:text-3xl">
        {value}
      </p>

      <p className="mt-1 max-w-full truncate text-[11px] text-slate-500 sm:text-sm">
        <span className="sm:hidden">{shortLabel ?? label}</span>
        <span className="hidden sm:inline">{label}</span>
      </p>
    </div>
  );
}