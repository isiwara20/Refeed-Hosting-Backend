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
      userId: updated.ngoId?.username || updated.ngoId, // Use populated ngoId username
      userType: "NGO",
      approvedBy: req.admin.username
    }).catch((err) => console.error("NGO verification approved notification failed:", err));

    await notificationService.notifyAllAdminsVerificationDecision({
      decision: "approved",
      targetType: "NGO",
      targetUsername: updated.ngoId?.username || updated.ngoUsername || "",
      actedBy: req.admin.username
    }).catch((err) => console.error("Admin broadcast for NGO approval failed:", err));
    
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
      userId: updated.ngoId?.username || updated.ngoId, // Use populated ngoId username
      userType: "NGO",
      reason,
      rejectedBy: req.admin.username
    }).catch((err) => console.error("NGO verification rejected notification failed:", err));

    await notificationService.notifyAllAdminsVerificationDecision({
      decision: "rejected",
      targetType: "NGO",
      targetUsername: updated.ngoId?.username || updated.ngoUsername || "",
      actedBy: req.admin.username,
      reason
    }).catch((err) => console.error("Admin broadcast for NGO rejection failed:", err));
    
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
      userId: updated.username, // Use username field from DonorProfile
      userType: "Donor",
      approvedBy: req.admin?.username || "admin"
    }).catch((err) => console.error("Donor verification approved notification failed:", err));

    await notificationService.notifyAllAdminsVerificationDecision({
      decision: "approved",
      targetType: "Donor",
      targetUsername: updated.username || "",
      actedBy: req.admin?.username || "admin"
    }).catch((err) => console.error("Admin broadcast for donor approval failed:", err));
    
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
      userId: updated.username, // Use username field from DonorProfile
      userType: "Donor",
      reason: reason || "Requirements not met",
      rejectedBy: req.admin?.username || "admin"
    }).catch((err) => console.error("Donor verification rejected notification failed:", err));

    await notificationService.notifyAllAdminsVerificationDecision({
      decision: "rejected",
      targetType: "Donor",
      targetUsername: updated.username || "",
      actedBy: req.admin?.username || "admin",
      reason: reason || "Requirements not met"
    }).catch((err) => console.error("Admin broadcast for donor rejection failed:", err));
    
    res.status(200).json({ message: "Donor rejected", updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};