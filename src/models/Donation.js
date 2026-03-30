import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donator",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["produce", "dairy", "bakery", "prepared", "packaged", "other"],
      default: "other",
    },
    quantity: { type: String, required: true },
    location: { type: String, default: "" },
    status: {
      type: String,
      enum: ["AVAILABLE", "ACCEPTED", "COMPLETED"],
      default: "AVAILABLE",
    },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
