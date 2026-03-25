import express from "express";
import { updateOrderDetails } from "../controller/orderController.js";
import authMiddleware from "../middleware/jwt.js";

const router = express.Router();

// 📦 Add / Update Address & Contact
router.post("/order-details/:id", authMiddleware, updateOrderDetails);

export default router;
