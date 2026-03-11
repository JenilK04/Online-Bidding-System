import mongoose from "mongoose";
import Product from "../models/products.js";
import { io } from "../index.js";

export const placeBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚫 Auction must be active
    if (product.status !== "Active") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Auction not active" });
    }

    // 🚫 Seller cannot bid
    if (product.sellerId.toString() === userId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Seller cannot bid" });
    }

    // 🚫 Must be registered
    const isRegistered = product.registeredUsers.some(
      (u) => u.userId.toString() === userId
    );

    if (!isRegistered) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not registered for auction" });
    }

    // 💰 Calculate minimum bid
    const basePrice =
      product.currentBid > 0
        ? product.currentBid
        : product.startingPrice;

    const minBid = basePrice + product.bidIncrement;

    if (amount < minBid) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Minimum bid must be ₹${minBid}`,
      });
    }

    // 🔥 Update product
    product.currentBid = amount;
    product.highestBidderId = userId;
    product.bidsCount += 1;

    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    // ⚡ Emit real-time update
    io.to(productId).emit("bidUpdated", {
      productId,
      currentBid: amount,
      bidsCount: product.bidsCount,
      bidderId: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      currentBid: amount,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getBidsByProduct = async (req, res) => {
  try {
    const productId  = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only seller can view bid history
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to view bids",
      });
    }

    res.json(product.bids || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch bids",
    });
  }
};