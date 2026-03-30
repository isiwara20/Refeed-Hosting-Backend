//Sewni

import {
  createAuditLog,
  getAuditLogs,
  countAuditLogs
} from "../repositories/auditLogRepository.js";

export const logAdminActivityService = async (data) => {
  return createAuditLog(data);
};

export const getAuditLogsService = async (queryParams) => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = {
    adminUsername: queryParams.adminUsername,
    action: queryParams.action,
    fromDate: queryParams.fromDate,
    toDate: queryParams.toDate
  };

  const logs = await getAuditLogs(filters, { skip, limit });
  const total = await countAuditLogs(filters);

  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    logs
  };
};