import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiShield, FiTrash2, FiPause, FiPlay, 
  FiClock, FiUsers, FiTrendingUp, FiActivity, FiHash, FiFileText
} from "react-icons/fi";
import API from "../../services/api";

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await API.get(`/admin/events/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateStatus = async (newStatus) => {
    if (newStatus === 'Terminate' && !window.confirm("Permanently delete this asset?")) return;
    
    try {
      if (newStatus === 'Terminate') {
        await API.delete(`/admin/events/${id}`);
        navigate("/admin/events");
      } else {
        await API.patch(`/admin/events/${id}/status`, { status: newStatus });
        fetchData();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">SYNCING AUDIT DATA...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 uppercase text-[10px] font-black tracking-widest transition-colors">
          <FiArrowLeft size={16} /> Back to Ledger
        </button>
        
        <div className="flex gap-3">
          {/* <button 
            onClick={() => updateStatus(product.status === 'Paused' ? 'Active' : 'Paused')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-sm border ${
              product.status === 'Paused' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
            }`}
          >
            {product.status === 'Paused' ? <><FiPlay /> Resume</> : <><FiPause /> Freeze</>}
          </button> */}
          <button 
            onClick={() => updateStatus('Terminate')}
            className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-red-100 transition-all shadow-sm"
          >
            <FiTrash2 /> Terminate
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Asset & Bid History */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <div className="w-40 h-40 bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 shrink-0">
                <img src={product.images?.[0]} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    ID: {product._id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    product.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{product.title}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <FiUsers className="text-blue-500"/> Seller: <span className="font-bold text-slate-800">{product.sellerId?.email || 'System'}</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Starting Price', val: `₹${product.startingPrice.toLocaleString()}`, color: 'text-slate-900' },
                { label: 'Current Bid', val: `₹${product.currentBid.toLocaleString()}`, color: 'text-blue-600' },
                { label: 'Min Increment', val: `₹${product.bidIncrement}`, color: 'text-emerald-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BID HISTORY TABLE - The New Audit Log */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <FiTrendingUp className="text-blue-600"/> Transaction Audit Log
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{product.bids?.length || 0} Total Bids</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto overflow-x-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Bidder Identity</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Amount</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Timestamp</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {product.bids?.length > 0 ? (
                    product.bids.map((bid) => (
                      <tr key={bid._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-800 italic">"{bid.bidderId?.email}"</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-blue-600">₹{bid.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(bid.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase border ${
                            bid.isAutoBid ? 'border-purple-100 text-purple-500 bg-purple-50' : 'border-slate-100 text-slate-400'
                          }`}>
                            {bid.isAutoBid ? 'Proxy' : 'Manual'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <FiActivity className="mx-auto text-slate-200 mb-4" size={40} />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No bids recorded yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Stats & Users */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
            <h3 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
              <FiUsers className="text-blue-600"/> Registration Vault
            </h3>
            <div className="space-y-3">
              {product.registeredUsers?.map((reg, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="truncate pr-4">
                    <p className="text-xs font-black text-slate-800">@{reg.bidderName}</p>
                    <p className="text-[9px] text-slate-400 truncate uppercase">{reg.userId?.email || 'Guest'}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              ))}
              {(!product.registeredUsers || product.registeredUsers.length === 0) && (
                <p className="p-6 text-center text-[10px] font-bold text-slate-300 uppercase border-2 border-dashed border-slate-100 rounded-3xl">Zero Registrations</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FiShield size={80} />
            </div>
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <FiShield className="text-blue-400"/> Admin Security
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Auction Logic</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">Verified</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Escrow Locked</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">₹{product.currentBid.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-500 mt-6 leading-relaxed uppercase">
              All administrative actions on this ledger are encrypted and non-reversible.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminProductDetail;