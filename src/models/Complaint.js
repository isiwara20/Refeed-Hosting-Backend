//Sewni

import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String, required: true },

  category: {
    type: String,
    enum: ["ABUSE", "MISCONDUCT", "FOOD_QUALITY", "SYSTEM_FAILURE", "OTHER"],
    required: true
  },

  reportedByRole: {
    type: String,
    enum: ["NGO", "DONATOR"],
    required: true
  },

  reportedBy: {
    type: String, // username
    required: true
  },

  againstRole: {
    type: String,
    enum: ["NGO", "DONATOR", "SYSTEM"],
    required: true
  },

  againstUsername: {
    type: String
  },

  status: {
    type: String,
    enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"],
    default: "OPEN"
  },

  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "LOW"
  },

  adminNotes: {
    type: String,
    default: ""
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);