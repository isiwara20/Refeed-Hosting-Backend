//Sewni

import Admin from '../models/Admin.js';
import AdminProfile from '../models/AdminProfile.js';

export const getAdminProfileRepository = async (username) => {
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return null;
    }

    let adminProfile = await AdminProfile.findOne({ username });
    
    if (!adminProfile) {
      adminProfile = await AdminProfile.create({ username });
    }

    return {
      ...admin.toObject(),
      profile: adminProfile.toObject()
    };
  } catch (error) {
    throw new Error('Error fetching admin profile: ' + error.message);
  }
};

export const updateAdminProfileRepository = async (username, updateData) => {
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      throw new Error('Admin not found');
    }

    const { profileData, adminData } = updateData;

    if (adminData) {
      await Admin.updateOne({ username }, adminData);
    }

    let adminProfile = await AdminProfile.findOne({ username });
    
    if (!adminProfile) {
      adminProfile = await AdminProfile.create({ 
        username, 
        ...profileData 
      });
    } else {
      await AdminProfile.updateOne({ username }, profileData);
    }

    const updatedAdmin = await Admin.findOne({ username });
    const updatedProfile = await AdminProfile.findOne({ username });

    return {
      ...updatedAdmin.toObject(),
      profile: updatedProfile.toObject()
    };
  } catch (error) {
    throw new Error('Error updating admin profile: ' + error.message);
  }
};
