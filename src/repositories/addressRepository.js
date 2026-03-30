import Address from "../models/NgoAddress.js";

//create address repo
export const createAddress = async (data) => {
  return await Address.create(data);
};

//update address repo
export const updateAddress = async (id, updateData) => {
  return await Address.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true }
  );
};

//delete address repo
export const deleteAddress = async (id) => {
  return await Address.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
};

//get all address repo
export const getAllAddresses = async () => {
  return await Address.find({ isDeleted: false });
};


//get all the address by the username
export const getAddressesByUsername = async (username) => {
  return await Address.find({ username, isDeleted: false });
};
