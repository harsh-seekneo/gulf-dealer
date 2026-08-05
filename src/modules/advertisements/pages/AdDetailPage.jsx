import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
  Tag,
} from "lucide-react";

import { advertisementsApi } from "../api/advertisementsApi";

const categoryConfig = {
  HOME_PAGE_BANNER: {
    title: "Homepage Banner",
    subtitle: "Top placement with maximum homepage visibility",
    dimensions: "1440 x 200 px",
    icon: Layers,
  },
  LISTING_BANNER: {
    title: "Listing Page Banner",
    subtitle: "Appears inside listing detail pages",
    dimensions: "728 x 90 px",
    icon: FileText,
  },
  LARGE_CATEGORY_BANNER: {
    title: "Large Category Ad",
    subtitle: "Shown on category and search result pages",
    dimensions: "300 x 250 px",
    icon: Layers,
  },
  SMALL_ADVERTISEMENT_SPACE: {
    title: "Small Ad Space",
    subtitle: "Sidebar and inline ad slots",
    dimensions: "160 x 600 px",
    icon: Tag,
  },
};

const devices = [
  { key: "desktop", label: "Desktop", icon: Monitor, width: "max-w-4xl" },
  { key: "tablet", label: "Tablet", icon: Tablet, width: "max-w-2xl" },
  { key: "mobile", label: "Mobile", icon: Smartphone, width: "max-w-sm" },
];

const formatCurrency = (value) => `BHD ${(Number(value) || 0).toFixed(3)}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getStatusClass = (status) => {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (status === "PENDING") return "bg-amber-100 text-amber-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
};

const DetailRow = ({ label, value, children }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-b-0">
    <span className="text-slate-500">{label}</span>
    {children || <span className="text-right font-semibold text-slate-900">{value || "-"}</span>}
  </div>
);

const Section = ({ title, children, action }) => (
  <section className="overflow-hidden rounded-xl bg-white shadow-sm">
    <div className="flex min-h-14 items-center justify-between border-b border-slate-100 px-5">
      <h2 className="font-bold text-slate-950">{title}</h2>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export default function AdDetailPage() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    advertisementsApi
      .getById(id)
      .then((data) => {
        if (active) setAd(data.ad || data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load advertisement");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleDownloadInvoice = () => {
    window.print();
  };

  if (loading) return <p className="text-sm text-slate-400">Loading ad details...</p>;
  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!ad) return <p className="text-sm text-slate-400">Advertisement not found.</p>;

  const config = categoryConfig[ad.category] || categoryConfig.HOME_PAGE_BANNER;
  const activeDevice = devices.find((item) => item.key === device) || devices[0];
  const creativeUrl = ad.creatives?.[device]?.url || ad.creatives?.desktop?.url;
  const startDate = ad.startsAt || ad.createdAt;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/advertisements"
            className="mb-3 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-950">
              {ad.name || config.title}
            </h1>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(ad.status)}`}>
              {ad.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{ad.advertisementId}</p>
        </div>
      </div>

      <Section
        title="Advertisement Preview"
        action={
          <div className="flex overflow-hidden rounded-xl bg-slate-100 p-1">
            {devices.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDevice(item.key)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${
                    device === item.key ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className={`mx-auto ${activeDevice.width}`}>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex h-10 items-center gap-2 border-b border-slate-100 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-400">
                  gulfincart.com - {config.dimensions}
                </span>
              </div>
              <div className="p-4">
                {creativeUrl ? (
                  <img
                    src={creativeUrl}
                    alt={`${device} advertisement creative`}
                    className="h-52 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-400">
                    No {device} creative uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Campaign Details">
          <DetailRow label="Advertisement Name" value={ad.name} />
          <DetailRow label="Ad ID" value={ad.advertisementId} />
          <DetailRow label="Placement" value={config.title} />
          <DetailRow label="Duration" value={`${ad.durationDays || 0} Days`} />
          <DetailRow label="Views" value={(ad.viewCount || 0).toLocaleString()} />
          <DetailRow label="Redirect URL">
            {ad.redirectTo ? (
              <a
                href={ad.redirectTo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-[260px] items-center gap-1 truncate text-right font-semibold text-blue-600"
              >
                <span className="truncate">{ad.redirectTo}</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <span className="font-semibold text-slate-900">-</span>
            )}
          </DetailRow>
        </Section>

        <Section title="Advertisement Placement">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(categoryConfig).map(([key, item]) => {
              const Icon = item.icon;
              const selected = ad.category === key;
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-4 ${
                    selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      selected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Advertisement Plan">
          <DetailRow label="Plan Name" value={`Premium ${config.title}`} />
          <DetailRow label="Start Date" value={formatDate(startDate)} />
          <DetailRow label="End Date" value={formatDate(ad.endsAt)} />
          <DetailRow label="Payment Status" value={ad.paymentStatus} />
          <DetailRow label="Amount" value={formatCurrency(ad.totalAmount || ad.price)} />
        </Section>

        <Section
          title="Payment Details"
          action={
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600"
            >
              <Download size={15} />
              Download Invoice
            </button>
          }
        >
          <DetailRow label="Invoice Number" value={`INV-${String(ad._id).slice(-8).toUpperCase()}`} />
          <DetailRow label="Payment Method" value={ad.paymentMethod || "-"} />
          <DetailRow label="Transaction Date" value={formatDate(ad.paidAt || ad.createdAt)} />
          <DetailRow label="VAT (5%)" value={formatCurrency(ad.vatAmount)} />
          <DetailRow label="Amount Paid" value={formatCurrency(ad.totalAmount || ad.price)} />
        </Section>
      </div>

      {ad.status === "REJECTED" ? (
        <Section title="Review Notes">
          <DetailRow label="Reason" value={ad.rejectionReason} />
          <DetailRow label="Remark" value={ad.rejectionRemark} />
        </Section>
      ) : null}
    </div>
  );
}
