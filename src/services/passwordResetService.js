import bcrypt from "bcrypt";
import Ngo from "../models/Ngo.js";
import Donator from "../models/Donator.js";

/**
 * Find user by email OR username
 */
export const findUserByEmailOrUsername = async (identifier) => {
  let user = await Ngo.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (user) return { user, role: "ngo" };

  user = await Donator.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (user) return { user, role: "donator" };

  throw new Error("User not found");
};

/**
 * Mask phone number (security)
 * 94771234567 → 9477****567
 */
export const maskPhone = (phone) => {
  return phone;//.replace(/^(\d{4})\d+(\d{3})$/, "$1****$2");
};

/**
 * Update password by username
 */
export const resetPassword = async (username, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  let user = await Ngo.findOne({ username });
  if (user) {
    user.password = hashedPassword;
    await user.save();
    return "Password updated for NGO";
  }

  user = await Donator.findOne({ username });
  if (user) {
    user.password = hashedPassword;
    await user.save();
    return "Password updated for Donator";
  }

  throw new Error("User not found");
};
