import express from "express";
import { register } from "../controllers/authController.js";
import { loginUser } from "../controllers/loginController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);

// Get NGO profile by username
router.get("/ngo/:username", async (req, res) => {
  try {
    const Ngo = (await import("../models/Ngo.js")).default;
    const ngo = await Ngo.findOne({ username: req.params.username }).select("-password");
    if (!ngo) return res.status(404).json({ error: "NGO not found" });
    res.json(ngo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update NGO profile
router.patch("/update-ngo", async (req, res) => {
  try {
    const Ngo = (await import("../models/Ngo.js")).default;
    const { username, name, email } = req.body;
    const updated = await Ngo.findOneAndUpdate({ username }, { name, email }, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ error: "NGO not found" });
    res.json({ message: "Profile updated", ...updated.toObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working " });
});

export default router;




/*


This defines the authentication routes using Express Router.
It connects HTTP endpoints to their respective controller functions.

Data Flow:
Client → Express Router → Controller → Service → Repository → Database

Responsibilities:
- POST /register → Calls the register controller to create a new user account.
- POST /login → Calls the loginUser controller to authenticate a user.
- GET /test → Simple test endpoint to verify that auth routes are working.

This file does not contain business logic or database logic.
It only maps incoming HTTP requests to the appropriate controller functions,
keeping routing logic separated from application logic.
*/