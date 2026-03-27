import React, { useState } from "react";
import API from "../services/api";
import { 
  FiBox, FiCamera, FiClock, FiShield, 
  FiTruck, FiInfo, FiTag, FiX, FiSettings, FiMapPin 
} from "react-icons/fi";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "", subtitle: "", sku: "", category: "Electronics",
    brand: "", modelNumber: "", condition: "Used - Excellent", description: "",
    startingPrice: "", bidIncrement: 10, maxRegistrations: 100,
    startTime: "", endTime: "",
    antiSnipeWindow: 60, 
    extensionDuration: 120, // 👈 Added this
    
    // 📍 NEW: Seller Pickup Address
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
    status: "Scheduled" // 👈 Changed default to Scheduled for pro listing
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // images are sent as base64 array to match controller
      await API.post("/products", { ...form, images }); 
      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to list item" });
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
          
          {/* SECTION 1: IDENTITY */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiTag className="text-blue-600"/> Listing Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="title" placeholder="Title (e.g. Vintage 1970s Camera)" className="md:col-span-2 p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10" onChange={handleChange} required />
              <input name="subtitle" placeholder="Subtitle" className="p-4 bg-slate-50 border rounded-2xl outline-none" onChange={handleChange} />
              <input name="sku" placeholder="Custom SKU" className="p-4 bg-slate-50 border rounded-2xl outline-none" onChange={handleChange} />
              <select name="category" className="p-4 bg-slate-50 border rounded-2xl outline-none" onChange={handleChange}>
                {["Electronics", "Collectibles", "Fashion", "Home & Garden", "Motors", "Other"].map(cat => <option key={cat}>{cat}</option>)}
              </select>
              <select name="condition" className="p-4 bg-slate-50 border rounded-2xl outline-none" onChange={handleChange}>
                {["New with tags", "New without tags", "Used - Excellent", "Used - Fair", "Parts Only"].map(cond => <option key={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {/* 📍 NEW SECTION: SELLER LOCATION (For Pickup) */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiMapPin className="text-blue-600"/> Item Location (Pickup Address)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input name="sellerAddress.street" placeholder="Street Address" className="md:col-span-2 p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
              <input name="sellerAddress.city" placeholder="City" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
              <input name="sellerAddress.state" placeholder="State" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
              <input name="sellerAddress.zipCode" placeholder="Zip Code" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
            </div>
          </div>

          {/* SECTION 2: SPECIFICS & IMAGES */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiInfo className="text-blue-600"/> Item Specifics</h3>
            <div className="grid grid-cols-2 gap-6">
              <input name="brand" placeholder="Brand" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} />
              <input name="modelNumber" placeholder="Model Number" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} />
            </div>
            <textarea name="description" placeholder="Item description..." className="w-full p-4 bg-slate-50 border rounded-2xl h-32" onChange={handleChange} required />
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FiCamera /> Photos (Max 12)</label>
              <div className="flex flex-wrap gap-4">
                {images.map((img, i) => <img key={i} src={img} className="w-20 h-20 object-cover rounded-xl border" alt="" />)}
                <label className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50">
                  <span className="text-2xl text-slate-300">+</span>
                  <input type="file" multiple className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: AUCTION ENGINE & ANTI-SNIPE */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiClock className="text-blue-600"/> Auction & Anti-Snipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="number" name="startingPrice" placeholder="Start Price ₹" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
              <input type="number" name="bidIncrement" placeholder="Increment ₹" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} />
              <input type="number" name="maxRegistrations" placeholder="Max Bidders" className="p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Start Time</label>
                <input type="datetime-local" name="startTime" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">End Time</label>
                <input type="datetime-local" name="endTime" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-600 uppercase ml-2 flex items-center gap-1"><FiSettings /> Snipe (s)</label>
                    <input type="number" name="antiSnipeWindow" value={form.antiSnipeWindow} className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl" onChange={handleChange} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-600 uppercase ml-2">Ext. (s)</label>
                    <input type="number" name="extensionDuration" value={form.extensionDuration} className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl" onChange={handleChange} />
                 </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: RETURNS & LOGISTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
              <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiShield className="text-blue-600"/> Returns</h3>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <input type="checkbox" name="returnPolicy.acceptsReturns" checked={form.returnPolicy.acceptsReturns} className="w-5 h-5 rounded" onChange={handleChange} />
                <span className="text-sm font-bold text-slate-600">Accept Returns</span>
              </div>
              <select name="returnPolicy.returnWindow" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={handleChange}>
                {["14 Days", "30 Days", "60 Days", "No Returns"].map(w => <option key={w}>{w}</option>)}
              </select>
            </div>

            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
              <h3 className="flex items-center gap-3 text-slate-800 font-bold"><FiTruck className="text-blue-600"/> Logistics</h3>
              <input type="number" name="shippingWeight" placeholder="Weight (g)" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={handleChange} />
              <div className="grid grid-cols-3 gap-3">
                <input name="dimensions.length" placeholder="L" className="p-4 bg-slate-50 border rounded-xl" onChange={handleChange} />
                <input name="dimensions.width" placeholder="W" className="p-4 bg-slate-50 border rounded-xl" onChange={handleChange} />
                <input name="dimensions.height" placeholder="H" className="p-4 bg-slate-50 border rounded-xl" onChange={handleChange} />
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-8 bg-white border-t flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Discard Draft</button>
          <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
            {loading ? "Processing..." : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;