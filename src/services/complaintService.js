//Sewni

import {
  createComplaint,
  findAllComplaints,
  findComplaintById,
  updateComplaintById,
  deleteComplaintById,
  countComplaints,
  aggregateComplaintStats
} from "../repositories/complaintRepository.js";

export const createComplaintService = async (data) => {
  return await createComplaint(data);
};

export const getAllComplaintsService = async (query) => {
  const filter = { isDeleted: false };

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.severity) filter.severity = query.severity;

  return await findAllComplaints(filter);
};

export const getComplaintByIdService = async (id) => {
  return await findComplaintById(id);
};

export const updateComplaintStatusService = async (id, data) => {
  return await updateComplaintById(id, data);
};

export const deleteComplaintService = async (id) => {
  return await deleteComplaintById(id);
};

export const getComplaintAnalyticsService = async () => {
  const total = await countComplaints({ isDeleted: false });
  const open = await countComplaints({ status: "OPEN", isDeleted: false });
  const resolved = await countComplaints({ status: "RESOLVED", isDeleted: false });

  const statusBreakdown = await aggregateComplaintStats();

  return {
    total,
    open,
    resolved,
    statusBreakdown
  };
};