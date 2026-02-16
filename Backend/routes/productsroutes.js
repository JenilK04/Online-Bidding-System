import express from "express"
import verifyToken from "../middleware/jwt.js"
import{
  addProduct,
  getProducts,
  getMyProducts,
  closeBid,
  getSingleProduct,
  registerForAuction
} from "../controller/productscontroller.js";

import { placeBid } from "../controller/bidController.js";

const router = express.Router();
router.get("/", verifyToken, getProducts);
router.post("/", verifyToken, addProduct);
router.get("/my-products", verifyToken, getMyProducts);
router.patch("/close/:id", verifyToken, closeBid);
router.get("/:id", verifyToken, getSingleProduct);
router.post("/register/:id", verifyToken, registerForAuction);

router.post("/bids/:id", verifyToken, placeBid);



export default router;
