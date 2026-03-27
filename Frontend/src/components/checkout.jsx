import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiShield, FiTruck, FiCreditCard, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import API from "../services/api";

const Checkout = () => {
  const { id } = useParams(); // This matches the ID from your Profile navigate
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [formData, setFormData] = useState({ address: "", contact: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchLot = async () => {
      try {
        // Fix: Call your generic product fetcher or a specific checkout detail endpoint
        const res = await API.get(`/products/${id}`); 
        setLot(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        navigate("/profile");
      }
    };
    fetchLot();
  }, [id, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Save Shipping Details to Backend
      await API.post(`/order-details/${id}`, {
        address: formData.address,
        city: formData.city,
        contact: formData.contact
      });

      // 2. Process the "Payment" (Sets isPaid: true on backend)
      await API.post(`/payment/${id}`);
      
      setIsSuccess(true);
      // Redirect after 2 seconds to show success state
      setTimeout(() => navigate("/profile"), 2500);
    } catch (err) {
      alert("Transaction failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <FiCheckCircle className="text-emerald-500 text-8xl mb-6 mx-auto" />
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Payment Confirmed</h1>
        <p className="text-slate-400 font-medium">Your order is being processed. Redirecting to your profile...</p>
      </motion.div>
    </div>
  );

  if (!lot) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Securing Connection...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* --- LEFT: FORM --- */}
      <div className="flex-grow p-8 md:p-20 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-indigo-600 transition">
          <FiArrowLeft /> Back to Profile
        </button>

        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Finalize Your Win</h1>
        <p className="text-slate-500 mb-12 font-medium">Complete the secure transaction for: {lot.title}</p>

        <form onSubmit={handlePayment} className="space-y-8">
          {/* Shipping Section */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-indigo-600 mb-6">
              <FiTruck /> Shipping Venue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required 
                placeholder="Full Shipping Address" 
                className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              <input 
                required 
                placeholder="City" 
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
              <input 
                required 
                placeholder="Contact Number" 
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition" 
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
            </div>
          </section>

          {/* Payment Section (Mock UI) */}
          <section>
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-emerald-600 mb-6">
              <FiCreditCard /> Secure Payment
            </h3>
            <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="relative z-10">
                   <p className="text-[10px] font-black opacity-40 uppercase mb-6 tracking-widest">Encrypted Gateway Active</p>
                   <div className="space-y-4">
                      <input placeholder="Card Number" className="w-full bg-white/10 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/30 outline-none" />
                      <div className="flex gap-4">
                        <input placeholder="MM/YY" className="w-1/2 bg-white/10 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/30 outline-none" />
                        <input placeholder="CVC" className="w-1/2 bg-white/10 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/30 outline-none" />
                      </div>
                   </div>
                </div>
                <FiShield size={120} className="absolute -right-8 -bottom-8 text-white/5" />
            </div>
          </section>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all duration-300">
            {loading ? "Verifying Transaction..." : `Pay ₹${(lot.currentBid * 1.05).toLocaleString()}`}
          </button>
        </form>
      </div>

      {/* --- RIGHT: ORDER SUMMARY --- */}
      <aside className="w-full md:w-[450px] bg-slate-50 p-12 flex flex-col border-l border-slate-100">
        <div className="sticky top-12">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-8">Order Summary</h3>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200/50 mb-8">
            <div className="aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
                <img src={lot.images?.[0]} className="max-h-full object-contain p-4" alt="product" />
            </div>
            <h4 className="font-black text-slate-900 text-lg leading-tight">{lot.title}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Item ID: {lot._id.substring(0,8)}</p>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Hammer Price</span>
                <span className="text-slate-900">₹{lot.currentBid?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Auction Fee (5%)</span>
                <span className="text-slate-900">₹{(lot.currentBid * 0.05).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-4">
                <span>TOTAL</span>
                <span className="text-indigo-600 tracking-tighter">₹{(lot.currentBid * 1.05).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Checkout;