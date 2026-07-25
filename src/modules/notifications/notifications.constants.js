import { MessageSquare, CheckCircle2, AlertCircle, CreditCard, XCircle } from "lucide-react";

export const NOTIFICATION_ICONS = {
  lead: { icon: MessageSquare, bg: "bg-blue-100 text-blue-600" },
  approved: { icon: CheckCircle2, bg: "bg-emerald-100 text-emerald-600" },
  expiring: { icon: AlertCircle, bg: "bg-amber-100 text-amber-600" },
  payment: { icon: CreditCard, bg: "bg-violet-100 text-violet-600" },
  rejected: { icon: XCircle, bg: "bg-red-100 text-red-600" },
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
  return `${days} day${days > 1 ? "s" : ""} ago`;
};