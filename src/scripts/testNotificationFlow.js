import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Notification from "../models/notification.js";
import NotificationPreference from "../models/notificationPreference.js";
import seedNotificationSystem from "./seedNotificationSystem.js";
import {
  triggerDonationCreatedNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../services/notificationService.js";

// Load environment variables for MONGO_URI
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../config/.env") });

const assertCondition = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  try {
    await connectDB();
    await seedNotificationSystem();

    const userId = new mongoose.Types.ObjectId();
    console.log("Using test userId:", userId.toString());

    // Clean previous test data (if any)
    await Notification.deleteMany({ userId });
    await NotificationPreference.deleteMany({ userId });

    /* =========================
       Scenario 1: Channels ON
    ========================= */
    console.log("\n=== Scenario 1: channels.email + channels.inApp = true ===");

    await NotificationPreference.create({
      userId,
      channels: { email: true, inApp: true },
      events: {
        donationCreated: true,
        donationAccepted: true,
        donationCompleted: true,
        requestCreated: true,
        requestAccepted: true,
        requestCompleted: true
      }
    });

    await triggerDonationCreatedNotification({
      userId,
      donationTitle: "Fresh Bread and Pastries",
      donationId: new mongoose.Types.ObjectId().toString(),
      category: "Bakery",
      quantity: "40 packs",
      location: "Colombo 05",
      metadata: { scenario: 1 }
    });

    let notifications = await Notification.find({ userId }).sort({
      createdAt: 1
    });

    console.log(
      "Notifications after donation-created trigger (expected 2: EMAIL + INAPP):"
    );
    console.log(
      notifications.map((n) => ({
        id: n._id.toString(),
        channel: n.channel,
        isRead: n.isRead,
        status: n.status
      }))
    );

    assertCondition(
      notifications.length === 2,
      `Scenario 1 failed: expected 2 notifications, got ${notifications.length}`
    );
    assertCondition(
      notifications.every((n) => n.status === "SENT"),
      "Scenario 1 failed: expected all notifications to be SENT"
    );
    assertCondition(
      notifications.some((n) => n.channel === "EMAIL") &&
        notifications.some((n) => n.channel === "INAPP"),
      "Scenario 1 failed: expected EMAIL and INAPP channels"
    );

    /* =========================
       Read / Unread Behaviour
    ========================= */
    console.log("\n=== Read / Unread behaviour ===");

    if (notifications[0]) {
      await markNotificationAsRead(notifications[0]._id);
    }

    let afterSingleRead = await Notification.find({ userId }).sort({
      createdAt: 1
    });
    console.log(
      "After markNotificationAsRead on first notification (NotificationPage single read):"
    );
    console.log(
      afterSingleRead.map((n) => ({
        id: n._id.toString(),
        channel: n.channel,
        isRead: n.isRead,
        readAt: n.readAt,
        status: n.status
      }))
    );

    assertCondition(
      afterSingleRead.filter((n) => n.isRead).length === 1,
      "Read behavior failed: expected exactly one notification marked as read after single-read action"
    );

    await markAllNotificationsAsRead(userId);
    let afterAllRead = await Notification.find({ userId }).sort({
      createdAt: 1
    });
    console.log(
      "After markAllNotificationsAsRead (NotificationList 'Mark all as read'):"
    );
    console.log(
      afterAllRead.map((n) => ({
        id: n._id.toString(),
        channel: n.channel,
        isRead: n.isRead,
        readAt: n.readAt,
        status: n.status
      }))
    );

    assertCondition(
      afterAllRead.length === 2 && afterAllRead.every((n) => n.isRead),
      "Read behavior failed: expected all notifications to be marked as read after mark-all action"
    );

    /* =========================
       Scenario 2: Channels OFF
    ========================= */
    console.log("\n=== Scenario 2: channels.email + channels.inApp = false ===");

    await Notification.deleteMany({ userId });
    await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        channels: { email: false, inApp: false }
      },
      { upsert: true, returnDocument: "after" }
    );

    await triggerDonationCreatedNotification({
      userId,
      donationTitle: "Cooked Rice Meals",
      donationId: new mongoose.Types.ObjectId().toString(),
      category: "Prepared Meals",
      quantity: "80 portions",
      location: "Kandy Town",
      metadata: { scenario: 2 }
    });

    const afterSuppressed = await Notification.find({ userId }).sort({
      createdAt: 1
    });
    const suppressedCount = afterSuppressed.filter(
      (n) => n.status === "SUPPRESSED"
    ).length;

    console.log(
      "Notifications when both channels are disabled (expected 2 SUPPRESSED):",
      afterSuppressed.map((n) => ({
        id: n._id.toString(),
        channel: n.channel,
        status: n.status
      }))
    );

    if (suppressedCount === 2) {
      console.log(
        "✅ Preferences successfully suppressed delivery for all donation-created notifications."
      );
    } else {
      console.log(
        `⚠️ Expected 2 SUPPRESSED notifications, got ${suppressedCount}. Inspect data above.`
      );
    }

    assertCondition(
      afterSuppressed.length === 2,
      `Scenario 2 failed: expected 2 notifications, got ${afterSuppressed.length}`
    );
    assertCondition(
      suppressedCount === 2,
      `Scenario 2 failed: expected 2 SUPPRESSED notifications, got ${suppressedCount}`
    );

    console.log("✅ All assertions passed");
  } catch (err) {
    console.error("Test notification flow failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();

