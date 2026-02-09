import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getAllOrders,
  markOrderDelivered,
  getOrderById
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";


const router = express.Router();

// Create order
router.post("/", protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);
router.put("/:id/deliver", protect, admin, markOrderDelivered);

export default router;
