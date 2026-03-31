import express from "express";
import { 
  createOrder, 
  finalizePayment,
  markAsShipped,
  getManageOrder
} from "../controller/orderController.js";
import { verifyToken } from "../middleware/jwt.js";
import { get } from "mongoose";

const router = express.Router();

// 📝 STEP 1: INITIALIZE ORDER & SHIPPING
// Triggered when the buyer submits the Shipping Form in Checkout.jsx
router.post("/create", verifyToken, createOrder);

// 💳 STEP 2: FINALIZE PAYMENT
// Triggered when the "Pay" button is clicked after mock card validation
router.patch("/finalize/:orderId", verifyToken , finalizePayment);
router.patch("/ship/:orderId", verifyToken, markAsShipped);
router.get("/manage/:productId", verifyToken, getManageOrder);


// 🔍 STEP 3: ORDER RETRIEVAL
// Used to display the receipt or shipping status in the Profile/Order details page
// router.get("/:orderId", verifyToken, getOrderById);

// // 👤 STEP 4: USER ORDER HISTORY
// // Fetches all won lots and their fulfillment status for the Buyer
// router.get("/my-orders", verifyToken, getMyOrders);

export default router;