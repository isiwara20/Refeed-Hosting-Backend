console.log("Donor routes module loaded ");


import express from "express";
import { DonorController } from "../controllers/donor.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

//debuging test route
router.get("/test", (req, res) => {
  console.log("[DonorRoutes] test route hit");
  res.json({ message: "Donor routes working " });
});

// Debug middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`[DonorRoutes] ${req.method} ${req.originalUrl}`);
  console.log("Request body:", req.body);
  console.log("Request user:", req.user);
  next();
});

// Routes with debug logs
router.post("/", auth, async (req, res, next) => {
  console.log("POST / called");
  try {
    const profile = await DonorController.createProfile(req, res, next);
    console.log("Profile created:", profile);
  } catch (err) {
    console.error("Error in POST /:", err);
    next(err);
  }
});

router.get("/:username", auth, async (req, res, next) => {
  console.log("GET /:username called");
  try {
    const profile = await DonorController.getProfile(req, res, next);
    console.log("Profile fetched:", profile);
  } catch (err) {
    console.error("Error in GET /:username:", err);
    next(err);
  }
});

router.patch("/", auth, async (req, res, next) => {
  console.log("PATCH / called");
  try {
    const profile = await DonorController.updateProfile(req, res, next);
    console.log("Profile updated:", profile);
  } catch (err) {
    console.error("Error in PATCH /:", err);
    next(err);
  }
});

router.patch("/:username/approve", auth, async (req, res, next) => {
  console.log("PATCH /:username/approve called");
  try {
    const profile = await DonorController.approveVerification(req, res, next);
    console.log("Profile approved:", profile);
  } catch (err) {
    console.error("Error in PATCH /:username/approve:", err);
    next(err);
  }
});


router.delete("/:username", auth, DonorController.deleteProfile);

router.delete("/:username/hard", auth, DonorController.hardDeleteProfile);

export default router;




/*


This defines all Donor-related API routes using Express Router.
It connects HTTP endpoints to the DonorController while applying authentication
and logging middleware for debugging purposes.

Data Flow:
Client → Donor Routes → auth middleware → DonorController → Service → Repository → Database

Key Components:

1. Initial Console Log:
   Confirms that the donor routes module has been loaded when the server starts.

2. Test Route (GET /test):
   Simple debugging endpoint to verify that donor routes are accessible.

3. Debug Middleware:
   Logs:
   - HTTP method
   - Requested URL
   - Request body
   - Authenticated user (req.user)
   This helps trace incoming requests and debug authentication or payload issues.

4. Protected Routes (All use auth middleware):
   - POST / → Creates a new donor profile.
   - GET /:username → Retrieves a specific donor profile.
   - PATCH / → Updates the authenticated donor's profile.
   - PATCH /:username/approve → Approves donor verification.

Each route:
   - Logs when it is triggered.
   - Calls the appropriate controller method.
   - Handles errors using try/catch and next(err).

This file contains routing logic only.
It does not implement business rules or database logic,
maintaining clean separation of concerns in the architecture.
*/