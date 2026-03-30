// Import all foodrequest-related service functions

import * as service from "../services/foodRequestService.js";
import * as notificationService from "../services/notificationService.js";

//create request
export const createRequest = async (req, res) => {
  try {
    const result = await service.createFoodRequest(req.body); 
    
    await notificationService.sendInAppNotificationToUsername({
      username: result.request.username,
      eventType: "FOOD_REQUEST_CREATED",
      subject: "Food request submitted",
      message: `Your food request for ${result.request.category} items was submitted successfully.`,
      metadata: {
        requestId: result.request._id?.toString(),
        category: result.request.category,
        urgencyLevel: result.request.urgencyLevel
      }
    }).catch((err) => console.error("Food request created notification failed:", err));
    
    res.status(201).json({
      message: "Food request submitted",
      available: result.availability.available,
      donations: result.availability.donations,
      request: result.request
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// Update request
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await service.updateFoodRequest(id, req.body);
    
    await notificationService.sendInAppNotificationToUsername({
      username: updated.username,
      eventType: "FOOD_REQUEST_UPDATED",
      subject: "Food request updated",
      message: `Your request has been updated (${Object.keys(req.body).join(", ") || "details"}).`,
      metadata: {
        requestId: updated._id?.toString(),
        changes: Object.keys(req.body)
      }
    }).catch((err) => console.error("Food request updated notification failed:", err));
    
    res.status(200).json({ message: "Request updated", data: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete request
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await service.deleteFoodRequest(id);

    await notificationService.sendInAppNotificationToUsername({
      username: deleted?.username,
      eventType: "FOOD_REQUEST_DELETED",
      subject: "Food request deleted",
      message: "Your food request was deleted successfully.",
      metadata: {
        requestId: deleted?._id?.toString(),
        category: deleted?.category
      }
    }).catch((err) => console.error("Food request delete notification failed:", err));

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//displaying all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await service.fetchAllRequests(); 
    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//display all based on username
export const getRequestsByUsername = async (req, res) => {
  try {
    const { username } = req.params; 
    const requests = await service.fetchRequestsByUsername(username);
    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};