import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🔗 RELATIONS: The "Glue" between Product, Buyer, and Seller
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    buyer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    seller: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // 💰 FINAL FINANCIALS: Snapshotted at the moment of sale
    // We store these as numbers here so they never change, even if the Product is edited later.
    hammerPrice: { 
      type: Number, 
      required: true 
    },
    platformFee: { 
      type: Number, 
      default: function() { return this.hammerPrice * 0.05; } // 5% Fee
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },

    // 🚚 SHIPPING DETAILS: Captured during the Checkout process
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true }
    },

    // 💳 TRANSACTION STATUSES
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Failed", "Refunded"], 
      default: "Pending" 
    },
    deliveryStatus: { 
      type: String, 
      enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Picked Up"], 
      default: "Pending" 
    },

    // 📑 AUDIT TRAIL
    transactionId: { 
      type: String, 
      unique: true, 
      sparse: true // Allows the field to be null until payment is processed
    },
    trackingNumber: { type: String, trim: true },
    carrier: { type: String, trim: true },
    
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date }
  },
  { 
    timestamps: true // Automatically creates createdAt and updatedAt
  }
);

// Indexing for faster lookups in the Admin/User Dashboards
orderSchema.index({ buyer: 1, paymentStatus: 1 });
orderSchema.index({ seller: 1, deliveryStatus: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;