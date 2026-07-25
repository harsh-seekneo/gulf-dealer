import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AdPreview from "../components/AdPreview";
import AdPlacementSelector from "../components/AdPlacementSelector";
import AdPaymentDetails from "../components/AdPaymentDetails";
import { advertisementsApi } from "../api/advertisementsApi";

export default function AdDetailPage() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await advertisementsApi.getById(id);
        setAd(data.ad);
      } catch (err) {
        console.error("Failed to load ad:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDownloadInvoice = async () => {
    const blob = await advertisementsApi.downloadInvoice(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-sm text-slate-400">Loading ad details...</p>;
  if (!ad) return <p className="text-sm text-slate-400">Advertisement not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} />
          Create Ad
        </button>
      </div>

      <AdPreview ad={ad} device={device} onDeviceChange={setDevice} />
      <AdPlacementSelector selected={ad.placement} />
      <AdPaymentDetails ad={ad} onDownloadInvoice={handleDownloadInvoice} />
    </div>
  );
}