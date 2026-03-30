//Sewni

import {
  fetchPendingNgos,
  approveNgo,
  rejectNgo,
  fetchPendingDonors,
  approveDonor,
  rejectDonor
} from "../services/adminVerificationService.js";
import * as notificationService from "../services/notificationService.js";

/* ================= NGO ================= */

export const getPendingNgoList = async (req, res) => {
  try {
    const data = await fetchPendingNgos();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveNgoController = async (req, res) => {
  try {
    const updated = await approveNgo(req.params.id, req.admin.username);
    
    // Trigger verification approved notification
    await notificationService.triggerVerificationApprovedNotification({
      userId: updated.ngoUsername, // Assuming this maps to user ID
      userType: "NGO",
      approvedBy: req.admin.username
    }).catch((err) => console.error("NGO verification approved notification failed:", err));
    
    res.status(200).json({ message: "NGO verified successfully", updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectNgoController = async (req, res) => {
  try {
    const { reason } = req.body;
    const updated = await rejectNgo(req.params.id, reason, req.admin.username);
    
    // Trigger verification rejected notification
    await notificationService.triggerVerificationRejectedNotification({
      userId: updated.ngoUsername, // Assuming this maps to user ID
      userType: "NGO",
      reason,
      rejectedBy: req.admin.username
    }).catch((err) => console.error("NGO verification rejected notification failed:", err));
    
    res.status(200).json({ message: "NGO rejected", updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= DONOR ================= */

export const getPendingDonorList = async (req, res) => {
  try {
    const data = await fetchPendingDonors();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveDonorController = async (req, res) => {
  try {
    const updated = await approveDonor(req.params.id);
    
    // Trigger verification approved notification
    await notificationService.triggerVerificationApprovedNotification({
      userId: updated.donorUsername, // Assuming this maps to user ID
      userType: "Donor",
      approvedBy: req.admin?.username || "admin"
    }).catch((err) => console.error("Donor verification approved notification failed:", err));
    
    res.status(200).json({ message: "Donor approved", updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectDonorController = async (req, res) => {
  try {
    const { reason } = req.body;
    const updated = await rejectDonor(req.params.id, reason);
    
    // Trigger verification rejected notification
    await notificationService.triggerVerificationRejectedNotification({
      userId: updated.donorUsername, // Assuming this maps to user ID
      userType: "Donor",
      reason: reason || "Requirements not met",
      rejectedBy: req.admin?.username || "admin"
    }).catch((err) => console.error("Donor verification rejected notification failed:", err));
    
    res.status(200).json({ message: "Donor rejected", updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};