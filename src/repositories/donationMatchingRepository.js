import SurplusDonation from "../models/SurplusDonation.model.js";

export const findAvailableDonations = async (location, foodType) => {
  return await SurplusDonation.find({
    "location.address": { $regex: location, $options: "i" }, // partial, case-insensitive match
    foodType: foodType,
    lifecycleStatus: "PUBLISHED",
    isDeleted: false,
    //expiryTime: { $gt: new Date() }
  });
};
