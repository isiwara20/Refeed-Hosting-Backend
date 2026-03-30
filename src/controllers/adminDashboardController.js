//Sewni

import {
  getDashboardSummaryService,
  getDashboardAlertsService
} from "../services/adminDashboardService.js";


// GET /api/admin/dashboard/summary
export const getDashboardSummary = async (req, res) => {
  try {
    const data = await getDashboardSummaryService();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// GET /api/admin/dashboard/alerts
export const getDashboardAlerts = async (req, res) => {
  try {
    const data = await getDashboardAlertsService();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Dashboard alerts error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
