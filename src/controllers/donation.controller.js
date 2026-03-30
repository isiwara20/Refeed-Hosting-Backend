//Sewni

import * as donationService from "../services/donation.service.js";

export const getAllDonations = async (req, res) => {
  try {
    const donations = await donationService.fetchAllDonations(req.query);
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};