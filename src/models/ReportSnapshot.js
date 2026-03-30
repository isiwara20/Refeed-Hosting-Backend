// models/ReportSnapshot.js

import mongoose from "mongoose";

const reportSnapshotSchema = new mongoose.Schema({
  generatedBy: {
    type: String,
    required: true
  },

  reportType: {
    type: String,
    enum: [
      "SUMMARY",
      "MONTHLY",
      "COMPLAINT_ANALYTICS",
      "FULL_SYSTEM_REPORT"
    ],
    required: true
  },

  section: {
    type: String
  },

  data: {
    type: Object,
    required: true
  }

}, { timestamps: true });

export default mongoose.model("ReportSnapshot", reportSnapshotSchema);