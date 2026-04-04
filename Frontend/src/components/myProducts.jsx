import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiPackage, FiActivity, FiCheckCircle, 
  FiXCircle, FiTrendingUp, FiUsers, FiTrash2, FiDollarSign, FiTruck 
} from "react-icons/fi";
import Navbar from "./Navbar";
import AddProductModal from "./addProduct"; 
import API from "../services/api";
import socket from "../services/socket";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const navigate = useNavigate();

  const fetchMyProducts = async () => {
    try {
      const res = await API.get("/products/my-products");
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchMyProducts(); 

    /**
     * 🔥 REAL-TIME ENGINE
     * We listen for 'globalProductUpdate' because the Seller Hub 
     * monitors multiple products simultaneously without joining individual rooms.
     */
    const handleUpdate = (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p))
      );
    };

    // const handleNewProduct = (newP) => {
    //   setProducts((prev) => {
    //     if (prev.find(p => p._id === newP._id)) return prev;
    //     return [newP, ...prev];
    //   });
    // };

    // Listen for the global broadcast defined in index.js
    socket.on("globalProductUpdate", handleUpdate);
    // socket.on("productCreated", handleNewProduct);

    return () => {
      socket.off("globalProductUpdate", handleUpdate);
      // socket.off("productCreated", handleNewProduct);
    };
  }, []); 

  const confirmCloseBid = async () => {
    try {
      await API.patch(`/products/close/${selectedProductId}`);
      // Note: We don't need to manually update state here anymore 
      // because the backend emit will trigger handleUpdate automatically.
      setShowCloseModal(false);
    } catch (err) {
      alert("Failed to close auction.");
    }
  };

  // Stats auto-calculate based on the real-time 'products' state
  const activeCount = products.filter(p => p.status === 'Active').length;
  const soldCount = products.filter(p => p.status === 'Sold').length;
  const totalRevenue = products
    .filter(p => p.status === 'Sold')
    .reduce((acc, curr) => acc + (curr.currentBid || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="font-black text-slate-400 animate-pulse tracking-widest uppercase">
        Loading Seller Hub...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Seller Hub</h1>
            <p className="text-slate-500 font-medium">Manage logistics and finalize sales.</p>
          </div>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[20px] font-black uppercase text-xs shadow-xl hover:bg-blue-700 transition-colors">
            <FiPlus size={18} /> <span>New Listing</span>
          </button>
        </div>

        {/* STATS - These update in real-time as bids come in */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Live Now", val: activeCount, icon: <FiActivity />, color: "bg-green-50 text-green-600" },
            { label: "Items Sold", val: soldCount, icon: <FiCheckCircle />, color: "bg-purple-50 text-purple-600" },
            { label: "Revenue", val: `₹${totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, color: "bg-emerald-50 text-emerald-600" },
            { label: "Total", val: products.length, icon: <FiPackage />, color: "bg-blue-50 text-blue-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-xl`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((p) => (
              <motion.div 
                layout 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={p._id}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/my-product/${p._id}`)}
                className={`group cursor-pointer bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 relative ${p.status === "Sold" ? "ring-2 ring-green-500/10" : ""}`}
              >
                {/* IMAGE */}
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={p.images?.[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  <span className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg backdrop-blur-md ${p.status === 'Active' ? 'bg-green-500/90' : p.status === 'Sold' ? 'bg-slate-900/90' : 'bg-blue-500/90'}`}>
                    {p.status}
                  </span>
                </div>

                {/* INFO */}
                <div className="p-8">
                  <h2 className="text-2xl font-black text-slate-900 truncate mb-5 group-hover:text-blue-600 transition-colors">{p.title}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-[24px]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Bid</p>
                      <p className="text-lg font-black text-blue-600">₹{(p.currentBid || p.startingPrice).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-[24px]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bidders</p>
                      <p className="text-lg font-black text-slate-700">{p.registeredUsers?.length || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex-grow">
                      <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-blue-600 transition-all">
                        <FiActivity size={14} /> View Console
                      </div>
                    </div>
                    
                    {(p.status === "Active" || p.status === "Scheduled") && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedProductId(p._id); 
                          setShowCloseModal(true); 
                        }} 
                        className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                      >
                        <FiXCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* CLOSE MODAL */}
      <AnimatePresence>
        {showCloseModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><FiTrash2 size={40} /></div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Close Auction?</h2>
              <p className="text-slate-500 text-sm mb-8">This will instantly select the highest bidder as the winner.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmCloseBid} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-200">Confirm & Close</button>
                <button onClick={() => setShowCloseModal(false)} className="w-full py-2 text-slate-400 font-bold text-xs uppercase">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddProductModal isOpen={open} onClose={() => setOpen(false)} onSuccess={fetchMyProducts} />
    </div>
  );
};

export default MyProducts;