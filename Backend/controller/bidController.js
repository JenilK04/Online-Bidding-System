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
    const userId = req.user.id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Auction not found" });

    // 1. Validations
    if (product.status !== "Active") {
      return res.status(400).json({ message: "Bidding is closed." });
    }

    const minBidRequired = (product.currentBid || product.startingPrice) + product.bidIncrement;
    if (amount < minBidRequired) {
      return res.status(400).json({ message: `Min bid is ₹${minBidRequired}` });
    }

    // 2. Create the Bid Record
    const newBid = new Bid({
      productId: id,
      bidderId: userId,
      amount: amount,
      bidTime: new Date()
    });
    await newBid.save();

    // 3. Update Product Stats
    product.currentBid = amount;
    product.highestBidderId = userId;
    product.bidsCount += 1;

    // Anti-Snipe Logic
    const now = new Date();
    const endTime = new Date(product.endTime);
    if ((endTime - now) / 1000 <= product.antiSnipeWindow) {
      product.endTime = new Date(endTime.getTime() + (product.extensionDuration * 1000));
      product.isExtended = true;
    }
    await product.save();

    // 4. 🔥 POPULATE EMAIL FOR REAL-TIME LEDGER
    const populatedBid = await Bid.findById(newBid._id)
      .populate("bidderId", "email"); // Pull only the email

    // 5. SOCKET EMITS
    io.to(id).emit("productUpdated", product);
    io.to(id).emit("bidPlaced", populatedBid); // Sends the bid with the email object
    io.emit("productUpdated", product);

    res.status(200).json({ message: "Bid placed", product, bid: populatedBid });
  } catch (error) {
    res.status(500).json({ message: "Bidding failed", error: error.message });
  }
};

/**
 * 📦 GET BID HISTORY (Real-Time Ledger)
 */
export const getBidsByProduct = async (req, res) => {
  try {
    const bids = await Bid.find({ productId: req.params.id })
      .sort({ bidTime: -1 })
      .populate("bidderId", "email") // 🔥 Populate email from User model
      .limit(20);
    
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bid history" });
  }
};