//DonationOrderStatus
import mongoose from "mongoose";

const DonationOrderStatusSchema = new mongoose.Schema(
  {
    ngoUsername: { type: String, required: true }, // FK to NGO user
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    surplusDonationId: { type: mongoose.Schema.Types.ObjectId, ref: "SurplusDonation", required: true },
    donorUsername: { type: String, required: true }, // from SurplusDonation


    foodType: { type: String, required: true },

    quantity: {
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
    },

    deliveryAddress: { type: String }, // Only for delivery type
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("DonationOrderStatus", DonationOrderStatusSchema);