/**
 * Artillery.io Processor
 * Custom functions for load testing
 */

module.exports = {
  // Setup function - runs once before tests
  setup: function(context, ee, next) {
    console.log('Starting load test...');
    next();
  },

  // Cleanup function - runs once after tests
  cleanup: function(context, ee, next) {
    console.log('Load test completed');
    next();
  },

  // Before request - runs before each request
  beforeRequest: function(requestParams, context, ee, next) {
    // Add timestamp to track request timing
    requestParams.timestamp = Date.now();
    next();
  },

  // After response - runs after each response
  afterResponse: function(requestParams, response, context, ee, next) {
    // Calculate response time
    const responseTime = Date.now() - requestParams.timestamp;
    
    // Log slow requests
    if (responseTime > 1000) {
      console.log(`Slow request detected: ${requestParams.url} took ${responseTime}ms`);
    }
    
    // Emit custom metric
    ee.emit('customStat', {
      stat: 'response_time',
      value: responseTime,
      tags: ['endpoint:' + requestParams.url]
    });
    
    next();
  },

  // Generate random email
  generateEmail: function(context, ee, next) {
    context.vars.randomEmail = `test${Date.now()}@example.com`;
    next();
  },

  // Generate random phone
  generatePhone: function(context, ee, next) {
    context.vars.randomPhone = `070612${Math.floor(Math.random() * 10000)}`;
    next();
  },

  // Generate random username
  generateUsername: function(context, ee, next) {
    context.vars.randomUsername = `user${Math.floor(Math.random() * 100000)}`;
    next();
  }
};
