import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowLeft, FiUser, FiMapPin, FiPhone, FiTruck, 
  FiCheckCircle, FiAlertCircle, FiClock, FiDollarSign,
  FiBox, FiShield, FiExternalLink
} from "react-icons/fi";
import API from "../services/api";

const SellerManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchManagementData = async () => {
      try {
        const res = await API.get(`/orders/manage/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        navigate("/profile");
      }
    };
    fetchManagementData();
  }, [id, navigate]);

  const handleShip = async () => {
    if (!trackingNumber) return alert("Enter tracking number");
    setLoading(true);
    try {
      await API.patch(`/orders/ship/${id}`, { trackingNumber });
      alert("Order Shipped!");
      window.location.reload();
    } catch (err) {
      alert("Shipment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Authenticating Sales Node...</p>
    </div>
  );

  const { product, order } = data;
  const isPaid = order && order.paymentStatus === "Paid";
  const isShipped = order && order.deliveryStatus === "Shipped";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* TOP NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Merchant Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Secure Fulfillment Channel</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: ASSET IDENTITY (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-2 border border-slate-200 shadow-sm"
            >
              <div className="aspect-square bg-slate-50 rounded-[38px] flex items-center justify-center p-10 overflow-hidden relative group">
                <img src={product.images[0]} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                   <span className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm">Lot Asset</span>
                </div>
              </div>
            </motion.div>

            <div className="px-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-4">{product.title}</h1>
              <div className="flex items-center justify-between p-5 bg-slate-900 rounded-3xl text-white">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Hammer Price</span>
                  <span className="text-xl font-black tracking-tighter">₹{product.currentBid.toLocaleString()}</span>
                </div>
                <FiDollarSign size={24} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* RIGHT: LOGISTICS & FULFILLMENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* DYNAMIC PROGRESS TIMELINE */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><FiBox size={120}/></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-10 mb-12">
                    <TimelineStep icon={<FiDollarSign/>} label="Payment" status={isPaid ? "complete" : "active"} />
                    <div className={`h-[2px] flex-grow rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                    <TimelineStep icon={<FiTruck/>} label="Dispatch" status={isShipped ? "complete" : isPaid ? "active" : "locked"} />
                  </div>

                  <AnimatePresence mode="wait">
                    {isPaid ? (
                      <motion.div key="paid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-emerald-600 bg-emerald-50 p-6 rounded-[28px] border border-emerald-100">
                        <FiCheckCircle size={20} className="shrink-0" />
                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Funds captured and verified. Please initiate delivery within 24 hours.</p>
                      </motion.div>
                    ) : (
                      <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-amber-600 bg-amber-50 p-6 rounded-[28px] border border-amber-100">
                        <FiClock size={20} className="shrink-0 animate-spin-slow" />
                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Awaiting buyer checkout. Do not release asset to courier.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* DELIVERY INTELLIGENCE */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${!isPaid ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FiMapPin className="text-blue-600"/> Shipping Venue
                </h4>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-900">{order?.shippingAddress?.fullName}</p>
                  <p className="text-sm font-bold text-slate-500 leading-snug">
                    {order?.shippingAddress?.street}, {order?.shippingAddress?.city}<br/>
                    {order?.shippingAddress?.state} - {order?.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FiPhone className="text-blue-600"/> Contact Node
                </h4>
                <p className="text-lg font-black text-slate-900">{order?.shippingAddress?.phone}</p>
                <button className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                  View Full Profile <FiExternalLink />
                </button>
              </div>
            </div>

            {/* DISPATCH PROTOCOL ACTION */}
            <div className={`transition-all duration-700 delay-200 ${!isPaid ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {!isShipped ? (
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><FiTruck/></div>
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Initialize Courier Tracking</h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <input 
                        placeholder="Scan or Enter Tracking ID" 
                        className="flex-grow p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition font-mono font-bold text-slate-600"
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                      <button 
                        onClick={handleShip}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-12 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50"
                      >
                        {loading ? "AUTHENTICATING..." : "Confirm Dispatch"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 p-10 rounded-[40px] text-white flex items-center justify-between shadow-2xl shadow-slate-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><FiShield size={100}/></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Transit Manifest Confirmed</p>
                    <p className="text-3xl font-mono font-black tracking-tighter text-blue-400">{order.trackingNumber}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-widest">Estimated Arrival: 3-5 Business Days</p>
                  </div>
                  <FiTruck size={48} className="text-indigo-500 hidden md:block" />
                </div>
              )}
            </div>

            {!isPaid && (
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] justify-center py-6">
                <FiShield /> Data Encryption Active • Locked until checkout
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// HELPER COMPONENT FOR THE PROGRESS STEPS
const TimelineStep = ({ icon, label, status }) => {
  const isComplete = status === "complete";
  const isActive = status === "active";
  const isLocked = status === "locked";

  return (
    <div className="flex flex-col items-center gap-3 relative">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
        isComplete ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 
        isActive ? 'bg-white border-slate-900 text-slate-900 shadow-xl' : 
        'bg-slate-50 border-slate-100 text-slate-300'
      }`}>
        {isComplete ? <FiCheckCircle size={22}/> : icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-300' : 'text-slate-900'}`}>
        {label}
      </span>
    </div>
  );
}

export default SellerManagement;