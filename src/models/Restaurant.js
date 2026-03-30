import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    donorUsername: { type: String, required: true, unique: true },
    name:          { type: String, required: true },
    address:       { type: String, required: true },
    phone:         { type: String },
    description:   { type: String },
    foodsServed:   { type: String }, // comma-separated or free text
    openingHours:  { type: String },
    image:         { type: String }, // base64
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", RestaurantSchema);
