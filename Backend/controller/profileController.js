import User from "../models/user.js";
import Product from "../models/products.js";
import Order from "../models/order.js"; // 🚨 NEW: Import Order model

/* ===============================
   GET USER PROFILE
=================================*/
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user info
    const userDoc = await User.findById(userId).select("-password");

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Get User's Listings (Selling)
    const myProducts = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });

    // 3. Get Won Products AND their Order details
    const wonProductsRaw = await Product.find({ 
      winnerId: userId,
      status: { $in: ["Ended", "Sold"] } 
    }).lean().sort({ updatedAt: -1 });

    const wonProducts = await Promise.all(
      wonProductsRaw.map(async (product) => {
        const order = await Order.findOne({ 
          product: product._id, 
          buyer: userId 
        });
        
        return {
          ...product,
          paymentStatus: order ? order.paymentStatus : "Pending",
          deliveryStatus: order ? order.deliveryStatus : "Pending",
          transactionId: order ? order.transactionId : null,
          buyerShippingAddress: order ? order.shippingAddress : null,
          orderId: order ? order._id : null
        };
      })
    );

    // 4. Registered Auctions
    const registeredProducts = await Product.find({
      "registeredUsers.userId": userId
    }).sort({ createdAt: -1 });

    // 🔥 THE FIX: Spread the user document into the root of the response
    // This ensures res.data on the frontend HAS the status, role, and firstName directly.
    res.json({
      ...userDoc._doc, // Spreads firstName, status, role, etc., into the main object
      myProducts,
      wonProducts,
      registeredProducts
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to load profile",
      error: error.message
    });
  }
};
