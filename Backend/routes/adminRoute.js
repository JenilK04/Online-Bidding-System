import express from "express";
import { 
  getAdminStats, 
  getAllUsers, 
  toggleUserStatus,
  getAdminEvents,
  getFinanceStats,
  verifyUser,
  updateUserStatus
} from "../controller/adminController.js";
import { verifyToken, isAdmin } from "../middleware/jwt.js";

const router = express.Router();

// All routes here are prefixed with /api/admin
router.get("/stats", verifyToken, isAdmin, getAdminStats);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.patch("/users/:id/status", verifyToken, isAdmin, toggleUserStatus);
router.get("/events", verifyToken, isAdmin, getAdminEvents);
router.get("/finance", verifyToken, isAdmin, getFinanceStats);
router.patch('/verify/:id', verifyToken, isAdmin, verifyUser);
router.patch(`/users/:userId/status`, verifyToken, isAdmin, updateUserStatus);


export default router;