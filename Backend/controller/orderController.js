import Order from "../models/order.js";
import Product from "../models/products.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 📝 STEP 1: CREATE RAZORPAY ORDER & INITIALIZE INTERNAL ORDER
export const createOrder = async (req, res) => {
  try {
    const { productId, shippingAddress } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product || product.status !== "Sold") {
      return res.status(400).json({ message: "Lot not available for checkout." });
    }
    if (product.winnerId.toString() !== buyerId) {
      return res.status(403).json({ message: "Unauthorized: You are not the winner." });
    }

    const hammerPrice = product.currentBid;
    const totalAmount = Math.round(hammerPrice * 1.05); // Hammer + 5% Fee

    // Create Razorpay Order Object
    const rzpOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // to paise
      currency: "INR",
      receipt: `receipt_${productId.substring(18)}`,
    });

    // Save or Update Internal Order in DB
    let order = await Order.findOne({ product: productId });
    if (order) {
      order.shippingAddress = shippingAddress;
      order.razorpayOrderId = rzpOrder.id;
    } else {
      order = new Order({
        product: productId,
        buyer: buyerId,
        seller: product.sellerId,
        hammerPrice,
        totalAmount,
        shippingAddress,
        razorpayOrderId: rzpOrder.id,
      });
    }

    await order.save();
    res.status(201).json({ razorpayOrder: rzpOrder, orderId: order._id });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 💳 STEP 2: VERIFY RAZORPAY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Check if all required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
       return res.status(400).json({ message: "Missing required payment details" });
    }

    // 2. Signature Verification Logic
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.log("❌ Signature Mismatch");
      return res.status(400).json({ message: "Invalid Signature" });
    }

    // 3. Update Order in Database
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!order) {
      console.log("❌ Order not found in DB for ID:", razorpay_order_id);
      return res.status(404).json({ message: "Order record not found" });
    }

    order.paymentStatus = "Paid";
    order.transactionId = razorpay_payment_id;
    order.paidAt = new Date();
    await order.save();

    // 4. Update Product status
    await Product.findByIdAndUpdate(order.product, { paymentStatus: "Paid" });

    console.log("✅ Payment Verified & Saved:", razorpay_payment_id);
    res.status(200).json({ message: "Payment Verified", transactionId: razorpay_payment_id });

  } catch (error) {
    // ❗ THIS IS WHAT YOU ARE SEEING: 
    console.error("CRITICAL VERIFY ERROR:", error.message); 
    res.status(500).json({ message: "Verification Error", details: error.message });
  }
};

// 🚚 STEP 3: LOGISTICS (SHIP & MANAGE)
export const markAsShipped = async (req, res) => {
  try {
    const { productId } = req.params;
    const { trackingNumber, carrier } = req.body;
    const order = await Order.findOne({ product: productId });

    if (!order || order.paymentStatus !== "Paid") return res.status(400).json({ message: "Cannot ship unpaid items." });
    if (order.seller.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    order.deliveryStatus = "Shipped";
    order.trackingNumber = trackingNumber;
    order.carrier = carrier || "Standard Shipping";
    order.shippedAt = new Date();
    await order.save();

    await Product.findByIdAndUpdate(productId, { deliveryStatus: "Shipped", trackingNumber });
    res.status(200).json({ message: "Item Shipped", order });
  } catch (error) {
    res.status(500).json({ message: "Shipping update failed" });
  }
};

export const getManageOrder = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (product.sellerId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    const order = await Order.findOne({ product: req.params.productId });
    res.json({ product, order: order || null }); 
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};