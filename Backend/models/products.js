import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // 🔹 BASIC PRODUCT INFO
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String,
        required: true,
      },
    ],

    category: {
      type: String,
    },

    condition: {
      type: String,
      enum: ["New", "Used", "Antique"],
      default: "Used",
    },

    // 🔹 AUCTION PRICING
    startingPrice: {
      type: Number,
      required: true,
      min: 1,
    },

    currentBid: {
      type: Number,
      default: 0,
    },

    bidIncrement: {
      type: Number,
      default: 10, // ₹10 minimum increment
      min: 1,
    },

    bidsCount: {
      type: Number,
      default: 0,
    },

    // 🔹 AUCTION TIME (DATE + TIME)
    auctionStart: {
      type: Date,
      required: true,
    },

    // 🔹 AUCTION STATUS
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Ended"],
      default: "Upcoming",
    },

    // 🔹 SELLER & WINNER
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    highestBidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔹 BIDDER REGISTRATION (BEFORE BIDDING)
    maxRegistrations: {
      type: Number,
      required: true,
      min: 1,
    },

    registeredUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notified: {
          type: Boolean,
          default: false, // auction start / winner email sent
        },
        bidderNumber: Number,
        bidderName: String,
        registeredAt: Date,
      },
    ],

    registrationClosed: {
      type: Boolean,
      default: false,
    },

    // 🔹 POST-AUCTION FLOW
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    deliveryStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered"],
      default: "Pending",
    },

    // 🔹 VISIBILITY CONTROL
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default mongoose.model("Product", productSchema);
