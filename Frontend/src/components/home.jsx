import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowRight, FiShield, FiZap, FiSmartphone, 
  FiClock, FiCreditCard, FiPackage, FiSearch, 
  FiCheck, FiTrendingUp, FiAward, FiMessageSquare, 
  FiMail, FiPlus, FiMinus, FiFileText 
} from "react-icons/fi";

const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  // Updated Steps Data with Verified Icons
  const steps = [
    { 
      title: "Discover Events", 
      desc: "Browse curated auction events. From vintage timepieces to real estate, find your niche.", 
      icon: <FiSearch />, color: "text-blue-600", bg: "bg-blue-50" 
    },
    { 
      title: "Verify Identity", 
      desc: "Quick KYC verification ensures a secure and trustworthy bidding environment for everyone.", 
      icon: <FiCheck />, color: "text-indigo-600", bg: "bg-indigo-50" 
    },
    { 
      title: "Live Bidding", 
      desc: "Place real-time bids on individual lots. Our anti-snipe system keeps the competition fair.", 
      icon: <FiTrendingUp />, color: "text-amber-600", bg: "bg-amber-50" 
    },
    { 
      title: "Win & Collect", 
      desc: "The highest bidder takes the prize. Secure payment and fully insured global shipping.", 
      icon: <FiAward />, color: "text-emerald-600", bg: "bg-emerald-50" 
    },
  ];

  const features = [
    { title: "Live Bidding", icon: <FiZap />, desc: "Real-time updates with millisecond latency.", color: "bg-amber-100 text-amber-600" },
    { title: "Secure System", icon: <FiShield />, desc: "End-to-end encryption and verified profiles.", color: "bg-green-100 text-green-600" },
    { title: "Global Payments", icon: <FiCreditCard />, desc: "Integrated multi-currency processing.", color: "bg-rose-100 text-rose-600" },
    { title: "Scheduled Events", icon: <FiClock />, desc: "Never miss an item with automated alerts.", color: "bg-purple-100 text-purple-600" },
    { title: "Verified Delivery", icon: <FiPackage />, desc: "Tracked shipping from the vault to your door.", color: "bg-indigo-100 text-indigo-600" },
    { title: "Mobile Ready", icon: <FiSmartphone />, desc: "Bid on the go with our optimized interface.", color: "bg-blue-100 text-blue-600" },
  ];

  const faqs = [
    { q: "Is there a registration fee for events?", a: "Most events are free to join, though some high-value auctions require a refundable security deposit to ensure bidder intent." },
    { q: "How does the 'Anti-Snipe' timer work?", a: "If a bid is placed in the final 30 seconds, the clock extends by 60 seconds, allowing all parties a fair chance to respond." },
    { q: "Are all sellers verified?", a: "Yes. Every seller undergoes a background check, and every lot is authenticated by our in-house experts." }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans scroll-smooth">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">B</div>
          <span className="text-xl font-black tracking-tighter">BIDMASTER</span>
        </Link>

        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <a href="#how-it-works" className="hover:text-blue-600 transition">How it works</a>
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#support" className="hover:text-blue-600 transition">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100">Join</Link>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <header className="relative pt-24 pb-32 px-6 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Live Auctions Active Now
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
            The Art of the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Winning Bid.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 max-w-xl mx-auto mb-12 font-medium">
            Join the world's premier digital auction house. Experience real-time bidding on verified assets with millisecond precision.
          </motion.p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-slate-900 text-white px-10 py-5 rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition shadow-2xl">Start Bidding</Link>
            <Link to="/products" className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition">View Lots</Link>
          </div>
        </div>
      </header>

      {/* --- 3. HOW IT WORKS --- */}
      <section id="how-it-works" className="py-32 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left mb-20">
            <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.3em] mb-4">The Protocol</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Four steps to <br/> excellence.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-slate-100 -z-0" />
            {steps.map((step, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i} className="group relative z-10">
                <div className={`w-20 h-20 ${step.bg} ${step.color} rounded-[28px] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-all duration-500`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. FEATURES GRID --- */}
      <section id="features" className="py-32 px-6 bg-slate-900 rounded-[60px] mx-4 md:mx-8 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-24 tracking-tighter">Built for the <br/> Elite Collector.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {features.map((f, i) => (
              <motion.div whileHover={{ y: -10 }} key={i} className="bg-slate-800/40 p-10 rounded-[40px] border border-slate-700 hover:border-blue-500 transition-all group">
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{f.title}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. SUPPORT & FAQ --- */}
      <section id="support" className="py-32 px-6 bg-slate-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Support Center</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 leading-tight">We're at your <br/> service 24/7.</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl flex items-center gap-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><FiMessageSquare size={22}/></div>
                  <div><h4 className="font-black text-[10px] uppercase tracking-widest">Live Concierge</h4><p className="text-xs text-slate-400 font-bold">Priority Support Available</p></div>
                </div>
                <div className="bg-white p-6 rounded-3xl flex items-center gap-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><FiMail size={22}/></div>
                  <div><h4 className="font-black text-[10px] uppercase tracking-widest">Email Relations</h4><p className="text-xs text-slate-400 font-bold">support@bidmaster.pro</p></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-slate-400"><FiFileText className="text-blue-600" size={18}/> Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-slate-50 last:border-0 pb-4">
                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex justify-between items-center text-left py-2 group">
                      <span className="font-black text-sm text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{faq.q}</span>
                      {activeFaq === i ? <FiMinus className="text-blue-600"/> : <FiPlus className="text-slate-300"/>}
                    </button>
                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed border-l-2 border-blue-100 pl-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. FOOTER --- */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-black text-xs">B</div>
              <span className="font-black tracking-tighter text-slate-900">BIDMASTER PRO</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Global Auction Authority © 2026</p>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Audit Ledger</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;