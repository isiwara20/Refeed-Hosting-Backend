//Sewni

import Admin from "../models/Admin.js";

export const adminOnly = async (req, res, next) => {
  try {
    const username = req.headers["username"] || req.headers["x-username"];
    
    console.log("Admin middleware - Username received:", username);
    console.log("Admin middleware - All headers:", req.headers);

    if (!username) {
      return res.status(401).json({ message: "Unauthorized - No username provided" });
    }

    const admin = await Admin.findOne({ username });
    console.log("Admin middleware - Found admin:", admin);

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden - Admin only" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};