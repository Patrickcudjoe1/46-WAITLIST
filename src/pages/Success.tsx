import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Package, ShoppingBag, MapPin } from "lucide-react";

interface WaitlistEntry {
  name: string;
  size: string;
  quantity: number;
  location: string;
  status: string;
}

const Success = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const [details, setDetails] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await fetch(`${backendUrl}/api/waitlist/${reference}`);
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
          
          // Proactively verify status if it's still 'pending'
          if (data.status === "pending") {
            const verifyRes = await fetch(`${backendUrl}/api/waitlist/verify/${reference}`, {
              method: "POST"
            });
            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              if (verifyData.status === "paid") {
                // Refresh details
                const updatedRes = await fetch(`${backendUrl}/api/waitlist/${reference}`);
                const updatedData = await updatedRes.json();
                setDetails(updatedData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch transaction details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#f6f6f4] px-6 py-20 flex flex-col items-center">
      <div className="w-full max-w-md">
        {/* Success Icon Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 scale-150 blur-2xl bg-green-500/10 rounded-full animate-pulse" />
            <CheckCircle2 className="h-16 w-16 text-black relative z-10" />
          </div>
        </div>

        <div className="text-center space-y-4 mb-12">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-black">
            THANK YOU
          </h1>
          <p className="font-body text-sm text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
            Your pre-order for the 46 Gold Coast Jersey has been successfully confirmed.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : details ? (
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-6 border-b border-zinc-100">
              <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">
                ORDER SUMMARY
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Items</p>
                    <p className="font-body text-sm font-semibold text-black leading-tight">
                      46 Gold Coast Jersey
                    </p>
                    <div className="flex gap-3 mt-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 font-body text-[9px] font-bold text-zinc-600">
                        SIZE {details.size}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 font-body text-[9px] font-bold text-zinc-600">
                        QTY {details.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="font-body text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Delivery To</p>
                    <p className="font-body text-sm font-semibold text-black">
                      {details.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50 flex items-center justify-between text-[10px] font-medium text-zinc-500">
              <span>REF: {reference?.slice(0, 12)}...</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="uppercase tracking-widest font-bold text-black italic">PAID</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-500">Payment completed. Confirmation details will be sent to your email.</p>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center space-y-6">
          <Link
            to="/"
            className="group flex items-center gap-2 font-body text-xs font-bold uppercase tracking-[0.2em] text-black hover:opacity-70 transition-all"
          >
            <span>Back to Store</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="pt-8 border-t border-zinc-200 w-full text-center">
            <p className="font-body text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              20 SLOTS ONLY - PRE-ORDER SECURED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
