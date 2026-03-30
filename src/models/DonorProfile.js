import mongoose from "mongoose";

/**
 * DonorProfile
 * SRP: stores donor profile + verification info
 * username links with donatorsDB and donations
 */
const DonorProfileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // Primary key
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },

    businessRegNumber: { type: String }, // Verification documents
    nicNumber: { type: String },
    profileImage: { type: String }, // base64 image string
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    isDeleted: { type: Boolean, default: false }, // Soft delete
  },
  { timestamps: true }
);

export default mongoose.model("DonorProfile", DonorProfileSchema);
