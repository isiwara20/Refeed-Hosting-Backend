import express from "express";
import cors from "cors";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";

//donation
import donorRoutes from "./routes/donor.routes.js";
import surplusRoutes from "./routes/surplus.routes.js";


import foodRequestRoutes from "./routes/foodRequestRoutes.js";
import voiceRoutes from "./routes/voiceRoutes.js";
import ngoAddressRoutes from "./routes/addressRoutes.js";
import donationPickingRoutes from "./routes/donationPickingLocation.js";
import donationOrderStatusRoutes from "./routes/donationOrderStatusRoutes.js";
import ngoVerificationNGOSideRoutes from "./routes/ngoVerificationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

//Sewni
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminVerificationRoutes from "./routes/adminVerificationRoutes.js";
import adminRegistrationRoutes from "./routes/adminRegistrationRoutes.js";
import adminProfileRoutes from "./routes/adminProfileRoutes.js";
import donationRoutes from "./routes/donation.routes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import directPayRoutes from "./routes/directPayRoutes.js";

// Middleware
import { notFound, errorHandler } from "./middleware/error.js";


const app = express();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/test", (req, res) => res.json({ message: "Test route working ✅" }));

//donation  Routes
app.use("/api/profile", donorRoutes);
app.use("/api/surplus", surplusRoutes);


// Routes
console.log("Mounting auth routes...");
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted ");

console.log("Mounting notification routes...");
app.use("/api/notifications", notificationRoutes);
app.use("/api/restaurant", restaurantRoutes);
console.log("Notification routes mounted ");
app.use("/api/conversations", conversationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API root working " });
});


app.use("/api/password", passwordResetRoutes);

app.use("/api/otp", otpRoutes);

//Sewni
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/verification", adminVerificationRoutes);
app.use("/api/admin/registration", adminRegistrationRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/admin/donations", donationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/audit-logs", auditLogRoutes);
app.use("/api/payment", directPayRoutes);


//NGO Componets
app.use("/api/food-requests", foodRequestRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/ngo-Address",ngoAddressRoutes);
app.use("/api/donations-picking",donationPickingRoutes);
app.use("/api/donation-orders-status",donationOrderStatusRoutes);
app.use("/api/ngo-verification/",ngoVerificationNGOSideRoutes);

// Health check (optional)
//app.get("/api/health", (req, res) => {
  //res.json({ status: "Backend running " });
//});

// Error Handling
app.use(notFound);
app.use(errorHandler);



export default app;
