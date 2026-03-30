import NgoVerification from "../models/NgoVerification.model.js";

import Ngo from "../models/Ngo.js";


export const createVerification = async (data) => {
  const record = new NgoVerification(data);
  return await record.save();
};

/////////////////////////////////////////////
export const findByNgoId = async (ngoId) => {
  return await NgoVerification.findOne({ ngoId });
};

export const findByNgoUsername = async (ngoUsername) => {
  // Find NGO first
  const ngo = await Ngo.findOne({ username: ngoUsername });
  if (!ngo) return null;

  // 2Find verification record
  return await NgoVerification.findOne({ ngoId: ngo._id });
};

