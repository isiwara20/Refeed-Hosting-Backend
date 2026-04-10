//Sewni

import NgoVerification from "../models/NgoVerification.model.js";
import DonorProfile from "../models/DonorProfile.js";

/* ================= NGO ================= */

export const getPendingNgos = () =>
  NgoVerification.find({ status: "PENDING" })
    .populate("ngoId", "name email username")
    .sort({ createdAt: -1 });

export const findNgoVerificationById = (id) =>
  NgoVerification.findById(id).populate("ngoId", "name email username");

export const saveNgoVerification = (ngoVerification) =>
  ngoVerification.save();

/* ================= DONOR ================= */

export const getPendingDonors = () =>
  DonorProfile.find({ verificationStatus: "PENDING", isDeleted: false })
    .sort({ createdAt: -1 });

export const findDonorById = (id) =>
  DonorProfile.findById(id);

export const saveDonorProfile = (donor) =>
  donor.save();