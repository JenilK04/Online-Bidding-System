import express from "express";
import verifyToken from "../middleware/jwt.js"
import { placeBid} from "../controller/bidController.js";
    
const router = express.Router();

router.post("/:id", verifyToken, placeBid);
// router.get("/bids/:id", verifyToken, getBidsByProduct);

export default router