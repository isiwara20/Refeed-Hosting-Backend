# ReFeed Notification Rule Engine

## Overview

The ReFeed notification system has been enhanced with a powerful rule engine that provides flexible, configurable, and scalable notification management. This system follows best practices for enterprise applications and allows for dynamic notification behavior without code changes.

## Architecture

### Core Components

1. **NotificationRule Model** - Defines when and how notifications should be sent
2. **NotificationTemplate Model** - Manages reusable notification content with localization
3. **RuleEngine Service** - Evaluates rules and determines notification actions
4. **Enhanced NotificationService** - Processes notifications using the rule engine

### Key Features

- 🎯 **Rule-Based Triggering** - Configure when notifications fire based on complex conditions
- 🌍 **Multi-Language Support** - Template localization for different languages
- 📱 **Multi-Channel Delivery** - Email, SMS, and In-App notifications
- ⏰ **Smart Scheduling** - Time-based rules, cooldowns, and frequency controls
- 🔄 **Dynamic Content** - Template variables for personalized messages
- 📊 **Analytics Ready** - Built-in execution tracking and metrics
- 🛡️ **User Preferences** - Honor user notification preferences and quiet hours

## Models

### NotificationRule

```javascript
{
  name: String,                    // Rule name
  eventType: String,              // Event that triggers this rule
  conditions: [Condition],        // Array of conditions to evaluate
  actions: [Action],              // Actions to execute when conditions match
  applicableUserTypes: [String],  // User types this rule applies to
  cooldownPeriod: Number,         // Minutes between executions
  activeTimeRange: Object,        // Time window for execution
  activeDays: [String],           // Days of week when active
  priority: Number                // Execution priority (lower = higher priority)
}
```

### NotificationTemplate

```javascript
{
  name: String,                   // Template identifier
  eventType: String,              // Associated event type
  localizations: [Localization], // Multi-language content
  variables: [Variable],          // Template variables
  channelSettings: Object         // Channel-specific configurations
}
```

## Usage

### Basic Notification Flow

```javascript
// 1. Create event context
const context = {
  eventType: "DONATION_CREATED",
  user: { _id: userId, userType: "donor" },
  data: {
    donationTitle: "Fresh Vegetables",
    donationId: "123",
    category: "Vegetables"
  }
};

// 2. Process through rule engine
const results = await processNotificationEvent(context);
```

### Creating Notification Rules

```javascript
const rule = {
  name: "Welcome New Donors",
  eventType: "USER_REGISTRATION",
  conditions: [
    {
      field: "user.userType",
      operator: "equals",
      value: "donor"
    }
  ],
  actions: [
    {
      type: "send_notification",
      channels: ["EMAIL", "INAPP"],
      templateId: templateId,
      priority: "NORMAL"
    }
  ],
  applicableUserTypes: ["donor"]
};
```

### Creating Templates

```javascript
const template = {
  name: "donor_welcome",
  eventType: "USER_REGISTRATION",
  localizations: [
    {
      language: "en",
      subject: "Welcome {{username}}!",
      bodyText: "Welcome to ReFeed, {{username}}! Your {{userType}} account is ready."
    }
  ],
  variables: [
    { name: "username", required: true },
    { name: "userType", required: true }
  ]
};
```

## Integration Guide

### 1. Update Controllers

```javascript
// In your controller
import * as notificationService from "../services/notificationService.js";

export const createDonation = async (req, res) => {
  try {
    const donation = await createDonationService(req.body);
    
    // Trigger notifications using rule engine
    await notificationService.triggerDonationCreatedNotification({
      userId: donation.donatorId,
      donationTitle: donation.title,
      donationId: donation._id.toString(),
      category: donation.category,
      quantity: donation.quantity
    });
    
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 2. Available Trigger Functions

- `triggerUserRegistrationNotification()`
- `triggerDonationCreatedNotification()`
- `triggerVerificationApprovedNotification()`
- `triggerVerificationRejectedNotification()`
- `triggerFoodRequestCreatedNotification()`
- `triggerDonationOrderCreatedNotification()`
- `triggerComplaintCreatedNotification()`
- And more...

## Rule Engine Capabilities

### Condition Operators

- `equals` / `not_equals`
- `in` / `not_in`
- `greater_than` / `less_than`
- `contains`
- `starts_with` / `ends_with`

### Action Types

- `send_notification` - Send immediate notification
- `delay` - Schedule for later execution
- `escalate` - Trigger escalation workflow
- `suppress` - Suppress other notifications

### Time-Based Controls

```javascript
{
  activeTimeRange: { start: "09:00", end: "17:00" },
  activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  cooldownPeriod: 60, // minutes
  maxExecutionsPerUser: 5
}
```

## Setup Instructions

### 1. Install and Seed

```bash
# Run the notification system seeder
node src/scripts/seedNotificationSystem.js

# Test the system
node src/scripts/testNotificationRuleEngine.js
```

### 2. Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/refeed
# Add email/SMS service configurations as needed
```

### 3. Database Indexes

The system automatically creates the following indexes:
- Notifications: `userId + createdAt`, `eventType + status`, `scheduledFor + status`
- Rules: `eventType + isActive + priority`, `applicableUserTypes`
- Templates: `name`, `category + eventType`, `isActive`

## Best Practices

### 1. Rule Organization

- Use clear, descriptive rule names
- Set appropriate priorities (1-100, lower = higher priority)
- Group related rules by event type
- Document business logic in rule descriptions

### 2. Template Management

- Use consistent variable naming
- Provide meaningful default values
- Support multiple languages from the start
- Keep templates focused and reusable

### 3. Performance Optimization

- Use specific conditions to avoid unnecessary rule evaluations
- Set cooldown periods for frequent events
- Limit max executions per user for non-critical notifications
- Monitor rule execution metrics

### 4. Testing

- Test notification flows with the provided test script
- Create unit tests for custom rule conditions
- Verify template rendering with various data scenarios
- Test user preference filtering

## Monitoring and Analytics

### Built-in Tracking

- Rule execution counts and timing
- Template usage statistics
- Notification delivery status
- User preference compliance

### Querying Notifications

```javascript
// Get user notifications
const notifications = await getUserNotifications(userId);

// Get system-wide notifications
const allNotifications = await getAllNotifications();

// Mark as read
await markNotificationAsRead(notificationId);
```

## Migration from Legacy System

The new system maintains backward compatibility:

1. **Existing trigger functions** still work but now use the rule engine internally
2. **Legacy parameters** are mapped to the new context structure
3. **User preferences** continue to be respected
4. **Channel strategies** remain the same

## Troubleshooting

### Common Issues

1. **No notifications generated**
   - Check if matching rules exist and are active
   - Verify user types in rule configuration
   - Check time-based constraints

2. **Template rendering fails**
   - Ensure all required variables are provided
   - Check template variable definitions
   - Verify localization exists for user language

3. **Rules not executing**
   - Check rule conditions and test data
   - Verify cooldown periods aren't blocking execution
   - Check time range and day restrictions

### Debug Mode

Enable debug logging in the rule engine:

```javascript
console.log("Rule evaluation context:", context);
console.log("Matching rules found:", rules.length);
```

## Future Enhancements

- Web UI for rule and template management
- A/B testing capabilities
- Advanced analytics dashboard
- Machine learning-based optimization
- Webhook integrations
- Real-time notification streaming

---

This rule engine provides a robust foundation for notification management that can scale with your application's growth and changing business requirements.