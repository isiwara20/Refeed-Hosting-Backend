//Sewni

import SurplusDonation from "../models/SurplusDonation.model.js";

export const getAllDonations = (filter) => {
  return SurplusDonation.find(filter);
};

export const getDonationById = (id) => {
  return SurplusDonation.findById(id);
};

export const updateDonation = (id, updateData) => {
  return SurplusDonation.findByIdAndUpdate(id, updateData, { new: true });
};