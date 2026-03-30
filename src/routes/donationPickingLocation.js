import express from "express";
import SurplusDonation from "../models/SurplusDonation.model.js";

const router = express.Router();

// Get donation by ID
router.get("/:id", async (req, res) => {
  try {
    const donation = await SurplusDonation.findById(req.params.id);
    if (!donation || donation.isDeleted) {
      return res.status(404).json({ error: "Donation not found" });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
