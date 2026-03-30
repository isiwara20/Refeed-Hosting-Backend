//Sewni

import {
  registerAdminService,
  getAllAdminsService,
  checkAdminExistsService
} from "../services/adminRegistrationService.js";
import * as notificationService from "../services/notificationService.js";

export const registerAdminController = async (req, res) => {
  try {
    console.log("Admin registration request received:");
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    
    const result = await registerAdminService(req.body);
    
    if (!result.success) {
      console.log("Registration failed:", result.message);
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    console.log("Registration successful:", result.data);

    await notificationService
      .sendInAppNotificationToUsername({
        username: result?.data?.username,
        role: "ADMIN",
        eventType: "ADMIN_REGISTERED",
        subject: "Admin account created",
        message: "Your admin account has been registered successfully.",
        metadata: {
          adminId: result?.data?._id?.toString(),
          username: result?.data?.username,
        },
      })
      .catch((err) => console.error("Admin registration notification failed:", err));

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllAdminsController = async (req, res) => {
  try {
    const result = await getAllAdminsService();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total
    });
  } catch (error) {
    console.error("Get admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const checkAdminExistsController = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required"
      });
    }

    const result = await checkAdminExistsService(username);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      exists: result.exists
    });
  } catch (error) {
    console.error("Check admin exists error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
