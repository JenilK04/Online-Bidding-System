import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUsers, FiSearch, FiUserCheck, FiUserX, FiMail, 
  FiActivity, FiLayers, FiDollarSign, FiLogOut, FiShield, FiEye, FiCheck, FiX, FiSlash
} from "react-icons/fi";
import API from "../../services/api";

const AdminUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  
  // --- 1. KYC VERIFICATION HANDLER (Document Approval) ---
  const handleVerification = async (userId, status) => {
    try {
      await API.patch(`admin/verify/${userId}`, { status });
      setUsers(users.map(u => u._id === userId ? { 
        ...u, 
        verificationStatus: status, 
        isVerified: status === "Verified" 
      } : u));
      if (selectedDoc) setSelectedDoc(null);
    } catch (err) {
      alert("Verification update failed.");
    }
  };

  // --- 2. ACCESS STATUS HANDLER (Active / Deactivated / Suspended) ---
  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await API.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Status update failed.");
    }
  };

  const filteredUsers = users.filter(user => {
    const name = `${user?.firstName} ${user?.lastName}`.toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const personalId = (user?.personalId || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search) || personalId.includes(search);
    
    if (filter === "pending") return matchesSearch && user.verificationStatus === "Pending";
    if (filter === "all") return matchesSearch;
    return matchesSearch && user.status === filter;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse text-blue-400">Ledger Synchronization...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      
      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[40px] p-8 max-w-2xl w-full shadow-2xl relative">
              <button onClick={() => setSelectedDoc(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><FiX size={24}/></button>
              <h2 className="text-2xl font-black mb-2">Identity Verification</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">User ID: {selectedDoc.personalId}</p>
              
              <div className="bg-slate-50 rounded-3xl overflow-hidden border-4 border-slate-100 mb-8">
                <img src={selectedDoc.verificationDoc} className="w-full h-auto object-contain max-h-[60vh]" alt="Identity Doc" />
              </div>

              <div className="flex gap-4">
                <button onClick={() => handleVerification(selectedDoc._id, "Verified")} className="flex-grow bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-emerald-700 transition-all">Approve User</button>
                <button onClick={() => handleVerification(selectedDoc._id, "Rejected")} className="flex-grow bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase text-xs border border-red-100 hover:bg-red-600 hover:text-white transition-all">Reject Document</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 sticky top-0 h-screen z-50 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <FiActivity className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">Admin<span className="text-blue-500">Node</span></span>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {[
            { name: 'Overview', icon: <FiActivity />, path: '/admin/dashboard' },
            { name: 'Manage Users', icon: <FiUsers />, path: '/admin/users' },
            { name: 'Auction Events', icon: <FiLayers />, path: '/admin/events' },
            { name: 'Finance', icon: <FiDollarSign />, path: '/admin/finance' }
          ].map((item) => (
            <button key={item.name} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{item.icon} {item.name}</button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"><FiLogOut /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Directory</h1>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mt-1">Identity & KYC Moderation</p>
          </div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        {/* FILTERS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'active', 'deactivated', 'suspended', 'pending'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
              {f === 'pending' ? 'KYC Queue' : f}
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
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-inner ${user.isVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                            {user.isVerified ? <FiCheck /> : (user?.firstName?.charAt(0) || "?")}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] font-bold text-slate-400">{user.personalId}</p>
                          </div>
                        </div>
                      </td>

                      {/* NEW: ACCESS STATUS COLUMN */}
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest 
                          ${user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                            user.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          {user.status}
                        </span>
                      </td>

                      {/* KYC STATUS COLUMN */}
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest 
                          ${user.verificationStatus === 'Verified' ? 'bg-blue-100 text-blue-600' : 
                            user.verificationStatus === 'Pending' ? 'bg-blue-50 text-blue-400 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                          {user.verificationStatus || "Unverified"}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {/* KYC REVIEW BUTTON */}
                          {user.verificationStatus === "Pending" && (
                            <button onClick={() => setSelectedDoc(user)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <FiEye /> Review ID
                            </button>
                          )}
                          
                          {/* ACCESS CONTROL BUTTONS */}
                          {user.status === 'active' ? (
                            <>
                              <button onClick={() => handleUpdateStatus(user._id, 'deactivated')} className="p-3 text-orange-500 bg-white border border-orange-100 hover:bg-orange-500 hover:text-white rounded-xl transition-all" title="Deactivate">
                                <FiUserX size={18} />
                              </button>
                              <button onClick={() => handleUpdateStatus(user._id, 'suspended')} className="p-3 text-red-600 bg-white border border-red-100 hover:bg-red-600 hover:text-white rounded-xl transition-all" title="Suspend">
                                <FiSlash size={18} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleUpdateStatus(user._id, 'active')} className="p-3 text-emerald-600 bg-white border border-green-100 hover:bg-green-600 hover:text-white rounded-xl transition-all" title="Activate Account">
                              <FiUserCheck size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;