import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    index: true // Crucial for fast history lookups
  },
  bidderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bidderName: String, // Cached for UI speed (so you don't always populate)
  amount: { 
    type: Number, 
    required: true 
  },
  bidTime: { 
    type: Date, 
    default: Date.now 
  },
  isAutoBid: { 
    type: Boolean, 
    default: false 
  } // For future "Proxy Bidding" features
}, { timestamps: true });

export default mongoose.model("Bid", bidSchema);