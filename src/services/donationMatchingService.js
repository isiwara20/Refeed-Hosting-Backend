import * as donationRepo from "../repositories/donationMatchingRepository.js";

// Category Mapping Layer
const categoryMap = {
  vegetable: "veg",
  "non-vegetable": "non_veg",
  cooked: "cooked",
  packed: "packed",
  bakery: "bakery",
  mixed: "mixed"
};

export const checkDonationAvailability = async (location, category) => {

  const mappedFoodType = categoryMap[category];

  if (!mappedFoodType) {
    return { available: false, donations: [] };
  }

  const donations = await donationRepo.findAvailableDonations(
    location,
    mappedFoodType
  );

  if (donations.length > 0) {
    return {
      available: true,
      donations
    };
  }

  return {
    available: false,
    donations: []
  };
};
