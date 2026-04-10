import Notification from "../models/notification.js";
import NotificationPreference from "../models/notificationPreference.js";
import NotificationRule from "../models/NotificationRule.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import Donator from "../models/Donator.js";
import Ngo from "../models/Ngo.js";
import Admin from "../models/Admin.js";
import RuleEngine from "./ruleEngine.js";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

/* =========================
   Preference Helpers
========================= */

const PRIORITY_ORDER = ["LOW", "NORMAL", "HIGH"];

const EVENT_TYPE_TO_PREF_KEY = {
  USER_REGISTRATION: "userRegistration",
  ADMIN_REGISTERED: "adminRegistered",
  PASSWORD_RESET_SUCCESS: "passwordResetSuccess",

  DONATION_CREATED: "donationCreated",
  REQUEST_ACCEPTED: "requestAccepted",
  DONATION_COMPLETED: "donationCompleted",

  VERIFICATION_SUBMITTED: "verificationSubmitted",
  VERIFICATION_APPROVED: "verificationApproved",
  VERIFICATION_REJECTED: "verificationRejected",

  FOOD_REQUEST_CREATED: "foodRequestCreated",
  FOOD_REQUEST_UPDATED: "foodRequestUpdated",
  FOOD_REQUEST_DELETED: "foodRequestDeleted",

  DONATION_ORDER_CREATED: "donationOrderCreated",
  DONATION_ORDER_STATUS_CHANGED: "donationOrderStatusChanged",
  DONATION_ORDER_CANCELLED: "donationOrderCancelled",

  COMPLAINT_CREATED: "complaintCreated",
  COMPLAINT_STATUS_UPDATED: "complaintStatusUpdated",

  NEW_MESSAGE: "newMessage",

  SURPLUS_DRAFT_CREATED: "surplusDraftCreated",
  SURPLUS_PUBLISHED: "surplusPublished",
  SURPLUS_RESERVED: "surplusReserved",
  SURPLUS_COMPLETED: "surplusCompleted",
  SURPLUS_COLLECTED: "surplusCollected",

  DONOR_PROFILE_CREATED: "donorProfileCreated",
  DONOR_PROFILE_UPDATED: "donorProfileUpdated",
  DONOR_PROFILE_SOFT_DELETED: "donorProfileSoftDeleted",
  DONOR_PROFILE_HARD_DELETED: "donorProfileHardDeleted",

  ADDRESS_CREATED: "addressCreated",
  ADDRESS_UPDATED: "addressUpdated",
  ADDRESS_DELETED: "addressDeleted"
};

const shouldSendBasedOnPreference = async ({
  userId,
  channel,
  priority,
  eventType
}) => {
  if (!userId) {
    return true;
  }

  try {
    const pref = await NotificationPreference.findOne({ userId });

    // No preferences stored -> allow all notifications
    if (!pref) {
      return true;
    }

    // Channel-level filtering
    //
    // We support both:
    // - legacy array-based config: channels: ["EMAIL", "INAPP"]
    // - current object-based config used by the frontend:
    //   channels: { email: true/false, inApp: true/false }
    if (Array.isArray(pref.channels) && pref.channels.length > 0) {
      if (!pref.channels.includes(channel)) {
        return false;
      }
    } else if (
      pref.channels &&
      typeof pref.channels === "object"
    ) {
      const { email = true, inApp = true } = pref.channels;

      if (channel === "EMAIL" && !email) {
        return false;
      }

      if (channel === "INAPP" && !inApp) {
        return false;
      }
    }

    // Priority threshold filtering
    if (pref.minPriority) {
      const prefIndex = PRIORITY_ORDER.indexOf(pref.minPriority);
      const currentIndex = PRIORITY_ORDER.indexOf(priority);

      if (prefIndex !== -1 && currentIndex !== -1 && currentIndex < prefIndex) {
        return false;
      }
    }

    // Event-type filtering
    if (eventType && pref.events && typeof pref.events === "object") {
      const key = EVENT_TYPE_TO_PREF_KEY[eventType];
      if (key && pref.events[key] === false) {
        return false;
      }
    }

    // TODO: quietHours filtering can be added here later

    return true;
  } catch (error) {
    console.error("Preference check failed, allowing notification by default:", error.message);
    return true;
  }
};

/* =========================
   Channel Strategies
========================= */

const emailSender = async (data) => {
  console.log("📧 Sending EMAIL:", data.subject);
  // integrate nodemailer later
};

const smsSender = async (data) => {
  console.log("📱 Sending SMS:", data.message);
  // integrate SMS gateway later
};

const inAppSender = async (data) => {
  console.log("🔔 Creating IN-APP notification");
  // In-app notifications are persisted via the Notification model,
  // so this channel does not need to call any external provider.
};

const channelMap = {
  EMAIL: emailSender,
  SMS: smsSender,
  INAPP: inAppSender
};

/* =========================
   Core Rule-Based Notification Function
========================= */

/**
 * Process notification using rule engine
 * @param {Object} context - Event context
 * @param {string} context.eventType - Type of event that triggered notification
 * @param {Object} context.user - User object
 * @param {Object} context.data - Event-specific data for template variables
 */
export const processNotificationEvent = async (context) => {
  try {
    // Validate context
    if (!context.eventType) {
      throw new Error("eventType is required");
    }

    // Evaluate rules to determine actions
    const actions = await RuleEngine.evaluateRules(context);
    
    if (actions.length === 0) {
      console.log(`No applicable rules found for event: ${context.eventType}`);
      return [];
    }

    // Process actions and create notifications
    const results = await RuleEngine.processActions(actions, context);
    
    // Send notifications through appropriate channels
    for (const notificationGroup of results) {
      if (Array.isArray(notificationGroup)) {
        for (const notification of notificationGroup) {
          await executeChannelSender(notification);
        }
      } else if (notificationGroup) {
        await executeChannelSender(notificationGroup);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Rule-based notification processing failed:", error);
    throw error;
  }
};

/**
 * Execute channel-specific sending logic
 */
const executeChannelSender = async (notification) => {
  try {
    const sender = channelMap[notification.channel];
    if (!sender) {
      console.error(`Invalid channel: ${notification.channel}`);
      return;
    }

    // Check user preferences
    const allowed = await shouldSendBasedOnPreference({
      userId: notification.userId,
      channel: notification.channel,
      priority: notification.priority,
      eventType: notification.eventType
    });

    if (!allowed) {
      await Notification.findByIdAndUpdate(notification._id, {
        status: "SUPPRESSED",
        metadata: {
          ...notification.metadata,
          suppressReason: "User preferences"
        }
      });
      return;
    }

    // Send through channel
    await sender({
      subject: notification.subject,
      message: notification.message
    });

    // Update status to sent
    await Notification.findByIdAndUpdate(notification._id, {
      status: "SENT",
      sentAt: new Date()
    });

  } catch (error) {
    console.error(`Channel execution failed for ${notification.channel}:`, error);
    
    // Update status to failed
    await Notification.findByIdAndUpdate(notification._id, {
      status: "FAILED",
      $inc: { retryCount: 1 },
      metadata: {
        ...notification.metadata,
        error: error.message
      }
    });
  }
};

const resolveUserByUsernameAndRole = async ({ username, role }) => {
  if (!username) return null;

  const normalizedRole = String(role || "").toUpperCase();

  if (normalizedRole === "DONOR" || normalizedRole === "DONATOR") {
    return Donator.findOne({ username }).select("_id username role");
  }

  if (normalizedRole === "NGO") {
    return Ngo.findOne({ username }).select("_id username role");
  }

  if (normalizedRole === "ADMIN") {
    return Admin.findOne({ username }).select("_id username role");
  }

  // Role unknown: try common user collections.
  const [donator, ngo, admin] = await Promise.all([
    Donator.findOne({ username }).select("_id username role"),
    Ngo.findOne({ username }).select("_id username role"),
    Admin.findOne({ username }).select("_id username role")
  ]);

  return donator || ngo || admin || null;
};

export const sendInAppNotificationToUsername = async ({
  username,
  role,
  eventType,
  subject,
  message,
  priority = "NORMAL",
  metadata = {}
}) => {
  const user = await resolveUserByUsernameAndRole({ username, role });

  if (!user?._id) {
    return null;
  }

  return sendNotification({
    userId: user._id,
    eventType,
    channel: "INAPP",
    subject,
    message,
    priority,
    metadata
  });
};

/* =========================
   Legacy Support Functions (Deprecated - Use processNotificationEvent instead)
========================= */

export const sendNotification = async ({
  userId,
  eventType,
  channel,
  subject,
  message,
  priority = "NORMAL",
  metadata = {}
}) => {
  try {
    const sender = channelMap[channel];
    if (!sender) throw new Error("Invalid channel");

    const allowed = await shouldSendBasedOnPreference({
      userId,
      channel,
      priority,
      eventType
    });

    if (!allowed) {
      console.log(
        `Notification skipped by preferences for user ${userId} on channel ${channel}`
      );
      return null;
    }

    await sender({ subject, message });

    const record = await Notification.create({
      userId,
      eventType,
      channel,
      subject,
      message,
      priority,
      status: "SENT",
      metadata,
      sentAt: new Date()
    });

    return record;

  } catch (error) {
    console.error("Notification failed:", error.message);

    return Notification.create({
      userId,
      eventType,
      channel,
      subject,
      message,
      priority,
      status: "FAILED",
      metadata
    });
  }
};

/* =========================
   Retry Failed
========================= */

export const retryFailedNotifications = async (limit = 3) => {
  const failed = await Notification.find({
    status: "FAILED",
    retryCount: { $lt: limit }
  });

  for (const n of failed) {
    try {
      await channelMap[n.channel]({
        subject: n.subject,
        message: n.message
      });

      n.status = "SENT";
      n.sentAt = new Date();
      await n.save();

    } catch {
      n.retryCount += 1;
      await n.save();
    }
  }

  return failed.length;
};

/* =========================
   Donation / Request Events
========================= */

export const triggerDonationCreatedNotification = async ({
  userId,
  donationTitle,
  donationId,
  category,
  quantity,
  location
}) => {
  return await processNotificationEvent({
    eventType: "DONATION_CREATED",
    user: { _id: userId },
    data: {
      donationTitle,
      donationId,
      category,
      quantity,
      location
    }
  });
};

export const triggerRequestAcceptedNotification = async ({
  userId,
  requestTitle,
  requestId,
  acceptedBy
}) => {
  return await processNotificationEvent({
    eventType: "REQUEST_ACCEPTED",
    user: { _id: userId },
    data: {
      requestTitle,
      requestId,
      acceptedBy
    }
  });
};

export const triggerDonationCompletedNotification = async ({
  userId,
  donationTitle,
  donationId,
  completedBy
}) => {
  return await processNotificationEvent({
    eventType: "DONATION_COMPLETED",
    user: { _id: userId },
    data: {
      donationTitle,
      donationId,
      completedBy
    }
  });
};

/* =========================
   User Registration & Auth 
========================= */

export const triggerUserRegistrationNotification = async ({
  userId,
  username,
  userType,
  email
}) => {
  return await processNotificationEvent({
    eventType: "USER_REGISTRATION",
    user: { _id: userId, userType },
    data: {
      username,
      userType,
      email
    }
  });
};

/* =========================
   Verification Notifications
========================= */

export const triggerVerificationApprovedNotification = async ({
  userId,
  userType,
  approvedBy
}) => {
  return await processNotificationEvent({
    eventType: "VERIFICATION_APPROVED",
    user: { _id: userId, userType },
    data: {
      userType,
      approvedBy
    }
  });
};

export const triggerVerificationRejectedNotification = async ({
  userId,
  userType,
  reason,
  rejectedBy
}) => {
  return await processNotificationEvent({
    eventType: "VERIFICATION_REJECTED",
    user: { _id: userId, userType },
    data: {
      userType,
      reason,
      rejectedBy
    }
  });
};

export const notifyAllAdminsInApp = async ({
  eventType,
  subject,
  message,
  priority = "HIGH",
  metadata = {}
}) => {
  const admins = await Admin.find({}).select("_id username");
  if (!admins.length) {
    return [];
  }

  return Promise.allSettled(
    admins.map((admin) =>
      sendNotification({
        userId: admin._id,
        eventType,
        channel: "INAPP",
        subject,
        message,
        priority,
        metadata: {
          audience: "admins",
          ...metadata
        }
      })
    )
  );
};

export const notifyAllAdminsVerificationDecision = async ({
  decision,
  targetType,
  targetUsername,
  actedBy,
  reason
}) => {
  const normalizedDecision = String(decision || "").toLowerCase();
  const isApproved = normalizedDecision === "approved";
  const eventType = isApproved ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED";
  const actor = actedBy || "admin";
  const entityLabel = String(targetType || "user").toUpperCase();
  const subject = isApproved
    ? `${entityLabel} verification approved`
    : `${entityLabel} verification rejected`;
  const message = isApproved
    ? `${entityLabel} account ${targetUsername || "(unknown)"} was approved by ${actor}.`
    : `${entityLabel} account ${targetUsername || "(unknown)"} was rejected by ${actor}.${reason ? ` Reason: ${reason}` : ""}`;

  const admins = await Admin.find({}).select("_id username");
  if (!admins.length) {
    return [];
  }

  return Promise.allSettled(
    admins.map((admin) =>
      sendNotification({
        userId: admin._id,
        eventType,
        channel: "INAPP",
        subject,
        message,
        priority: "HIGH",
        metadata: {
          audience: "admins",
          decision: normalizedDecision,
          targetType: entityLabel,
          targetUsername: targetUsername || "",
          actedBy: actor,
          reason: reason || ""
        }
      })
    )
  );
};

/* =========================
   Food Request Notifications
========================= */

export const triggerFoodRequestCreatedNotification = async ({
  userId,
  requestTitle,
  requestId,
  category,
  quantity
}) => {
  return await processNotificationEvent({
    eventType: "FOOD_REQUEST_CREATED",
    user: { _id: userId },
    data: {
      requestTitle,
      requestId,
      category,
      quantity
    }
  });
};

export const triggerFoodRequestUpdatedNotification = async ({
  userId,
  requestTitle,
  requestId,
  changes
}) => {
  return await processNotificationEvent({
    eventType: "FOOD_REQUEST_UPDATED",
    user: { _id: userId },
    data: {
      requestTitle,
      requestId,
      changes
    }
  });
};

/* =========================
   Donation Order Notifications
========================= */

export const triggerDonationOrderCreatedNotification = async ({
  donorId,
  ngoId,
  donationTitle,
  donationId,
  orderId
}) => {
  // Notify donor
  await processNotificationEvent({
    eventType: "DONATION_ORDER_CREATED",
    user: { _id: donorId },
    data: {
      donationTitle,
      donationId,
      orderId,
      userRole: "donor"
    }
  });
  
  // Notify NGO
  return await processNotificationEvent({
    eventType: "DONATION_ORDER_CREATED",
    user: { _id: ngoId },
    data: {
      donationTitle,
      donationId,
      orderId,
      userRole: "ngo"
    }
  });
};

export const triggerDonationOrderStatusChangedNotification = async ({
  userId,
  donationTitle,
  orderId,
  newStatus,
  previousStatus
}) => {
  return await processNotificationEvent({
    eventType: "DONATION_ORDER_STATUS_CHANGED",
    user: { _id: userId },
    data: {
      donationTitle,
      orderId,
      newStatus,
      previousStatus
    }
  });
};

export const triggerDonationOrderCancelledNotification = async ({
  userId,
  donationTitle,
  orderId,
  cancelReason
}) => {
  return await processNotificationEvent({
    eventType: "DONATION_ORDER_CANCELLED",
    user: { _id: userId },
    data: {
      donationTitle,
      orderId,
      cancelReason
    }
  });
};

/* =========================
   Complaint Notifications
========================= */

export const triggerComplaintCreatedNotification = async ({
  userId,
  complaintId,
  category,
  subject
}) => {
  return await processNotificationEvent({
    eventType: "COMPLAINT_CREATED",
    user: { _id: userId },
    data: {
      complaintId,
      category,
      subject
    }
  });
};

export const triggerComplaintStatusUpdatedNotification = async ({
  userId,
  complaintId,
  newStatus,
  previousStatus,
  updatedBy
}) => {
  return await processNotificationEvent({
    eventType: "COMPLAINT_STATUS_UPDATED",
    user: { _id: userId },
    data: {
      complaintId,
      newStatus,
      previousStatus,
      updatedBy
    }
  });
};

/* =========================
   History Queries
========================= */

export const getUserNotifications = async (
  userId,
  { unreadOnly = false, limit = 20, skip = 0 } = {}
) => {
  const parsedLimit = Number.parseInt(limit, 10);
  const parsedSkip = Number.parseInt(skip, 10);

  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 20;
  const safeSkip = Number.isFinite(parsedSkip) && parsedSkip > 0
    ? parsedSkip
    : 0;

  if (!isValidObjectId(userId)) {
    return {
      notifications: [],
      pagination: {
        total: 0,
        limit: safeLimit,
        skip: safeSkip,
        hasMore: false
      },
      unreadCount: 0
    };
  }

  const query = { userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(safeSkip)
      .limit(safeLimit),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, isRead: false })
  ]);

  return {
    notifications,
    pagination: {
      total,
      limit: safeLimit,
      skip: safeSkip,
      hasMore: safeSkip + notifications.length < total
    },
    unreadCount
  };
};

export const getAllNotifications = () =>
  Notification.find().sort({ createdAt: -1 });

export const getUnreadNotificationCount = async (userId) => {
  if (!isValidObjectId(userId)) {
    return { unreadCount: 0 };
  }
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { unreadCount };
};

/* =========================
   Read / Unread Helpers
========================= */

export const markNotificationAsRead = async (id) => {
  const notification = await Notification.findById(id);

  // Not found at all
  if (!notification) {
    return null;
  }

  // Already read -> idempotent: return as-is
  if (notification.isRead) {
    return notification;
  }

  // Transition from unread to read
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

export const markAllNotificationsAsRead = async (userId) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!isValidObjectId(userId)) {
    return { modifiedCount: 0 };
  }

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return { modifiedCount: result.modifiedCount };
};
