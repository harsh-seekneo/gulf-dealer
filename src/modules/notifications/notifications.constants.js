import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Megaphone,
  MessageSquare,
  Star,
  Truck,
  XCircle,
} from "lucide-react";

export const DEALER_NOTIFICATION_TABS = [
  { key: "all", label: "All" },
  { key: "listings", label: "Vehicles" },
  { key: "leads", label: "Leads" },
  { key: "advertisements", label: "Advertisements" },
  { key: "business", label: "Profile" },
  { key: "payments", label: "Payments" },
  { key: "subscription", label: "Subscription" },
];

export const getNotificationVisual = (type = "") => {
  if (type.includes("REJECTED") || type.includes("FAILED") || type.includes("EXPIRED")) {
    return { icon: XCircle, bg: "bg-red-50 text-red-500", dot: "bg-red-500" };
  }

  if (type.includes("APPROVED") || type.includes("PUBLISHED") || type.includes("SUCCESSFUL") || type.includes("ACTIVATED")) {
    return { icon: CheckCircle2, bg: "bg-emerald-50 text-emerald-500", dot: "bg-emerald-500" };
  }

  if (type.includes("EXPIRING") || type.includes("LIMIT")) {
    return { icon: AlertCircle, bg: "bg-amber-50 text-amber-500", dot: "bg-amber-500" };
  }

  if (type === "NEW_LEAD") {
    return { icon: MessageSquare, bg: "bg-blue-50 text-blue-500", dot: "bg-blue-500" };
  }

  if (type.startsWith("ADVERTISEMENT_")) {
    return { icon: Megaphone, bg: "bg-sky-50 text-sky-500", dot: "bg-sky-500" };
  }

  if (type.startsWith("PAYMENT_") || type.startsWith("REFUND_") || type.startsWith("WITHDRAWAL_")) {
    return { icon: CreditCard, bg: "bg-violet-50 text-violet-500", dot: "bg-violet-500" };
  }

  if (type.startsWith("SUBSCRIPTION_")) {
    return { icon: Star, bg: "bg-green-50 text-green-500", dot: "bg-green-500" };
  }

  if (type.startsWith("LISTING_")) {
    return { icon: Truck, bg: "bg-blue-50 text-blue-500", dot: "bg-blue-500" };
  }

  return { icon: Bell, bg: "bg-slate-50 text-slate-500", dot: "bg-slate-500" };
};

export const timeAgo = (date) => {
  if (!date) return "";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
