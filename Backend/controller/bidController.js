import Product from "../models/products.js";
import Bid from "../models/Bid.js"; // Your new Bid model
import { io } from "../index.js";

/**
 * 🔥 PLACE BID (Real-Time Engine)
 * Handles: Validations, Anti-Snipe Extension, Atomic Updates, and Socket Broadcasts.
 */
export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (!amount) return res.status(400).json({ message: "Bid amount is required" });

    // 1. Fetch product to check status and registration
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 🚫 Initial Validations
    if (product.status !== "Active") {
      return res.status(400).json({ message: "Auction is not currently active" });
    }

    if (product.sellerId.toString() === userId) {
      return res.status(400).json({ message: "Sellers cannot bid on their own items" });
    }

    const registration = product.registeredUsers.find(u => u.userId.toString() === userId);
    if (!registration) {
      return res.status(400).json({ message: "You must be registered to bid" });
    }

    // 💰 Calculate Minimum Required Bid
    const currentHigh = product.currentBid > 0 ? product.currentBid : product.startingPrice;
    const requiredMin = currentHigh + (product.bidIncrement || 1);

    if (amount < requiredMin) {
      return res.status(400).json({ message: `Bid too low. Minimum: ₹${requiredMin}` });
    }

    // 🔥 2. ANTI-SNIPE LOGIC (Soft Close)
    const now = new Date();
    const endTime = new Date(product.endTime);
    const secondsRemaining = (endTime.getTime() - now.getTime()) / 1000;

    let newEndTime = product.endTime;
    let isExtended = product.isExtended;

    // If bid is placed within the "Anti-Snipe Window" (e.g., last 60s)
    if (secondsRemaining <= product.antiSnipeWindow) {
      newEndTime = new Date(endTime.getTime() + product.extensionDuration * 1000);
      isExtended = true;
    }

    // 🛡️ 3. ATOMIC UPDATE (Optimistic Concurrency)
    // Only update if currentBid hasn't changed since we read it
    const updatedProduct = await Product.findOneAndUpdate(
      { 
        _id: productId, 
        currentBid: product.currentBid 
      },
      {
        $set: { 
          currentBid: amount, 
          highestBidderId: userId,
          endTime: newEndTime,
          isExtended: isExtended,
          lastBidAt: now
        },
        $inc: { bidsCount: 1 },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(409).json({ message: "Outbid! Someone else just placed a higher bid." });
    }

    // 📜 4. SAVE TO BID HISTORY MODEL
    const newBidRecord = await Bid.create({
      productId,
      bidderId: userId,
      bidderName: registration.bidderName,
      amount,
      bidTime: now
    });

    // ⚡ 5. REAL-TIME EMITTERS
    // Update the entire product room (price, countdown, bidder)
    io.to(productId).emit("productUpdated", updatedProduct);
    
    // Broadcast specific bid event for the "Live Ledger/History" component
    io.to(productId).emit("newBidAdded", newBidRecord);

    return res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Bid Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
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