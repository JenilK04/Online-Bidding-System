import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiTag, FiArrowRight, FiMapPin, FiPackage, FiTrendingUp, FiSearch, FiFilter, FiCheckCircle } from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";
import socket from "../services/socket";

const formatDateTime = (utcDate) => {
  return new Date(utcDate).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedId, setLastUpdatedId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // --- LOGIC: Sorting Priority ---
  const sortProducts = (data) => {
    const statusOrder = { "Active": 1, "Scheduled": 2, "Sold": 3, "Unsold": 4 };
    
    return [...data].sort((a, b) => {
      if (a.isRegistered && !b.isRegistered) return -1;
      if (!a.isRegistered && b.isRegistered) return 1;
      return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
    });
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(sortProducts(res.data));
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleRemoteUpdate = (updatedProduct) => {
      setProducts((prevProducts) => {
        const updatedList = prevProducts.map((p) => 
          // Use .toString() to ensure ID comparison is safe
          p._id.toString() === updatedProduct._id.toString() 
            ? { ...p, ...updatedProduct } 
            : p
        );
        
        setLastUpdatedId(updatedProduct._id);
        setTimeout(() => setLastUpdatedId(null), 2000);

        return sortProducts(updatedList);
      });
    };

    const handleNewProduct = (newProduct) => {
      setProducts(prev => sortProducts([newProduct, ...prev]));
    };

    // 🔥 Register listeners correctly inside the effect
    socket.on("globalProductUpdate", handleRemoteUpdate);
    socket.on("productCreated", handleNewProduct);

    // Cleanup function
    return () => {
      socket.off("globalProductUpdate", handleRemoteUpdate);
      socket.off("productCreated", handleNewProduct);
    };
  }, []); // <--- Ensure this is properly attached to the useEffect

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
      <div className="text-slate-400 font-black animate-pulse tracking-widest uppercase">Initializing Market...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Market
            </h2>
            <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-widest">
              Professional Real-Time Bidding
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by title or brand..."
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full sm:w-64 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                className="pl-11 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer shadow-sm text-slate-600 font-medium"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Sold">Sold</option>
                <option value="Unsold">Unsold</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center px-4 py-2 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">{products.filter(p => p.status === "Active").length} Live</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                  layout
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: lastUpdatedId === product._id ? [0, -10, 0] : 0, // 🔥 Subtle jump on update
                    borderColor: lastUpdatedId === product._id ? "#2563eb" : "#e2e8f0",
                    boxShadow: lastUpdatedId === product._id ? "0 20px 25px -5px rgb(37 99 235 / 0.1)" : "none"
                  }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={product._id}
                className={`group relative rounded-[24px] border-2 overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${
                  ["Sold", "Unsold"].includes(product.status) ? "grayscale-[0.3] opacity-90" : ""
                }`}
              >
                <Link to={`/products/${product._id}`} className="flex flex-col h-full">
                  
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {product.isRegistered && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md bg-blue-100 text-blue-700 border border-blue-200">
                        <FiCheckCircle /> Registered
                      </span>
                    )}
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md 
                      ${product.status === "Active" ? "bg-green-600 text-white" : 
                        product.status === "Scheduled" ? "bg-blue-600 text-white" : 
                        product.status === "Sold" ? "bg-slate-900 text-white" : "bg-red-500 text-white"}`}>
                      {product.status}
                    </span>
                  </div>

                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/400"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.status === "Sold" && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-black text-2xl tracking-tighter border-4 border-white px-6 py-2 rounded-xl -rotate-12">SOLD</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">{product.brand || "Generic"}</span>
                      <span className="text-[9px] font-black bg-blue-50 px-2 py-0.5 rounded text-blue-600 uppercase tracking-widest">{product.condition}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      <FiMapPin className="text-blue-500" />
                      <span>{product.sellerAddress?.city || "Remote"}</span>
                      <span className="ml-auto flex items-center gap-1"><FiTrendingUp /> {product.bidsCount || 0} Bids</span>
                    </div>

                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">
                          {product.status === "Active" ? "Current Bid" : 
                           product.status === "Unsold" ? "Final Bid" : "Current Bid"}
                        </p>
                        <p className={`text-2xl font-black transition-colors ${lastUpdatedId === product._id ? 'text-blue-600' : 'text-slate-900'}`}>
                          ₹{(product.status === "Unsold" || product.bidsCount === 0 
                              ? product.startingPrice 
                              : product.currentBid
                            ).toLocaleString()}
                        </p>
                        {/* 🔥 ADDED STARTING PRICE BELOW CURRENT BID */}
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          Start: ₹{product.startingPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end text-right">
                         <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">
                            {product.status === "Scheduled" ? "Starts" : "Ends"}
                         </p>
                         <p className="text-[11px] font-bold text-slate-600">
                            {formatDateTime(product.status === "Scheduled" ? product.startTime : product.endTime)}
                         </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Products;