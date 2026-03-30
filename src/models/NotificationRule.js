import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true // e.g., "user.userType", "donation.category", "time.hour"
  },
  operator: {
    type: String,
    enum: ["equals", "not_equals", "in", "not_in", "greater_than", "less_than", "contains", "starts_with", "ends_with"],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["send_notification", "delay", "escalate", "suppress"],
    required: true
  },
  channels: [{
    type: String,
    enum: ["EMAIL", "SMS", "INAPP"]
  }],
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NotificationTemplate"
  },
  delay: {
    minutes: Number,
    hours: Number,
    days: Number
  },
  priority: {
    type: String,
    enum: ["LOW", "NORMAL", "HIGH"],
    default: "NORMAL"
  }
});

const notificationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    description: {
      type: String,
      trim: true
    },
    
    eventType: {
      type: String,
      required: true // e.g., "DONATION_CREATED", "USER_REGISTRATION"
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    priority: {
      type: Number,
      default: 100 // Lower numbers = higher priority for rule execution order
    },
    
    conditions: [conditionSchema],
    
    actions: [actionSchema],
    
    // Rule applicability settings
    applicableUserTypes: [{
      type: String,
      enum: ["donor", "ngo", "admin"]
    }],
    
    // Frequency controls
    cooldownPeriod: {
      type: Number, // minutes
      default: 0
    },
    
    maxExecutionsPerUser: {
      type: Number,
      default: null // null = unlimited
    },
    
    // Time-based controls
    activeTimeRange: {
      start: String, // "09:00"
      end: String    // "18:00"
    },
    
    activeDays: [{
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    }],
    
    // Audit trail
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    
    executionCount: {
      type: Number,
      default: 0
    },
    
    lastExecuted: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
notificationRuleSchema.index({ eventType: 1, isActive: 1, priority: 1 });
notificationRuleSchema.index({ applicableUserTypes: 1 });
notificationRuleSchema.index({ createdAt: -1 });

// Virtual for rule status
notificationRuleSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.maxExecutionsPerUser && this.executionCount >= this.maxExecutionsPerUser) return 'exhausted';
  return 'active';
});

export default mongoose.model("NotificationRule", notificationRuleSchema);