//Sewni

import AuditLog from "../models/AuditLog.js";

export const createAuditLog = (data) => {
  return AuditLog.create(data);
};

export const getAuditLogs = (filters, options) => {
  const query = {};

  if (filters.adminUsername) {
    query.adminUsername = filters.adminUsername;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.fromDate && filters.toDate) {
    query.createdAt = {
      $gte: new Date(filters.fromDate),
      $lte: new Date(filters.toDate)
    };
  }

  return AuditLog.find(query)
    .sort({ createdAt: -1 })
    .skip(options.skip)
    .limit(options.limit)
    .populate("admin", "username name");
};

export const countAuditLogs = (filters) => {
  const query = {};

  if (filters.adminUsername) {
    query.adminUsername = filters.adminUsername;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.fromDate && filters.toDate) {
    query.createdAt = {
      $gte: new Date(filters.fromDate),
      $lte: new Date(filters.toDate)
    };
  }

  return AuditLog.countDocuments(query);
};