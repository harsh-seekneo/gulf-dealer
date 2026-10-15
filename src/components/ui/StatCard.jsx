export default function StatCard({
  icon: Icon,
  value,
  label,
  iconBg = "bg-blue-100 text-blue-600",
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-2 shadow-sm sm:p-3 md:p-4 lg:p-5">
      <div
        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg sm:mb-3 sm:h-8 sm:w-8 lg:mb-4 lg:h-10 lg:w-10 ${iconBg}`}
      >
        <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
      </div>

      <p className="truncate text-base font-bold leading-tight text-slate-900 sm:text-xl md:text-2xl lg:text-3xl">
        {value}
      </p>

      <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-500 sm:text-xs lg:mt-1 lg:text-sm">
        {label}
      </p>
    </div>
  );
}