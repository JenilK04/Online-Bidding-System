import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiDollarSign, FiTrendingUp, FiArrowUpRight, 
  FiPieChart, FiDownloadCloud, FiShield, FiCheck,
  FiActivity, FiUsers, FiLayers, FiLogOut
} from "react-icons/fi";
import API from "../../services/api";

const AdminFinance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({
    totalSalesVolume: 0,
    platformCommission: 0,
    pendingPayouts: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await API.get("/admin/finance");
        setData(res.data);
      } catch (err) {
        console.error("Finance Audit Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cards = [
    { label: "Gross Volume", val: `₹${data.totalSalesVolume.toLocaleString('en-IN')}`, icon: <FiTrendingUp />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Net Revenue (5%)", val: `₹${data.platformCommission.toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Payouts", val: data.pendingPayouts, icon: <FiPieChart />, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse text-emerald-400">Auditing Ledger Assets</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 sticky top-0 h-screen z-50 shrink-0">
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
               <p className="text-xs font-bold text-white truncate">Finance_Controller</p>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Finance Ledger</h1>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Platform Revenue & Transaction Audit</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm">
            <FiDownloadCloud /> Export CSV
          </button>
        </header>

        {/* METRIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {cards.map((card, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={i} className="bg-white p-8 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 text-xl`}>
                {card.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{card.val}</h2>
            </motion.div>
          ))}
        </div>

        {/* TRANSACTION TABLE */}
        <div className="bg-white rounded-[40px] border border-white shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <FiShield className="text-blue-600" /> Secure Transactions
            </h3>
            <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">Gateway Active</span>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fee (5%)</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-[10px] text-slate-400">TXN-{tx._id.substring(18, 24).toUpperCase()}</td>
                  <td className="px-8 py-6 font-black text-slate-900 text-sm truncate max-w-[200px]">{tx.title}</td>
                  <td className="px-8 py-6 font-black text-slate-900">₹{tx.currentBid.toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6 font-bold text-emerald-600">+₹{(tx.currentBid * 0.05).toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                      <FiCheck /> Cleared
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.transactions.length === 0 && (
            <div className="py-20 text-center">
              <FiPieChart size={40} className="mx-auto mb-4 text-slate-100" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No cleared transactions found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminFinance;