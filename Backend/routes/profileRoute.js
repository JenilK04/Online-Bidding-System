import express from "express";
import { getProfile, updateProfileDetails } from "../controller/profileController.js";
import authMiddleware from "../middleware/jwt.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);

router.put("/update", authMiddleware, updateProfileDetails);

export default router;