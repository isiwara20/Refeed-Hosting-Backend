//Sewni
 
import express from "express";
import { auditLogger } from "../middleware/auditLoggerMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getPendingNgoList,
  approveNgoController,
  rejectNgoController,
  getPendingDonorList,
  approveDonorController,
  rejectDonorController
} from "../controllers/adminVerificationController.js";

const router = express.Router();

/* NGO */
router.get("/ngos/pending", adminOnly, getPendingNgoList);

router.patch(
  "/ngos/:id/approve",
  adminOnly,
  auditLogger("APPROVE_NGO", "NGO"),
  approveNgoController
);

router.patch(
  "/ngos/:id/reject",
  adminOnly,
  auditLogger("REJECT_NGO", "NGO"),
  rejectNgoController
);

/* DONOR */
router.get("/donors/pending", adminOnly, getPendingDonorList);

router.patch(
  "/donors/:id/approve",
  adminOnly,
  auditLogger("APPROVE_DONOR", "DONOR"),
  approveDonorController
);

router.patch(
  "/donors/:id/reject",
  adminOnly,
  auditLogger("REJECT_DONOR", "DONOR"),
  rejectDonorController
);

export default router;