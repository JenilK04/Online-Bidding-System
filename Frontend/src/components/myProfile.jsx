import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiTruck, FiCheckCircle, FiMapPin, 
  FiPhone, FiClock, FiUser, FiInfo, FiArrowRight 
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wonItems, setWonItems] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState("won"); // "won" or "listings"

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/profile");
      setUser(res.data.user);
      setWonItems(res.data.wonProducts || []); 
      setMyListings(res.data.myProducts || []); 
    } catch (err) { console.error("Profile Fetch Error:", err); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />

      {/* --- PROFILE HEADER --- */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-6 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-slate-900 rounded-[30px] flex items-center justify-center text-white text-3xl font-black shadow-xl">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{user.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 <FiPhone className="text-indigo-500" /> {user.phone || "No Phone"}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 <FiCheckCircle className="text-emerald-500" /> Verified Member
               </div>
            </div>
          </div>

          <div className="flex gap-3">
             <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Purchases</p>
               <p className="text-xl font-black text-slate-900">{wonItems.length}</p>
             </div>
             <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Listings</p>
               <p className="text-xl font-black text-slate-900">{myListings.length}</p>
             </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-6xl mx-auto mt-12 flex gap-8">
            {[
              { id: "won", label: "My Wins", icon: <FiCheckCircle /> },
              { id: "listings", label: "My Listings", icon: <FiPackage /> }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border-b-2 ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            
            {/* RENDER WON ITEMS */}
            {activeTab === "won" && wonItems.map((item) => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                key={item._id}
                className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm flex flex-col group"
              >
                <div className="aspect-square bg-slate-50 p-6 flex items-center justify-center">
                  <img src={item.images?.[0]} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" alt="" />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="font-black text-slate-900 text-lg mb-4 leading-tight">{item.title}</h4>

                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Price</span>
                     <span className="font-black text-slate-900 tracking-tighter text-lg">₹{item.currentBid?.toLocaleString()}</span>
                  </div>

                  <div className="mt-auto">
                    {!item.isPaid ? (
                      <button 
                        onClick={() => navigate(`/checkout/${item._id}`)} 
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition flex items-center justify-center gap-2"
                      >
                        Complete Checkout <FiArrowRight />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        <FiTruck /> {item.deliveryStatus || 'Processing Shipment'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* RENDER LISTINGS */}
            {activeTab === "listings" && myListings.map((listing) => (
              <motion.div 
                key={listing._id}
                className="bg-white rounded-[32px] border border-slate-200 overflow-hidden flex flex-col shadow-sm"
              >
                <div className="aspect-video bg-slate-100 p-4 flex items-center justify-center relative">
                   <img src={listing.images?.[0]} className="max-h-full object-contain" alt="" />
                   <div className="absolute top-4 right-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${listing.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                        {listing.status}
                      </span>
                   </div>
                </div>
                <div className="p-6">
                  <h4 className="font-black text-slate-900 truncate mb-4">{listing.title}</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                      {listing.isPaid ? "Sold & Paid" : "Awaiting Winner"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* EMPTY STATE */}
        {((activeTab === "won" && wonItems.length === 0) || 
           (activeTab === "listings" && myListings.length === 0)) && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <FiPackage size={48} className="mx-auto mb-4 text-slate-200"/>
             <h3 className="text-xl font-black text-slate-900 mb-1">No Activity Found</h3>
             <p className="text-slate-400 text-sm font-medium">Your marketplace history will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;