import Notification from "../models/notification.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import NotificationPreference from "../models/notificationPreference.js";
import * as notificationService from "../services/notificationService.js";

/* =========================
   Send Notification
========================= */

export const sendNotification = async (req, res) => {
  try {
    const result = await notificationService.sendNotification(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   Notification History
========================= */

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly, limit, skip } = req.query;

    const data = await notificationService.getUserNotifications(userId, {
      unreadOnly: unreadOnly === "true",
      limit,
      skip
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const result = await notificationService.getUnreadNotificationCount(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllNotifications = async (req, res) => {
  const data = await notificationService.getAllNotifications();
  res.json(data);
};

/* =========================
   Read / Unread Management
========================= */

export const markAsRead = async (req, res) => {
  try {
    const updated = await notificationService.markNotificationAsRead(
      req.params.id
    );
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const result = await notificationService.markAllNotificationsAsRead(
      userId
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   Retry Failed
========================= */

export const retryFailed = async (req, res) => {
  const count = await notificationService.retryFailedNotifications();
  res.json({ retried: count });
};

/* =========================
   Template CRUD
========================= */

export const createTemplate = async (req, res) => {
  const t = await NotificationTemplate.create(req.body);
  res.status(201).json(t);
};

export const getTemplates = async (req, res) => {
  res.json(await NotificationTemplate.find());
};

export const updateTemplate = async (req, res) => {
  const t = await NotificationTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(t);
};

export const deleteTemplate = async (req, res) => {
  await NotificationTemplate.findByIdAndDelete(req.params.id);
  res.json({ message: "Template deleted" });
};

/* =========================
   Preferences CRUD
========================= */

export const upsertPreference = async (req, res) => {
  const pref = await NotificationPreference.findOneAndUpdate(
    { userId: req.body.userId },
    req.body,
    { upsert: true, new: true }
  );
  res.json(pref);
};

export const getPreference = async (req, res) => {
  const pref = await NotificationPreference.findOne({
    userId: req.params.userId
  });
  res.json(pref);
};
