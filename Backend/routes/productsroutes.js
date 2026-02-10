import express from "express"
import verifyToken from "../middleware/jwt.js"
import{
  addProduct,
  getProducts,
  getMyProducts,
  closeBid,
  getSingleProduct
} from "../controller/productscontroller.js";

const router = express.Router();

// Public / Logged-in view
router.get("/", verifyToken, getProducts);

// Logged-in seller
router.post("/", verifyToken, addProduct);
router.get("/my-products", verifyToken, getMyProducts);
// routes/productRoutes.js
router.patch("/close/:id", verifyToken, closeBid);
// routes/productRoutes.js
router.get("/:id", verifyToken, getSingleProduct);



export default router;
