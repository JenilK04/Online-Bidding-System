import User from "../models/user.js";
import Product from "../models/products.js";
// import Transaction from "../models/transaction.js"; // If you've created this

export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Bidders/Users
    const totalUsers = await User.countDocuments({ role: "user" });

    // 2. Live Auctions (Child Lots that are currently 'Active')
    const activeAuctions = await Product.countDocuments({ 
      status: "Active", 
      parentId: { $ne: null } // Only count individual lots, not parent events
    });

    // 3. Platform Revenue (Sum of all 'Sold' lot currentBids)
    const salesData = await Product.aggregate([
      { $match: { status: "Ended", currentBid: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$currentBid" } } }
    ]);
    
    const totalRevenue = salesData.length > 0 ? salesData[0].total : 0;

    // 4. Global Activity (Recent 5 Bids or Actions)
    const recentActivity = await Product.find({ parentId: { $ne: null } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title currentBid status updatedAt");

    res.status(200).json({
      totalUsers,
      activeAuctions,
      totalRevenue,
      pendingReports: 0, // Placeholder until Report model is active
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: "Admin Stats Error", error: error.message });
  }
};

// --- USER MANAGEMENT ---

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({ message: `User ${user.isBanned ? 'Banned' : 'Unbanned'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: "Ban action failed" });
  }
};

export const verifyUser = async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
      res.status(200).json({ message: "User verified", user });
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
};