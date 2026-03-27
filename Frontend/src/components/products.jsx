import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiTag, FiArrowRight, FiMapPin, FiPackage } from "react-icons/fi";
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

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
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

  useEffect(() => {
    socket.on("productCreated", (newProduct) => {
      setProducts((prev) => [newProduct, ...prev]);
    });

    socket.on("productUpdated", (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });

    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
    };
  }, []);

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
              Professional Bidding Engine
            </p>
          </div>
          <div className="flex gap-2 text-sm font-medium">
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm">
              {products.length} Items Live
            </span>
          </div>
        </div>

        {/* ... Loading & Error states remain same ... */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={product._id}
                className={`group relative bg-white rounded-[24px] border border-slate-200 overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${
                  ["Sold", "Unsold"].includes(product.status) ? "grayscale-[0.4] opacity-90" : ""
                }`}
              >
                <Link to={`/products/${product._id}`} className="flex flex-col h-full">
                  
                  {/* Status Badge - Updated for new Enum */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md 
                      ${product.status === "Active" ? "bg-green-600 text-white" : 
                        product.status === "Scheduled" ? "bg-blue-600 text-white" : 
                        product.status === "Sold" ? "bg-slate-900 text-white" : "bg-red-500 text-white"}`}>
                      {product.status === "Active" && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      )}
                      {product.status}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/400"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.status === "Sold" && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-black text-2xl tracking-tighter border-4 border-white px-6 py-2 rounded-xl -rotate-12">WON</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </div>

                    {/* NEW: Brand & Condition Specifics */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{product.brand || "Generic"}</span>
                      <span className="text-[10px] font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-600 uppercase">{product.condition}</span>
                    </div>
                    
                    {/* NEW: Location Tag */}
                    <div className="flex items-center gap-1.5 mb-4 text-[11px] text-slate-400 font-medium">
                      <FiMapPin className="text-blue-500" />
                      <span>{product.sellerAddress?.city || "Remote Location"}</span>
                    </div>

                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">
                          {product.status === "Active" ? "Current High Bid" : "Starting At"}
                        </p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                          ₹{(product.currentBid || product.startingPrice).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
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