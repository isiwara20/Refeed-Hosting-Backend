//FoodRequest

import mongoose from "mongoose";


//stores food requsting
const foodRequestSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    location: { 
      type: String, 
      required: true 
    },


    category: {
      type: String,
      enum: [
        "non-vegetable",
        "vegetable",
        "cooked",
        "packed",
        "bakery",
        "mixed"
      ],
      required: true
    },

    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true
    },

    expiryRequirement: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "matched", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("FoodRequest", foodRequestSchema);
