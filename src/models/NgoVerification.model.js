import mongoose from "mongoose";

const ngoVerificationSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ngo",
      required: true,
      unique: true
    },

    // Legal Info
    registrationNumber: { type: String, required: true },
    registrationAuthority: { type: String },
    registrationDocumentUrl: { type: String },

    // Address Info
    officialAddress: { type: String, required: true },
    district: { type: String },
    province: { type: String },

    // Contact Person
    contactPersonName: { type: String, required: true },
    contactPersonNIC: { type: String },
    contactPersonRole: { type: String },

    // Workflow
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    rejectionReason: { type: String },

    verifiedBy: { type: String },
    verifiedAt: { type: Date },

    // Admin checklist
    documentChecked: { type: Boolean, default: false },
    backgroundChecked: { type: Boolean, default: false },
    siteVisited: { type: Boolean, default: false },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ngoprofiles", ngoVerificationSchema);
