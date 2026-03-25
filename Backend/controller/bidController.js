import mongoose from "mongoose";
import Product from "../models/products.js";
import { io } from "../index.js";

export const placeBid = async (req, res) => {
  try {
    if (!req.body || req.body.amount === undefined) {
      return res.status(400).json({
        message: "Bid amount is required",
      });
    }

    const { amount } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚫 Auction must be active
    if (product.status !== "Active") {
      return res.status(400).json({ message: "Auction not active" });
    }

    // 🚫 Seller cannot bid
    if (product.sellerId.toString() === userId) {
      return res.status(400).json({ message: "Seller cannot bid" });
    }

    // 🚫 Must be registered
    const isRegistered = product.registeredUsers.some(
      (u) => u.userId.toString() === userId
    );

    if (!isRegistered) {
      return res.status(400).json({ message: "Not registered for auction" });
    }

    // 💰 Minimum bid logic
    const basePrice =
      product.currentBid > 0
        ? product.currentBid
        : product.startingPrice;

    const minBid = basePrice + product.bidIncrement;

    if (amount < minBid) {
      return res.status(400).json({
        message: `Minimum bid must be ₹${minBid}`,
      });
    }

    // 🔥 Update
    product.currentBid = amount;
    product.highestBidderId = userId;
    product.bidsCount += 1;

    await product.save();

    // 🔥 Emit full update
    io.to(productId).emit("productUpdated", product);

    // ⚡ Optional lightweight update
    io.to(productId).emit("bidUpdated", {
      productId,
      currentBid: amount,
      bidsCount: product.bidsCount,
      highestBidderId: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      product,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
// export const getBidsByProduct = async (req, res) => {
//   try {
//     const productId  = req.params.id;

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     // Only seller can view bid history
//     if (product.sellerId.toString() !== req.user.id) {
//       return res.status(403).json({
//         message: "Not authorized to view bids",
//       });
//     }

//     res.json(product.bids || []);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to fetch bids",
//     });
//   }
// };