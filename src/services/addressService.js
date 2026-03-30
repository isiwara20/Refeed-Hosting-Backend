import * as repository from "../repositories/addressRepository.js";

export const createUserAddress = async (data) => {
  // Could add validation / formatting logic here
  return await repository.createAddress(data);
};

export const updateUserAddress = async (id, updateData) => {
  const updated = await repository.updateAddress(id, updateData);
  if (!updated) throw new Error("Address not found");
  return updated;
};

export const deleteUserAddress = async (id) => {
  const deleted = await repository.deleteAddress(id);
  if (!deleted) throw new Error("Address not found");
  return deleted;
};

export const fetchAllAddresses = async () => {
  return await repository.getAllAddresses();
};

export const fetchAddressesByUsername = async (username) => {
  if (!username) throw new Error("Username is required");
  return await repository.getAddressesByUsername(username);
};
