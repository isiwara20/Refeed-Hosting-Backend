//Sewni

import {
  createComplaintService,
  getAllComplaintsService,
  getComplaintByIdService,
  updateComplaintStatusService,
  deleteComplaintService,
  getComplaintAnalyticsService
} from "../services/complaintService.js";
import * as notificationService from "../services/notificationService.js";

export const createComplaintController = async (req, res) => {
  try {
    const complaint = await createComplaintService(req.body);
    
    // Trigger complaint created notification
    await notificationService.triggerComplaintCreatedNotification({
      userId: complaint.userId || complaint.username,
      complaintId: complaint._id?.toString(),
      category: complaint.category,
      subject: complaint.subject || complaint.description?.substring(0, 50)
    }).catch((err) => console.error("Complaint created notification failed:", err));
    
    return res.status(201).json(complaint);
  } catch (error) {
    console.error("Create complaint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllComplaintsController = async (req, res) => {
  try {
    const complaints = await getAllComplaintsService(req.query);
    return res.status(200).json(complaints);
  } catch (error) {
    console.error("Fetch complaints error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getComplaintByIdController = async (req, res) => {
  try {
    const complaint = await getComplaintByIdService(req.params.id);

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    return res.status(200).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateComplaintController = async (req, res) => {
  try {
    const updated = await updateComplaintStatusService(req.params.id, req.body);

    if (!updated)
      return res.status(404).json({ message: "Complaint not found" });      
    // Trigger complaint status updated notification
    await notificationService.triggerComplaintStatusUpdatedNotification({
      userId: updated.userId || updated.username,
      complaintId: updated._id?.toString(),
      newStatus: req.body.status,
      previousStatus: updated.previousStatus,
      updatedBy: req.admin?.username || "admin"
    }).catch((err) => console.error("Complaint status updated notification failed:", err));
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteComplaintController = async (req, res) => {
  try {
    const deleted = await deleteComplaintService(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Complaint not found" });

    return res.status(200).json({ message: "Complaint deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const complaintAnalyticsController = async (req, res) => {
  try {
    const data = await getComplaintAnalyticsService();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};