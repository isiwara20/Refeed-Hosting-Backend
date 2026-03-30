/**
 * Simple syntax validation test for notification service
 * Verifies that all modules can be imported without syntax errors
 */

console.log("🧪 Testing notification service syntax...\n");

try {
  // Test importing notification service
  console.log("1️⃣ Importing notification service...");
  await import("../services/notificationService.js");
  console.log("✅ notificationService.js imported successfully");

  // Test importing rule engine
  console.log("2️⃣ Importing rule engine...");
  await import("../services/ruleEngine.js");
  console.log("✅ ruleEngine.js imported successfully");

  // Test importing models
  console.log("3️⃣ Importing notification models...");
  await import("../models/notification.js");
  console.log("✅ notification.js imported successfully");

  await import("../models/NotificationRule.js");
  console.log("✅ NotificationRule.js imported successfully");

  await import("../models/NotificationTemplate.js");
  console.log("✅ NotificationTemplate.js imported successfully");

  console.log("\n🎉 All syntax validation tests passed!");
  console.log("✅ The notification rule engine is ready to use.");
  console.log("\n💡 Note: To run full functional tests, ensure MongoDB is running and configured.");

} catch (error) {
  console.error("❌ Syntax validation failed:", error.message);
  console.error("\nStack trace:", error.stack);
  process.exit(1);
}

process.exit(0);