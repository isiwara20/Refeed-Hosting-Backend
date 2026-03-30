//Sewni

import * as donationRepo from "../repositories/donation.repository.js";

export const fetchAllDonations = async (query) => {
  const filter = { isDeleted: false };

  if (query.lifecycleStatus) {
    filter.lifecycleStatus = query.lifecycleStatus;
  }

  return donationRepo.getAllDonations(filter);
};