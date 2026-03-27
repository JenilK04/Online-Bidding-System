import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiTag, FiArrowRight, FiMapPin, FiPackage, FiTrendingUp } from "react-icons/fi";
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

  // --- LOGIC: Constant Sorting Priority ---
  const sortProducts = (data) => {
    const order = { "Active": 1, "Scheduled": 2, "Sold": 3, "Unsold": 4 };
    return [...data].sort((a, b) => (order[a.status] || 5) - (order[b.status] || 5));
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
  }, []);

  // 🔥 LOGIC: REAL-TIME SOCKET ENGINE
  useEffect(() => {
    const handleRemoteUpdate = (updatedProduct) => {
      setProducts((prevProducts) => {
        const updatedList = prevProducts.map((p) => 
          p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p
        );
        return sortProducts(updatedList);
      });

      setLastUpdatedId(updatedProduct._id);
      setTimeout(() => setLastUpdatedId(null), 2000);
    };

    socket.on("productCreated", (newProduct) => {
      setProducts(prev => sortProducts([newProduct, ...prev]));
    });

    socket.on("productUpdated", handleRemoteUpdate);

    return () => {
      socket.off("productCreated");
      socket.off("productUpdated", handleRemoteUpdate);
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
      <div className="text-slate-400 font-black animate-pulse tracking-widest uppercase">Initializing Market...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Market
            </h2>
            <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-widest">
              Professional Real-Time Bidding
            </p>
          </div>
          <div className="flex gap-2 text-sm font-medium">
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              {products.filter(p => p.status === "Active").length} Live Now
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  borderColor: lastUpdatedId === product._id ? "#2563eb" : "#e2e8f0",
                  backgroundColor: lastUpdatedId === product._id ? "#f8faff" : "#ffffff"
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={product._id}
                className={`group relative rounded-[24px] border-2 overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${
                  ["Sold", "Unsold"].includes(product.status) ? "grayscale-[0.3] opacity-90" : ""
                }`}
              >
                <Link to={`/products/${product._id}`} className="flex flex-col h-full">
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md 
                      ${product.status === "Active" ? "bg-green-600 text-white" : 
                        product.status === "Scheduled" ? "bg-blue-600 text-white" : 
                        product.status === "Sold" ? "bg-slate-900 text-white" : "bg-red-500 text-white"}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Image */}
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

                  {/* Card Content */}
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

                    {/* 🔥 UPDATED PRICING LOGIC */}
                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        {/* Show small "Start" label if there are bids */}
                        {product.bidsCount > 0 && product.status !== "Unsold" && (
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight line-through mb-0.5">
                            Start: ₹{product.startingPrice.toLocaleString()}
                          </p>
                        )}

                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">
                          {product.status === "Active" ? "Current Bid" : 
                           product.status === "Unsold" ? "Final (Starting)" : "Starting Price"}
                        </p>
                        
                        <p className={`text-2xl font-black transition-colors ${lastUpdatedId === product._id ? 'text-blue-600' : 'text-slate-900'}`}>
                          ₹{(product.status === "Unsold" || product.bidsCount === 0 
                              ? product.startingPrice 
                              : product.currentBid
                            ).toLocaleString()}
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