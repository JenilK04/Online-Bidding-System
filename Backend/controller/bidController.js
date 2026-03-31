import Product from "../models/products.js";
import Bid from "../models/Bid.js"; // Your new Bid model
import { io } from "../index.js";

/**
 * 🔥 PLACE BID (Real-Time Engine)
 * Handles: Validations, Anti-Snipe Extension, Atomic Updates, and Socket Broadcasts.
 */
// --- productController.js ---

/**
 * 🔨 PLACE BID (The Real-Time Engine)
 */
export const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;; // Assuming your user object has firstName

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Auction not found" });

    // 1. Validations
    if (product.status !== "Active") {
      return res.status(400).json({ message: "Bidding is closed for this item." });
    }

    const minBidRequired = (product.currentBid || product.startingPrice) + product.bidIncrement;
    if (amount < minBidRequired) {
      return res.status(400).json({ message: `Minimum bid is ₹${minBidRequired}` });
    }

    // 2. 🔥 NEW: Create the Bid Record in the Bid collection
    const newBidRecord = new Bid({
      productId: id,
      bidderId: userId,
      bidderName: userName, // Store name so you don't have to populate every time
      amount: amount,
      bidTime: new Date()
    });
    await newBidRecord.save();

    // 3. Update Product Model
    product.currentBid = amount;
    product.highestBidderId = userId;
    product.bidsCount += 1;

    // 4. Anti-Snipe
    const now = new Date();
    const endTime = new Date(product.endTime);
    if ((endTime - now) / 1000 <= product.antiSnipeWindow) {
      product.endTime = new Date(endTime.getTime() + (product.extensionDuration * 1000));
      product.isExtended = true;
    }

    await product.save();

    // 5. 🔥 SOCKET EMITS
    // Notify the Details page about the product update
    io.to(id).emit("productUpdated", product); 
    
    // Notify the Details page about the NEW BID for the ledger
    io.to(id).emit("bidPlaced", newBidRecord); 
    
    // Global Update for Market Gallery
    io.emit("productUpdated", product);

    res.status(200).json({ 
      message: "Bid placed successfully", 
      product, 
      bid: newBidRecord 
    });
  } catch (error) {
    res.status(500).json({ message: "Bidding failed", error: error.message });
  }
};

/**
 * 📦 GET BID HISTORY (Real-Time Ledger)
 */
export const getBidsByProduct = async (req, res) => {
  try {
    // Fetch from the dedicated Bid collection for better performance
    const bids = await Bid.find({ productId: req.params.id })
      .sort({ bidTime: -1 })
      .limit(20);
    
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bid history" });
  }
};