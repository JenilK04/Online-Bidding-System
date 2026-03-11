import User from "../models/user.js";
import Product from "../models/products.js";

/* ===============================
   GET USER PROFILE
=================================*/

export const getProfile = async (req, res) => {
  try {

    const userId = req.user.id;

    // get user info
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /* ---------------------------
       Products created by seller
    ----------------------------*/

    const myProducts = await Product.find({
      sellerId: userId
    }).sort({ createdAt: -1 });


    /* ---------------------------
       Products won by the user
    ----------------------------*/

    const wonProducts = await Product.find({
      winnerId: userId
    }).sort({ createdAt: -1 });


    /* ---------------------------
       Auctions user registered in
    ----------------------------*/

    const registeredProducts = await Product.find({
      "registeredUsers.userId": userId
    }).sort({ createdAt: -1 });


    res.json({
      user,
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



/* ===============================
   UPDATE DELIVERY DETAILS
=================================*/

export const updateProfileDetails = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      mobile,
      address,
      city,
      state,
      pincode,
      country
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        mobile,
        address,
        city,
        state,
        pincode,
        country
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });

  }

};