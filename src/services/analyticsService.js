//Sewni

import * as repo from "../repositories/analyticsRepository.js";

/* =====================================================
   1PLATFORM IMPACT SUMMARY (Basic Academic Report)
===================================================== */

export const getPlatformSummaryService = async () => {
  return {
    totalAdmins: await repo.countAdmins(),
    totalNgos: await repo.countNgos(),
    totalDonators: await repo.countDonators(),
    totalComplaints: await repo.countComplaints({ isDeleted: false }),
    openComplaints: await repo.countComplaints({
      status: "OPEN",
      isDeleted: false
    }),
    resolvedComplaints: await repo.countComplaints({
      status: "RESOLVED",
      isDeleted: false
    })
  };
};

/* =====================================================
   2️⃣ MONTHLY GROWTH REPORT (Basic Academic Report)
===================================================== */

export const getMonthlyGrowthBasicService = async () => {
  return {
    ngoGrowth: await repo.monthlyNgoGrowthBasic(),
    donatorGrowth: await repo.monthlyDonatorGrowthBasic()
  };
};

/* =====================================================
   3️⃣ COMPLAINT IMPACT BREAKDOWN (Basic Academic Report)
===================================================== */

export const getComplaintImpactService = async () => {
  return {
    byStatus: await repo.complaintStatusBreakdown(),
    byCategory: await repo.complaintsByCategory(),
    bySeverity: await repo.complaintsBySeverity()
  };
};

/* =====================================================
   4️⃣ ADVANCED DONATION & ENGAGEMENT ANALYTICS
===================================================== */

export const getDonationAnalyticsService = async () => {
  try {
    return {
      totalDonations: await repo.countDonations(),
      donationStatus: await repo.donationStatusBreakdown(),
      expiredDonations: await repo.expiredDonations(),
      cancelledDonations: await repo.flaggedDonations(),
      monthlyDonationGrowth: await repo.monthlyDonationGrowth(),
      topDonors: await repo.topActiveDonors(),
      topNgos: await repo.topActiveNgos(),
      foodTypeBreakdown: await repo.foodTypeBreakdown(),
      pickupWindowAnalytics: await repo.pickupWindowAnalytics(),
      locationAnalytics: await repo.locationAnalytics(),
      quantityAnalytics: await repo.quantityAnalytics(),
      selfDeliveryAnalytics: await repo.selfDeliveryAnalytics(),
      expiryAnalytics: await repo.expiryAnalytics(),
      lifecycleAnalytics: await repo.donationLifecycleAnalytics()
    };
  } catch (error) {
    console.error("Error in getDonationAnalyticsService:", error);
    throw error;
  }
};

/* =====================================================
   5️⃣ RISK & VERIFICATION ANALYTICS
===================================================== */

export const getRiskAnalyticsService = async () => {
  return {
    highRiskNgos: await repo.highRiskNgos(),
    verificationStatus: await repo.verificationBreakdown()
  };
};

/* =====================================================
   6️⃣ FULL SYSTEM REPORT (MASTER REPORT)
===================================================== */

export const getFullSystemReportService = async () => {
  return {
    platformSummary: await getPlatformSummaryService(),
    monthlyGrowth: await getMonthlyGrowthBasicService(),
    complaintImpact: await getComplaintImpactService(),
    donationAnalytics: await getDonationAnalyticsService(),
    riskAnalytics: await getRiskAnalyticsService()
  };
};