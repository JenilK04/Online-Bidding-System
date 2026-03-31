import React, { useState } from "react";
import API from "../services/api";
import { 
  FiBox, FiCamera, FiClock, FiShield, 
  FiTruck, FiInfo, FiTag, FiX, FiSettings, FiMapPin, FiTrash2,
  FiAlertCircle // 👈 Added for error icons
} from "react-icons/fi";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({}); // 👈 Handles validation and API errors

  const [form, setForm] = useState({
    title: "", subtitle: "", sku: "", category: "Electronics",
    brand: "", modelNumber: "", condition: "Used - Excellent", description: "",
    startingPrice: "", bidIncrement: 10, maxRegistrations: 100,
    startTime: "", endTime: "",
    antiSnipeWindow: 60, 
    extensionDuration: 120, 
    
    sellerAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    
    returnPolicy: {
      acceptsReturns: false,
      returnWindow: "No Returns",
      returnShippingPaidBy: "Buyer",
      restockingFee: 0,
    },
    shippingWeight: "",
    dimensions: { length: "", width: "", height: "" },
    status: "Scheduled" 
  });

  if (!isOpen) return null;

  // 🔥 Helper to style error inputs
  const inputStyle = (fieldName) => `p-4 bg-slate-50 border rounded-2xl outline-none transition-all ${errors[fieldName] ? 'border-red-500 bg-red-50/30' : 'border-slate-200'}`;

  // 🔥 ADDED: Remove Image Logic
  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user types
    if(errors[name]) setErrors(prev => {
        const newErrs = {...prev};
        delete newErrs[name];
        return newErrs;
    });

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === "checkbox" ? checked : value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
      });
    });
    Promise.all(readers).then(results => setImages(prev => [...prev, ...results].slice(0, 12)));
    e.target.value = "";
  };

  // 🔥 VALIDATION LOGIC
  const validateForm = () => {
    let tempErrors = {};
    if (!form.title) tempErrors.title = "Listing title is required";
    if (!form.startingPrice || form.startingPrice <= 0) tempErrors.startingPrice = "Please enter a valid start price";
    if (!form.startTime) tempErrors.startTime = "Start date required";
    if (!form.endTime) tempErrors.endTime = "End date required";
    if (images.length === 0) tempErrors.images = "At least one image is required";
    if (!form.sellerAddress.street) tempErrors["sellerAddress.street"] = "Pickup street address is required";
    
    // Date Logic
    if (new Date(form.startTime) >= new Date(form.endTime)) {
        tempErrors.endTime = "End time must be after start time";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // 👈 Stop if invalid

    setLoading(true);
    try {
      await API.post("/products", { ...form, images }); 
      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Internal Server Error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] w-full max-w-5xl rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 bg-white border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Professional Listing</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">eBay Grade Integration</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition text-slate-400 hover:text-red-500">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar bg-slate-50/50">
          
          {/* 🔥 ERROR BANNER */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-pulse">
              <FiAlertCircle className="shrink-0" />
              <p className="text-xs font-black uppercase tracking-widest">{errors.submit}</p>
            </div>
          )}

          {/* SECTION 1: IDENTITY */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiTag className="text-blue-600"/> Listing Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <input name="title" placeholder="Title (e.g. Vintage 1970s Camera)" className={`w-full ${inputStyle('title')} focus:ring-2 focus:ring-blue-500/10`} onChange={handleChange} />
                {errors.title && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase tracking-tighter">{errors.title}</p>}
              </div>
              <input name="subtitle" placeholder="Subtitle" className={inputStyle('subtitle')} onChange={handleChange} />
              <input name="sku" placeholder="Custom SKU" className={inputStyle('sku')} onChange={handleChange} />
              <select name="category" className={inputStyle('category')} onChange={handleChange}>
                {["Electronics", "Collectibles", "Fashion", "Home & Garden", "Motors", "Other"].map(cat => <option key={cat}>{cat}</option>)}
              </select>
              <select name="condition" className={inputStyle('condition')} onChange={handleChange}>
                {["New with tags", "New without tags", "Used - Excellent", "Used - Fair", "Parts Only"].map(cond => <option key={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {/* 📍 NEW SECTION: SELLER LOCATION (For Pickup) */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiMapPin className="text-blue-600"/> Item Location (Pickup Address)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input name="sellerAddress.street" placeholder="Street Address" className={`md:col-span-2 ${inputStyle('sellerAddress.street')}`} onChange={handleChange} />
              <input name="sellerAddress.city" placeholder="City" className={inputStyle('sellerAddress.city')} onChange={handleChange} />
              <input name="sellerAddress.state" placeholder="State" className={inputStyle('sellerAddress.state')} onChange={handleChange} />
              <input name="sellerAddress.zipCode" placeholder="Zip Code" className={inputStyle('sellerAddress.zipCode')} onChange={handleChange} />
              {errors["sellerAddress.street"] && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 md:col-span-4 uppercase tracking-tighter">{errors["sellerAddress.street"]}</p>}
            </div>
          </div>

          {/* SECTION 2: SPECIFICS & IMAGES */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiInfo className="text-blue-600"/> Item Specifics</h3>
            <div className="grid grid-cols-2 gap-6">
              <input name="brand" placeholder="Brand" className={inputStyle('brand')} onChange={handleChange} />
              <input name="modelNumber" placeholder="Model Number" className={inputStyle('modelNumber')} onChange={handleChange} />
            </div>
            <textarea name="description" placeholder="Item description..." className={`w-full ${inputStyle('description')} h-32`} onChange={handleChange} />
            
            <div className="space-y-4">
              <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${errors.images ? 'text-red-500' : 'text-slate-400'}`}><FiCamera /> Photos (Max 12) {errors.images && " — Required"}</label>
              <div className="flex flex-wrap gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} className={`w-20 h-20 object-cover rounded-xl border ${errors.images ? 'border-red-300' : 'border-slate-200'}`} alt="" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className={`w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors ${errors.images ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                  <span className={`text-2xl ${errors.images ? 'text-red-300' : 'text-slate-300'}`}>+</span>
                  <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: AUCTION ENGINE & ANTI-SNIPE */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiClock className="text-blue-600"/> Auction & Anti-Snipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <input type="number" name="startingPrice" placeholder="Start Price ₹" className={`w-full ${inputStyle('startingPrice')}`} onChange={handleChange} />
                {errors.startingPrice && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase tracking-tighter">{errors.startingPrice}</p>}
              </div>
              <input type="number" name="bidIncrement" placeholder="Increment ₹" className={inputStyle('bidIncrement')} onChange={handleChange} />
              <input type="number" name="maxRegistrations" placeholder="Max Bidders" className={inputStyle('maxRegistrations')} onChange={handleChange} />
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Start Time</label>
                <input type="datetime-local" name="startTime" className={`w-full ${inputStyle('startTime')}`} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">End Time</label>
                <input type="datetime-local" name="endTime" className={`w-full ${inputStyle('endTime')}`} onChange={handleChange} />
                {errors.endTime && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.endTime}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-600 uppercase ml-2 flex items-center gap-1"><FiSettings /> Snipe (s)</label>
                    <input type="number" name="antiSnipeWindow" value={form.antiSnipeWindow} className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none" onChange={handleChange} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-600 uppercase ml-2">Ext. (s)</label>
                    <input type="number" name="extensionDuration" value={form.extensionDuration} className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none" onChange={handleChange} />
                 </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: RETURNS & LOGISTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
              <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiShield className="text-blue-600"/> Returns</h3>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" name="returnPolicy.acceptsReturns" checked={form.returnPolicy.acceptsReturns} className="w-5 h-5 rounded accent-blue-600" onChange={handleChange} />
                <span className="text-sm font-bold text-slate-600">Accept Returns</span>
              </div>
              <select name="returnPolicy.returnWindow" className={inputStyle('returnPolicy.returnWindow')} onChange={handleChange}>
                {["14 Days", "30 Days", "60 Days", "No Returns"].map(w => <option key={w}>{w}</option>)}
              </select>
            </div>

            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
              <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiTruck className="text-blue-600"/> Logistics</h3>
              <input type="number" name="shippingWeight" placeholder="Weight (g)" className={inputStyle('shippingWeight')} onChange={handleChange} />
              <div className="grid grid-cols-3 gap-3">
                <input name="dimensions.length" placeholder="L" className={inputStyle('dimensions.length')} onChange={handleChange} />
                <input name="dimensions.width" placeholder="W" className={inputStyle('dimensions.width')} onChange={handleChange} />
                <input name="dimensions.height" placeholder="H" className={inputStyle('dimensions.height')} onChange={handleChange} />
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-8 bg-white border-t flex justify-end gap-4 shrink-0">
          <button onClick={onClose} type="button" className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Discard Draft</button>
          <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
            {loading ? "Processing..." : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;