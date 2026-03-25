import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiArrowRight, FiShield, FiZap, FiSmartphone, 
  FiClock, FiCreditCard, FiPackage, FiUsers, FiTrendingUp, FiAward 
} from "react-icons/fi";

const Home = () => {
  const features = [
    { title: "Live Bidding", icon: <FiZap />, desc: "Real-time auction updates with millisecond latency.", color: "bg-amber-100 text-amber-600" },
    { title: "Secure System", icon: <FiShield />, desc: "End-to-end encryption and verified bidder profiles.", color: "bg-green-100 text-green-600" },
    { title: "Mobile Optimized", icon: <FiSmartphone />, desc: "Bid on the go with our world-class mobile interface.", color: "bg-blue-100 text-blue-600" },
    { title: "Scheduled Events", icon: <FiClock />, desc: "Never miss an item with automated calendar alerts.", color: "bg-purple-100 text-purple-600" },
    { title: "Global Payments", icon: <FiCreditCard />, desc: "Integrated multi-currency payment processing.", color: "bg-rose-100 text-rose-600" },
    { title: "Verified Delivery", icon: <FiPackage />, desc: "Tracked shipping from the auction house to your door.", color: "bg-indigo-100 text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* --- MODERN NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-slate-200/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">B</div>
          <span className="text-xl font-extrabold tracking-tight">BidMaster</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How it Works</a>
          <a href="#support" className="hover:text-blue-600 transition">Support</a>
        </div>

        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition">
            Login
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-100">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Live Auctions Running Now
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6"
          >
            Bid on excellence, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Win with confidence.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The premier global marketplace for high-stakes online auctions. 
            Experience real-time bidding with verified sellers and secure transactions.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/register" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 group">
              Get Started for Free <FiArrowRight className="group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/products" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition">
              Browse Auctions
            </Link>
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-[120px]" />
        </div>
      </header>

      {/* --- FEATURES GRID (Bento Style) --- */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to trade</h2>
            <p className="text-slate-500">Built for individual collectors and enterprise auction houses alike.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={i}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center text-xl mb-6 shadow-inner`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to place your first bid?</h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">Join thousands of bidders and start winning items at competitive prices today.</p>
            <Link to="/register" className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition inline-block">
              Create My Account
            </Link>
          </div>
          {/* Subtle patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full -ml-20 -mb-20 blur-3xl" />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-100 border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">B</div>
            <span className="font-bold tracking-tight text-slate-900">BidMaster Pro</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-blue-600 transition">Terms</a>
            <a href="#" className="hover:text-blue-600 transition">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition">Cookies</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 BidMaster Pro Inc. Built with React.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;