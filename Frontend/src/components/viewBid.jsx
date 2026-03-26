import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiClock, FiTrendingUp, FiUsers, FiActivity } from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";
import socket from "../services/socket";

const formatTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const MyProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, bidsRes] = await Promise.all([
        API.get(`/products/${id}`),
        API.get(`/products/bids/${id}`)
      ]);
      setProduct(prodRes.data);
      setBids(bidsRes.data);
    } catch (err) {
      setError("Failed to sync product data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Join room for this specific product
    socket.emit("joinProduct", id);

    // Listen for real-time bid updates
    socket.on("productUpdated", (updatedProduct) => {
      if (updatedProduct._id === id) {
        setProduct(updatedProduct);
      }
    });

    socket.on("bidPlaced", (newBid) => {
      // Add new bid to the top of the list
      setBids((prev) => [newBid, ...prev]);
    });

    return () => {
      socket.emit("leaveProduct", id);
      socket.off("productUpdated");
      socket.off("bidPlaced");
    };
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Fetching Live Auction Stats...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl text-center shadow-sm border border-slate-200">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <Link to="/my-products" className="text-blue-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <Link to="/my-products" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-bold text-sm uppercase tracking-widest">
            <FiArrowLeft /> Back to My Inventory
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Product Overview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
              <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-6">
                <img src={product.images[0]} className="w-full h-full object-contain p-4" alt="product" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{product.title}</h1>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">{product.description}</p>
              
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    product.status === "Active" ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {product.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Starting</span>
                  <span className="text-sm font-bold text-slate-700">₹{product.startingPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Stats & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-blue-600 mb-2"><FiTrendingUp size={20}/></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current High</p>
                <p className="text-2xl font-black text-slate-900">₹{(product.currentBid || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-purple-600 mb-2"><FiActivity size={20}/></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bids</p>
                <p className="text-2xl font-black text-slate-900">{product.bidsCount}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-orange-600 mb-2"><FiClock size={20}/></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Started On</p>
                <p className="text-sm font-black text-slate-700 leading-tight">
                  {new Date(product.auctionStart).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Bid History Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Live Bid Ledger</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Updating in real-time
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bidder</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {bids.map((bid, index) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={bid._id} 
                          className={index === 0 ? "bg-blue-50/30" : "hover:bg-slate-50 transition-colors"}
                        >
                          <td className="px-6 py-4">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              index === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                              {bids.length - index}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">{bid.bidderName || "Anonymous Bidder"}</td>
                          <td className="px-6 py-4">
                            <span className="text-green-600 font-black tracking-tight">₹{bid.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">{formatTime(bid.createdAt)}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {bids.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="text-slate-200 mb-2 flex justify-center"><FiUsers size={48}/></div>
                    <p className="text-slate-400 font-medium">Waiting for the first bid to be placed...</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProductDetails;