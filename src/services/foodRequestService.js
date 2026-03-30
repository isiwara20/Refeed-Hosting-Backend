import * as repository from "../repositories/foodRequestRepository.js";
import * as matchingService from "./donationMatchingService.js";


export const createFoodRequest = async (data) => {

  if (new Date(data.expiryRequirement) <= new Date()) {
    throw new Error("Expiry requirement must be future");
  }

  //  Matching Logic
  const matchResult = await matchingService.checkDonationAvailability(
    data.location,
    data.category
  );

  if (matchResult.available) {
    data.status = "matched";
  }

  const savedRequest = await repository.createRequest(data);

  return {
    request: savedRequest,
    availability: matchResult
  };
};

/*export const createFoodRequest = async (data) => {

  // Business Rule 1: Expiry date must be future
  if (new Date(data.expiryRequirement) <= new Date()) {
    throw new Error("Expiry requirement must be a future date");
  }

  // Business Rule 2: Critical urgency auto-priority 
  if (data.urgencyLevel === "critical") {
    console.log(" Critical request created");
  }

  return await repository.createRequest(data);
};*/


// Update request
export const updateFoodRequest = async (id, updateData) => {
  if (updateData.expiryRequirement && new Date(updateData.expiryRequirement) <= new Date()) {
    throw new Error("Expiry requirement must be a future date");
  }

  const updated = await repository.updateRequest(id, updateData);
  if (!updated) throw new Error("Food request not found");
  return updated;
};

// Delete request
export const deleteFoodRequest = async (id) => {
  const deleted = await repository.deleteRequest(id);
  if (!deleted) throw new Error("Food request not found");
  return deleted;
};


//display all requests
export const fetchAllRequests = async () => {
  return await repository.getAllRequests();
};

//display all based on username
export const fetchRequestsByUsername = async (username) => {
  if (!username) {
    throw new Error("Username is required");
  }
  const requests = await repository.getRequestsByUsername(username);
  return requests;
};