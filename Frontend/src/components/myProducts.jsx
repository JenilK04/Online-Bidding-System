import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiPackage, FiActivity, FiCheckCircle, 
  FiXCircle, FiTrendingUp, FiUsers, FiTrash2 
} from "react-icons/fi";
import Navbar from "./Navbar";
import AddProductModal from "./addProduct";
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

  // ✅ Fixed: Added dependency array to fetch only on mount
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
      await API.patch(`/products/close/${selectedProductId}`);
      // Product will update via socket or local state map
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProductId ? { ...p, status: "Ended" } : p
        )
      );
    } catch {
      alert("Failed to close bid.");
    } finally {
      setClosingId(null);
      setShowCloseModal(false);
      setSelectedProductId(null);
    }
  };

  // Calculate quick stats for the dashboard
  const activeCount = products.filter(p => p.status === 'Active').length;
  const totalBids = products.reduce((acc, curr) => acc + (curr.bidsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- DASHBOARD HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seller Dashboard</h1>
            <p className="text-slate-500">Manage your listings and track live auctions.</p>
          </div>
          
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <FiPlus size={20} />
            <span>List New Product</span>
          </button>
        </div>

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FiPackage size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Items</p>
              <p className="text-2xl font-black text-slate-900">{products.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><FiActivity size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Bids</p>
              <p className="text-2xl font-black text-slate-900">{activeCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><FiTrendingUp size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Engagement</p>
              <p className="text-2xl font-black text-slate-900">{totalBids} Bids</p>
            </div>
          </div>
        </div>

        {/* --- PRODUCT GRID --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-[32px]" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No products found</h3>
            <p className="text-slate-500 mb-8">You haven't listed any items for auction yet.</p>
            <button onClick={() => setOpen(true)} className="text-blue-600 font-bold hover:underline">Start selling today &rarr;</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {products.map((p) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p._id}
                  className={`group relative bg-white rounded-[32px] border border-slate-200 overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/10 ${
                    p.status === "Ended" ? "opacity-75 grayscale-[0.3]" : ""
                  }`}
                >
                  {/* Image Header */}
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/400x300"}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 
                          ${p.status === 'Active' ? 'bg-green-500 text-white' : 
                            p.status === 'Upcoming' ? 'bg-amber-400 text-white' : 'bg-slate-900 text-white'}`}>
                          {p.status === 'Active' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                          {p.status}
                        </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-black text-slate-900 truncate mb-4">{p.title}</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Base Price</p>
                        <p className="font-black text-slate-700">₹{p.startingPrice.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mb-1">Current Bid</p>
                        <p className="font-black text-blue-600">₹{(p.currentBid || p.startingPrice).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6 px-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FiUsers size={16} />
                        <span className="text-sm font-bold">{p.registeredUsers?.length || 0} Joined</span>
                      </div>
                      <div className="h-1 w-1 bg-slate-300 rounded-full" />
                      <div className="text-sm font-bold text-slate-500">{p.bidsCount || 0} Bids</div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => navigate(`/my-product/${p._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition shadow-sm"
                      >
                        <FiTrendingUp /> View Bids
                      </button>

                      {(p.status === "Upcoming" || p.status === "Active") && (
                        <button
                          disabled={closingId === p._id}
                          onClick={() => openCloseModal(p._id)}
                          className="w-full flex items-center justify-center gap-2 border-2 border-red-100 text-red-600 py-3 rounded-2xl font-bold hover:bg-red-50 transition"
                        >
                          {closingId === p._id ? <span className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" /> : 
                           p.status === "Upcoming" ? <><FiXCircle /> Cancel Auction</> : <><FiCheckCircle /> Close Auction</>}
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

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showCloseModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowCloseModal(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiTrash2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                This action will finalize the auction. You cannot reopen it once closed.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmCloseBid} 
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-lg shadow-red-100"
                >
                  Yes, Close Auction
                </button>
                <button 
                  onClick={() => setShowCloseModal(false)} 
                  className="w-full py-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition"
                >
                  Nevermind
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchMyProducts}
      />
    </div>
  );
};

export default MyProducts;