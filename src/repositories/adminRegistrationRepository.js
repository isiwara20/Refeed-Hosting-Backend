//Sewni

import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

export const createAdmin = async (adminData) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { username: adminData.username },
        { email: adminData.email }
      ]
    });

    if (existingAdmin) {
      throw new Error("Admin with this username or email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create new admin
    const newAdmin = new Admin({
      username: adminData.username,
      password: hashedPassword,
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone,
      role: "ADMIN"
    });

    await newAdmin.save();

    // Return admin without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    return adminResponse;
  } catch (error) {
    throw error;
  }
};

export const findAdminByUsername = async (username) => {
  return await Admin.findOne({ username });
};

export const findAllAdmins = async () => {
  return await Admin.find().select("-password").sort({ createdAt: -1 });
};

export const countAdmins = async () => {
  return await Admin.countDocuments();
};
