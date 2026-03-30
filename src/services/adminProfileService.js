//Sewni

import {
  getAdminProfileRepository,
  updateAdminProfileRepository
} from '../repositories/adminProfileRepository.js';

export const getAdminProfileService = async (username) => {
  try {
    return await getAdminProfileRepository(username);
  } catch (error) {
    console.error('Service error - get admin profile:', error);
    throw error;
  }
};

export const updateAdminProfileService = async (username, updateData) => {
  try {
    return await updateAdminProfileRepository(username, updateData);
  } catch (error) {
    console.error('Service error - update admin profile:', error);
    throw error;
  }
};
