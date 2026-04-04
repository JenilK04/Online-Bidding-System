import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiTruck, FiCheckCircle, FiPhone, FiCreditCard, 
  FiClock, FiArrowRight, FiMapPin, FiFileText, FiHash, FiActivity, FiTag, FiSend,
  FiShield, FiUploadCloud, FiAlertTriangle, FiLock, FiInfo, FiX
} from "react-icons/fi";
import Navbar from "./Navbar";
import API from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wonItems, setWonItems] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState("won"); 

  // --- NEW STATES FOR VERIFICATION & BASE64 PREVIEW ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // To show the image before upload
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // --- EXISTING STATES FOR SHIPPING WORKFLOW ---
  const [trackingData, setTrackingData] = useState({});
  const [isShipping, setIsShipping] = useState(false);

  // --- PAYMENT TIMEOUT CONFIG (24 Hours) ---
  const PAYMENT_WINDOW = 24 * 60 * 60 * 1000;

  
  const fetchData = async () => {
  try {
    // 1. Get the User Profile first (should be < 100ms)
    const userRes = await API.get("/profile"); 
    setUser(userRes.data);

    // 2. Fire the items request WITHOUT 'awaiting' it immediately
    // This lets the UI render the header while the list loads
    API.get("/profile").then(res => {
      setWonItems(res.data.wonProducts || []);
      setMyListings(res.data.myProducts || []);
    });
    
  } catch (err) { 
    console.error("Profile Sync Error:", err); 
  }
};
  
  useEffect(() => { fetchData(); }, []);
  // --- NEW: FILE CHANGE HANDLER WITH BASE64 PREVIEW ---
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return alert("File too large. Please select an image under 2MB.");
      }
      setSelectedFile(file);
      
      // Create Base64 Preview for the UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- NEW: VERIFICATION UPLOAD HANDLER ---
  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Please select a document image first.");
    
    setIsVerifying(true);
    const formData = new FormData();
    // This key MUST match: upload.single("verificationDoc") in your backend route
    formData.append("verificationDoc", selectedFile);

    try {
      await API.post("/auth/verify-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        fetchData(); // Refresh to show "Pending" status
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShipAction = async (productId) => {
    const trackNum = trackingData[productId];
    if (!trackNum) return alert("Please enter a tracking number");

    setIsShipping(true);
    try {
      await API.patch(`/orders/ship/${productId}`, { trackingNumber: trackNum });
      alert("Shipment Confirmed!");
      fetchData(); 
    } catch (err) {
      alert("Failed to update shipping status.");
    } finally {
      setIsShipping(false);
    }
  };

  const handlePrintInvoice = (item) => {
    const printWindow = window.open("", "_blank");
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${item.title}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-section { margin-top: 30px; text-align: right; border-top: 2px solid #1e293b; padding-top: 20px; }
            .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">INVOICE</h1>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">TXN: ${item.transactionId || 'PENDING_SYNC'}</p>
            </div>
            <div style="text-align: right">
              <h2 style="margin:0; font-size: 18px; font-weight: 900; color: #4f46e5;">AUCTION_HUB</h2>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div class="info-grid">
            <div>
              <div class="label">Billed To</div>
              <div class="value">${user.firstName} ${user.lastName}</div>
              <div style="color: #64748b; font-size: 13px;">
                ${item.buyerShippingAddress?.street || 'Verified Warehouse Address'}<br/>
                ${item.buyerShippingAddress?.city || ''}, ${item.buyerShippingAddress?.state || ''}
              </div>
            </div>
            <div style="text-align: right">
              <div class="label">Payment Status</div>
              <div class="value" style="color: #059669;">CONFIRMED / PAID</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: right;">Final Hammer Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 700;">${item.title}</td>
                <td style="text-align: right; font-weight: 700;">₹${item.currentBid?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-section">
            <span class="label">Total Amount Paid</span>
            <div style="font-size: 24px; font-weight: 900;">₹${item.currentBid?.toLocaleString()}</div>
          </div>
          <div class="footer">This is an electronically generated document for your purchase at AuctionHub.</div>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* --- KYC WARNING BANNER --- */}
      {!user.isVerified && user.verificationStatus !== "Pending" && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-800">
              <FiAlertTriangle className="animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Verification Required: Please upload your documents for ID: {user.personalId}
              </p>
            </div>
            <button 
              onClick={() => setActiveTab("verify")}
              className="text-[10px] font-black uppercase text-amber-900 underline underline-offset-4"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-100 pt-14 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-slate-50 ${user.isVerified ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-900 shadow-slate-200'}`}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {user.isVerified ? <FiCheckCircle className="text-white text-xs" /> : <FiShield className="text-white text-xs" />}
              </div>
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <FiHash /> {user.email}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${user.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  <FiActivity /> {user.isVerified ? 'Verified Pro' : user.verificationStatus || 'Unverified'}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
               <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 rounded-[28px] border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Purchases</p>
                 <p className="text-2xl font-black text-slate-900">{wonItems.length}</p>
               </div>
               <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 rounded-[28px] border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Listings</p>
                 <p className="text-2xl font-black text-slate-900">{myListings.length}</p>
               </div>
            </div>
          </div>

          <div className="mt-16 flex gap-10">
              {[
                { id: "won", label: "Inventory Won", icon: <FiTag /> }, 
                { id: "listings", label: "Selling Hub", icon: <FiPackage /> },
                { id: "verify", label: "Verification", icon: <FiShield /> }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-3 border-b-[3px] ${activeTab === tab.id ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="popLayout">
            
            {/* --- VERIFICATION TAB CONTENT --- */}
            {activeTab === "verify" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-[48px] border border-slate-200 p-12 shadow-sm text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <FiLock size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Account Verification</h2>
                  <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    To maintain market integrity, please upload a copy of the ID associated with: <span className="text-slate-900 font-bold">{user.personalId}</span>
                  </p>

                  {user.isVerified ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[32px] flex flex-col items-center gap-4">
                      <FiCheckCircle className="text-emerald-500 text-5xl" />
                      <div>
                        <p className="text-emerald-900 font-black uppercase text-xs tracking-widest">Verification Complete</p>
                        <p className="text-emerald-600 text-[11px] mt-1 font-bold">Your account has full trading privileges.</p>
                      </div>
                    </div>
                  ) : (user.verificationStatus === "Pending" || uploadSuccess) ? (
                    <div className="bg-blue-50 border border-blue-100 p-10 rounded-[32px] flex flex-col items-center gap-4">
                      <FiClock className="text-blue-500 text-5xl animate-spin-slow" />
                      <div>
                        <p className="text-blue-900 font-black uppercase text-xs tracking-widest">Under Admin Review</p>
                        <p className="text-blue-600 text-[11px] mt-1 font-bold">We are validating your document. This usually takes 2-4 hours.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Image Preview Node */}
                      {previewUrl && (
                        <div className="mb-6 relative group max-w-xs mx-auto">
                          <img src={previewUrl} className="rounded-3xl border-4 border-white shadow-xl w-full object-cover aspect-video" alt="Preview" />
                          <button 
                            onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <FiX />
                          </button>
                        </div>
                      )}

                      <label className="group block cursor-pointer bg-slate-50 border-2 border-dashed border-slate-200 p-16 rounded-[40px] hover:border-indigo-400 hover:bg-white transition-all duration-300">
                        <FiUploadCloud className="mx-auto text-5xl text-slate-300 group-hover:text-indigo-500 mb-4 transition-colors" />
                        <p className="text-sm font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">
                          {selectedFile ? selectedFile.name : "Choose File or Drag Here"}
                        </p>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={onFileChange} 
                        />
                      </label>

                      <button 
                        onClick={handleFileUpload}
                        disabled={isVerifying || !selectedFile}
                        className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all ${isVerifying || !selectedFile ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'}`}
                      >
                        {isVerifying ? "Encoding Identity..." : "Submit for Approval"}
                      </button>
                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <FiInfo /> Document must clearly show your full name and ID number.
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* --- WON ITEMS TAB (KEEPING EVERYTHING) --- */}
            {activeTab === "won" && wonItems.map((item) => {
              const isPaid = item.paymentStatus === "Paid";
              const winTimestamp = new Date(item.endTime).getTime();
              const isExpired = !isPaid && (Date.now() - winTimestamp > PAYMENT_WINDOW);
              
              return (
                <motion.div 
                  layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  key={item._id}
                  className="group bg-white rounded-[48px] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 grid grid-cols-1 lg:grid-cols-12"
                >
                  <div className="lg:col-span-3 bg-slate-50/50 p-10 flex items-center justify-center border-r border-slate-100 overflow-hidden">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={item.images?.[0]} 
                      className="max-h-52 object-contain mix-blend-multiply drop-shadow-2xl" 
                      alt="" 
                    />
                  </div>

                  <div className="lg:col-span-5 p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-700' : isExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isPaid ? "Payment Verified" : isExpired ? "Win Expired" : "Action Required"}
                       </span>
                       {isPaid && <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1"><FiTruck/> In Pipeline</span>}
                    </div>
                    <h4 className="font-black text-slate-900 text-3xl mb-3 leading-[1.1] tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-2 leading-relaxed">{item.description}</p>
                    
                    <div className="flex items-center gap-10">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Hammer Price</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{item.currentBid?.toLocaleString()}</p>
                       </div>
                       {isPaid && (
                         <div className="border-l border-slate-200 pl-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                            <p className="text-sm font-black text-indigo-600 uppercase flex items-center gap-2 mt-1">
                               <FiTruck className="animate-pulse" /> {item.deliveryStatus || "Processing"}
                            </p>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="lg:col-span-4 p-10 bg-slate-50/30 flex flex-col justify-center border-l border-slate-100 backdrop-blur-sm">
                    {!isPaid ? (
                      <div className="text-center">
                        <div className={`w-14 h-14 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50`}>
                          <FiCreditCard className={`${isExpired ? 'text-slate-300' : 'text-indigo-600'} text-xl`} />
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-6 px-4">
                          {isExpired ? "The payment period for this item has ended." : "Secure your win by completing the transaction node."}
                        </p>
                        <button 
                          onClick={() => !isExpired && navigate(`/checkout/${item._id}`)} 
                          disabled={isExpired}
                          className={`w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl flex items-center justify-center gap-3 ${isExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-[0.98] shadow-slate-200'}`}
                        >
                          {isExpired ? "Purchase Expired" : "Checkout Now"} {!isExpired && <FiArrowRight />}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex gap-4 p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                           <FiMapPin className="text-indigo-500 shrink-0 mt-1" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping Venue</p>
                              <p className="text-[12px] font-bold text-slate-700 leading-tight">
                                {item.buyerShippingAddress?.street || "Verified HQ"}<br/>
                                <span className="opacity-60">{item.buyerShippingAddress?.city}, {item.buyerShippingAddress?.state}</span>
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-4 p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                           <FiFileText className="text-emerald-500 shrink-0 mt-1" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Internal Reference</p>
                              <p className="text-[11px] font-mono font-bold text-slate-900 truncate">{item.transactionId || "SYNCING_TX_NODE..."}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handlePrintInvoice(item)}
                          className="w-full py-4 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-300"
                        >
                          Print Invoice
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* --- LISTINGS TAB (KEEPING EVERYTHING) --- */}
            {activeTab === "listings" && myListings.map((listing) => {
              const isSold = listing.status === "Sold" || listing.winnerId;
              const isPaid = listing.paymentStatus === "Paid"; 
              const isShipped = listing.deliveryStatus === "Shipped";

              return (
                <motion.div 
                  key={listing._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6 mb-6 hover:shadow-md transition-all cursor-pointer"
                >
                  <div onClick={() => navigate(isSold ? `/manage-listing/${listing._id}` : `/my-product/${listing._id}`)} className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl p-3 flex items-center justify-center border border-slate-100">
                        <img src={listing.images?.[0]} className="max-h-full object-contain mix-blend-multiply" alt=""/>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xl mb-1">{listing.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                            {isPaid ? "Funds Secured" : listing.status}
                          </span>
                          {isPaid && !isShipped && (
                            <span className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1">
                              <FiClock className="animate-spin-slow" /> Awaiting Shipment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Bid</p>
                      <p className="text-xl font-black text-slate-900">₹{listing.currentBid?.toLocaleString()}</p>
                    </div>
                  </div>

                  {isPaid && !isShipped ? (
                    <div onClick={(e) => e.stopPropagation()} className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100 flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-grow">
                        <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-1">Fulfillment Required</p>
                        <p className="text-xs text-indigo-600 font-medium">Buyer has completed payment. Please provide tracking to ship.</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <input 
                          type="text"
                          placeholder="Enter Tracking ID..."
                          className="bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 w-full md:w-64"
                          onChange={(e) => setTrackingData({...trackingData, [listing._id]: e.target.value})}
                        />
                        <button 
                          onClick={() => handleShipAction(listing._id)}
                          disabled={isShipping}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
                        >
                          <FiSend /> {isShipping ? "Confirming..." : "Confirm Ship"}
                        </button>
                      </div>
                    </div>
                  ) : isShipped ? (
                    <div onClick={(e) => e.stopPropagation()} className="bg-emerald-50 p-5 rounded-[28px] border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                            <FiCheckCircle />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Dispatched</p>
                            <p className="text-[11px] font-mono text-emerald-600 font-bold">{listing.trackingNumber || "TRK-XXXXXXXX"}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/manage-listing/${listing._id}`)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition">View Details</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-400 italic">Shipping options will unlock once payment is confirmed.</p>
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                          Manage Auction <FiArrowRight />
                        </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {((activeTab === "won" && wonItems.length === 0) || (activeTab === "listings" && myListings.length === 0)) && (
          <div className="text-center py-32 bg-slate-50/50 rounded-[60px] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
               <FiPackage className="text-slate-300 text-3xl"/>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">The Vault is Empty</h3>
             <p className="text-slate-400 text-sm font-medium tracking-wide">Start bidding or list an item to see activity.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;