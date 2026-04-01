import User from "../models/user.js";
import Product from "../models/products.js";
import Order from "../models/order.js";

/**
 * 📊 GET ADMIN STATS
 * Aggregates data for the Command Center cards.
 */
export const getAdminStats = async (req, res) => {
  try {
    // Run counts in parallel for performance
    const [totalUsers, activeAuctions, soldProducts, pendingReports] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments({ status: "Active" }),
      Product.find({ status: "Sold" }),
      User.countDocuments({ status: "suspended" }) // Example: using suspended as "issues"
    ]);

    // Calculate Total Platform Revenue
    const totalRevenue = soldProducts.reduce((acc, curr) => acc + (curr.currentBid || 0), 0);

    // Get 5 most recent active auctions for the "Live Bid Ledger"
    const recentActivity = await Product.find({ status: "Active" })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title currentBid status updatedAt");

    res.status(200).json({
      totalUsers,
      activeAuctions,
      totalRevenue,
      pendingReports,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin analytics", error: error.message });
  }
};

/**
 * 👥 GET ALL USERS
 * Fetches the directory for the Manage Users page.
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user directory" });
  }
};

/**
 * 🛡️ TOGGLE USER STATUS
 * Suspends or activates a user account.
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects "active" or "suspended"

    const user = await User.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status" });
  }
};

// controllers/adminController.js
export const getAdminEvents = async (req, res) => {
  try {
    const events = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
};

export const getFinanceStats = async (req, res) => {
  try {
    // 1. Aggregate Financial Totals
    const financeSummary = await Order.aggregate([
      { 
        $match: { paymentStatus: "Paid" } // Only count actual money received
      },
      {
        $group: {
          _id: null,
          totalSalesVolume: { $sum: "$hammerPrice" }, // Gross amount
          platformCommission: { $sum: "$platformFee" }, // Your 5% cut
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = financeSummary[0] || { totalSalesVolume: 0, platformCommission: 0 };

    // 2. Count Pending Payouts
    // Orders paid by buyer but not yet marked as 'Delivered' (or your internal payout trigger)
    const pendingPayouts = await Order.countDocuments({ 
      paymentStatus: "Paid", 
      deliveryStatus: { $ne: "Delivered" } 
    });

    // 3. Fetch Recent Transactions
    // We populate 'product' to get the title and 'buyer' for the identity
    const transactions = await Order.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("product", "title")
      .populate("buyer", "firstName name email");

    // Format for Frontend (Matching your React AdminFinance component)
    const formattedTransactions = transactions.map(order => ({
      _id: order._id,
      title: order.product?.title || "Deleted Asset",
      currentBid: order.hammerPrice,
      platformFee: order.platformFee,
      status: order.paymentStatus,
      buyer: order.buyer?.firstName || order.buyer?.name || "Anonymous",
      date: order.createdAt
    }));

    res.status(200).json({
      totalSalesVolume: stats.totalSalesVolume,
      platformCommission: stats.platformCommission,
      pendingPayouts,
      transactions: formattedTransactions
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Finance Ledger Sync Failed", 
      error: error.message 
    });
  }
};

// Example Admin Controller
export const verifyUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user and update their verification status
        const user = await User.findByIdAndUpdate(
            userId, 
            { isVerified: true, verificationStatus: "Verified" }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User verified successfully", 
            user 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during verification" });
    }
};

// Admin Controller to manage user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newStatus } = req.body; // Expects "active", "deactivated", or "suspended"

    const user = await User.findByIdAndUpdate(
      userId,
      { status: newStatus },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      message: `User is now ${newStatus}`, 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};