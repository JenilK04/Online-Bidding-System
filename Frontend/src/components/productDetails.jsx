import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiClock, FiUsers, FiTrendingUp, FiInfo, 
  FiCheckCircle, FiArrowLeft, FiCalendar, FiShield 
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";
import socket from "../services/socket";

// --- HELPERS ---
const formatDateFull = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id;
  } catch { return null; }
};

const ProductDetails = () => {
  const { id } = useParams();
  const userId = getUserId();

  // State
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isNewBid, setIsNewBid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [selectedImg, setSelectedImg] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [bidderName, setBidderName] = useState("");

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setError("");
    } catch (err) {
      setError("This auction listing is no longer available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  useEffect(() => {
    if (!product?._id) return;
    socket.emit("joinProduct", product._id);

    const handleUpdate = (updated) => {
      if (updated._id === id) { // Direct ID check to avoid stale closures
        setProduct(updated);
        setIsNewBid(true);
        setTimeout(() => setIsNewBid(false), 2000);
      }
    };

    socket.on("productUpdated", handleUpdate);
    return () => {
        socket.emit("leaveProduct", product._id); // Clean up socket room
        socket.off("productUpdated", handleUpdate);
    };
  }, [id, product?._id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- UI STATE GUARDS ---
  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Synchronizing Auction Data...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiInfo size={32} />
        </div>
        <p className="text-slate-800 font-bold mb-4">{error}</p>
        <Link to="/products" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          Back to Gallery
        </Link>
      </div>
    </div>
  );

  const registeredCount = product.registeredUsers?.length || 0;
  const remainingSlots = (product.maxRegistrations || 0) - registeredCount;
  const isRegistered = product.registeredUsers?.some(u => u.userId === userId);
  const isOwner = product.sellerId === userId;
  const currentPrice = product.currentBid > 0 ? product.currentBid : product.startingPrice;
  const minimumBid = currentPrice + (product.bidIncrement || 0);
  const isHighestBidder = product.highestBidderId === userId;

  const getCountdown = () => {
    const startTime = new Date(product.auctionStart).getTime();
    const diff = startTime - now;
    if (product.status === "Upcoming") {
        if (diff <= 0) return "Starting...";
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${h}h ${m}m ${s}s`;
    }
    if (product.status === "Active") {
        const liveTime = now - startTime;
        const h = Math.floor(liveTime / 3600000);
        const m = Math.floor((liveTime % 3600000) / 60000);
        const s = Math.floor((liveTime % 60000) / 1000);
        return `${h}h ${m}m ${s}s`;
    }
    return "Closed";
  };

  const handleRegister = async () => {
    try {
      await API.post(`/products/register/${id}`, { bidderName: bidderName.trim() });
      setShowRegisterModal(false);
      fetchProduct();
    } catch (err) { alert(err.response?.data?.message || "Registration failed"); }
  };

  const handlePlaceBid = async () => {
    try {
      await API.post(`/products/bids/${id}`, { amount: Number(bidAmount) });
      setBidAmount("");
    } catch (err) { alert(err.response?.data?.message || "Bid failed"); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition text-sm font-bold uppercase tracking-wider">
          <FiArrowLeft /> Gallery / {product.title}
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: IMAGE SUITE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-8 sm:p-12">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImg}
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImg]} 
                className="max-h-full w-auto object-contain drop-shadow-2xl" 
              />
            </AnimatePresence>
          </div>
          {/* Fixed Horizontal Scrollbar Visibility */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImg(i)}
                className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl border-2 transition-all overflow-hidden bg-white p-2 ${selectedImg === i ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-contain" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: AUCTION DASHBOARD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
            
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${product.status === 'Active' ? 'bg-green-500 text-white' : 'bg-amber-400 text-white'}`}>
                    {product.status}
                 </span>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <FiCalendar className="text-blue-600" /> {formatDateFull(product.auctionStart)}
                 </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
                {product.title}
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Price</p>
                <motion.p 
                  key={currentPrice}
                  animate={isNewBid ? { scale: [1, 1.1, 1], color: ['#2563eb', '#16a34a', '#2563eb'] } : {}}
                  className="text-2xl sm:text-3xl font-black text-blue-600"
                >
                  ₹{currentPrice.toLocaleString()}
                </motion.p>
              </div>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {product.status === 'Upcoming' ? 'Starts In' : 'Duration'}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tracking-tighter">
                    {getCountdown()}
                </p>
              </div>
            </div>

            {/* BIDDING CONSOLE - Fixed padding and layout */}
            <div className={`p-6 sm:p-8 rounded-[24px] border-2 transition-all duration-500 ${isRegistered ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
              {isOwner ? (
                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm h-12">
                   <FiShield /> Merchant View
                </div>
              ) : !isRegistered ? (
                <div className="text-center space-y-5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Participation</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{remainingSlots} slots left</p>
                  </div>
                  <button 
                    disabled={remainingSlots <= 0 || product.status === "Ended"}
                    onClick={() => { setBidderName(`Bidder_${registeredCount + 1}`); setShowRegisterModal(true); }}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition shadow-lg active:scale-95 disabled:opacity-20"
                  >
                    Register Now
                  </button>
                </div>
              ) : product.status === "Active" ? (
                <div className="space-y-5">
                  {isHighestBidder && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest p-2.5 rounded-xl flex items-center justify-center gap-2">
                      <FiCheckCircle size={14} /> Leading Bidder
                    </motion.div>
                  )}
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg group-focus-within:text-blue-600 transition-colors">₹</span>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min ${minimumBid.toLocaleString()}`}
                      className="w-full bg-white border border-slate-200 pl-10 pr-4 py-5 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <button 
                    disabled={!bidAmount || Number(bidAmount) < minimumBid || isHighestBidder}
                    onClick={handlePlaceBid}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                  >
                    Place Bid
                  </button>
                </div>
              ) : (
                <div className="py-2 text-center">
                   <div className="text-blue-600 font-black text-xs flex items-center justify-center gap-2 uppercase tracking-widest">
                      <FiClock /> Catalog Mode
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Bidding restricted until start date</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[24px] border border-slate-200 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><FiUsers /></div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Room Size</p>
                  <p className="text-lg font-black text-slate-800">{registeredCount}/{product.maxRegistrations}</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[24px] border border-slate-200 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0"><FiTrendingUp /></div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Total Bids</p>
                  <p className="text-lg font-black text-slate-800">{product.bidsCount}</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* --- MODAL FIXES: Proper layering and scroll lock --- */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegisterModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">Handle</h2>
              <p className="text-slate-500 text-xs mb-8 leading-relaxed">Enter your alias for this auction floor.</p>
              <input 
                type="text" 
                value={bidderName} 
                autoFocus
                onChange={(e) => setBidderName(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-black text-slate-900 mb-8 outline-none focus:border-blue-600"
              />
              <div className="flex flex-col gap-2">
                <button onClick={handleRegister} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-lg">Confirm Identity</button>
                <button onClick={() => setShowRegisterModal(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600 transition tracking-widest">Withdraw</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;