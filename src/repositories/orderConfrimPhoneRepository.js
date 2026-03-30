import Donator from "../models/Donator.js";
import Ngo from "../models/Ngo.js";

//fetching the donors phone number by username
export const getDonorPhoneByUsername = async (username) => {
  const donor = await Donator.findOne({ username });
  if (!donor) throw new Error("Donor not found");
  return donor.phone;
};

//fetching the ngos phone number by username
export const getNgoPhoneByUsername = async (username) => {
  const ngo = await Ngo.findOne({ username });
  if (!ngo) throw new Error("NGO not found");
  return ngo.phone;
};
