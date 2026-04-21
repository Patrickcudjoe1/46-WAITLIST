import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Package, User, Mail, MapPin, Hash, RefreshCcw, Loader2 } from "lucide-react";

interface WaitlistEntry {
  id: number;
  name: string;
  size: string;
  quantity: number;
  location: string;
  email: string;
  phone: string;
  paymentReference: string;
  paymentStatus: string;
  createdAt: string;
}

const AdminWaitlist = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${backendUrl}/api/waitlist`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const copyLink = (ref: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/checkout/${ref}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-zinc-100 text-zinc-500 border-zinc-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-extrabold text-black tracking-tight">WAITLIST ADMIN</h1>
            <p className="font-body text-xs text-zinc-400 uppercase tracking-widest">Managing {entries.length} Registrations</p>
          </div>
          <button 
            onClick={fetchEntries}
            className="inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
          >
            <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-zinc-200">
            <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
            <p className="font-body text-xs text-zinc-400 uppercase tracking-widest">Fetching database records...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="p-6 font-body text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="p-6 font-body text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Order</th>
                    <th className="p-6 font-body text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Location</th>
                    <th className="p-6 font-body text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Payment</th>
                    <th className="p-6 font-body text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-body text-sm font-bold text-black">{entry.name}</span>
                          <span className="font-body text-[11px] text-zinc-400 flex items-center gap-1.5 italic">
                            <Mail className="h-3 w-3" /> {entry.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-black border border-zinc-200">
                            SIZE {entry.size}
                          </span>
                          <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-black border border-zinc-200">
                            QTY {entry.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-1.5 font-body text-[11px] font-medium text-zinc-500 italic">
                          <MapPin className="h-3 w-3" /> {entry.location}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(entry.paymentStatus)}`}>
                          {entry.paymentStatus}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {entry.paymentStatus.toLowerCase() === 'pending' ? (
                          <button
                            onClick={() => copyLink(entry.paymentReference)}
                            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-body text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
                          >
                            {copiedRef === entry.paymentReference ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy Link
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="font-body text-[10px] font-bold text-green-500 uppercase tracking-widest">
                            Fulfilled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {entries.length === 0 && (
              <div className="p-20 text-center">
                <p className="font-body text-xs text-zinc-400 uppercase tracking-widest italic">No registrations found in database.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWaitlist;
