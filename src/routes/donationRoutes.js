import express from "express";
import {
  createDonation,
  listDonations,
  getDonation,
  acceptDonation,
  completeDonation,
} from "../controllers/donationController.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/", listDonations);
router.get("/:id", getDonation);
router.patch("/:id/accept", acceptDonation);
router.patch("/:id/complete", completeDonation);

export default router;
