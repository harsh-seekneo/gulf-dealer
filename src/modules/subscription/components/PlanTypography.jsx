export const planSectionHeadingClass =
  "text-[34px] font-black leading-none text-[#07115a] sm:text-[42px]";

export const planSectionDescriptionClass =
  "mt-2 text-[17px] font-bold leading-6 text-slate-500";

export const planCardTitleClass =
  "break-words text-[15px] font-semibold leading-5 text-slate-900";

export const planCardTitleDarkClass =
  "break-words text-[15px] font-semibold leading-5 text-white";

export const planBodyTextClass =
  "text-[13px] font-normal leading-5 text-slate-500";

export const planBodyTextDarkClass =
  "text-[13px] font-normal leading-5 text-white/80";

export const planLabelTextClass =
  "text-xs font-medium leading-4 text-slate-500";

export const planLabelTextDarkClass =
  "text-xs font-medium leading-4 text-white/70";

export const planChipTextClass =
  "text-[13px] font-medium leading-4";

export const PlanSectionHeading = ({ as: Component = "h2", className = "", children }) => (
  <Component className={`${planSectionHeadingClass} ${className}`}>{children}</Component>
);

export const PlanSectionDescription = ({ as: Component = "p", className = "", children }) => (
  <Component className={`${planSectionDescriptionClass} ${className}`}>{children}</Component>
);
