import express from "express";
import { sendOTP, checkOTP } from "../controllers/otpController.js";

const router = express.Router();

// Send OTP to phone
router.post("/send", sendOTP);

// Verify OTP
router.post("/verify", checkOTP);

export default router;
