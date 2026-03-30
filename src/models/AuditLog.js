//Sewni

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
    adminUsername: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String, // NGO, DONATOR, ADMIN, REPORT, SYSTEM
      required: true
    },
    targetId: {
      type: String
    },
    description: {
      type: String
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);