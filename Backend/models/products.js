import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // --- 🔹 LISTING IDENTITY ---
    title: { type: String, required: true, trim: true, index: true },
    subtitle: { type: String, trim: true }, 
    sku: { type: String, unique: true, sparse: true }, 
    category: { 
      type: String, 
      required: true, 
      enum: ["Electronics", "Collectibles", "Fashion", "Home & Garden", "Motors", "Other"],
      index: true 
    },

    // --- 🔹 ITEM SPECIFICS ---
    brand: { type: String, trim: true },
    modelNumber: { type: String, trim: true },
    condition: {
      type: String,
      enum: ["New with tags", "New without tags", "Used - Excellent", "Used - Fair", "Parts Only"],
      default: "Used - Excellent",
    },
    images: [{ type: String, required: true }], 
    description: { type: String, required: true },

    // --- 🔹 LIVE AUCTION ENGINE ---
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // 📍 SELLER PICKUP ADDRESS (New)
    // For local pickup items, the buyer needs to know where to go.
    sellerAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "India" }
    },

    startingPrice: { type: Number, required: true, min: 1 },
    currentBid: { type: Number, default: 0 },
    bidIncrement: { type: Number, default: 10 },
    highestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidsCount: { type: Number, default: 0 },

    // --- 🔹 REGISTRATION & AUDIENCE ---
    maxRegistrations: { type: Number, default: 100 },
    registeredUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bidderName: String,   
        bidderNumber: Number,
        registeredAt: { type: Date, default: Date.now },
        notifyOnStart: { type: Boolean, default: true },
        notifyOnOutbid: { type: Boolean, default: true },
        isNotified: { type: Boolean, default: false }
      }
    ],

    // --- 🔹 RETURN POLICIES ---
    returnPolicy: {
      acceptsReturns: { type: Boolean, default: false },
      returnWindow: { 
        type: String, 
        enum: ["14 Days", "30 Days", "60 Days", "No Returns"], 
        default: "No Returns" 
      },
      returnShippingPaidBy: { 
        type: String, 
        enum: ["Buyer", "Seller"], 
        default: "Buyer" 
      },
      restockingFee: { type: Number, default: 0 }
    },

    // --- 🔹 TIMING & ANTI-SNIPE ---
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    lastBidAt: { type: Date },
    isExtended: { type: Boolean, default: false },
    antiSnipeWindow: { type: Number, default: 60 }, 
    extensionDuration: { type: Number, default: 120 }, 

    // --- 🔹 LOGISTICS & STATUS ---
    shippingWeight: { type: Number }, 
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Active", "Ended", "Sold", "Unsold", "Cancelled"],
      default: "Draft",
      index: true
    },

    // --- 🔹 BUYER FULFILLMENT (New & Updated) ---
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
  }, { timestamps: true }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ "registeredUsers.userId": 1 });

export default mongoose.model("Product", productSchema);