import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiLayers, FiPlus, FiSearch, FiEdit2, FiTrash2, 
  FiEye, FiFilter, FiCheckCircle, FiClock 
} from "react-icons/fi";
import API from "../../services/api";

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/admin/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING_VAULT...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-10">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Inventory Ledger</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Global Auction Asset Management</p>
        </div>
        <button 
          onClick={() => navigate("/admin/add-product")}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 flex items-center gap-3 hover:bg-blue-700 transition"
        >
          <FiPlus size={18}/> Provision New Asset
        </button>
      </header>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assets by title or ID..."
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 text-sm focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition flex items-center gap-2 text-xs font-black uppercase">
            <FiFilter /> Filter
          </button>
        </div>
      </div>

      {/* ASSET TABLE */}
      <div className="bg-white rounded-[40px] border border-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, i) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                key={event._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
                        {event.images?.[0] ? (
                            <img src={event.images[0]} alt="thumb" className="w-full h-full object-cover" />
                        ) : <FiLayers className="text-slate-300" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 truncate max-w-[200px]">{event.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {event._id.substring(0,8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">₹{event.currentBid?.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Starts at ₹{event.startingPrice?.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    event.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {event.status === 'Active' ? <FiCheckCircle /> : <FiClock />}
                    {event.status}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white text-slate-400 hover:text-blue-600 border border-slate-200 rounded-xl transition shadow-sm">
                      <FiEye size={16} />
                    </button>
                    <button className="p-3 bg-white text-slate-400 hover:text-amber-600 border border-slate-200 rounded-xl transition shadow-sm">
                      <FiEdit2 size={16} />
                    </button>
                    <button className="p-3 bg-white text-slate-400 hover:text-red-600 border border-slate-200 rounded-xl transition shadow-sm">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredEvents.length === 0 && (
          <div className="p-20 text-center">
            <FiLayers size={48} className="mx-auto mb-4 text-slate-100" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No assets found in ledger</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;