import mongoose from "mongoose";
import NotificationRule from "../models/NotificationRule.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../config/.env") });

/**
 * Seed basic notification rules and templates for ReFeed application
 */
const seedNotificationRules = async () => {
  try {
    console.log("Seeding notification rules and templates...");

    // Clear existing data
    await NotificationTemplate.deleteMany({});
    await NotificationRule.deleteMany({});

    // Create Templates
    const templates = [
      {
        name: "user_registration_welcome",
        description: "Welcome message for new user registration",
        category: "auth",
        eventType: "USER_REGISTRATION",
        localizations: [
          {
            language: "en",
            subject: "Welcome to ReFeed, {{username}}!",
            bodyText: `Hello {{username}},

Welcome to ReFeed! Your {{userType}} account has been successfully created.

You can now:
- Create and manage donations
- Connect with verified NGOs
- Track your impact on food waste reduction

Thank you for joining our mission to reduce food waste!

Best regards,
The ReFeed Team`,
            bodyHtml: `<h2>Hello {{username}},</h2>
<p>Welcome to ReFeed! Your <strong>{{userType}}</strong> account has been successfully created.</p>
<h3>You can now:</h3>
<ul>
  <li>Create and manage donations</li>
  <li>Connect with verified NGOs</li>
  <li>Track your impact on food waste reduction</li>
</ul>
<p>Thank you for joining our mission to reduce food waste!</p>
<p>Best regards,<br>The ReFeed Team</p>`
          }
        ],
        variables: [
          { name: "username", description: "User's display name", required: true },
          { name: "userType", description: "Type of user (donor, ngo, admin)", required: true },
          { name: "email", description: "User's email address" }
        ],
        channelSettings: {
          email: { enabled: true, fromName: "ReFeed Team" },
          sms: { enabled: false },
          inApp: { enabled: true }
        }
      },
      {
        name: "donation_created_success",
        description: "Confirmation when a donation is successfully created",
        category: "donation",
        eventType: "DONATION_CREATED",
        localizations: [
          {
            language: "en",
            subject: "Your donation '{{donationTitle}}' is now live!",
            bodyText: `Your donation "{{donationTitle}}" has been successfully listed.

Donation Details:
- Category: {{category}}
- Quantity: {{quantity}}
- Location: {{location}}

NGOs in your area can now view and request this donation. You'll be notified when someone shows interest.

Thank you for making a difference!`,
            bodyHtml: `<h2>Your donation "{{donationTitle}}" has been successfully listed!</h2>
<h3>Donation Details:</h3>
<ul>
  <li><strong>Category:</strong> {{category}}</li>
  <li><strong>Quantity:</strong> {{quantity}}</li>
  <li><strong>Location:</strong> {{location}}</li>
</ul>
<p>NGOs in your area can now view and request this donation. You'll be notified when someone shows interest.</p>
<p><strong>Thank you for making a difference!</strong></p>`
          }
        ],
        variables: [
          { name: "donationTitle", description: "Title of the donation", required: true },
          { name: "donationId", description: "Unique donation identifier" },
          { name: "category", description: "Donation category" },
          { name: "quantity", description: "Donation quantity" },
          { name: "location", description: "Donation location" }
        ]
      },
      {
        name: "verification_approved",
        description: "Notification when user verification is approved",
        category: "verification",
        eventType: "VERIFICATION_APPROVED",
        localizations: [
          {
            language: "en",
            subject: "🎉 Your {{userType}} verification has been approved!",
            bodyText: `Congratulations! Your {{userType}} verification has been approved by {{approvedBy}}.

You now have access to all platform features:
- Full donation management
- Priority matching with requests
- Advanced analytics and reporting

Start making an impact today!`,
            bodyHtml: `<h2>🎉 Congratulations!</h2>
<p>Your <strong>{{userType}}</strong> verification has been approved by {{approvedBy}}.</p>
<h3>You now have access to all platform features:</h3>
<ul>
  <li>Full donation management</li>
  <li>Priority matching with requests</li>
  <li>Advanced analytics and reporting</li>
</ul>
<p><strong>Start making an impact today!</strong></p>`
          }
        ],
        variables: [
          { name: "userType", description: "Type being verified", required: true },
          { name: "approvedBy", description: "Admin who approved verification", required: true }
        ]
      },
      {
        name: "verification_rejected",
        description: "Notification when user verification is rejected",
        category: "verification",
        eventType: "VERIFICATION_REJECTED",
        localizations: [
          {
            language: "en",
            subject: "Your {{userType}} verification requires attention",
            bodyText: `Your {{userType}} verification has been reviewed and requires some updates.

Reason: {{reason}}

Please review the requirements and resubmit your verification documents. Our team is here to help if you need assistance.

Contact support if you have questions.`,
            bodyHtml: `<h2>Your {{userType}} verification requires attention</h2>
<p>Your verification has been reviewed and requires some updates.</p>
<p><strong>Reason:</strong> {{reason}}</p>
<p>Please review the requirements and resubmit your verification documents. Our team is here to help if you need assistance.</p>
<p>Contact support if you have questions.</p>`
          }
        ],
        variables: [
          { name: "userType", description: "Type being verified", required: true },
          { name: "reason", description: "Reason for rejection", required: true },
          { name: "rejectedBy", description: "Admin who rejected verification" }
        ]
      },
      {
        name: "food_request_created",
        description: "Confirmation when a food request is created",
        category: "general",
        eventType: "FOOD_REQUEST_CREATED",
        localizations: [
          {
            language: "en",
            subject: "Your food request '{{requestTitle}}' was created",
            bodyText: `Your food request "{{requestTitle}}" is now visible to matching donors.

Request Details:
- Category: {{category}}
- Quantity: {{quantity}}
- Request ID: {{requestId}}

We'll notify you when donors respond.`,
            bodyHtml: `<h2>Your food request "{{requestTitle}}" was created</h2>
<h3>Request Details:</h3>
<ul>
  <li><strong>Category:</strong> {{category}}</li>
  <li><strong>Quantity:</strong> {{quantity}}</li>
  <li><strong>Request ID:</strong> {{requestId}}</li>
</ul>
<p>We'll notify you when donors respond.</p>`
          }
        ],
        variables: [
          { name: "requestTitle", description: "Food request title", required: true },
          { name: "requestId", description: "Request identifier", required: true },
          { name: "category", description: "Requested food category", required: true },
          { name: "quantity", description: "Requested quantity", required: true }
        ]
      },
      {
        name: "donation_order_created",
        description: "Notification when a donation order is created",
        category: "order",
        eventType: "DONATION_ORDER_CREATED",
        localizations: [
          {
            language: "en",
            subject: "Donation order {{orderId}} has been created",
            bodyText: `A donation order has been created for "{{donationTitle}}".

Order Details:
- Order ID: {{orderId}}
- Donation ID: {{donationId}}
- Role: {{userRole}}

Please review the order details in your dashboard.`,
            bodyHtml: `<h2>Donation order {{orderId}} has been created</h2>
<p>A donation order has been created for <strong>{{donationTitle}}</strong>.</p>
<ul>
  <li><strong>Order ID:</strong> {{orderId}}</li>
  <li><strong>Donation ID:</strong> {{donationId}}</li>
  <li><strong>Role:</strong> {{userRole}}</li>
</ul>
<p>Please review the order details in your dashboard.</p>`
          }
        ],
        variables: [
          { name: "donationTitle", description: "Donation title", required: true },
          { name: "donationId", description: "Donation identifier", required: true },
          { name: "orderId", description: "Order identifier", required: true },
          { name: "userRole", description: "Recipient role for this notification" }
        ]
      },
      {
        name: "complaint_created",
        description: "Acknowledgement when a complaint is created",
        category: "complaint",
        eventType: "COMPLAINT_CREATED",
        localizations: [
          {
            language: "en",
            subject: "Complaint received: {{subject}}",
            bodyText: `Your complaint has been submitted successfully.

Complaint Details:
- Complaint ID: {{complaintId}}
- Category: {{category}}
- Subject: {{subject}}

Our team will review and update the status soon.`,
            bodyHtml: `<h2>Complaint received: {{subject}}</h2>
<p>Your complaint has been submitted successfully.</p>
<ul>
  <li><strong>Complaint ID:</strong> {{complaintId}}</li>
  <li><strong>Category:</strong> {{category}}</li>
  <li><strong>Subject:</strong> {{subject}}</li>
</ul>
<p>Our team will review and update the status soon.</p>`
          }
        ],
        variables: [
          { name: "complaintId", description: "Complaint identifier", required: true },
          { name: "category", description: "Complaint category", required: true },
          { name: "subject", description: "Complaint subject", required: true }
        ]
      }
    ];

    // Add coverage for all event types used across controllers/services.
    const additionalTemplateConfigs = [
      {
        name: "request_accepted",
        category: "donation",
        eventType: "REQUEST_ACCEPTED",
        subject: "Your request '{{requestTitle}}' was accepted",
        bodyText:
          "Your request {{requestId}} was accepted by {{acceptedBy}}.",
        variables: ["requestTitle", "requestId", "acceptedBy"],
      },
      {
        name: "donation_completed",
        category: "donation",
        eventType: "DONATION_COMPLETED",
        subject: "Donation '{{donationTitle}}' completed",
        bodyText:
          "Donation {{donationId}} was completed by {{completedBy}}.",
        variables: ["donationTitle", "donationId", "completedBy"],
      },
      {
        name: "food_request_updated",
        category: "general",
        eventType: "FOOD_REQUEST_UPDATED",
        subject: "Food request updated",
        bodyText:
          "Your request {{requestId}} was updated. Changes: {{changes}}.",
        variables: ["requestTitle", "requestId", "changes"],
      },
      {
        name: "food_request_deleted",
        category: "general",
        eventType: "FOOD_REQUEST_DELETED",
        subject: "Food request deleted",
        bodyText:
          "Your request {{requestId}} for {{category}} was deleted.",
        variables: ["requestId", "category"],
      },
      {
        name: "complaint_status_updated",
        category: "complaint",
        eventType: "COMPLAINT_STATUS_UPDATED",
        subject: "Complaint status changed to {{newStatus}}",
        bodyText:
          "Complaint {{complaintId}} status changed from {{previousStatus}} to {{newStatus}} by {{updatedBy}}.",
        variables: ["complaintId", "newStatus", "previousStatus", "updatedBy"],
      },
      {
        name: "donation_order_status_changed",
        category: "order",
        eventType: "DONATION_ORDER_STATUS_CHANGED",
        subject: "Order {{orderId}} status updated",
        bodyText:
          "Order {{orderId}} status changed from {{previousStatus}} to {{newStatus}}.",
        variables: ["donationTitle", "orderId", "newStatus", "previousStatus"],
      },
      {
        name: "donation_order_cancelled",
        category: "order",
        eventType: "DONATION_ORDER_CANCELLED",
        subject: "Order {{orderId}} cancelled",
        bodyText:
          "Order {{orderId}} for {{donationTitle}} was cancelled. Reason: {{cancelReason}}.",
        variables: ["donationTitle", "orderId", "cancelReason"],
      },
      {
        name: "verification_submitted",
        category: "verification",
        eventType: "VERIFICATION_SUBMITTED",
        subject: "Verification submitted",
        bodyText:
          "Verification {{verificationId}} for {{ngoUsername}} was submitted and is under review.",
        variables: ["verificationId", "ngoUsername"],
      },
      {
        name: "address_created",
        category: "general",
        eventType: "ADDRESS_CREATED",
        subject: "Address added",
        bodyText:
          "A new address was added ({{city}}, {{country}}).",
        variables: ["addressId", "city", "country"],
      },
      {
        name: "address_updated",
        category: "general",
        eventType: "ADDRESS_UPDATED",
        subject: "Address updated",
        bodyText:
          "Address {{addressId}} was updated. Fields: {{updatedFields}}.",
        variables: ["addressId", "updatedFields"],
      },
      {
        name: "address_deleted",
        category: "general",
        eventType: "ADDRESS_DELETED",
        subject: "Address removed",
        bodyText: "Address {{addressId}} was removed.",
        variables: ["addressId"],
      },
      {
        name: "admin_registered",
        category: "auth",
        eventType: "ADMIN_REGISTERED",
        subject: "Admin account created",
        bodyText:
          "Admin account {{username}} was registered successfully.",
        variables: ["adminId", "username"],
      },
      {
        name: "new_message",
        category: "general",
        eventType: "NEW_MESSAGE",
        subject: "New message from {{senderUsername}}",
        bodyText:
          "You received a new message from {{senderUsername}}.",
        variables: ["conversationId", "senderUsername"],
      },
      {
        name: "surplus_draft_created",
        category: "donation",
        eventType: "SURPLUS_DRAFT_CREATED",
        subject: "Surplus draft created",
        bodyText: "Your surplus draft was saved successfully.",
        variables: [],
      },
      {
        name: "surplus_published",
        category: "donation",
        eventType: "SURPLUS_PUBLISHED",
        subject: "Surplus published",
        bodyText: "Your surplus listing is now published.",
        variables: [],
      },
      {
        name: "surplus_reserved",
        category: "donation",
        eventType: "SURPLUS_RESERVED",
        subject: "Surplus reserved",
        bodyText: "A surplus listing has been reserved.",
        variables: [],
      },
      {
        name: "surplus_completed",
        category: "donation",
        eventType: "SURPLUS_COMPLETED",
        subject: "Surplus marked complete",
        bodyText: "The surplus flow was marked complete.",
        variables: [],
      },
      {
        name: "surplus_collected",
        category: "donation",
        eventType: "SURPLUS_COLLECTED",
        subject: "Surplus collected",
        bodyText: "The surplus donation was collected.",
        variables: [],
      },
      {
        name: "donor_profile_created",
        category: "general",
        eventType: "DONOR_PROFILE_CREATED",
        subject: "Donor profile created",
        bodyText: "Your donor profile for {{username}} was created.",
        variables: ["username"],
      },
      {
        name: "donor_profile_updated",
        category: "general",
        eventType: "DONOR_PROFILE_UPDATED",
        subject: "Donor profile updated",
        bodyText:
          "Your donor profile was updated. Fields: {{updatedFields}}.",
        variables: ["username", "updatedFields"],
      },
      {
        name: "donor_profile_soft_deleted",
        category: "general",
        eventType: "DONOR_PROFILE_SOFT_DELETED",
        subject: "Donor profile deactivated",
        bodyText: "Your donor profile for {{username}} was deactivated.",
        variables: ["username"],
      },
      {
        name: "donor_profile_hard_deleted",
        category: "general",
        eventType: "DONOR_PROFILE_HARD_DELETED",
        subject: "Donor profile permanently deleted",
        bodyText: "Your donor profile for {{username}} was permanently deleted.",
        variables: ["username"],
      },
      {
        name: "password_reset_success",
        category: "auth",
        eventType: "PASSWORD_RESET_SUCCESS",
        subject: "Password updated",
        bodyText:
          "Your password was successfully updated at {{updatedAt}}.",
        variables: ["username", "updatedAt"],
      },
    ];

    const additionalTemplates = additionalTemplateConfigs.map((cfg) => ({
      name: cfg.name,
      description: `Auto-seeded template for ${cfg.eventType}`,
      category: cfg.category,
      eventType: cfg.eventType,
      localizations: [
        {
          language: "en",
          subject: cfg.subject,
          bodyText: cfg.bodyText,
          bodyHtml: `<p>${cfg.bodyText}</p>`,
        },
      ],
      variables: cfg.variables.map((v) => ({
        name: v,
        description: `${v} variable`,
      })),
      channelSettings: {
        email: { enabled: false },
        sms: { enabled: false },
        inApp: { enabled: true },
      },
    }));

    templates.push(...additionalTemplates);

    const createdTemplates = await NotificationTemplate.insertMany(templates);
    console.log(`Created ${createdTemplates.length} notification templates`);

    // Create Rules
    const rules = [
      {
        name: "Welcome New Users",
        description: "Send welcome notification to all new registered users",
        eventType: "USER_REGISTRATION",
        isActive: true,
        priority: 1,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP"],
            templateId: createdTemplates.find(t => t.name === "user_registration_welcome")._id,
            priority: "NORMAL"
          }
        ],
        applicableUserTypes: ["donor", "ngo"]
      },
      {
        name: "Donation Created - Immediate Confirmation",
        description: "Immediate confirmation when donation is created",
        eventType: "DONATION_CREATED",
        isActive: true,
        priority: 1,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP"],
            templateId: createdTemplates.find(t => t.name === "donation_created_success")._id,
            priority: "NORMAL"
          }
        ],
        applicableUserTypes: []
      },
      {
        name: "High Priority Verification Approved",
        description: "High priority notification for approved verifications",
        eventType: "VERIFICATION_APPROVED",
        isActive: true,
        priority: 1,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP", "SMS"],
            templateId: createdTemplates.find(t => t.name === "verification_approved")._id,
            priority: "HIGH"
          }
        ],
        applicableUserTypes: []
      },
      {
        name: "Verification Rejected with Follow-up",
        description: "Notify when verification is rejected and schedule follow-up",
        eventType: "VERIFICATION_REJECTED",
        isActive: true,
        priority: 1,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP"],
            templateId: createdTemplates.find(t => t.name === "verification_rejected")._id,
            priority: "HIGH"
          },
          {
            type: "delay",
            delay: { days: 7 },
            priority: "NORMAL"
          }
        ],
        applicableUserTypes: [],
        cooldownPeriod: 60, // 1 hour cooldown
        maxExecutionsPerUser: 3
      },
      {
        name: "Donation Order Created Notification",
        description: "Notify users when a donation order is created",
        eventType: "DONATION_ORDER_CREATED",
        isActive: true,
        priority: 2,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP"],
            templateId: createdTemplates.find(t => t.name === "donation_order_created")._id,
            priority: "HIGH"
          }
        ],
        applicableUserTypes: []
      },
      {
        name: "Food Request Created Notification",
        description: "Notify user when a food request is created",
        eventType: "FOOD_REQUEST_CREATED",
        isActive: true,
        priority: 2,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP"],
            templateId: createdTemplates.find(t => t.name === "food_request_created")._id,
            priority: "NORMAL"
          }
        ],
        applicableUserTypes: []
      },
      {
        name: "Complaint Created Notification",
        description: "Notify user when a complaint is created",
        eventType: "COMPLAINT_CREATED",
        isActive: true,
        priority: 2,
        conditions: [],
        actions: [
          {
            type: "send_notification",
            channels: ["EMAIL", "INAPP"],
            templateId: createdTemplates.find(t => t.name === "complaint_created")._id,
            priority: "NORMAL"
          }
        ],
        applicableUserTypes: []
      }
    ];

    const additionalRules = additionalTemplateConfigs.map((cfg) => ({
      name: `${cfg.eventType} Notification`,
      description: `Auto-seeded rule for ${cfg.eventType}`,
      eventType: cfg.eventType,
      isActive: true,
      priority: 5,
      conditions: [],
      actions: [
        {
          type: "send_notification",
          channels: ["INAPP"],
          templateId: createdTemplates.find((t) => t.name === cfg.name)._id,
          priority: cfg.eventType === "PASSWORD_RESET_SUCCESS" ? "HIGH" : "NORMAL",
        },
      ],
      applicableUserTypes: [],
    }));

    rules.push(...additionalRules);

    const createdRules = await NotificationRule.insertMany(rules);
    console.log(`Created ${createdRules.length} notification rules`);

    console.log("✅ Notification system seeding completed successfully!");
    
    return {
      templates: createdTemplates,
      rules: createdRules
    };
    
  } catch (error) {
    console.error("❌ Error seeding notification system:", error);
    throw error;
  }
};

export default seedNotificationRules;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const run = async () => {
    try {
      const uri =
        process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/refeed";

      await mongoose.connect(uri);
      console.log("Connected to MongoDB");

      await seedNotificationRules();
      console.log("Seed script finished");
    } catch (error) {
      console.error("Seed script failed:", error);
      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();
      console.log("Disconnected from MongoDB");
    }
  };

  run();
}