import FoodRequest from "../models/FoodRequest.js";

export const createRequest = async (data) => {
  return await FoodRequest.create(data);
};


//get the all requests
export const getAllRequests = async () => {
  return await FoodRequest.find();
};

//get the requests based on username
export const getRequestsByUsername = async (username) => {
  return await FoodRequest.find({ username });
};

//update request
export const updateRequest = async (id, updateData) => {
  return await FoodRequest.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete request
export const deleteRequest = async (id) => {
  return await FoodRequest.findByIdAndDelete(id);
};