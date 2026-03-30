//Sewni

import SurplusDonation from "../models/SurplusDonation.model.js";
import Complaint from "../models/Complaint.js";
import DonorProfile from "../models/DonorProfile.js";
import NgoVerification from "../models/NgoVerification.model.js";
import Admin from "../models/Admin.js";
import Ngo from "../models/Ngo.js";
import Donator from "../models/Donator.js";

/* ===========================
   DONATION ANALYTICS
=========================== */

export const countDonations = () =>
  SurplusDonation.countDocuments({ isDeleted: false });

export const donationStatusBreakdown = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$lifecycleStatus",
        count: { $sum: 1 }
      }
    }
  ]);

export const expiredDonations = () =>
  SurplusDonation.countDocuments({
    expiryTime: { $lt: new Date() },
    lifecycleStatus: { $ne: "COLLECTED" }
  });

export const flaggedDonations = () =>
  SurplusDonation.countDocuments({ lifecycleStatus: "CANCELLED" });

export const monthlyDonationGrowth = () =>
  SurplusDonation.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    }
  ]);

export const topActiveDonors = () =>
  SurplusDonation.aggregate([
    {
      $lookup: {
        from: "donorprofiles",
        localField: "donorUsername",
        foreignField: "username",
        as: "donorProfile"
      }
    },
    { $unwind: "$donorProfile" },
    {
      $group: {
        _id: "$donorUsername",
        name: { $first: "$donorProfile.name" },
        email: { $first: "$donorProfile.email" },
        donations: { $sum: 1 }
      }
    },
    { $sort: { donations: -1 } },
    { $limit: 10 }
  ]);

export const topActiveNgos = () =>
  SurplusDonation.aggregate([
    { $match: { lifecycleStatus: "COMPLETED" } },
    {
      $group: {
        _id: "$donorUsername",
        claims: { $sum: 1 }
      }
    },
    { $sort: { claims: -1 } },
    { $limit: 5 }
  ]);

/* ===========================
   COMPREHENSIVE SURPLUS DONATION ANALYTICS
=========================== */

export const foodTypeBreakdown = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$foodType",
        count: { $sum: 1 },
        totalQuantity: { $sum: "$quantity.amount" }
      }
    },
    { $sort: { count: -1 } }
  ]);

export const pickupWindowAnalytics = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false, pickupWindowStart: { $exists: true }, pickupWindowEnd: { $exists: true } } },
    {
      $project: {
        windowDuration: {
          $divide: [
            { $subtract: [{ $toDate: "$pickupWindowEnd" }, { $toDate: "$pickupWindowStart" }] },
            1000 * 60 * 60
          ]
        },
        foodType: 1,
        lifecycleStatus: 1
      }
    },
    {
      $group: {
        _id: null,
        avgWindowHours: { $avg: "$windowDuration" },
        minWindowHours: { $min: "$windowDuration" },
        maxWindowHours: { $max: "$windowDuration" },
        totalDonationsWithWindows: { $sum: 1 }
      }
    }
  ]);

export const locationAnalytics = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false, "location.lat": { $exists: true }, "location.lng": { $exists: true } } },
    {
      $group: {
        _id: "$location.address",
        count: { $sum: 1 },
        coordinates: { $first: "$location" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

export const quantityAnalytics = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$quantity.unit",
        totalQuantity: { $sum: "$quantity.amount" },
        avgQuantity: { $avg: "$quantity.amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalQuantity: -1 } }
  ]);

export const selfDeliveryAnalytics = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$selfDelivery",
        count: { $sum: 1 }
      }
    }
  ]);

export const expiryAnalytics = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false } },
    {
      $project: {
        hoursToExpiry: {
          $divide: [
            { $subtract: ["$expiryTime", "$createdAt"] },
            1000 * 60 * 60 // Convert to hours
          ]
        },
        foodType: 1,
        lifecycleStatus: 1
      }
    },
    {
      $group: {
        _id: null,
        avgHoursToExpiry: { $avg: "$hoursToExpiry" },
        minHoursToExpiry: { $min: "$hoursToExpiry" },
        maxHoursToExpiry: { $max: "$hoursToExpiry" },
        totalDonations: { $sum: 1 }
      }
    }
  ]);

export const donationLifecycleAnalytics = () =>
  SurplusDonation.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$lifecycleStatus",
        count: { $sum: 1 },
        avgTimeToComplete: {
          $avg: {
            $cond: [
              { $eq: ["$lifecycleStatus", "COMPLETED"] },
              { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60] }, // hours
              null
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

/* ===========================
   COMPLAINT ANALYTICS
=========================== */

export const complaintsBySeverity = () =>
  Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$severity",
        count: { $sum: 1 }
      }
    }
  ]);

export const complaintsByCategory = () =>
  Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    }
  ]);

export const resolutionRate = async () => {
  const total = await Complaint.countDocuments({ isDeleted: false });
  const resolved = await Complaint.countDocuments({
    status: "RESOLVED",
    isDeleted: false
  });

  return total === 0 ? 0 : ((resolved / total) * 100).toFixed(2);
};

/* ===========================
   NGO RISK
=========================== */

export const highRiskNgos = () =>
  NgoVerification.find({ riskLevel: "HIGH" });

export const verificationBreakdown = () => {
  // Get NGO verification status
  const ngoVerification = NgoVerification.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get Donor verification status
  const donorVerification = DonorProfile.aggregate([
    {
      $group: {
        _id: "$verificationStatus",
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Combine both results
  return Promise.all([ngoVerification, donorVerification]).then(([ngoResults, donorResults]) => {
    const combined = [];
    
    // Add NGO results
    ngoResults.forEach(result => {
      combined.push({
        _id: result._id,
        type: 'NGO',
        count: result.count
      });
    });
    
    // Add Donor results
    donorResults.forEach(result => {
      combined.push({
        _id: result._id,
        type: 'DONOR',
        count: result.count
      });
    });
    
    return combined;
  });
};

/* ===========================
   PLATFORM SUMMARY
=========================== */

export const countAdmins = () =>
  Admin.countDocuments();

export const countNgos = () =>
  Ngo.countDocuments();

export const countDonators = () =>
  Donator.countDocuments();

export const countComplaints = (filter = {}) =>
  Complaint.countDocuments(filter);

/* ===========================
   MONTHLY GROWTH (BASIC)
=========================== */

export const monthlyNgoGrowthBasic = () =>
  Ngo.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

export const monthlyDonatorGrowthBasic = () =>
  Donator.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

/* ===========================
   COMPLAINT BREAKDOWN (BASIC)
=========================== */

export const complaintStatusBreakdown = () =>
  Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);