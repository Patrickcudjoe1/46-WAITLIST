import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, MapPin, Package, CreditCard, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

interface WaitlistEntry {
  name: string;
  size: string;
  quantity: number;
  location: string;
  status: string;
}

const Checkout = () => {
  const { reference } = useParams();
  const [details, setDetails] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${backendUrl}/api/waitlist/${reference}`);
        if (!response.ok) {
          throw new Error("Order not found or link expired.");
        }
        const data = await response.json();
        setDetails(data);
        if (data.status === "paid") {
          setError("This order has already been completed.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [reference]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${backendUrl}/api/waitlist/refresh/${reference}`, {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Could not refresh payment link.");
      }
      const data = await response.json();
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f4] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <p className="mt-4 font-body text-xs text-zinc-500 uppercase tracking-widest">Loading order details...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-[#f6f6f4] px-6 py-20 flex flex-col items-center">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-black">LINK UNAVAILABLE</h1>
          <p className="font-body text-sm text-zinc-500">{error || "This order link is no longer valid."}</p>
          <Link to="/" className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 pt-4">
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f4] px-6 py-20 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <Link to="/" className="group flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
            <ChevronLeft className="h-3 w-3" />
            <span>Return</span>
          </Link>
        </div>

        <div className="text-center space-y-4 mb-16">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-black">COMPLETE ORDER</h1>
          <p className="font-body text-xs text-zinc-400 uppercase tracking-widest leading-relaxed">
            Payment requested by 46 GOLD COAST
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-8 space-y-10">
            {/* Header / Recipient */}
            <div>
              <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">
                FOR
              </h3>
              <p className="font-display text-xl font-bold text-black">{details.name}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="h-12 w-12 bg-zinc-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Item Details</p>
                  <p className="font-body text-sm font-semibold text-black leading-tight">
                    46 Gold Coast Jersey
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="font-body text-[10px] font-bold text-zinc-500 uppercase">
                      SIZE: <span className="text-black">{details.size}</span>
                    </span>
                    <span className="font-body text-[10px] font-bold text-zinc-500 uppercase">
                      QTY: <span className="text-black">{details.quantity}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body text-sm font-bold text-black italic">
                    GHS {450 * details.quantity}.00
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex items-start gap-5 pt-6 border-t border-zinc-100">
              <div className="h-12 w-12 bg-zinc-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="font-body text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Shipping To</p>
                <p className="font-body text-sm font-semibold text-black italic">
                  {details.location}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="pt-8 border-t border-zinc-900/5 flex justify-between items-end">
              <div>
                <p className="font-body text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Amount</p>
                <p className="font-display text-4xl font-extrabold text-black italic">
                  GHS {450 * details.quantity}.00
                </p>
              </div>
              <div className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 font-body text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                Tax incl.
              </div>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-black text-white p-6 font-body text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:bg-zinc-400 disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            <span>{isProcessing ? "INITIALIZING..." : "SECURE CHECKOUT"}</span>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="font-body text-[9px] font-medium text-zinc-400 uppercase tracking-[0.2em] leading-loose max-w-[240px] mx-auto">
            YOU ARE PAYING THROUGH PAYSTACK'S SECURE PAYMENT GATEWAY.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
