import Donation from "../models/Donation.js";
import * as notificationService from "../services/notificationService.js";

export const createDonation = async (req, res) => {
  try {
    const { donatorId, title, description, category, quantity, location, expiresAt } =
      req.body;
    if (!donatorId || !title || !quantity) {
      return res
        .status(400)
        .json({ message: "donatorId, title, and quantity are required" });
    }
    const donation = await Donation.create({
      donatorId,
      title,
      description: description || "",
      category: category || "other",
      quantity,
      location: location || "",
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    await notificationService.triggerDonationCreatedNotification({
      userId: donatorId,
      donationTitle: donation.title,
      donationId: donation._id.toString(),
      category: donation.category,
      quantity: donation.quantity,
      location: donation.location
    }).catch((err) => console.error("Donation created notification failed:", err));
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create donation" });
  }
};

export const listDonations = async (req, res) => {
  try {
    const { status, donatorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (donatorId) filter.donatorId = donatorId;
    const donations = await Donation.find(filter)
      .populate("donatorId", "name username email phone")
      .populate("acceptedBy", "name username email phone")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to list donations" });
  }
};

export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donatorId", "name username email phone")
      .populate("acceptedBy", "name username email phone");
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get donation" });
  }
};

export const acceptDonation = async (req, res) => {
  try {
    const { ngoId } = req.body;
    if (!ngoId) {
      return res.status(400).json({ message: "ngoId is required" });
    }
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (donation.status !== "AVAILABLE") {
      return res
        .status(400)
        .json({ message: "Donation is no longer available" });
    }
    donation.status = "ACCEPTED";
    donation.acceptedBy = ngoId;
    await donation.save();
    await donation.populate("donatorId", "name username");
    await donation.populate("acceptedBy", "name username email phone");
    await notificationService.triggerRequestAcceptedNotification({
      userId: donation.donatorId._id,
      message: `An NGO has accepted your donation "${donation.title}". They will contact you to arrange pickup.`,
      metadata: { donationId: donation._id.toString(), ngoId },
    }).catch((err) => console.error("Request accepted notification failed:", err));
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to accept donation" });
  }
};

export const completeDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (donation.status !== "ACCEPTED") {
      return res
        .status(400)
        .json({ message: "Only accepted donations can be completed" });
    }
    donation.status = "COMPLETED";
    await donation.save();
    await donation.populate("donatorId", "name username");
    await donation.populate("acceptedBy", "name username");
    await notificationService.triggerDonationCompletedNotification({
      userId: donation.donatorId._id,
      message: `Donation "${donation.title}" has been completed. Thank you for reducing food waste!`,
      metadata: { donationId: donation._id.toString() },
    }).catch((err) => console.error("Donation completed notification failed:", err));
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to complete donation" });
  }
};
