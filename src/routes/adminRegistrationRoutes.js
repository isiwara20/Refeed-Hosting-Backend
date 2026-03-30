//Sewni

import express from "express";
import {
  registerAdminController,
  getAllAdminsController,
  checkAdminExistsController
} from "../controllers/adminRegistrationController.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Only existing admins can register new admins
router.post("/register", adminOnly, registerAdminController);
//router.post("/register", registerAdminController);

// Only admins can view all admins
router.get("/list", adminOnly, getAllAdminsController);

// Check if admin username exists (for validation)
router.get("/check/:username", checkAdminExistsController);

export default router;
