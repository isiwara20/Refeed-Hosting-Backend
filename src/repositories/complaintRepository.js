//Sewni

import Complaint from "../models/Complaint.js";

export const createComplaint = (data) =>
  Complaint.create(data);

export const findAllComplaints = (filter) =>
  Complaint.find(filter).sort({ createdAt: -1 });

export const findComplaintById = (id) =>
  Complaint.findById(id);

export const updateComplaintById = (id, updateData) =>
  Complaint.findByIdAndUpdate(id, updateData, { new: true });

export const deleteComplaintById = (id) =>
  Complaint.findByIdAndDelete(id);

export const countComplaints = (filter) =>
  Complaint.countDocuments(filter);

export const aggregateComplaintStats = () =>
  Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);