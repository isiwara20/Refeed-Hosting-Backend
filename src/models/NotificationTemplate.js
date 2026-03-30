import mongoose from "mongoose";

const variableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // e.g., "userName", "donationTitle", "verificationStatus"
  },
  description: {
    type: String
  },
  defaultValue: {
    type: String
  },
  required: {
    type: Boolean,
    default: false
  }
});

const localizationSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    default: "en"
  },
  subject: {
    type: String,
    required: true
  },
  bodyText: {
    type: String,
    required: true
  },
  bodyHtml: {
    type: String
  }
});

const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    
    description: {
      type: String,
      trim: true
    },
    
    category: {
      type: String,
      required: true,
      enum: ["auth", "donation", "verification", "order", "complaint", "general"]
    },
    
    eventType: {
      type: String,
      required: true
    },
    
    // Template content with localization support
    localizations: [localizationSchema],
    
    // Variables that can be used in the template
    variables: [variableSchema],
    
    // Channel-specific settings
    channelSettings: {
      email: {
        enabled: { type: Boolean, default: true },
        fromName: String,
        replyTo: String,
        attachments: [String]
      },
      sms: {
        enabled: { type: Boolean, default: true },
        maxLength: { type: Number, default: 160 }
      },
      inApp: {
        enabled: { type: Boolean, default: true },
        actionButtons: [{
          label: String,
          action: String,
          url: String
        }]
      }
    },
    
    // Template status and versioning
    version: {
      type: Number,
      default: 1
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Usage tracking
    usageCount: {
      type: Number,
      default: 0
    },
    
    lastUsed: {
      type: Date
    },
    
    // Audit trail
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
notificationTemplateSchema.index({ category: 1, eventType: 1 });
notificationTemplateSchema.index({ isActive: 1 });

// Methods for template processing
notificationTemplateSchema.methods.render = function(variables = {}, language = 'en') {
  const localization = this.localizations.find(l => l.language === language) || 
                      this.localizations.find(l => l.language === 'en') ||
                      this.localizations[0];
  
  if (!localization) {
    throw new Error(`No localization found for template ${this.name}`);
  }
  
  let subject = localization.subject;
  let bodyText = localization.bodyText;
  let bodyHtml = localization.bodyHtml || bodyText;
  
  // Replace variables in the template
  this.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const regex = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g');
    
    subject = subject.replace(regex, value);
    bodyText = bodyText.replace(regex, value);
    bodyHtml = bodyHtml.replace(regex, value);
  });
  
  return {
    subject,
    bodyText,
    bodyHtml
  };
};

// Static method to find template by event type
notificationTemplateSchema.statics.findByEventType = function(eventType) {
  return this.findOne({ eventType, isActive: true });
};

export default mongoose.model("NotificationTemplate", notificationTemplateSchema);