import Product from "../models/products.js";
import { io } from "../index.js";

export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (amount === undefined) {
      return res.status(400).json({ message: "Bid amount is required" });
    }

    // 1. Fetch product first to check status and registration
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚫 Initial Validations
    if (product.status !== "Active") {
      return res.status(400).json({ message: "Auction is not currently active" });
    }

    if (product.sellerId.toString() === userId) {
      return res.status(400).json({ message: "Sellers are not permitted to bid on their own items" });
    }

    const registration = product.registeredUsers.find(
      (u) => u.userId.toString() === userId
    );

    if (!registration) {
      return res.status(400).json({ message: "You must be registered to bid on this item" });
    }

    // 💰 Calculate Minimum Required Bid
    const currentHigh = product.currentBid > 0 ? product.currentBid : product.startingPrice;
    const requiredMin = currentHigh + product.bidIncrement;

    if (amount < requiredMin) {
      return res.status(400).json({ message: `Bid too low. Minimum required: ₹${requiredMin}` });
    }

    // 🔥 ATOMIC UPDATE (Prevents Race Conditions)
    // We only update IF the currentBid in DB is still what we thought it was
    const updatedProduct = await Product.findOneAndUpdate(
      { 
        _id: productId, 
        currentBid: product.currentBid // Ensure no one else bid while we were processing
      },
      {
        $set: { 
          currentBid: amount, 
          highestBidderId: userId 
        },
        $inc: { bidsCount: 1 },
        $push: { 
          bids: { 
            amount, 
            bidderId: userId, 
            bidderName: registration.bidderName,
            createdAt: new Date() 
          } 
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(409).json({ message: "Someone else just placed a higher bid. Please try again." });
    }

    // ⚡ Real-time Emitters
    io.to(productId).emit("productUpdated", updatedProduct);
    
    // Emit specific 'bidPlaced' event for the "Live Ledger" we built earlier
    io.to(productId).emit("bidPlaced", updatedProduct.bids[updatedProduct.bids.length - 1]);

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
 * Get Bids for Merchant View
 */
export const getBidsByProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("bids sellerId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Security: Only the seller or the registered bidders should see full history
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to bid history" });
    }

    // Return bids sorted by newest first
    const sortedBids = (product.bids || []).sort((a, b) => b.createdAt - a.createdAt);
    
    res.json(sortedBids);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bid history" });
  }
};