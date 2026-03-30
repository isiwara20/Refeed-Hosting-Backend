//Sewni

import { logAdminActivityService } from "../services/auditLogService.js";

export const auditLogger = (action, targetType) => {
  return async (req, res, next) => {
    try {
      if (!req.admin) return next();

      await logAdminActivityService({
        admin: req.admin._id,
        adminUsername: req.admin.username,
        action,
        targetType,
        targetId: req.params.id || null,
        description: `${req.admin.username} performed ${action}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });

      next();
    } catch (error) {
      console.error("Audit logger error:", error);
      next();
    }
  };
};