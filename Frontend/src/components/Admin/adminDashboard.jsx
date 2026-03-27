import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiUsers, FiUser, FiLayers, FiDollarSign, FiActivity, 
  FiAlertCircle, FiCheckCircle, FiTrendingUp, FiSettings, 
  FiXCircle, FiLogOut 
} from "react-icons/fi";
import API from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State matches the keys sent by the Admin Controller
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    pendingReports: 0,
    recentActivity: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Backend: router.get("/stats", protect, isAdmin, getAdminStats);
        const res = await API.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Admin Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const statCards = [
    { label: "Total Bidders", val: stats.totalUsers, icon: <FiUsers />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Live Lots", val: stats.activeAuctions, icon: <FiLayers />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Platform Rev", val: `₹${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Issues", val: stats.pendingReports, icon: <FiAlertCircle />, color: "text-red-600", bg: "bg-red-50" },
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse text-blue-400">Synchronizing Command Center</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
            <FiActivity className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">Admin<span className="text-blue-500">Node</span></span>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {[
            { name: 'Overview', icon: <FiActivity />, path: '/admin/dashboard' },
            { name: 'Manage Users', icon: <FiUsers />, path: '/admin/users' },
            { name: 'Auction Events', icon: <FiLayers />, path: '/admin/events' },
            { name: 'Finance', icon: <FiDollarSign />, path: '/admin/finance' },
          ].map((item) => (
            <button 
              key={item.name} 
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut /> Logout
            </button>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Authorized Access</p>
               <p className="text-xs font-bold text-white truncate">Admin_Access_Panel</p>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Real-Time Platform Analytics</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">AD</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security</p>
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active Session</span>
            </div>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={card.label} 
              className="bg-white p-8 rounded-[32px] border border-white shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:rotate-12 transition-transform`}>
                {card.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.val}</p>
            </motion.div>
          ))}
        </div>

        {/* LOWER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🚀 DYNAMIC BID STREAM */}
          <section className="bg-white rounded-[40px] border border-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" /> Live Bid Ledger
              </h3>
              <div className="flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-600 text-[10px] font-black uppercase tracking-widest">Streaming</span>
              </div>
            </div>

            <div className="p-0 flex-grow">
               {stats.recentActivity && stats.recentActivity.length > 0 ? (
                 stats.recentActivity.map((lot, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0">LOT</div>
                            <div className="truncate">
                                <p className="text-sm font-black text-slate-800 truncate">{lot.title}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(lot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Sync Active</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="font-black text-emerald-600">₹{lot.currentBid.toLocaleString()}</p>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${lot.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                {lot.status}
                            </span>
                        </div>
                    </div>
                 ))
               ) : (
                 <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                    <FiActivity size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase text-[10px] tracking-[0.2em]">No Auction Activity Detected</p>
                 </div>
               )}
            </div>
            <button onClick={() => navigate("/admin/events")} className="w-full py-5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 hover:bg-slate-100 transition-all border-t border-slate-100">
              Audit Full Inventory
            </button>
          </section>

          {/* 🛡️ VERIFICATION QUEUE */}
          <section className="bg-white rounded-[40px] border border-white shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                <FiUsers className="text-indigo-600" /> Identity Moderation
              </h3>
            </div>
            <div className="p-8 space-y-4">
               {/* Static Placeholder for Identity Queue */}
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <FiUser size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Manual Verification Required</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">1 User awaiting KYC approval</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100">
                      <FiArrowRight size={18}/>
                    </button>
                  </div>
               </div>
               
               {/* Community Quick Link */}
               <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer h-48" onClick={() => navigate("/admin/users")}>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Platform Scale</p>
                    <h4 className="text-4xl font-black tracking-tighter">{stats.totalUsers}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">Verified Bidders</p>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors relative z-10 text-[10px] font-black uppercase tracking-[0.2em]">
                    Manage Directory <FiArrowRight />
                  </div>
                  <FiTrendingUp size={120} className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700" />
               </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

// Reusable Icon component
const FiArrowRight = ({ className }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
)

export default AdminDashboard;