
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-400">
      <Home size={16} />

      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <span key={item.label} className="flex items-center gap-2">
            <ChevronRight size={16} />

            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-slate-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-blue-600" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}