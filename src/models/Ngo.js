import mongoose from "mongoose";

//stores all NGO details
const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "NGO" }
}, { timestamps: true });

export default mongoose.model("Ngo", ngoSchema);
