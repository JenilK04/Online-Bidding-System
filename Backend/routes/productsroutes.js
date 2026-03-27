import express from "express"
import verifyToken from "../middleware/jwt.js"
import{
  addProduct,
  getProducts,
  getMyProducts,
  getProductById,
  closeAuction,
  registerForAuction

} from "../controller/productscontroller.js";

;

const router = express.Router();
router.get("/", getProducts);
router.post("/", verifyToken, addProduct);
router.get("/my-products", verifyToken, getMyProducts);
router.patch("/close/:id", verifyToken, closeAuction);
router.get("/:id", verifyToken, getProductById);
router.post("/register/:id", verifyToken, registerForAuction);


export default router;
