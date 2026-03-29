import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUsers, FiSearch, FiArrowLeft, FiUserCheck, FiUserX, FiMail 
} from "react-icons/fi";
import API from "../../services/api";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      // Ensure we always have an array even if API fails
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      await API.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Status update failed.");
    }
  };

  // 🔥 SAFE FILTER LOGIC: Prevents "toLowerCase of undefined"
  const filteredUsers = users.filter(user => {
    const name = (user?.name || "").toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesFilter = filter === "all" || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-slate-900">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">
        Synchronizing User Directory...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4 text-[10px] font-black uppercase tracking-widest"
          >
            <FiArrowLeft /> Back to Command Center
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            User Directory <span className="text-sm bg-blue-100 text-blue-600 px-4 py-1 rounded-full">{users.length}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-grow md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Name or Email..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2">
        {['all', 'active', 'suspended'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify / Auth</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={user._id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {/* 🔥 SAFE AVATAR: Prevents "charAt of undefined" */}
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {user?.name ? user.name.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">
                            {user?.firstName || "Anonymous User"}
                          </p>
                          <p className="text-xs font-medium text-slate-400">
                            {user?.email || "No Email Linked"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-600">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "N/A"}
                      </p>
                      <p className="text-[10px] font-black text-slate-300 uppercase">Synced</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {user?.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user._id, user.status)}
                          className={`p-3 rounded-xl transition-all ${user?.status === 'active' ? 'text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white' : 'text-green-600 bg-green-50 hover:bg-green-600 hover:text-white'}`}
                        >
                          {user?.status === 'active' ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                        </button>
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
                          <FiMail size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-300">
               <FiUsers size={64} className="opacity-10 mb-4" />
               <p className="font-black uppercase text-xs tracking-widest">No matching profiles found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;