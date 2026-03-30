import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  role: { type: String, default: "ADMIN" }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
