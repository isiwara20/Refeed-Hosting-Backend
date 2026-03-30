// Import all passwordreset-related service functions


import {
  findUserByEmailOrUsername,
  maskPhone,
  resetPassword
} from "../services/passwordResetService.js";
import * as notificationService from "../services/notificationService.js";

import { sendOTPViaWhatsApp, verifyOTP, clearOTP } from "../services/otpService.js";


//Find user and return masked phone
 
export const identifyUser = async (req, res) => {
  try {
    const { identifier } = req.body;

    const { user } = await findUserByEmailOrUsername(identifier);

    res.json({
      message: "User found",
      phone: maskPhone(user.phone)
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


//reset password
export const updatePassword = async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;

    const msg = await resetPassword(username, newPassword, confirmPassword);

    await notificationService
      .sendInAppNotificationToUsername({
        username,
        eventType: "PASSWORD_RESET_SUCCESS",
        subject: "Password updated",
        message: "Your password was updated successfully.",
        priority: "HIGH",
        metadata: {
          username,
          updatedAt: new Date().toISOString(),
        },
      })
      .catch((err) => console.error("Password reset notification failed:", err));

    res.json({ message: msg });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
