import express from "express";
import {
  submitVerification,
  getVerificationStatus
} from "../controllers/ngoVerificationController.js";

const router = express.Router();

// NGO submits verification
router.post("/submit", submitVerification);
router.get("/status/:ngoUsername", getVerificationStatus);



export default router;
