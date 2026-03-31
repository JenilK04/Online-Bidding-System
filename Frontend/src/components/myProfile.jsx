import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiTruck, FiCheckCircle, FiPhone,FiCreditCard, 
  FiClock, FiArrowRight, FiMapPin, FiFileText, FiHash, FiActivity, FiTag, FiSend
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wonItems, setWonItems] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState("won"); 

  // --- NEW STATES FOR SHIPPING WORKFLOW ---
  const [trackingData, setTrackingData] = useState({});
  const [isShipping, setIsShipping] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/profile"); 
      setUser(res.data.user);
      setWonItems(res.data.wonProducts || []); 
      setMyListings(res.data.myProducts || []); 
    } catch (err) { console.error("Profile Sync Error:", err); }
  };

  // --- NEW HANDLER FOR SHIPPING ---
  const handleShipAction = async (productId) => {
    const trackNum = trackingData[productId];
    if (!trackNum) return alert("Please enter a tracking number");

    setIsShipping(true);
    try {
      await API.patch(`/orders/ship/${productId}`, { trackingNumber: trackNum });
      alert("Shipment Confirmed!");
      fetchData(); // Refresh UI to update status to "Shipped"
    } catch (err) {
      alert("Failed to update shipping status.");
    } finally {
      setIsShipping(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* --- REFINED HEADER --- */}
      <div className="bg-white border-b border-slate-100 pt-14 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Avatar with Ring */}
            <div className="relative">
              <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-slate-200 ring-4 ring-slate-50">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                <FiCheckCircle className="text-white text-xs" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <FiHash /> {user.email}
                </span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <FiActivity /> Active Bidder
                </span>
              </div>
            </div>

            {/* Stats Counter */}
            <div className="flex gap-4">
               <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 rounded-[28px] border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Purchases</p>
                 <p className="text-2xl font-black text-slate-900">{wonItems.length}</p>
               </div>
               <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 rounded-[28px] border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Listings</p>
                 <p className="text-2xl font-black text-slate-900">{myListings.length}</p>
               </div>
            </div>
          </div>

          {/* TAB NAV */}
          <div className="mt-16 flex gap-10">
              {[{ id: "won", label: "Inventory Won", icon: <FiTag /> }, 
                { id: "listings", label: "Selling Hub", icon: <FiPackage /> }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-3 border-b-[3px] ${activeTab === tab.id ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="popLayout">
            
            {/* --- MY PURCHASES TAB --- */}
            {activeTab === "won" && wonItems.map((item) => {
              const isPaid = item.paymentStatus === "Paid";
              
              return (
                <motion.div 
                  layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  key={item._id}
                  className="group bg-white rounded-[48px] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 grid grid-cols-1 lg:grid-cols-12"
                >
                  {/* LEFT: IMAGE */}
                  <div className="lg:col-span-3 bg-slate-50/50 p-10 flex items-center justify-center border-r border-slate-100 overflow-hidden">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={item.images?.[0]} 
                      className="max-h-52 object-contain mix-blend-multiply drop-shadow-2xl" 
                      alt="" 
                    />
                  </div>

                  {/* CENTER: DETAILS */}
                  <div className="lg:col-span-5 p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isPaid ? "Payment Verified" : "Action Required"}
                       </span>
                       {isPaid && <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1"><FiTruck/> In Pipeline</span>}
                    </div>
                    <h4 className="font-black text-slate-900 text-3xl mb-3 leading-[1.1] tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-2 leading-relaxed">{item.description}</p>
                    
                    <div className="flex items-center gap-10">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Hammer Price</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{item.currentBid?.toLocaleString()}</p>
                       </div>
                       {isPaid && (
                         <div className="border-l border-slate-200 pl-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                            <p className="text-sm font-black text-indigo-600 uppercase flex items-center gap-2 mt-1">
                               <FiTruck className="animate-pulse" /> {item.deliveryStatus || "Processing"}
                            </p>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* RIGHT: ACTION AREA */}
                  <div className="lg:col-span-4 p-10 bg-slate-50/30 flex flex-col justify-center border-l border-slate-100 backdrop-blur-sm">
                    {!isPaid ? (
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                          <FiCreditCard className="text-indigo-600 text-xl" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-6 px-4">Secure your win by completing the transaction node.</p>
                        <button 
                          onClick={() => navigate(`/checkout/${item._id}`)} 
                          className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                        >
                          Checkout Now <FiArrowRight />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex gap-4 p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                           <FiMapPin className="text-indigo-500 shrink-0 mt-1" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping Venue</p>
                              <p className="text-[12px] font-bold text-slate-700 leading-tight">
                                {item.buyerShippingAddress?.street || "Verified HQ"}<br/>
                                <span className="opacity-60">{item.buyerShippingAddress?.city}, {item.buyerShippingAddress?.state}</span>
                              </p>
                           </div>
                        </div>

                        <div className="flex gap-4 p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                           <FiFileText className="text-emerald-500 shrink-0 mt-1" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Internal Reference</p>
                              <p className="text-[11px] font-mono font-bold text-slate-900 truncate">
                                {item.transactionId || "SYNCING_TX_NODE..."}
                              </p>
                           </div>
                        </div>

                        <button className="w-full py-4 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-300">
                          Print Invoice
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* --- SELLER HUB TAB --- */}
            {activeTab === "listings" && myListings.map((listing) => {
              const isSold = listing.status === "Sold" || listing.winnerId;
              const isPaid = listing.paymentStatus === "Paid"; 
              const isShipped = listing.deliveryStatus === "Shipped";

              return (
                <motion.div 
                  key={listing._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6 mb-6 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* WRAP CONTENT TO MAKE CARD CLICKABLE */}
                  <div onClick={() => navigate(isSold ? `/manage-listing/${listing._id}` : `/my-product/${listing._id}`)} className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl p-3 flex items-center justify-center border border-slate-100">
                        <img src={listing.images?.[0]} className="max-h-full object-contain mix-blend-multiply" alt=""/>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xl mb-1">{listing.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                            {isPaid ? "Funds Secured" : listing.status}
                          </span>
                          {isPaid && !isShipped && (
                            <span className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1">
                              <FiClock className="animate-spin-slow" /> Awaiting Shipment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Bid</p>
                      <p className="text-xl font-black text-slate-900">₹{listing.currentBid?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* SHIPPING WORKFLOW BOX - STOP PROPAGATION TO PREVENT CARD CLICK */}
                  {isPaid && !isShipped ? (
                    <div onClick={(e) => e.stopPropagation()} className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100 flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-grow">
                        <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-1">Fulfillment Required</p>
                        <p className="text-xs text-indigo-600 font-medium">Buyer has completed payment. Please provide tracking to ship.</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <input 
                          type="text"
                          placeholder="Enter Tracking ID..."
                          className="bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 w-full md:w-64"
                          onChange={(e) => setTrackingData({...trackingData, [listing._id]: e.target.value})}
                        />
                        <button 
                          onClick={() => handleShipAction(listing._id)}
                          disabled={isShipping}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
                        >
                          <FiSend /> {isShipping ? "Confirming..." : "Confirm Ship"}
                        </button>
                      </div>
                    </div>
                  ) : isShipped ? (
                    <div onClick={(e) => e.stopPropagation()} className="bg-emerald-50 p-5 rounded-[28px] border border-emerald-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                            <FiCheckCircle />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Dispatched</p>
                            <p className="text-[11px] font-mono text-emerald-600 font-bold">{listing.trackingNumber || "TRK-XXXXXXXX"}</p>
                          </div>
                       </div>
                       <button onClick={() => navigate(`/manage-listing/${listing._id}`)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition">View Details</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                       <p className="text-xs font-bold text-slate-400 italic">Shipping options will unlock once payment is confirmed.</p>
                       <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                         Manage Auction <FiArrowRight />
                       </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* --- EMPTY STATE --- */}
        {((activeTab === "won" && wonItems.length === 0) || (activeTab === "listings" && myListings.length === 0)) && (
          <div className="text-center py-32 bg-slate-50/50 rounded-[60px] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
               <FiPackage className="text-slate-300 text-3xl"/>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">The Vault is Empty</h3>
             <p className="text-slate-400 text-sm font-medium tracking-wide">Start bidding or list an item to see activity.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;