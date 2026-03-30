//Sewni

import express from "express";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getPlatformSummary,
  getMonthlyGrowth,
  getComplaintImpact,
  getFullSystemReport,
  generatePDFReport
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/platform-summary", adminOnly, getPlatformSummary);
router.get("/monthly-growth", adminOnly, getMonthlyGrowth);
router.get("/complaint-impact", adminOnly, getComplaintImpact);

router.get("/full-report", adminOnly, getFullSystemReport);

router.get("/generate-pdf", adminOnly, generatePDFReport);

export default router;