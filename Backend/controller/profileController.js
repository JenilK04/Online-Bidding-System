import User from "../models/user.js";
import Product from "../models/products.js";
import Order from "../models/order.js"; // 🚨 NEW: Import Order model

/* ===============================
   GET USER PROFILE
=================================*/
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Run the primary queries in parallel (Major Speed Boost)
    const [userDoc, myProducts, wonProductsRaw, registeredProducts] = await Promise.all([
      User.findById(userId).select("-password").lean(),
      Product.find({ sellerId: userId }).sort({ createdAt: -1 }).lean(),
      Product.find({ winnerId: userId, status: { $in: ["Ended", "Sold"] } }).sort({ updatedAt: -1 }).lean(),
      Product.find({ "registeredUsers.userId": userId }).sort({ createdAt: -1 }).lean()
    ]);

    if (!userDoc) return res.status(404).json({ message: "User not found" });

    // 2. Fetch ALL relevant orders in ONE single query instead of a loop
    const productIds = wonProductsRaw.map(p => p._id);
    const orders = await Order.find({ 
      product: { $in: productIds }, 
      buyer: userId 
    }).lean();

    // 3. Create a Map for O(1) lookup time
    const orderMap = {};
    orders.forEach(order => {
      orderMap[order.product.toString()] = order;
    });

    // 4. Merge data in memory (extremely fast)
    const wonProducts = wonProductsRaw.map(product => {
      const order = orderMap[product._id.toString()];
      return {
        ...product,
        paymentStatus: order?.paymentStatus || "Pending",
        deliveryStatus: order?.deliveryStatus || "Pending",
        transactionId: order?.transactionId || null,
        buyerShippingAddress: order?.shippingAddress || null,
        orderId: order?._id || null
      };
    });

    res.json({
      ...userDoc, 
      myProducts,
      wonProducts,
      registeredProducts
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to load profile", error: error.message });
  }
};