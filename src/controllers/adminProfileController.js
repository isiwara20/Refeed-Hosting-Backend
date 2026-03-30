//Sewni

import {
  getAdminProfileService,
  updateAdminProfileService
} from "../services/adminProfileService.js";

export const getAdminProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const profileData = await getAdminProfileService(username);
    
    if (!profileData) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json(profileData);
  } catch (error) {
    console.error("Get admin profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body;
    
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const updatedProfile = await updateAdminProfileService(username, updateData);
    
    if (!updatedProfile) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
