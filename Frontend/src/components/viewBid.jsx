import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowLeft, FiClock, FiTrendingUp, FiUsers, 
  FiActivity, FiShield, FiCalendar, FiBox 
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";
import socket from "../services/socket";

const formatTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const MyProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, bidsRes] = await Promise.all([
        API.get(`/products/${id}`),
        API.get(`/bids/${id}`)
      ]);
      setProduct(prodRes.data);
      // Sort bids by newest first
      const sortedBids = bidsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBids(sortedBids);
    } catch (err) {
      setError("Failed to sync product data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Join room for this specific product
    socket.emit("joinProduct", id);

    // Listen for real-time product changes (Status, Current Bid, etc.)
    socket.on("productUpdated", (updatedProduct) => {
      if (updatedProduct._id === id) {
        setProduct(updatedProduct);
      }
    });

    // Listen for new bids
    socket.on("bidPlaced", (newBid) => {
      setBids((prev) => {
        // Prevent duplicate bids if socket fires twice
        if (prev.find(b => b._id === newBid._id)) return prev;
        return [newBid, ...prev];
      });
    });

    return () => {
      socket.emit("leaveProduct", id);
      socket.off("productUpdated");
      socket.off("bidPlaced");
    };
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Syncing Ledger...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] text-center shadow-2xl border border-slate-100">
        <p className="text-red-500 font-bold mb-6">{error || "Listing Not Found"}</p>
        <Link to="/my-products" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Return to Hub</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link to="/my-products" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-black text-[10px] uppercase tracking-[0.2em]">
            <FiArrowLeft size={16}/> Back to Seller Hub
          </Link>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-slate-400">
            SKU: {product.sku || "N/A"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Product Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm sticky top-24">
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-6 border border-slate-100">
                <img src={product.images[0]} className="w-full h-full object-cover" alt="product" />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  product.status === "Active" ? "bg-green-500 text-white" : "bg-slate-900 text-white"
                }`}>
                  {product.status}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {product.condition}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 leading-tight mb-4">{product.title}</h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{product.description}</p>
              
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FiUsers className="text-blue-600"/> Registered Paddles ({product.registeredUsers?.length || 0})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {product.registeredUsers?.map((u, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">{u.bidderName}</span>
                      <span className="text-[10px] font-black text-slate-400">#{u.bidderNumber}</span>
                    </div>
                  ))}
                  {product.registeredUsers?.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-4">No bidders registered yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Data & History */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Real-time Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <FiTrendingUp className="text-blue-600 mb-4" size={24}/>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current High Bid</p>
                  <p className="text-3xl font-black text-slate-900">₹{(product.currentBid || product.startingPrice).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <FiActivity className="text-purple-600 mb-4" size={24}/>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bid Count</p>
                  <p className="text-3xl font-black text-slate-900">{product.bidsCount || 0}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <FiClock className="text-orange-500 mb-4" size={24}/>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ends On</p>
                  <p className="text-sm font-black text-slate-700 leading-tight">
                    {formatTime(product.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bid History Ledger */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Live Bid Ledger</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Trail for this Listing</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Connection
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequence</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bidder Alias</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bid Amount</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence initial={false}>
                      {bids.map((bid, index) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={bid._id} 
                          className={index === 0 ? "bg-blue-50/20" : "hover:bg-slate-50 transition-colors"}
                        >
                          <td className="px-8 py-5">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                              index === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-500"
                            }`}>
                              {bids.length - index}
                            </span>
                          </td>
                          <td className="px-8 py-5 font-bold text-slate-700">{bid.bidderName || "Anonymous"}</td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                                <span className="text-green-600 font-black text-lg tracking-tight">₹{bid.amount.toLocaleString()}</span>
                                {index === 0 && <span className="text-[9px] font-black text-blue-500 uppercase">Leader</span>}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">{formatTime(bid.createdAt)}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                
                {bids.length === 0 && (
                  <div className="py-24 text-center">
                    <FiBox size={48} className="mx-auto text-slate-200 mb-4"/>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No bids placed yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProductDetails;