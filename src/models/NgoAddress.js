import mongoose from "mongoose";

//Stores Addresses of NGO
const AddressSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // FK to user
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: "Sri Lanka" },
    isDeleted: { type: Boolean, default: false }, // soft delete
  },
  { timestamps: true }
);

export default mongoose.model("NGOAddress", AddressSchema);
