import express from "express";
import { 
  createOrder, 
  verifyPayment, // Changed from finalizePayment
  markAsShipped,
  getManageOrder
} from "../controller/orderController.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// 📝 STEP 1: INITIALIZE ORDER & CREATE RAZORPAY ORDER
// This now talks to Razorpay API and creates an internal "Pending" order
router.post("/create", verifyToken, createOrder);

// 💳 STEP 2: VERIFY RAZORPAY PAYMENT
// This is the most important change. We use POST because we are sending 
// payment_id, order_id, and signature from the frontend.
router.post("/verify-payment", verifyToken, verifyPayment);

// 🚚 LOGISTICS
router.patch("/ship/:productId", verifyToken, markAsShipped);
router.get("/manage/:productId", verifyToken, getManageOrder);

export default router;