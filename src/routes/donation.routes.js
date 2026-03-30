//Sewni

import express from "express";
import * as controller from "../controllers/donation.controller.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", adminOnly, controller.getAllDonations);

export default router;