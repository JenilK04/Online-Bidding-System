import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMenu, FiX, FiUser, FiLogOut, 
  FiShoppingBag, FiPackage, FiChevronDown 
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Authentication Check
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Browse Auctions", path: "/products", icon: <FiShoppingBag /> },
  ];

  // Protected links that only show when logged in
  const authLinks = [
    { name: "Sell an Item", path: "/my-products", icon: <FiPackage /> },
  ];

  return (
    <nav className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
      scrolled ? "bg-slate-200/90 backdrop-blur-md shadow-sm py-3" : "bg-slate-100 py-5"
    } border-b border-slate-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
              B
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              BidMaster<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-colors ${
                  location.pathname === link.path ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {token && authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-colors ${
                  location.pathname === link.path ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* --- AUTH BUTTONS / PROFILE --- */}
          <div className="hidden md:flex items-center gap-4">
            {!token ? (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition px-4 py-2">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-blue-300 transition-all bg-slate-50"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.firstName?.[0] || "U"}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{user.firstName}</span>
                  <FiChevronDown className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account</p>
                          <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                        </div>
                        <Link 
                          to="/my-profile" 
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiUser /> Profile Settings
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition border-t border-slate-50 font-bold"
                        >
                          <FiLogOut /> Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 bg-slate-100 rounded-lg"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-xl text-slate-600 hover:bg-blue-50 font-bold"
                >
                  {link.icon} {link.name}
                </Link>
              ))}
              
              {token ? (
                <>
                  {/* Added Profile Link for Mobile View */}
                  <Link
                    to="/my-profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl text-slate-700 bg-slate-50 hover:bg-blue-50 font-bold border border-slate-100"
                  >
                    <FiUser className="text-blue-600" /> My Profile
                  </Link>

                  {authLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl text-slate-600 hover:bg-blue-50 font-bold"
                    >
                      {link.icon} {link.name}
                    </Link>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500 font-bold hover:bg-red-50"
                  >
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-center p-3 rounded-xl font-bold border border-slate-200">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="text-center p-3 rounded-xl font-bold bg-blue-600 text-white">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;