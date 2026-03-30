//Sewni

import {
  createAdmin,
  findAdminByUsername,
  findAllAdmins,
  countAdmins
} from "../repositories/adminRegistrationRepository.js";

export const registerAdminService = async (adminData) => {
  try {
    // Validate required fields
    const requiredFields = ['username', 'password', 'name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !adminData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate name
    if (adminData.name.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }

    // Validate username
    if (adminData.username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(adminData.username)) {
      throw new Error("Username can only contain letters, numbers, and underscores");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Validate phone number
    if (!/^\+?[\d\s-()]+$/.test(adminData.phone)) {
      throw new Error("Please enter a valid phone number");
    }

    // Validate password strength
    if (adminData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(adminData.password)) {
      throw new Error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    }

    // Create admin
    const newAdmin = await createAdmin(adminData);
    
    return {
      success: true,
      message: "Admin registered successfully",
      data: newAdmin
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

export const getAllAdminsService = async () => {
  try {
    const admins = await findAllAdmins();
    const totalAdmins = await countAdmins();
    
    return {
      success: true,
      data: admins,
      total: totalAdmins
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch admins"
    };
  }
};

export const checkAdminExistsService = async (username) => {
  try {
    const admin = await findAdminByUsername(username);
    return {
      success: true,
      exists: !!admin
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to check admin existence"
    };
  }
};
