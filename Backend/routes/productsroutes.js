import express from "express"
import verifyToken from "../middleware/jwt.js"
import{
  addProduct,
  getProducts,
  getMyProducts,
  closeBid
} from "../controller/productscontroller.js";
import e from "express";

const router = express.Router();

// Public / Logged-in view
router.get("/", verifyToken, getProducts);

// Logged-in seller
router.post("/", verifyToken, addProduct);
router.get("/my-products", verifyToken, getMyProducts);
// routes/productRoutes.js
router.patch("/close/:id", verifyToken, closeBid);


export default router;
