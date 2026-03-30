//Sewni

import express from "express";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  createComplaintController,
  getAllComplaintsController,
  getComplaintByIdController,
  updateComplaintController,
  deleteComplaintController,
  complaintAnalyticsController
} from "../controllers/complaintController.js";

const router = express.Router();

// NGO / Donator can create
router.post("/", createComplaintController);

// Admin only
router.get("/", adminOnly, getAllComplaintsController);
router.get("/analytics", adminOnly, complaintAnalyticsController);
router.get("/:id", adminOnly, getComplaintByIdController);
router.patch("/:id", adminOnly, updateComplaintController);
router.delete("/:id", adminOnly, deleteComplaintController);

export default router;