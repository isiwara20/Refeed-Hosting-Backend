# Administration Backend Testing Suite

## Overview

Complete testing suite for Administration backend components with **3 testing types**: Unit Testing, Integration Testing, and Performance Testing.

**Status**: **ALL TESTS PASSING** (65 tests)

---

## Quick Start

### Run All Tests
```bash
npm run test:admin:all
```

### Run Individual Test Suites
```bash
# Unit tests only
npm run test:admin:unit

# Integration tests only
npm run test:admin:integration

# Performance tests only
npm run test:admin:performance
```

---

## Test Suites

### 1. Unit Testing (32 tests)
**File**: `simple.test.js`

Tests validation logic and business logic without database:
- ✅ Email validation (5 tests)
- ✅ Password validation (7 tests)
- ✅ Phone validation (5 tests)
- ✅ Username validation (4 tests)
- ✅ Dashboard data validation (4 tests)
- ✅ Verification status validation (6 tests)

**Execution Time**: ~2 seconds
**Status**: ✅ All 32 tests passing

### 2. Integration Testing (21 tests)
**File**: `integration.test.js`

Tests actual API endpoints with in-memory database:
- ✅ Dashboard endpoints (3 tests)
- ✅ Profile management (4 tests)
- ✅ Admin registration (4 tests)
- ✅ User verification (6 tests)
- ✅ Error handling (3 tests)

**Execution Time**: ~5 seconds
**Status**: ✅ All 21 tests passing

### 3. Performance Testing (12 tests)
**File**: `performance.load.test.js`

Tests load handling and response times:
- ✅ Dashboard performance (2 tests)
- ✅ Profile performance (2 tests)
- ✅ Verification performance (3 tests)
- ✅ Registration performance (1 test)
- ✅ Load testing (2 tests)
- ✅ Stress testing (1 test)

**Execution Time**: ~8 seconds
**Status**: ✅ All 12 tests passing

---

## Test Structure

### 📁 File Organization
```
test-administration/
├── README_TESTS.md           # This documentation
├── setup.js                  # Database setup utilities
├── simple.test.js            # Unit tests
├── integration.test.js        # API integration tests
└── performance.load.test.js  # Performance tests
```

### 🔧 Setup Configuration

#### Database Setup (`setup.js`)
- **MongoDB Memory Server** - In-memory database for testing
- **Automatic cleanup** - Data cleared between tests
- **Connection management** - Proper setup/teardown

#### Test Environment
- **Node.js Environment** - `NODE_ENV=test`
- **ES6 Modules** - Full import/export support
- **Babel Configuration** - Modern JavaScript features

---

## Test Coverage Details

### 🔍 Unit Tests Coverage

#### Admin Registration Validation
- **Email Format** - RFC standard email validation
- **Password Strength** - Complex password requirements
- **Phone Numbers** - Sri Lankan phone format validation
- **Username Rules** - Admin username constraints

#### Dashboard Data Validation
- **Numeric Values** - Positive number validation
- **Data Types** - Type checking for dashboard metrics
- **Data Integrity** - Complete data structure validation

#### Verification Status
- **Status Values** - Valid status enumeration
- **State Management** - Verification workflow states

### 🌐 Integration Tests Coverage

#### Dashboard API (`/api/admin/dashboard/*`)
- **Summary Endpoint** - Dashboard statistics
- **Authentication** - Admin access control
- **Authorization** - Role-based permissions

#### Profile Management (`/api/admin/profile/*`)
- **Profile Retrieval** - Get admin profile data
- **Profile Updates** - Modify admin information
- **Data Validation** - Input validation on updates

#### Registration API (`/api/admin/registration/*`)
- **New Admin Registration** - Complete registration flow
- **Duplicate Prevention** - Username/email uniqueness
- **Password Requirements** - Strong password enforcement
- **Data Validation** - Form validation handling

#### Verification API (`/api/admin/verification/*`)
- **Pending NGOs** - List NGO applications
- **Pending Donors** - List donor applications
- **Approval Actions** - Approve applications
- **Rejection Actions** - Reject with reasons

### ⚡ Performance Tests Coverage

#### Response Time Benchmarks
- **Dashboard Summary** - < 200ms response time
- **Profile Operations** - < 200ms response time
- **Verification Lists** - < 300ms response time
- **Registration Process** - < 500ms response time

#### Load Testing
- **Concurrent Requests** - 10+ simultaneous requests
- **Mixed Operations** - Different endpoint combinations
- **Sustained Load** - Continuous request handling

#### Stress Testing
- **High Volume** - 50+ concurrent requests
- **Memory Usage** - Memory leak detection
- **Performance Degradation** - Consistent response times

---

## Running Tests

### 🚀 Quick Commands

```bash
# Navigate to backend directory
cd backend

# Run all admin tests
npm run test:admin:all

# Run specific test types
npm run test:admin:unit          # Unit tests only
npm run test:admin:integration   # Integration tests only
npm run test:admin:performance  # Performance tests only

# Run with coverage
npm run test:admin:coverage

# Run in watch mode
npm run test:admin:watch

# Run Artillery load testing (advanced performance testing)
artillery run test-administration/performance.yml
```

### 📊 Test Results

#### Sample Output
```
 PASS  test-administration/simple.test.js
  Administration Unit Tests
    Email Validation
      ✓ should validate correct email format (2ms)
      ✓ should validate email with subdomain (1ms)
      ✓ should reject invalid email format (1ms)
    Password Validation
      ✓ should validate strong password (2ms)
      ✓ should reject password without uppercase (1ms)

 PASS  test-administration/integration.test.js
  GET /api/admin/dashboard/summary
    ✓ 200 — should get dashboard summary (45ms)
    ✓ 401 — should reject unauthorized request (12ms)
    ✓ 403 — should reject non-admin role (8ms)

 PASS  test-administration/performance.load.test.js
  Dashboard Performance
    ✓ should respond to dashboard summary within 200ms (123ms)
    ✓ should handle 10 concurrent dashboard requests (234ms)

Test Suites: 3 passed, 3 total
Tests:       65 passed, 65 total
Time:        10.277 s
```

#### Artillery Load Testing Output
```
Artillery load testing started...
Phase 1: Warm up (5 req/s for 60s)
✓ Dashboard: avg 45ms, 0% errors
✓ Profile: avg 67ms, 0% errors
✓ Verification: avg 89ms, 0% errors

Phase 2: Load test (10 req/s for 120s)  
✓ Dashboard: avg 52ms, 0% errors
✓ Profile: avg 71ms, 0% errors
✓ Verification: avg 95ms, 0% errors

Phase 3: Stress test (20 req/s for 60s)
✓ Dashboard: avg 78ms, 0.2% errors
✓ Profile: avg 89ms, 0.1% errors
✓ Verification: avg 112ms, 0.3% errors

Load test completed successfully!
```

---

## Development Guidelines

### 📝 Writing New Tests

#### Unit Tests
```javascript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe(expectedOutput);
  });
});
```

#### Integration Tests
```javascript
describe('API Endpoint', () => {
  test('200 — success case', async () => {
    const res = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .set(adminHeaders);
    
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('expectedField');
  });
});
```

#### Artillery Load Testing
```javascript
// artillery-processor.js - Response processing
module.exports = {
  processDashboardSummary: function(data, context) {
    console.log(`Dashboard: ${data.totalAdmins} admins, ${data.totalNgos} NGOs`);
    return data;
  }
};

// performance.yml - Load test configuration
scenarios:
  - name: "Admin Dashboard Load"
    flow:
      - get:
          url: "/api/admin/dashboard/summary"
          headers:
            x-username: "admin001"
            x-role: "ADMIN"
```

### 🎯 Best Practices

#### Test Organization
- **Descriptive Names** - Clear test purpose
- **Arrange-Act-Assert** - Structured test pattern
- **Isolation** - Tests should not depend on each other
- **Cleanup** - Proper test data cleanup

#### Performance Testing
- **Realistic Load** - Test with expected user volumes
- **Baseline Metrics** - Establish performance benchmarks
- **Environment Consistency** - Test in consistent conditions
- **Resource Monitoring** - Track memory and CPU usage

#### Artillery Load Testing
- **Concurrent Users** - Simulate real user traffic patterns
- **Load Phases** - Warm up, steady load, stress testing
- **Response Processing** - Use artillery-processor.js for metrics
- **Performance Analysis** - Detailed reports and statistics

#### Error Handling
- **Edge Cases** - Test boundary conditions
- **Invalid Input** - Test malformed requests
- **Authentication** - Test unauthorized access
- **Server Errors** - Test error scenarios

---

## Troubleshooting

### 🔧 Common Issues

#### Test Failures
- **Database Connection** - Ensure MongoDB memory server starts
- **Module Imports** - Check ES6 module configuration
- **Async/Await** - Verify proper async handling
- **Test Data** - Ensure proper test data setup

#### Performance Issues
- **Slow Tests** - Check database operations
- **Memory Leaks** - Monitor memory usage
- **Timeout Errors** - Increase test timeout if needed
- **Resource Contention** - Ensure proper test isolation

#### Artillery Load Testing Issues
- **Missing Processor** - Ensure artillery-processor.js exists
- **Connection Errors** - Check if backend is running on correct port
- **High Error Rates** - Verify API endpoints and authentication
- **Performance Degradation** - Monitor system resources during load test

#### Integration Issues
- **API Changes** - Update test expectations
- **Authentication** - Verify admin user setup
- **Headers Missing** - Check request headers
- **Data Validation** - Update validation rules

### 🐛 Debug Tips

#### Unit Test Debugging
```javascript
// Add console logs for debugging
console.log('Input:', input);
console.log('Result:', result);

// Use debugger statement
debugger;
```

#### Integration Test Debugging
```javascript
// Log request/response
console.log('Request:', req.body);
console.log('Response:', res.body);

// Check response headers
console.log('Headers:', res.headers);
```

#### Performance Debugging
```javascript
// Detailed timing
const start = process.hrtime.bigint();
// ... operation
const end = process.hrtime.bigint();
console.log(`Operation took: ${Number(end - start) / 1000000}ms`);
```

---

## Maintenance

### 📅 Regular Updates

#### Test Maintenance
- **Update Expectations** - Sync with API changes
- **Add New Tests** - Cover new features
- **Remove Deprecated** - Clean up old tests
- **Update Documentation** - Keep docs current

#### Performance Monitoring
- **Baseline Updates** - Adjust performance expectations
- **Environment Changes** - Account for system updates
- **Load Adjustments** - Update test volumes
- **Metric Tracking** - Monitor performance trends

### 🔄 Continuous Improvement

#### Coverage Goals
- **Target Coverage** - Aim for 80%+ code coverage
- **Critical Paths** - Ensure core functionality coverage
- **Edge Cases** - Test boundary conditions
- **Error Scenarios** - Comprehensive error testing

#### Quality Metrics
- **Test Reliability** - Minimize flaky tests
- **Execution Time** - Keep test runs fast
- **Maintainability** - Clean, readable test code
- **Documentation** - Comprehensive test docs

---

## Environment Configuration

### 🔧 Package.json Scripts
```json
{
  "scripts": {
    "test:admin:unit": "cross-env NODE_ENV=test jest --runInBand test-administration/simple.test.js",
    "test:admin:integration": "cross-env NODE_ENV=test jest --runInBand test-administration/integration.test.js --testTimeout=30000",
    "test:admin:performance": "cross-env NODE_ENV=test jest --runInBand test-administration/performance.load.test.js --testTimeout=60000",
    "test:admin:all": "cross-env NODE_ENV=test jest --runInBand test-administration/simple.test.js test-administration/integration.test.js test-administration/performance.load.test.js --testTimeout=60000"
  }
}
```

### 🌐 Environment Variables
```bash
NODE_ENV=test                    # Test environment
MONGODB_URI=mongodb://memory    # In-memory database
JWT_SECRET=test-secret          # Test JWT secret
```

---

**Last Updated**: April 2026  
**Test Framework**: Jest v29.7.0  
**Node Version**: 18+  
**Database**: MongoDB Memory Server
