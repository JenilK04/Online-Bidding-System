import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiDollarSign, FiTrendingUp, FiArrowUpRight, 
  FiPieChart, FiDownloadCloud, FiShield, FiCheck 
} from "react-icons/fi";
import API from "../../services/api";

const AdminFinance = () => {
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const cards = [
    { label: "Gross Volume", val: `₹${data.totalSalesVolume.toLocaleString()}`, icon: <FiTrendingUp />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Net Revenue (5%)", val: `₹${data.platformCommission.toLocaleString()}`, icon: <FiDollarSign />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Payouts", val: data.pendingPayouts, icon: <FiPieChart />, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  if (loading) return <div className="p-20 text-center font-black animate-pulse">AUDITING_LEDGER...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Finance Ledger</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Platform Revenue & Transaction Audit</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">
          <FiDownloadCloud /> Export CSV
        </button>
      </header>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} className="bg-white p-8 rounded-[32px] border border-white shadow-sm"
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
          <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">Gateway Active</span>
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
                <td className="px-8 py-6 font-black text-slate-900 text-sm">{tx.title}</td>
                <td className="px-8 py-6 font-black text-slate-900">₹{tx.currentBid.toLocaleString()}</td>
                <td className="px-8 py-6 font-bold text-emerald-600">+₹{(tx.currentBid * 0.05).toLocaleString()}</td>
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
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No cleared transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinance;