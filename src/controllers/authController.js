
// Import all userreg-related service functions

import { registerUser } from "../services/registerService.js";
import * as notificationService from "../services/notificationService.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    // Trigger registration notification
    await notificationService.triggerUserRegistrationNotification({
      userId: user._id,
      username: user.username,
      userType: user.userType || "user",
      email: user.email
    }).catch((err) => console.error("User registration notification failed:", err));

    res.status(201).json({
      message: "Registration successful",
      username: user.username
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};
