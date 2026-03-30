//Sewni

import {
  getPendingNgos,
  findNgoVerificationById,
  saveNgoVerification,
  getPendingDonors,
  findDonorById,
  saveDonorProfile
} from "../repositories/adminVerificationRepository.js";

/* ================= NGO ================= */

export const fetchPendingNgos = async () => {
  return await getPendingNgos();
};

export const approveNgo = async (id, adminUsername) => {
  const ngo = await findNgoVerificationById(id);
  if (!ngo) throw new Error("NGO verification record not found");

  ngo.status = "VERIFIED";
  ngo.verifiedBy = adminUsername;
  ngo.verifiedAt = new Date();

  return await saveNgoVerification(ngo);
};

export const rejectNgo = async (id, reason, adminUsername) => {
  const ngo = await findNgoVerificationById(id);
  if (!ngo) throw new Error("NGO verification record not found");

  ngo.status = "REJECTED";
  ngo.rejectionReason = reason;
  ngo.verifiedBy = adminUsername;
  ngo.verifiedAt = new Date();

  return await saveNgoVerification(ngo);
};

/* ================= DONOR ================= */

export const fetchPendingDonors = async () => {
  return await getPendingDonors();
};

export const approveDonor = async (id) => {
  const donor = await findDonorById(id);
  if (!donor) throw new Error("Donor not found");

  donor.verificationStatus = "APPROVED";
  return await saveDonorProfile(donor);
};

export const rejectDonor = async (id) => {
  const donor = await findDonorById(id);
  if (!donor) throw new Error("Donor not found");

  donor.verificationStatus = "REJECTED";
  return await saveDonorProfile(donor);
};