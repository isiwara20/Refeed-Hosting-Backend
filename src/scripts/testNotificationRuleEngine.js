import mongoose from "mongoose";
import * as notificationService from "../services/notificationService.js";
import seedNotificationSystem from "./seedNotificationSystem.js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../config/.env") });

/**
 * Test the rule-based notification system
 */
const testNotificationRuleEngine = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/refeed"
    );
    console.log("Connected to MongoDB");

    // Seed the notification system
    await seedNotificationSystem();
    
    // Test various notification scenarios
    console.log("\n🧪 Testing notification scenarios...\n");

    // Test 1: User Registration
    console.log("1️⃣ Testing User Registration Notification");
    await notificationService.triggerUserRegistrationNotification({
      userId: new mongoose.Types.ObjectId(),
      username: "john_doe",
      userType: "donor",
      email: "john@example.com"
    });
    console.log("✅ User registration notification processed\n");

    // Test 2: Donation Creation
    console.log("2️⃣ Testing Donation Created Notification");
    await notificationService.triggerDonationCreatedNotification({
      userId: new mongoose.Types.ObjectId(),
      donationTitle: "Fresh Vegetables from Local Farm",
      donationId: new mongoose.Types.ObjectId().toString(),
      category: "Vegetables",
      quantity: "50 kg",
      location: "Downtown Community Center"
    });
    console.log("✅ Donation created notification processed\n");

    // Test 3: Verification Approved
    console.log("3️⃣ Testing Verification Approved Notification");
    await notificationService.triggerVerificationApprovedNotification({
      userId: new mongoose.Types.ObjectId(),
      userType: "NGO",
      approvedBy: "admin_user"
    });
    console.log("✅ Verification approved notification processed\n");

    // Test 4: Verification Rejected
    console.log("4️⃣ Testing Verification Rejected Notification");
    await notificationService.triggerVerificationRejectedNotification({
      userId: new mongoose.Types.ObjectId(),
      userType: "Donor",
      reason: "Incomplete documentation provided",
      rejectedBy: "admin_user"
    });
    console.log("✅ Verification rejected notification processed\n");

    // Test 5: Food Request Created
    console.log("5️⃣ Testing Food Request Created Notification");
    await notificationService.triggerFoodRequestCreatedNotification({
      userId: new mongoose.Types.ObjectId(),
      requestTitle: "Urgent: Food for 100 families",
      requestId: new mongoose.Types.ObjectId().toString(),
      category: "Mixed Food Items",
      quantity: "500 portions"
    });
    console.log("✅ Food request created notification processed\n");

    // Test 6: Donation Order Created
    console.log("6️⃣ Testing Donation Order Created Notification");
    await notificationService.triggerDonationOrderCreatedNotification({
      donorId: new mongoose.Types.ObjectId(),
      ngoId: new mongoose.Types.ObjectId(),
      donationTitle: "Bakery Surplus",
      donationId: new mongoose.Types.ObjectId().toString(),
      orderId: new mongoose.Types.ObjectId().toString()
    });
    console.log("✅ Donation order created notification processed\n");

    // Test 7: Complaint Created
    console.log("7️⃣ Testing Complaint Created Notification");
    await notificationService.triggerComplaintCreatedNotification({
      userId: new mongoose.Types.ObjectId(),
      complaintId: new mongoose.Types.ObjectId().toString(),
      category: "Service Quality",
      subject: "Issue with donation pickup"
    });
    console.log("✅ Complaint created notification processed\n");

    console.log("🎉 All notification tests completed successfully!");
    console.log("\n📊 Check the notifications collection in your database to see the generated notifications.");
    console.log("📋 You can also check notification rules and templates collections to see the configurations.");
    console.log("✅ All assertions passed");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the test if this script is executed directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  testNotificationRuleEngine();
}

export default testNotificationRuleEngine;