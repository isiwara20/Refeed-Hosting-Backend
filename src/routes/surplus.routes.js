import express from "express";
import { SurplusController } from "../controllers/surplus.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { role } from "../middleware/role.middleware.js";
import { getNearbyNGOs } from "../utils/geo.service.js";


const router = express.Router();



//Request: GET /api/surplus/ping.Health check for this router.
router.get("/ping", (req, res) => res.json({ ok: true, where: "surplus router" }));


router.post("/", auth, role("DONOR"), SurplusController.createDraft);
router.post("/:id/publish", auth, role("DONOR"), SurplusController.publish);
router.get("/mine", auth, role("DONOR"), SurplusController.listMine);

// Get nearby NGOs using latitude & longitude
// URL: GET /api/surplus/nearby?lat=6.9&lng=79.8
router.get("/nearby", auth, async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng required" });
    }

    const ngos = await getNearbyNGOs(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.json(ngos);
  } catch (e) {
    next(e);
  }
});






//qr code
router.get("/:id/qrcode", auth, SurplusController.getQRCode);

// NEW: reserve step (PUBLISHED -> RESERVED)
// If have NGO role: replace `auth` with `auth, role("NGO")`
router.post("/:id/reserve", auth, SurplusController.reserveDonation);

// NGO scans QR → mark as COLLECTED
router.post("/:id/collect", auth, SurplusController.markCollected);



// Donor confirms final completion
router.post("/:id/complete", auth, SurplusController.markComplete);



export default router;




/*


This defines all Surplus Donation routes using Express Router.
It connects HTTP endpoints to SurplusController while applying
authentication, role-based authorization, and utility services.

Data Flow:
Client → Surplus Routes → Middleware (auth/role) → SurplusController 
→ Service Layer → Repository → Database

Key Responsibilities:

1. Health Check:
   - GET /ping → Confirms the surplus router is active.

2. Donor Actions (Protected by auth + role("DONOR")):
   - POST / → Create a draft donation.
   - POST /:id/publish → Publish a draft donation.
   - GET /mine → List donations created by the logged-in donor.
   - POST /:id/complete → Mark donation as fully completed.

3. Geolocation Feature:
   - GET /nearby?lat=...&lng=...
   Retrieves nearby NGOs based on latitude and longitude
   using the geo.service utility.

4. QR Code Feature:
   - GET /:id/qrcode → Generates or retrieves a QR code for donation tracking.

5. Donation Lifecycle Transitions:
   - POST /:id/reserve → Reserve a published donation.
   - POST /:id/collect → Mark donation as collected (e.g., after NGO scan).

Middleware Usage:
- auth → Ensures user is authenticated.
- role("DONOR") → Restricts access to donor-specific actions.

This  strictly handles routing and request validation.
It does not contain business logic, maintaining proper separation of concerns
within the layered architecture.
*/