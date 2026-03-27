import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiPackage, FiActivity, FiCheckCircle, 
  FiXCircle, FiTrendingUp, FiUsers, FiTrash2, FiDollarSign, FiTruck 
} from "react-icons/fi";
import Navbar from "./Navbar";
import AddProductModal from "./addProduct"; // ensure casing matches
import API from "../services/api";
import socket from "../services/socket";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [closingId, setClosingId] = useState(null);
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
  }, []);

  useEffect(() => {
    socket.on("productUpdated", (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });

    socket.on("productCreated", (newProduct) => {
      setProducts((prev) => [newProduct, ...prev]);
    });

    return () => {
      socket.off("productUpdated");
      socket.off("productCreated");
    };
  }, []);

  const openCloseModal = (id) => {
    setSelectedProductId(id);
    setShowCloseModal(true);
  };

  const confirmCloseBid = async () => {
    try {
      setClosingId(selectedProductId);
      // Calls your updated closeAuction controller
      await API.patch(`/products/close/${selectedProductId}`);
    } catch {
      alert("Failed to close auction.");
    } finally {
      setClosingId(null);
      setShowCloseModal(false);
      setSelectedProductId(null);
    }
  };

  // --- NEW DASHBOARD STATS ---
  const activeCount = products.filter(p => p.status === 'Active').length;
  const soldCount = products.filter(p => p.status === 'Sold').length;
  const totalRevenue = products
    .filter(p => p.status === 'Sold')
    .reduce((acc, curr) => acc + (curr.currentBid || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Seller Hub</h1>
            <p className="text-slate-500 font-medium">Manage logistics, track bids, and finalize sales.</p>
          </div>
          
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <FiPlus size={18} />
            <span>New Listing</span>
          </button>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Items", val: products.length, icon: <FiPackage />, color: "bg-blue-50 text-blue-600" },
            { label: "Live Now", val: activeCount, icon: <FiActivity />, color: "bg-green-50 text-green-600" },
            { label: "Items Sold", val: soldCount, icon: <FiCheckCircle />, color: "bg-purple-50 text-purple-600" },
            { label: "Revenue", val: `₹${totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, color: "bg-emerald-50 text-emerald-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-xl`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-[32px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {products.map((p) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={p._id}
                  className={`group bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all ${
                    p.status === "Sold" ? "border-green-100" : ""
                  }`}
                >
                  <div className="aspect-video bg-slate-100 relative">
                    <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md
                          ${p.status === 'Active' ? 'bg-green-500 text-white' : 
                            p.status === 'Sold' ? 'bg-slate-900 text-white' : 
                            p.status === 'Scheduled' ? 'bg-blue-500 text-white' : 'bg-slate-400 text-white'}`}>
                          {p.status}
                        </span>
                        {p.paymentStatus === 'Paid' && (
                          <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                            <FiDollarSign /> Paid
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-black text-slate-900 truncate mb-4">{p.title}</h2>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Bid</p>
                        <p className="font-black text-blue-600">₹{(p.currentBid || p.startingPrice).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Registrations</p>
                        <p className="font-black text-slate-700">{p.registeredUsers?.length || 0}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/my-product/${p._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition"
                      >
                        <FiActivity /> Management Console
                      </button>

                      {/* Fulfillment Shortcut */}
                      {p.status === "Sold" && (
                        <button
                          onClick={() => navigate(`/shipping-details/${p._id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition"
                        >
                          <FiTruck /> Ship Order
                        </button>
                      )}

                      {/* Manual Action for Active/Scheduled */}
                      {(p.status === "Active" || p.status === "Scheduled") && (
                        <button
                          onClick={() => openCloseModal(p._id)}
                          className="w-full flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-red-100 hover:text-red-500 transition"
                        >
                          <FiXCircle /> End Auction
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* CLOSE MODAL */}
      <AnimatePresence>
        {showCloseModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCloseModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><FiTrash2 size={40} /></div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Close Listing?</h2>
              <p className="text-slate-500 text-sm mb-8">This will finalize the auction immediately. If there are bidders, the highest will be selected as winner.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmCloseBid} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Confirm & Close</button>
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