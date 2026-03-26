import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiTag, FiArrowRight } from "react-icons/fi";
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
              Live Auctions
            </h2>
            <p className="text-slate-500 mt-1">
              Discover and bid on unique items in real-time.
            </p>
          </div>
          <div className="flex gap-2 text-sm font-medium">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
              Total: {products.length} Items
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <FiTag className="mx-auto text-4xl text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No active auctions</h3>
            <p className="text-slate-500">Check back later for new product listings.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product._id}
                className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/10 ${
                  product.status === "Ended" ? "grayscale-[0.5] opacity-80" : ""
                }`}
              >
                {/* --- FULL CONTAINER LINK --- */}
                <Link to={`/products/${product._id}`} className="flex flex-col h-full">
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm 
                      ${product.status === "Active" ? "bg-green-500 text-white" : 
                        product.status === "Upcoming" ? "bg-amber-400 text-white" : "bg-slate-500 text-white"}`}>
                      {product.status === "Active" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      )}
                      {product.status}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/400"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.status === "Ended" && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="text-white font-bold text-lg px-4 py-2 border-2 border-white rounded-lg rotate-12">SOLD</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                      <FiClock className="text-blue-500" />
                      <span>Starts: {formatDateTime(product.auctionStart)}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                          Starting Price
                        </p>
                        <p className="text-xl font-black text-blue-600">
                          ₹{product.startingPrice.toLocaleString()}
                        </p>
                      </div>

                      {/* Icon styled as button, but visually reacts to the card hover */}
                      <div 
                        className={`p-3 rounded-xl transition-all ${
                          product.status === "Ended" 
                          ? "bg-slate-100 text-slate-400" 
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                        }`}
                      >
                        <FiArrowRight size={20} />
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