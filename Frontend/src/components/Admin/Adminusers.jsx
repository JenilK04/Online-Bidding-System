import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUsers, FiSearch, FiUserCheck, FiUserX, FiMail, 
  FiActivity, FiLayers, FiDollarSign, FiLogOut 
} from "react-icons/fi";
import API from "../../services/api";

const AdminUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      await API.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Status update failed.");
    }
  };

  const filteredUsers = users.filter(user => {
    const name = (user?.firstName || user?.name || "").toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesFilter = filter === "all" || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse text-blue-400">Synchronizing User Directory</p>
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
               <p className="text-xs font-bold text-white truncate">User_Moderator</p>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              User Directory <span className="text-sm bg-blue-100 text-blue-600 px-4 py-1 rounded-full">{users.length}</span>
            </h1>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">Identity & Access Moderation</p>
          </div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name or Email..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* FILTERS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'active', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify / Auth</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
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
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            {user?.firstName ? user.firstName.charAt(0) : user?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">
                              {user?.firstName || user?.name || "Anonymous User"}
                            </p>
                            <p className="text-xs font-medium text-slate-400 lowercase">
                              {user?.email || "No Email Linked"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "N/A"}
                        </p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Synced</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {user?.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => toggleUserStatus(user._id, user.status)}
                            className={`p-3 rounded-xl transition-all shadow-sm ${user?.status === 'active' ? 'text-orange-500 bg-white border border-orange-100 hover:bg-orange-500 hover:text-white' : 'text-green-600 bg-white border border-green-100 hover:bg-green-600 hover:text-white'}`}
                          >
                            {user?.status === 'active' ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                          </button>
                          <button className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200 shadow-sm">
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
      </main>
    </div>
  );
};

export default AdminUsers;