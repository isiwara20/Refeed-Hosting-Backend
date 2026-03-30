import express from "express";
import {
  identifyUser,
  updatePassword
} from "../controllers/passwordResetController.js";

const router = express.Router();

//identify the user
router.post("/identify", identifyUser);

//password reset
router.post("/reset-password", updatePassword);

export default router;
