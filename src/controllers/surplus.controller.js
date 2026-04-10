import { SurplusService } from "../services/surplus.service.js";
import { generateQRCode } from "../utils/qr.service.js";
import * as notificationService from "../services/notificationService.js";

export const SurplusController = {
    // Create draft donation
  createDraft: async (req, res, next) => {
    try {
      const result = await SurplusService.createDraft(req.user.username, req.body);
      await notificationService.sendInAppNotificationToUsername({
        username: req.user.username,
        role: req.user.role,
        eventType: "SURPLUS_DRAFT_CREATED",
        subject: "Draft saved",
        message: "Your surplus donation draft was saved.",
        metadata: { donationId: result._id?.toString(), status: result.lifecycleStatus }
      }).catch((err) => console.error("Surplus draft notification failed:", err));
      res.status(201).json(result);
    } catch (e) { next(e); }
  },

    // Publish donation
  publish: async (req, res, next) => {
    
    try {
      const result = await SurplusService.publish(req.params.id);
      await notificationService.sendInAppNotificationToUsername({
        username: result.donorUsername,
        role: "DONOR",
        eventType: "SURPLUS_PUBLISHED",
        subject: "Donation published",
        message: "Your surplus donation is now visible for NGOs.",
        metadata: { donationId: result._id?.toString(), status: result.lifecycleStatus }
      }).catch((err) => console.error("Surplus publish notification failed:", err));
      res.json(result);
    } catch (e) { next(e); }
  },


  reserveDonation: async (req, res, next) => {
    try {
      const result = await SurplusService.reserveDonation(req.params.id);
      await notificationService.sendInAppNotificationToUsername({
        username: result.donorUsername,
        role: "DONOR",
        eventType: "SURPLUS_RESERVED",
        subject: "Donation reserved",
        message: "An NGO has reserved your donation.",
        metadata: {
          donationId: result._id?.toString(),
          status: result.lifecycleStatus,
          reservedBy: req.user?.username || "unknown"
        }
      }).catch((err) => console.error("Surplus reserve notification failed:", err));
      res.json(result);
    } catch (e) { next(e); }
  },

  listMine: async (req, res, next) => {
    try {
      const result = await SurplusService.getMyDonations(req.user.username);
      res.json(result);
    } catch (e) { next(e); }
  },


  // Generate QR code for donation
  getQRCode: async (req, res, next) => {
    try {
      const qr = await generateQRCode(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/surplus/complete/${req.params.id}`
      );
      res.json({ qr });
    } catch (e) { next(e); }
  },
    

    markComplete: async (req, res, next) => {
    try {
      const donation = await SurplusService.markComplete(req.params.id);
      await notificationService.sendInAppNotificationToUsername({
        username: donation.donorUsername,
        role: "DONOR",
        eventType: "SURPLUS_COMPLETED",
        subject: "Donation completed",
        message: "Your donation lifecycle is now completed.",
        metadata: { donationId: donation._id?.toString(), status: donation.lifecycleStatus }
      }).catch((err) => console.error("Surplus complete notification failed:", err));
      res.json(donation);
    } catch (e) { next(e); }
  },


  markCollected: async (req, res, next) => {
  try {
    const result = await SurplusService.markCollected(req.params.id);
    await notificationService.sendInAppNotificationToUsername({
      username: result.donorUsername,
      role: "DONOR",
      eventType: "SURPLUS_COLLECTED",
      subject: "Donation collected",
      message: "Your donation was marked as collected.",
      metadata: { donationId: result._id?.toString(), status: result.lifecycleStatus }
    }).catch((err) => console.error("Surplus collected notification failed:", err));
    res.json(result);
  } catch (e) { next(e); }
},


};






