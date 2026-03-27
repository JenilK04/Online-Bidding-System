import express from "express";
import { getAdminStats, getAllUsers, toggleUserBan, verifyUser } from "../controller/adminController.js";
import { verifyToken, isAdmin } from "../middleware/jwt.js";

const router = express.Router();

// All routes here are prefixed with /api/admin
router.get("/stats", verifyToken, isAdmin, getAdminStats);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.patch("/users/ban/:id", verifyToken, isAdmin, toggleUserBan);
router.patch("/users/verify/:id", verifyToken, isAdmin, verifyUser);

export default router;