//Sewni

import express from "express";
import {
  getDashboardSummary,
  getDashboardAlerts
} from "../controllers/adminDashboardController.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/summary", adminOnly, getDashboardSummary);
router.get("/alerts", adminOnly, getDashboardAlerts);

export default router;