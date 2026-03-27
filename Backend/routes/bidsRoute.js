import express from "express";
import {verifyToken} from "../middleware/jwt.js"
import { placeBid, getBidsByProduct} from "../controller/bidController.js";
    
const router = express.Router();

router.post("/:id", verifyToken, placeBid);
router.get("/:id", verifyToken, getBidsByProduct);

export default router