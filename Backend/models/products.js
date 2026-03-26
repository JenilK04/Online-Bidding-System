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

    category: String,

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
      default: 10,
      min: 1,
    },

    bids: [{
    amount: Number,
    bidderId: mongoose.Schema.Types.ObjectId,
    bidderName: String,
    createdAt: { type: Date, default: Date.now }
   }],

    bidsCount: {
      type: Number,
      default: 0,
    },

    // 🔹 AUCTION TIME
    auctionStart: {
      type: Date,
      required: true,
    },

    // 🔹 STATUS
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

    // 🔹 REGISTRATION
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
          default: false,
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

    // 📍 Shipping Address (buyer input)
    shippingAddress: {
      type: String,
      default: "",
    },

    // 📞 Contact Number (buyer input)
    contactNumber: {
      type: String,
      default: "",
    },

    // 💳 Payment
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    // 🚚 Delivery
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered"],
      default: "Pending",
    },

    // 🔥 Derived helper (optional but powerful)
    orderReady: {
      type: Boolean,
      default: false,
    },

    // 🔹 VISIBILITY
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);