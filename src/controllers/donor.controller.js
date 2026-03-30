import { DonorService } from "../services/donor.service.js";
import * as notificationService from "../services/notificationService.js";

export const DonorController = {
  createProfile: async (req, res, next) => {
    try {
      const profile = await DonorService.createProfile(req.user.username, req.body);

      await notificationService
        .sendInAppNotificationToUsername({
          username: req.user.username,
          role: req.user.role,
          eventType: "DONOR_PROFILE_CREATED",
          subject: "Profile created",
          message: "Your donor profile has been created.",
          metadata: { username: req.user.username },
        })
        .catch((err) => console.error("Donor profile create notification failed:", err));

      res.status(201).json(profile);
    } catch (err) { next(err); }
  },

  getProfile: async (req, res, next) => {
    try {
      const profile = await DonorService.getProfile(req.params.username);
      res.json(profile);
    } catch (err) { next(err); }
  },


deleteProfile: async (req, res, next) => {
  try {
    const result = await DonorService.deleteProfile(req.params.username);

    await notificationService
      .sendInAppNotificationToUsername({
        username: req.params.username,
        role: "DONOR",
        eventType: "DONOR_PROFILE_SOFT_DELETED",
        subject: "Profile deactivated",
        message: "Your donor profile was deactivated.",
        metadata: { username: req.params.username },
      })
      .catch((err) => console.error("Donor soft-delete notification failed:", err));

    res.json({ message: "Donor soft-deleted ", result });
  } catch (err) {
    next(err);
  }
},


hardDeleteProfile: async (req, res, next) => {
  try {
    const result = await DonorService.hardDeleteProfile(req.params.username);

    await notificationService
      .sendInAppNotificationToUsername({
        username: req.params.username,
        role: "DONOR",
        eventType: "DONOR_PROFILE_HARD_DELETED",
        subject: "Profile permanently deleted",
        message: "Your donor profile was permanently deleted.",
        metadata: { username: req.params.username },
      })
      .catch((err) => console.error("Donor hard-delete notification failed:", err));

    res.json({ message: "Donor permanently deleted ", result });
  } catch (err) {
    next(err);
  }
},

  updateProfile: async (req, res, next) => {
    try {
      const profile = await DonorService.updateProfile(req.user.username, req.body);

      await notificationService
        .sendInAppNotificationToUsername({
          username: req.user.username,
          role: req.user.role,
          eventType: "DONOR_PROFILE_UPDATED",
          subject: "Profile updated",
          message: "Your donor profile details were updated.",
          metadata: {
            username: req.user.username,
            updatedFields: Object.keys(req.body || {}),
          },
        })
        .catch((err) => console.error("Donor profile update notification failed:", err));

      res.json(profile);
    } catch (err) { next(err); }
  },

  approveVerification: async (req, res, next) => {
    try {
      const profile = await DonorService.approveVerification(req.params.username);
      res.json(profile);
    } catch (err) { next(err); }
  },
};


/*


This handles HTTP requests related to Donor profiles.
It receives client requests, extracts necessary data from the request object,
calls the DonorService for business logic processing,
and sends JSON responses back to the client.

Data Flow:
Client → DonorController → DonorService → DonorRepository → Database → Response

Responsibilities:

1. createProfile:
   - Uses authenticated user (req.user.username).
   - Passes request body to service.
   - Returns 201 Created with profile data.

2. getProfile:
   - Retrieves profile using username from URL parameters.
   - Returns profile data in JSON format.

3. updateProfile:
   - Updates profile of authenticated user.
   - Sends updated profile as response.

4. approveVerification:
   - Approves verification for a specific username.
   - Returns updated profile.

This layer:
- Contains no business logic.
- Handles request/response lifecycle.
- Delegates validation and rules to the service layer.
- Forwards errors to Express error-handling middleware using next(err).

It acts as the interface between HTTP requests and the application’s business logic.
*/