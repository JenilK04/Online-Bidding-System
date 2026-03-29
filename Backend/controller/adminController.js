import User from "../models/user.js";
import Product from "../models/products.js";

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

// controllers/adminController.js
export const getFinanceStats = async (req, res) => {
  try {
    const completedSales = await Product.find({ isPaid: true, status: "Ended" });
    
    const totalSalesVolume = completedSales.reduce((sum, p) => sum + p.currentBid, 0);
    const platformCommission = totalSalesVolume * 0.05; // Assuming 5% fee
    const pendingPayouts = await Product.countDocuments({ isPaid: true, deliveryStatus: { $ne: "Delivered" } });

    res.status(200).json({
      totalSalesVolume,
      platformCommission,
      pendingPayouts,
      transactions: completedSales // Send list for the table
    });
  } catch (error) {
    res.status(500).json({ message: "Finance Audit Failed" });
  }
};