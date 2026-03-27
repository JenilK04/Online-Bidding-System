import express from "express";
import { getProfile, updateProfileDetails } from "../controller/profileController.js";
import {verifyToken} from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);

router.put("/update", verifyToken, updateProfileDetails);

export default router;