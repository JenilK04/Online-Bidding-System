import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShield, FiTruck, FiCreditCard, 
  FiArrowLeft, FiCheckCircle, FiPackage 
} from "react-icons/fi";
import API from "../services/api";

const Checkout = () => {
  const { id } = useParams(); // Product ID
  const navigate = useNavigate();
  
  // State Management
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [formData, setFormData] = useState({ 
    fullName: "", street: "", city: "", state: "", zipCode: "", phone: "" 
  });

  // --- 🔹 INITIAL SYNC & STATUS GUARD ---
  useEffect(() => {
    const fetchLot = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const productData = res.data;

        // If already paid, trigger success state and exit
        if (productData.paymentStatus === "Paid") {
          setIsSuccess(true);
          setTimeout(() => navigate("/my-profile"), 4000);
          return;
        }

        setLot(productData);
      } catch (err) {
        console.error("Access Denied or Lot Missing:", err);
        navigate("/my-profile");
      }
    };
    fetchLot();
  }, [id, navigate]);

  // --- 🔹 DUAL-STEP PAYMENT LOGIC ---
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // STEP 1: Create the Order (Snapshots Price & Saves Address)
      const orderRes = await API.post("/orders/create", {
        productId: id,
        shippingAddress: { ...formData }
      });

      const orderId = orderRes.data.orderId;

      // STEP 2: Finalize Payment (Flips DB status to 'Paid')
      const finalizeRes = await API.patch(`/orders/finalize/${orderId}`);

      if (finalizeRes.status === 200) {
        setTxnId(finalizeRes.data.transactionId);
        setIsSuccess(true);
        // Extended timeout to let them see the Transaction ID
        setTimeout(() => navigate("/my-profile"), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Secure Gateway Timeout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🔹 SUCCESS STATE UI ---
  if (isSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <FiCheckCircle className="text-emerald-500 text-8xl mb-6 mx-auto" />
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Payment Confirmed</h1>
        
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Reference</p>
          <p className="text-lg font-mono font-bold text-slate-700">{txnId || "Verifying..."}</p>
        </div>

        <p className="text-slate-400 font-medium px-10">
          Your order is now being processed. You can track shipping in your profile.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
           <FiPackage /> Preparing for Dispatch
        </div>
      </motion.div>
    </div>
  );

  // --- 🔹 LOADING STATE UI ---
  if (!lot) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opening Secure Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* --- LEFT: CHECKOUT FORM --- */}
      <div className="flex-grow p-8 md:p-20 max-w-4xl overflow-y-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-indigo-600 transition">
          <FiArrowLeft /> Back to Inventory
        </button>

        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 leading-none">Finalize Win.</h1>
        <p className="text-slate-500 mb-12 font-medium">Capture shipping details and process payment for Lot #{lot._id.substring(18)}</p>

        <form onSubmit={handlePayment} className="space-y-12">
          
          {/* 🚚 Shipping Venue */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-indigo-600 mb-8">
              <FiTruck /> Logistics Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Full Name" className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              
              <input required placeholder="Street Address" className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, street: e.target.value})} />
              
              <input required placeholder="City" className="p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, city: e.target.value})} />
              
              <input required placeholder="State / Province" className="p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, state: e.target.value})} />
              
              <input required placeholder="Zip Code" className="p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})} />
              
              <input required placeholder="Phone Number" className="p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </section>

          {/* 💳 Payment Architecture */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-emerald-600 mb-8">
              <FiCreditCard /> Secure Payment Node
            </h3>
            <div className="p-10 bg-slate-900 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                   <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">256-Bit SSL Active</p>
                   <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-[8px]">VISA</div>
                </div>
                <div className="space-y-4">
                  <input placeholder="Card Number" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition" />
                  <div className="flex gap-4">
                    <input placeholder="MM / YY" className="w-1/2 bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition" />
                    <input placeholder="CVC" className="w-1/2 bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:bg-white/10 transition" />
                  </div>
                </div>
              </div>
              <FiShield size={160} className="absolute -right-12 -bottom-12 text-white/5" />
            </div>
          </section>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-8 rounded-[32px] font-black uppercase text-xs tracking-[0.4em] hover:bg-indigo-600 active:scale-[0.98] transition-all duration-500 shadow-xl shadow-slate-200">
            {loading ? "Authorizing Funds..." : `Confirm ₹${(lot.currentBid * 1.05).toLocaleString()}`}
          </button>
        </form>
      </div>

      {/* --- RIGHT: ORDER RECAP --- */}
      <aside className="w-full md:w-[500px] bg-slate-50 p-12 flex flex-col border-l border-slate-100">
        <div className="sticky top-12">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-10">Audit Recap</h3>
          
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200/50 mb-10">
            <div className="aspect-square bg-slate-50 rounded-3xl mb-8 overflow-hidden group">
                <img src={lot.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="product" />
            </div>
            <h4 className="font-black text-slate-900 text-2xl leading-tight mb-2">{lot.title}</h4>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated Win</p>
            </div>
          </div>

          <div className="space-y-6 px-4">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Winning Hammer</span>
                <span className="text-slate-900">₹{lot.currentBid?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Auction Premium (5%)</span>
                <span className="text-slate-900">₹{(lot.currentBid * 0.05).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 border-t border-slate-200 pt-6">
                <span className="tracking-tighter">Total Due</span>
                <span className="text-indigo-600 tracking-tighter">₹{(lot.currentBid * 1.05).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Checkout;