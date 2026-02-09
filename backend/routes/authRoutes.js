import express from "express";
import {
  registerUser,
  loginUser,
  loginWithFirebase
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/firebase", loginWithFirebase);

export default router;
