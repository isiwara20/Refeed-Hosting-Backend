//Sewni

import {
  countAdmins,
  countNgos,
  countDonators,
  getRecentAdmins
} from "../repositories/adminDashboardRepository.js";

export const getDashboardSummaryService = async () => {
  const totalAdmins = await countAdmins();
  const totalNgos = await countNgos();
  const totalDonators = await countDonators();

  return {
    totalAdmins,
    totalNgos,
    totalDonators
  };
};

export const getDashboardAlertsService = async () => {
  const recentAdmins = await getRecentAdmins();
  return { recentAdmins };
};