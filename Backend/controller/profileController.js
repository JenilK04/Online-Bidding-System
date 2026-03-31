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
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Get User's Listings (Selling)
    const myProducts = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });

    // 3. Get Won Products AND their Order details
    // We fetch products won by the user
    const wonProductsRaw = await Product.find({ 
      winnerId: userId,
      status: { $in: ["Ended", "Sold"] } 
    }).lean().sort({ updatedAt: -1 });

    // 🔥 THE FIX: Map through won products and attach the Order (if any)
    const wonProducts = await Promise.all(
      wonProductsRaw.map(async (product) => {
        const order = await Order.findOne({ 
          product: product._id, 
          buyer: userId 
        });
        
        return {
          ...product,
          // Attach the payment and shipping data from the Order model
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

    res.json({
      user,
      myProducts,
      wonProducts, // Now contains merged Order data
      registeredProducts
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to load profile",
      error: error.message
    });
  }
};

/* --- updateProfileDetails remains the same --- */