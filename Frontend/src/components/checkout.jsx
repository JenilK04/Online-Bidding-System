import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiShield, FiArrowLeft, FiCheckCircle, 
  FiLock, FiCreditCard
} from "react-icons/fi";
import API from "../services/api";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnId, setTxnId] = useState(""); 
  const [formData, setFormData] = useState({ 
    fullName: "", street: "", city: "", state: "", zipCode: "", phone: "" 
  });

  useEffect(() => {
    // 🔹 Since script is in index.html, we only need to fetch data here
    const fetchLot = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        if (res.data.paymentStatus === "Paid") {
          setIsSuccess(true);
          setTimeout(() => navigate("/my-profile"), 4000);
          return;
        }
        setLot(res.data);
      } catch (err) {
        navigate("/my-profile");
      }
    };
    fetchLot();

    // 🛡️ NO CLEANUP NEEDED: Script stays in index.html globally
  }, [id, navigate]);

  const isFormValid = Object.values(formData).every(value => value.trim() !== "");

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    
    // 🔹 Verify Razorpay is actually loaded from index.html
    if (!window.Razorpay) {
      alert("Payment gateway is still loading. Please refresh.");
      return;
    }

    if (!isFormValid || loading) return;
    setLoading(true);

    try {
      const { data } = await API.post("/orders/create", {
        productId: id,
        shippingAddress: formData
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "BidMaster Pro",
        description: `Lot Fulfillment #${id.substring(18)}`,
        order_id: data.razorpayOrder.id,
        handler: async (response) => {
          try {
            const verify = await API.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              productId: id
            });
            
            if (verify.status === 200) {
              setTxnId(response.razorpay_payment_id);
              setIsSuccess(true);
              setTimeout(() => navigate("/my-profile"), 5000);
            }
          } catch (err) {
            alert("Payment verification failed!");
            setLoading(false);
          }
        },
        prefill: { 
            name: formData.fullName,
            contact: formData.phone 
        },
        theme: { color: "#4f46e5" },
        modal: {
            ondismiss: () => setLoading(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed to initialize.");
      setLoading(false);
    }
  };

  // --- SUCCESS STATE ---
  if (isSuccess) return (
    <div className="h-screen flex items-center justify-center bg-white p-6 text-center font-sans">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md">
        <FiCheckCircle className="text-emerald-500 text-8xl mb-6 mx-auto" />
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Payment Verified.</h1>
        <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Reference</p>
            <p className="text-sm font-mono font-bold text-slate-700">{txnId || "Processing..."}</p>
        </div>
        <p className="text-slate-400 font-medium text-sm">Transfer complete. Your asset is being prepared for dispatch.</p>
      </motion.div>
    </div>
  );

  if (!lot) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-300">Syncing Vault...</div>;

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition">
          <FiArrowLeft /> Return
        </button>
        <div className="flex items-center gap-2">
            <FiLock className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Secure 256-bit SSL Gateway</span>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="flex-grow p-6 md:p-12 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase">Fulfillment</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Logistics Destination</p>
          </header>

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Recipient Full Name" 
                className="md:col-span-2 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm text-slate-600" 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              
              <input required placeholder="Street Address" 
                className="md:col-span-2 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm text-slate-600" 
                onChange={(e) => setFormData({...formData, street: e.target.value})} />
              
              <div className="flex gap-4">
                  <input required placeholder="City" 
                    className="w-1/2 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm text-slate-600" 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  
                  <input required placeholder="State" 
                    className="w-1/2 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm text-slate-600" 
                    onChange={(e) => setFormData({...formData, state: e.target.value})} />
              </div>
              
              <input required placeholder="Zip Code" 
                className="p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm text-slate-600" 
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})} />
              
              <input required placeholder="Phone" 
                className="p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm text-slate-600" 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div 
              className={`p-6 rounded-[32px] border transition-all duration-500 flex items-center justify-between ${
                isFormValid 
                ? 'bg-indigo-600 border-indigo-700 cursor-pointer shadow-xl shadow-indigo-100' 
                : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
              }`}
              onClick={isFormValid ? handlePayment : undefined}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${isFormValid ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                        <FiCreditCard size={20} />
                    </div>
                    <div>
                        <p className={`font-black text-xs uppercase tracking-widest ${isFormValid ? 'text-white' : 'text-slate-400'}`}>
                            {isFormValid ? 'Authorize Payment' : 'Complete Shipping Info'}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isFormValid ? 'text-indigo-100' : 'text-slate-300'}`}>
                            {isFormValid ? 'Ready via Razorpay' : 'Action Required'}
                        </p>
                    </div>
                </div>
                <div className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    isFormValid ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-300'
                  }`}>
                    {loading ? "Processing..." : "Pay Now"}
                </div>
            </div>
          </form>
        </div>

        <aside className="w-full md:w-[400px] bg-white border-l border-slate-200 p-8 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-[24px]">
                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden p-2 border border-slate-100 shrink-0">
                    <img src={lot.images?.[0]} className="w-full h-full object-contain" alt="" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{lot.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lot #{lot._id.substring(20)}</p>
                </div>
            </div>

            <div className="space-y-4 px-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Bid Hammer</span>
                    <span className="text-slate-900 font-bold">₹{lot.currentBid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Platform Fee (5%)</span>
                    <span className="text-slate-900 font-bold">₹{(lot.currentBid * 0.05).toLocaleString()}</span>
                </div>
                <div className="h-[1px] bg-slate-100 my-4" />
                <div className="flex justify-between text-3xl font-black text-slate-900 tracking-tighter">
                    <span>Total Due</span>
                    <span className="text-indigo-600">₹{(lot.currentBid * 1.05).toLocaleString()}</span>
                </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Checkout;