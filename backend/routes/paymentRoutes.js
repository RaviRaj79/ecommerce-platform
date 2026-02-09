import express from "express";
import {
  mockPayment,
  createCashfreeOrder,
  verifyCashfreeOrder
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// MOCK payment route
router.post("/mock", protect, mockPayment);
router.post("/cashfree/order", createCashfreeOrder);
router.post("/cashfree/verify", verifyCashfreeOrder);

export default router;
