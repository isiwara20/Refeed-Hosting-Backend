import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    eventType: {
      type: String,
      required: true
    },

    channel: {
      type: String,
      enum: ["EMAIL", "SMS", "INAPP"],
      required: true
    },

    subject: {
      type: String
    },

    message: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH"],
      default: "NORMAL"
    },

    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "SUPPRESSED"],
      default: "PENDING"
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date
    },

    retryCount: {
      type: Number,
      default: 0
    },

    metadata: {
      type: Object
    },

    sentAt: {
      type: Date
    },

    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationRule"
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationTemplate"
    },

    scheduledFor: {
      type: Date
    },

    processedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Add indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ eventType: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });

export default mongoose.model("Notification", notificationSchema);
