import * as repo from "../repositories/goVerificationRepository.js";
import Ngo from "../models/Ngo.js";

export const submitVerification = async (verificationData) => {
  const {
    ngoUsername,
    registrationNumber,
    registrationAuthority,
    registrationDocumentUrl,
    officialAddress,
    district,
    province,
    contactPersonName,
    contactPersonNIC,
    contactPersonRole,
  } = verificationData;

  // 1 Find NGO using username
  const ngo = await Ngo.findOne({ username: ngoUsername });

  if (!ngo) {
    throw new Error("NGO not found");
  }

  // 2 Check if verification already exists
  const existing = await repo.findByNgoId(ngo.ngo);
  if (existing) {
    throw new Error("Verification already submitted");
  }

  // 3 Create verification record
  const newVerification = await repo.createVerification({
    ngoId: ngo._id,

    registrationNumber,
    registrationAuthority,
    registrationDocumentUrl,

    officialAddress,
    district,
    province,

    contactPersonName,
    contactPersonNIC,
    contactPersonRole,
  });

  return newVerification;
};


export const getVerificationStatusByUsername = async (ngoUsername) => {
  const verification = await repo.findByNgoUsername(ngoUsername);

  if (!verification) {
    throw new Error("Verification record not found for this NGO");
  }

  return {
    ngoUsername,
    status: verification.status,
    verifiedBy: verification.verifiedBy || null,
    verifiedAt: verification.verifiedAt || null,
    rejectionReason: verification.rejectionReason || null,
    riskLevel: verification.riskLevel || null
  };
};