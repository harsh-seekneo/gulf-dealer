const SIZE_CLASS = {
  xs: "text-sm",
  sm: "text-[15px]",
  md: "text-[15px]",
  lg: "text-[24px]",
  xl: "text-[28px]",
};

const TONE_CLASS = {
  default: "text-slate-900",
  accent: "text-slate-900",
  premium: "text-slate-900",
  white: "text-white",
  muted: "text-slate-800",
};

const PlanPriceText = ({
  as: Component = "p",
  size = "sm",
  tone = "default",
  className = "",
  children,
  ...props
}) => (
  <Component
    className={`break-words font-black leading-none tracking-normal ${
      SIZE_CLASS[size] || SIZE_CLASS.sm
    } ${TONE_CLASS[tone] || TONE_CLASS.default} ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export default PlanPriceText;
