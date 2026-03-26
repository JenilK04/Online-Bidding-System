import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiTruck, FiCheckCircle, FiMapPin, 
  FiPhone, FiCreditCard, FiClock, FiEdit3, FiUser 
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [wonProducts, setWonProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("won"); // "won" or "listings"
  const [loadingAction, setLoadingAction] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ address: "", contact: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/profile");
      setUser(res.data.user);
      setWonProducts(res.data.wonProducts || []);
      setMyProducts(res.data.myProducts || []);
    } catch (err) { console.error(err); }
  };

  const handleAction = async (endpoint, id) => {
    try {
      setLoadingAction(id);
      await API.post(`/${endpoint}/${id}`);
      fetchData();
    } catch (err) { console.error(err); } finally {
      setLoadingAction(null);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      address: product.shippingAddress || "",
      contact: product.contactNumber || ""
    });
    setShowModal(true);
  };

  const handleSaveDetails = async () => {
    if (!formData.address || !formData.contact) return;
    try {
      setLoadingAction(selectedProduct._id);
      await API.post(`/order-details/${selectedProduct._id}`, {
        shippingAddress: formData.address,
        contactNumber: formData.contact
      });
      setShowModal(false);
      fetchData();
    } catch (err) { console.error(err); } finally {
      setLoadingAction(null);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />

      {/* --- PROFILE HEADER --- */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-200">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-500 font-medium">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <FiPhone className="text-indigo-500" /> {user.phone || "No Contact"}
               </div>
               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <FiMapPin className="text-indigo-500" /> {user.address || "No Address Saved"}
               </div>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center min-w-[120px]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Won</p>
               <p className="text-xl font-black text-indigo-600">{wonProducts.length}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center min-w-[120px]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Listings</p>
               <p className="text-xl font-black text-violet-600">{myProducts.length}</p>
             </div>
          </div>
        </div>

        {/* TABS */}
        <div className="max-w-6xl mx-auto mt-10 flex gap-8">
           <button 
             onClick={() => setActiveTab("won")}
             className={`pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'won' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
             Purchases
           </button>
           <button 
             onClick={() => setActiveTab("listings")}
             className={`pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'listings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
             Sales Gallery
           </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {(activeTab === "won" ? wonProducts : myProducts).map((p) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={p._id}
                className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="aspect-video bg-slate-50 relative p-4 flex items-center justify-center">
                  <img src={p.images?.[0]} className="max-h-full object-contain drop-shadow-lg" alt="item" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${p.isPaid ? 'bg-green-500 text-white' : 'bg-amber-400 text-white'}`}>
                      {p.isPaid ? "Paid" : "Payment Pending"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{p.title}</h4>
                    <p className="font-black text-indigo-600 ml-2">₹{p.currentBid.toLocaleString()}</p>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center gap-2 my-4">
                    <div className={`flex-1 h-1 rounded-full ${p.isPaid ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                    <div className={`flex-1 h-1 rounded-full ${p.deliveryStatus === 'Shipped' || p.deliveryStatus === 'Delivered' ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                    <div className={`flex-1 h-1 rounded-full ${p.deliveryStatus === 'Delivered' ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <FiMapPin className="text-slate-400 mt-1 shrink-0" />
                      <p className="text-xs text-slate-500 leading-normal">
                        {p.shippingAddress || <span className="italic">No address provided</span>}
                      </p>
                    </div>
                  </div>

                  {/* ACTION LOGIC */}
                  <div className="mt-auto">
                    {activeTab === "won" ? (
                      <>
                        {!p.shippingAddress ? (
                          <button onClick={() => openModal(p)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition">
                            Setup Delivery
                          </button>
                        ) : !p.isPaid ? (
                          <button 
                            onClick={() => handleAction('payment', p._id)}
                            disabled={loadingAction === p._id}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                          >
                            {loadingAction === p._id ? "Processing..." : "Complete Payment"}
                          </button>
                        ) : (
                          <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                               {p.deliveryStatus === 'Delivered' ? <><FiCheckCircle className="text-green-500" /> Received</> : <><FiTruck className="text-indigo-500" /> {p.deliveryStatus || 'Processing'}</>}
                             </p>
                          </div>
                        )}
                      </>
                    ) : (
                      // SELLER VIEW
                      <>
                        {!p.shippingAddress || !p.isPaid ? (
                          <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                             <FiClock /> Awaiting Buyer Action
                          </div>
                        ) : p.deliveryStatus === "Pending" ? (
                          <button 
                            onClick={() => handleAction('ship', p._id)}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition"
                          >
                            Ship to Buyer
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100">
                             <FiCheckCircle /> Fulfillment Complete
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- SHIPPING MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <FiPackage size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Delivery Info</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shipping Address</label>
                  <textarea 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Street, City, State, ZIP..."
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-medium text-slate-900 outline-none focus:border-indigo-500 transition-colors h-28"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <input 
                    type="text" 
                    value={formData.contact} 
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-medium text-slate-900 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-10">
                <button onClick={handleSaveDetails} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100">Save & Proceed</button>
                <button onClick={() => setShowModal(false)} className="w-full py-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition tracking-widest">Maybe later</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;