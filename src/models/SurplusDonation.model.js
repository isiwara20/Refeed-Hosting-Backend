import mongoose from "mongoose";

/**
 * SurplusDonation
 * SRP: stores donation info, lifecycle, location
 */
const SurplusDonationSchema = new mongoose.Schema(
  {
    donorUsername: { type: String, required: true }, // FK to DonorProfile

    foodType: {
      type: String,
      enum: ["veg", "cooked", "packed", "bakery", "mixed", "dairy", "non-veg"], // updated
      required: true,
    },

    quantity: {
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
    },

    expiryTime: { type: Date, required: true },

    pickupWindowStart: Date,
    pickupWindowEnd: Date,

    location: {
      address: String,
      lat: Number,
      lng: Number,
    },

    lifecycleStatus: {
      type: String,
      enum: ["DRAFT","PUBLISHED","RESERVED","COLLECTED","COMPLETED","EXPIRED","CANCELLED"],
      default: "DRAFT",
    },



    //  inside SurplusDonationSchema
    selfDelivery: { 
        type: Boolean, 
        default: false
     }, // if donor chooses self delivery






    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("SurplusDonation", SurplusDonationSchema);