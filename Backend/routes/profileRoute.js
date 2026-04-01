import express from "express";
import { getProfile } from "../controller/profileController.js";
import {verifyToken} from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);




export default router;