import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiClock, FiInfo, FiCheckCircle, FiArrowLeft, FiUsers,
  FiCalendar, FiShield, FiMapPin, FiTruck, FiRotateCcw, FiTrendingUp, FiPackage, FiPlusCircle
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";
import socket from "../services/socket";

const ProductDetails = () => {
  const { id } = useParams();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = (user.id || user._id || "").toString();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImg, setSelectedImg] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [isPriceUpdating, setIsPriceUpdating] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [tempBidderName, setTempBidderName] = useState("");

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError("Listing not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  useEffect(() => {
    if (!id) return;
    socket.emit("joinProduct", id);
    socket.on("productUpdated", (updated) => {
      setProduct(updated);
      setIsPriceUpdating(true);
      setTimeout(() => setIsPriceUpdating(false), 2000);
    });
    return () => { socket.emit("leaveProduct", id); socket.off("productUpdated"); };
  }, [id]);

  const handleRegisterSubmit = async () => {
    if (!tempBidderName.trim()) return alert("Please enter a name.");
    try {
      await API.post(`/products/register/${id}`, { bidderName: tempBidderName });
      setShowRegModal(false);
      await fetchProduct(); 
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">Syncing Auction Floor...</div>;
  if (error || !product) return <div className="p-20 text-center"><p className="text-red-500 mb-4">{error}</p><Link to="/products" className="text-blue-600 font-bold underline">Back to Market</Link></div>;

  const currentPrice = product?.currentBid > 0 ? product.currentBid : (product?.startingPrice || 0);
  const minNextBid = currentPrice + (product?.bidIncrement || 0);
  
  const isOwner = (product.sellerId?._id || product.sellerId || "").toString() === userId;
 const registrationRecord = product.registeredUsers?.find(u => {
    // Get the ID from the database (Handles if it's an object or string)
    const dbId = (u.userId?._id || u.userId || "").toString().trim();
    
    // Log the comparison to catch mismatches in the console
    console.log(`Checking DB ID: ${dbId} against Local ID: ${userId}`);
    
    return dbId === userId && dbId !== "";
});

// 4. Final Boolean
const isRegistered = !!registrationRecord;

console.log("Is User Registered?:", isRegistered);
if (isRegistered) {
    console.log("Found Alias:", registrationRecord.bidderName);
}
  // Format Dates for UI
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />

      {/* --- REGISTRATION MODAL --- */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[32px] w-full max-w-sm shadow-2xl">
              <h2 className="text-2xl font-black mb-2">Bidder Registration</h2>
              <p className="text-slate-500 text-sm mb-6">Choose an alias for this auction floor.</p>
              <input 
                type="text" placeholder="e.g. VintageCollector" 
                className="w-full p-4 bg-slate-50 border rounded-2xl mb-6 outline-none focus:border-blue-600 font-bold"
                value={tempBidderName} onChange={(e) => setTempBidderName(e.target.value)}
              />
              <button onClick={handleRegisterSubmit} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl">Confirm Identity</button>
              <button onClick={() => setShowRegModal(false)} className="w-full mt-2 text-slate-400 font-bold text-xs py-2">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        
        {/* --- LEFT: FULL PRODUCT DETAILS --- */}
        <div className="lg:col-span-7 space-y-8">
          <div className="aspect-[4/3] bg-white rounded-[40px] border border-slate-200 overflow-hidden flex items-center justify-center p-8">
             <img src={product.images?.[selectedImg] || "https://via.placeholder.com/600"} className="max-h-full w-auto object-contain" alt="product" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => setSelectedImg(i)} className={`w-20 h-20 shrink-0 rounded-2xl border-2 transition-all ${selectedImg === i ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 opacity-60'}`}>
                <img src={img} className="w-full h-full object-cover rounded-xl" alt="" />
              </button>
            ))}
          </div>

          {/* ITEM SPECIFICS & AUCTION CONFIG */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800"><FiInfo className="text-blue-600"/> Item Specifics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand</p><p className="text-sm font-black text-slate-800">{product.brand || "Generic"}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition</p><p className="text-sm font-black text-blue-600">{product.condition}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bid Increment</p><p className="text-sm font-black text-green-600">₹{product.bidIncrement}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p><p className="text-sm font-black text-slate-800">{product.category}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU</p><p className="text-sm font-black text-slate-800">{product.sku || "N/A"}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrations</p><p className="text-sm font-black text-slate-800">{product.registeredUsers?.length} / {product.maxRegistrations}</p></div>
              </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-800"><FiCalendar className="text-blue-600"/> Auction Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Starts At</p>
                  <p className="text-sm font-black text-slate-700">{formatDate(product.startTime)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ends At</p>
                  <p className="text-sm font-black text-slate-700">{formatDate(product.endTime)}</p>
                </div>
              </div>
            </div>

            {/* LOGISTICS & RETURNS */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-800"><FiTruck className="text-blue-600"/> Logistics & Returns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium"><span className="text-slate-400">Shipping Weight</span><span className="text-slate-900">{product.shippingWeight}g</span></div>
                  <div className="flex justify-between text-sm font-medium"><span className="text-slate-400">Box Dimensions</span><span className="text-slate-900">{product.dimensions?.length}x{product.dimensions?.width}x{product.dimensions?.height} cm</span></div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase pt-2"><FiMapPin /> Item Location: {product.sellerAddress?.city}, {product.sellerAddress?.state}</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium"><span className="text-slate-400">Returns</span><span className={product.returnPolicy?.acceptsReturns ? 'text-green-600' : 'text-red-500'}>{product.returnPolicy?.acceptsReturns ? 'Accepted' : 'Final Sale'}</span></div>
                  <div className="flex justify-between text-sm font-medium"><span className="text-slate-400">Window</span><span className="text-slate-900">{product.returnPolicy?.returnWindow}</span></div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Item Description</p>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIVE AUCTION CONSOLE --- */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl">
             <div className="flex justify-between items-center mb-6">
               <span className={`px-4 py-1.5 text-white text-[10px] font-black uppercase rounded-full tracking-widest ${product.status === "Active" ? "bg-green-600" : "bg-blue-600"}`}>
                 {product.status}
               </span>
               {product.isExtended && <span className="text-orange-500 text-[10px] font-bold animate-pulse flex items-center gap-1"><FiClock /> EXTENDED</span>}
             </div>

             <h1 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{product.title}</h1>

             <motion.div animate={isPriceUpdating ? { scale: [1, 1.05, 1], backgroundColor: ["#ffffff", "#f0fdf4", "#ffffff"] } : {}} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 mb-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Current Bid</p>
                <p className={`text-4xl font-black ${isPriceUpdating ? "text-green-600" : "text-blue-600"}`}>₹{currentPrice.toLocaleString()}</p>
                <div className="flex gap-4 mt-3 border-t pt-3 border-slate-100">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><FiTrendingUp/> {product.bidsCount} Bids</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><FiUsers/> {product.registeredUsers?.length} Registered</span>
                </div>
             </motion.div>

             <div className="space-y-4">
               {isOwner ? (
                 <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed text-center">
                    <FiShield className="mx-auto text-slate-300 mb-2" size={24} />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Seller Management View</p>
                    <p className="text-[10px] text-slate-400 mt-1 italic">You cannot bid on your own item</p>
                 </div>
               ) : isRegistered ? (
                 <div className="space-y-4">
                    <div className="p-5 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-center">
                      <p className="font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                        <FiCheckCircle /> Registered As
                      </p>
                      <p className="text-sm font-black italic">"{registrationRecord.bidderName}"</p>


                      {product.highestBidderId === userId && (
                        <motion.div 
                          initial={{ scale: 0.9 }} 
                          animate={{ scale: 1 }} 
                          className="mt-2 py-1 px-3 bg-green-600 text-white text-[9px] font-black uppercase rounded-full inline-block tracking-widest"
                        >
                          🏆 You are the Highest Bidder
                        </motion.div>
                      )}
                    </div>

                    {product.status === "Active" ? (
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-1">
                            <span>Next Bid Must Be &ge;</span>
                            <span className="text-blue-600">₹{minNextBid.toLocaleString()}</span>
                         </div>
                         <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={`Min ₹${minNextBid}`} className="w-full p-5 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
                         <button onClick={() => API.post(`/bids/${id}`, { amount: Number(bidAmount) })} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl">Confirm Bid</button>
                      </div>
                    ) : product.status === "Scheduled" ? (
                      <div className="p-4 bg-slate-100 rounded-2xl text-center text-[10px] font-bold text-slate-500 uppercase">
                        Bidding Opens: {formatDate(product.startTime)}
                      </div>
                    ) : null}
                 </div>
               ) : product.status === "Scheduled" ? (
                 <button onClick={() => setShowRegModal(true)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Register to Bid</button>
               ) : product.status === "Active" ? (
                 <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
                    <p className="text-red-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><FiShield/> Registration Missed</p>
                    <p className="text-slate-400 text-[10px] mt-1">You must register during the scheduled phase to bid.</p>
                 </div>
               ) : (
                 <div className="p-8 bg-slate-100 rounded-3xl text-center">
                   <FiPackage className="mx-auto text-slate-300 mb-2" size={32}/>
                   <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Auction Closed</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;