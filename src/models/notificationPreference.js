import mongoose from "mongoose";

/**
 * Notification preferences for a single user.
 *
 * NOTE:
 * - This schema supports channel toggles and per-event toggles for the
 *   full notification catalog used by controllers/services.
 */
const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    // Channel-level toggles. These apply to all events unless further
    // narrowed down by the `events` config (when we add event-type filtering).
    channels: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },

    // Per-event toggles for the full system event catalog.
    events: {
      userRegistration: {
        type: Boolean,
        default: true
      },
      adminRegistered: {
        type: Boolean,
        default: true
      },
      passwordResetSuccess: {
        type: Boolean,
        default: true
      },
      donationCreated: {
        type: Boolean,
        default: true
      },
      requestAccepted: {
        type: Boolean,
        default: true
      },
      donationCompleted: {
        type: Boolean,
        default: true
      },
      verificationSubmitted: {
        type: Boolean,
        default: true
      },
      verificationApproved: {
        type: Boolean,
        default: true
      },
      verificationRejected: {
        type: Boolean,
        default: true
      },
      foodRequestCreated: {
        type: Boolean,
        default: true
      },
      foodRequestUpdated: {
        type: Boolean,
        default: true
      },
      foodRequestDeleted: {
        type: Boolean,
        default: true
      },
      donationOrderCreated: {
        type: Boolean,
        default: true
      },
      donationOrderStatusChanged: {
        type: Boolean,
        default: true
      },
      donationOrderCancelled: {
        type: Boolean,
        default: true
      },
      complaintCreated: {
        type: Boolean,
        default: true
      },
      complaintStatusUpdated: {
        type: Boolean,
        default: true
      },
      newMessage: {
        type: Boolean,
        default: true
      },
      surplusDraftCreated: {
        type: Boolean,
        default: true
      },
      surplusPublished: {
        type: Boolean,
        default: true
      },
      surplusReserved: {
        type: Boolean,
        default: true
      },
      surplusCompleted: {
        type: Boolean,
        default: true
      },
      surplusCollected: {
        type: Boolean,
        default: true
      },
      donorProfileCreated: {
        type: Boolean,
        default: true
      },
      donorProfileUpdated: {
        type: Boolean,
        default: true
      },
      donorProfileSoftDeleted: {
        type: Boolean,
        default: true
      },
      donorProfileHardDeleted: {
        type: Boolean,
        default: true
      },
      addressCreated: {
        type: Boolean,
        default: true
      },
      addressUpdated: {
        type: Boolean,
        default: true
      },
      addressDeleted: {
        type: Boolean,
        default: true
      }
    },

    // Optional: quiet hours (not enforced yet)
    quietHours: {
      from: String,
      to: String
    },

    // Optional: minimum priority threshold
    minPriority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH"],
      default: "LOW"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Preference", preferenceSchema);
