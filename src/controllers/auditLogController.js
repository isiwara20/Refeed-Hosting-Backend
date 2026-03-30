//Sewni

import {
  getAuditLogsService
} from "../services/auditLogService.js";

export const getAuditLogs = async (req, res) => {
  try {
    const data = await getAuditLogsService(req.query);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Audit log fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};