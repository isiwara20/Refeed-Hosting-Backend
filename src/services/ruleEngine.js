import NotificationRule from "../models/NotificationRule.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import Notification from "../models/notification.js";
import mongoose from "mongoose";

/**
 * Rule Engine for processing notification rules
 */
class RuleEngine {
  
  /**
   * Evaluate all applicable rules for a given event
   * @param {Object} context - Event context containing user, event data, etc.
   * @returns {Array} Array of actions to execute
   */
  async evaluateRules(context) {
    const { eventType, user, data } = context;
    
    try {
      // Find all active rules for this event type
      const rules = await NotificationRule.find({
        eventType,
        isActive: true,
        $or: [
          { applicableUserTypes: { $size: 0 } }, // No user type restriction
          { applicableUserTypes: user?.userType }
        ]
      }).sort({ priority: 1 }); // Lower priority number = higher precedence
      
      const actionsToExecute = [];
      
      for (const rule of rules) {
        // Check if rule should be executed based on timing and frequency
        if (await this._shouldExecuteRule(rule, user, context)) {
          // Evaluate rule conditions
          if (await this._evaluateConditions(rule.conditions, context)) {
            // Add rule actions to execution list
            actionsToExecute.push(...rule.actions.map(action => ({
              ...action.toObject(),
              ruleId: rule._id,
              ruleName: rule.name
            })));
            
            // Update rule execution tracking
            await this._updateRuleExecution(rule);
          }
        }
      }
      
      return actionsToExecute;
    } catch (error) {
      console.error('Rule evaluation error:', error);
      return [];
    }
  }
  
  /**
   * Check if a rule should be executed based on timing and frequency constraints
   */
  async _shouldExecuteRule(rule, user, context) {
    try {
      // Check time range constraints
      if (rule.activeTimeRange && rule.activeTimeRange.start && rule.activeTimeRange.end) {
        const now = new Date();
        const currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        
        if (currentTime < rule.activeTimeRange.start || currentTime > rule.activeTimeRange.end) {
          return false;
        }
      }
      
      // Check day constraints
      if (rule.activeDays && rule.activeDays.length > 0) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!rule.activeDays.includes(today)) {
          return false;
        }
      }
      
      // Check cooldown period
      if (rule.cooldownPeriod > 0 && user) {
        const cooldownStart = new Date(Date.now() - (rule.cooldownPeriod * 60 * 1000));
        const recentExecution = await Notification.findOne({
          userId: user._id,
          ruleId: rule._id,
          createdAt: { $gte: cooldownStart }
        });
        
        if (recentExecution) {
          return false;
        }
      }
      
      // Check max executions per user
      if (rule.maxExecutionsPerUser && user) {
        const executionCount = await Notification.countDocuments({
          userId: user._id,
          ruleId: rule._id
        });
        
        if (executionCount >= rule.maxExecutionsPerUser) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Rule execution check error:', error);
      return false;
    }
  }
  
  /**
   * Evaluate rule conditions against the provided context
   */
  async _evaluateConditions(conditions, context) {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions means rule always applies
    }
    
    try {
      // All conditions must be true (AND logic)
      for (const condition of conditions) {
        const fieldValue = this._getFieldValue(condition.field, context);
        
        if (!this._evaluateCondition(condition, fieldValue)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }
  
  /**
   * Get field value from context using dot notation
   */
  _getFieldValue(fieldPath, context) {
    const paths = fieldPath.split('.');
    let value = context;
    
    for (const path of paths) {
      if (value && typeof value === 'object' && path in value) {
        value = value[path];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  /**
   * Evaluate a single condition
   */
  _evaluateCondition(condition, fieldValue) {
    const { operator, value: expectedValue } = condition;
    
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      case 'starts_with':
        return String(fieldValue).startsWith(String(expectedValue));
      case 'ends_with':
        return String(fieldValue).endsWith(String(expectedValue));
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
  
  /**
   * Update rule execution tracking
   */
  async _updateRuleExecution(rule) {
    try {
      await NotificationRule.findByIdAndUpdate(rule._id, {
        $inc: { executionCount: 1 },
        lastExecuted: new Date()
      });
    } catch (error) {
      console.error('Rule execution update error:', error);
    }
  }
  
  /**
   * Process actions and create notifications
   */
  async processActions(actions, context) {
    const results = [];
    
    for (const action of actions) {
      switch (action.type) {
        case 'send_notification':
          const notification = await this._processSendNotificationAction(action, context);
          if (notification) results.push(notification);
          break;
        case 'delay':
          await this._processDelayAction(action, context);
          break;
        case 'escalate':
          await this._processEscalateAction(action, context);
          break;
        case 'suppress':
          await this._processSuppressAction(action, context);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    }
    
    return results;
  }
  
  /**
   * Process send notification action
   */
  async _processSendNotificationAction(action, context) {
    try {
      const template = await NotificationTemplate.findById(action.templateId);
      if (!template) {
        console.error(`Template not found: ${action.templateId}`);
        return null;
      }
      
      const rendered = template.render(context.data || {}, context.user?.language || 'en');
      
      const notifications = [];
      const channels = action.channels || ['INAPP'];
      
      for (const channel of channels) {
        const notification = await Notification.create({
          userId: context.user?._id,
          eventType: context.eventType,
          channel,
          subject: rendered.subject,
          message: channel === 'EMAIL' ? rendered.bodyHtml : rendered.bodyText,
          priority: action.priority || 'NORMAL',
          status: 'PENDING',
          ruleId: action.ruleId,
          templateId: action.templateId,
          metadata: {
            ...context.data,
            ruleExecuted: action.ruleName
          }
        });
        
        notifications.push(notification);
      }
      
      // Update template usage
      await NotificationTemplate.findByIdAndUpdate(action.templateId, {
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      });
      
      return notifications;
    } catch (error) {
      console.error('Send notification action error:', error);
      return null;
    }
  }
  
  /**
   * Process delay action (schedule for later)
   */
  async _processDelayAction(action, context) {
    const { delay } = action;
    const scheduledFor = new Date();
    
    if (delay.minutes) scheduledFor.setMinutes(scheduledFor.getMinutes() + delay.minutes);
    if (delay.hours) scheduledFor.setHours(scheduledFor.getHours() + delay.hours);
    if (delay.days) scheduledFor.setDate(scheduledFor.getDate() + delay.days);
    
    // Create a delayed notification record
    await Notification.create({
      userId: context.user?._id,
      eventType: context.eventType + '_DELAYED',
      channel: 'INAPP',
      subject: 'Delayed Action',
      message: `Action delayed until ${scheduledFor.toISOString()}`,
      priority: action.priority || 'NORMAL',
      status: 'PENDING',
      scheduledFor,
      ruleId: action.ruleId,
      metadata: context.data
    });
  }
  
  /**
   * Process escalate action
   */
  async _processEscalateAction(action, context) {
    // Implementation for escalation logic
    console.log('Escalate action triggered:', action, context);
  }
  
  /**
   * Process suppress action
   */
  async _processSuppressAction(action, context) {
    // Mark similar notifications as suppressed
    await Notification.updateMany({
      userId: context.user?._id,
      eventType: context.eventType,
      status: 'PENDING'
    }, {
      status: 'SUPPRESSED',
      metadata: {
        suppressedBy: action.ruleId,
        suppressedAt: new Date()
      }
    });
  }
}

export default new RuleEngine();