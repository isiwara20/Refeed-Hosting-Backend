# NGO User Registration Testing Suite

## Overview

Complete testing suite for NGO user registration component with **3 testing types**: Unit Testing, Integration Testing, and Performance Testing.

**Status**:  **ALL TESTS PASSING** (60 tests)

---

## Quick Start

### Run All Tests
```bash
npm run test:ngo:all
```

### Run Individual Test Suites
```bash
# Unit tests only
npm run test:ngo:unit

# Integration tests only
npm run test:ngo:integration

# Performance tests only
npm test -- test-ngo_userReg/performance.load.test.js --testTimeout=60000
```

---

## Test Suites

### 1. Unit Testing (24 tests)
**File**: `simple.test.js`

Tests validation logic for individual components:
- ✅ Email validation (3 tests)
- ✅ Password validation (5 tests)
- ✅ Phone validation (3 tests)
- ✅ Postal code validation (3 tests)
- ✅ Urgency level validation (2 tests)
- ✅ Category validation (2 tests)
- ✅ Date validation (2 tests)
- ✅ Delivery type validation (2 tests)
- ✅ Order status validation (2 tests)

**Execution Time**: ~2 seconds
**Status**: ✅ All 24 tests passing

---

### 2. Integration Testing (24 tests)
**File**: `api.realistic.test.js`

Tests API endpoints and database interactions:
- ✅ Authentication endpoints (4 tests)
  - Register donator
  - Register NGO
  - Handle registration errors
  - Handle mismatched passwords

- ✅ OTP endpoints (2 tests)
  - Send OTP
  - Verify OTP

- ✅ Password reset endpoints (2 tests)
  - Identify user
  - Reset password

- ✅ NGO verification endpoints (2 tests)
  - Submit verification
  - Get verification status

- ✅ Food request endpoints (5 tests)
  - Create food request
  - Get all requests
  - Get requests by username
  - Update request
  - Delete request

- ✅ NGO address endpoints (5 tests)
  - Add address
  - Get all addresses
  - Get addresses by username
  - Update address
  - Delete address

- ✅ Donation order endpoints (3 tests)
  - Place order
  - Get orders by NGO
  - Update order status

- ✅ Donation picking endpoints (1 test)
  - Get picking location

**Database**: In-memory MongoDB (mongodb-memory-server)
**Execution Time**: ~16 seconds
**Status**: ✅ All 24 tests passing

---

### 3. Performance Testing (12 tests)
**File**: `performance.load.test.js`

Tests JavaScript performance metrics and benchmarks:
- ✅ Performance Metrics (5 tests)
  - Basic computation time
  - Memory usage monitoring
  - Array operations performance
  - Object creation performance
  - String operations performance

- ✅ Concurrent Operations (3 tests)
  - Concurrent promise handling
  - Sequential promise handling
  - Concurrent computation

- ✅ Data Structure Performance (3 tests)
  - Map operations
  - Set operations
  - Object lookup performance

- ✅ Performance Benchmarks (1 test)
  - Generate performance report

**Execution Time**: ~5 seconds
**Status**: ✅ All 12 tests passing

---

## Test Results Summary

```
Test Suites: 3 passed, 3 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        ~21 seconds
Success Rate: 100%
```

### Breakdown
| Test Type | Count | Status |
|-----------|-------|--------|
| Unit Tests | 24 | ✅ PASS |
| Integration Tests | 24 | ✅ PASS |
| Performance Tests | 12 | ✅ PASS |
| **Total** | **60** | **✅ PASS** |

---

## Performance Metrics

### Computation Performance
- Basic computation: 16ms
- Array operations: 25ms
- Object creation: 66ms
- String concatenation: 18ms

### Concurrent Operations
- 10 concurrent promises: 106ms
- 5 sequential promises: 540ms
- 5 concurrent computations: 46ms

### Data Structures
- Map operations (100k items): 170ms
- Set operations (100k items): 77ms
- Object lookup (100k items): 457ms

### Memory Management
- Heap memory increase: 9.54MB
- Garbage collection: Properly handled
- No memory leaks detected

---

## Test Data

### Registration Test Data
```javascript
{
  name: 'Performance Test User',
  email: 'perf[timestamp]@test.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  phone: '0706125515',
  role: 'donator'
}
```

### Food Request Test Data
```javascript
{
  username: 'perfngo',
  email: 'perf@test.com',
  phone: '0706125515',
  location: 'Kandy',
  category: 'vegetable',
  urgencyLevel: 'high',
  expiryRequirement: '2026-04-30'
}
```

---

## Environment Setup

### Prerequisites
- Node.js 14+
- npm 6+
- MongoDB (in-memory for tests)

### Dependencies
```json
{
  "jest": "^29.7.0",
  "supertest": "^7.0.0",
  "mongodb-memory-server": "^10.1.2",
  "cross-env": "^7.0.3"
}
```

### Installation
```bash
npm install
```

---

## Running Tests

### All Tests
```bash
npm run test:ngo:all
```

### Unit Tests Only
```bash
npm run test:ngo:unit
```

### Integration Tests Only
```bash
npm run test:ngo:integration
```

### Performance Tests Only
```bash
npm test -- test-ngo_userReg/performance.load.test.js --testTimeout=60000
```

### Watch Mode
```bash
npm test -- --watch
```

### With Coverage
```bash
npm test -- --coverage
```

---

## Test Configuration

### Jest Configuration
- **Test Environment**: Node
- **Test Timeout**: 60000ms (60 seconds)
- **Run In Band**: Yes (sequential execution)
- **Verbose**: Yes

### Database Configuration
- **Type**: MongoDB (in-memory)
- **Auto-cleanup**: Yes
- **Isolation**: Each test gets fresh database

---

## Validation Rules Tested

### Email Validation
- ✅ Valid format: `user@example.com`
- ❌ Invalid format: `userexample.com`
- ❌ Missing domain: `user@`

### Password Validation
- ✅ Strong: `Password123!`
- ❌ No uppercase: `password123!`
- ❌ No number: `Password!`
- ❌ No special char: `Password123`
- ❌ Too short: `Pass1!`

### Phone Validation
- ✅ Valid: `0706125515`
- ❌ With letters: `070abc5515`
- ❌ Too short: `070612`

### Postal Code Validation
- ✅ Valid: `12345`
- ❌ With letters: `1234a`
- ❌ Wrong length: `123`

### Urgency Level Validation
- ✅ Valid: `high`, `medium`, `low`
- ❌ Invalid: `urgent`, `critical`

### Category Validation
- ✅ Valid: `vegetable`, `fruit`, `cooked`
- ❌ Invalid: `other`, `unknown`

### Date Validation
- ✅ Future date: `2026-04-30`
- ❌ Past date: `2020-01-01`

### Delivery Type Validation
- ✅ Valid: `pickup`, `delivery`
- ❌ Invalid: `mail`, `courier`

### Order Status Validation
- ✅ Valid: `pending`, `confirmed`, `completed`
- ❌ Invalid: `processing`, `shipped`

---

## API Endpoints Tested

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP

### Password Management
- `POST /api/password/identify` - Identify user
- `POST /api/password/reset-password` - Reset password

### NGO Verification
- `POST /api/ngo-verification/submit` - Submit verification
- `GET /api/ngo-verification/status/:username` - Get verification status

### Food Requests
- `POST /api/food-requests/create` - Create request
- `GET /api/food-requests/all` - Get all requests
- `GET /api/food-requests/user/:username` - Get user requests
- `PUT /api/food-requests/update/:id` - Update request
- `DELETE /api/food-requests/delete/:id` - Delete request

### NGO Addresses
- `POST /api/ngo-Address` - Add address
- `GET /api/ngo-Address/` - Get all addresses
- `GET /api/ngo-Address/:username` - Get user addresses
- `PUT /api/ngo-Address/:id` - Update address
- `DELETE /api/ngo-Address/:id` - Delete address

### Donation Orders
- `POST /api/donation-orders-status/` - Place order
- `GET /api/donation-orders-status/ngo/:username` - Get NGO orders
- `PATCH /api/donation-orders-status/:id` - Update order status

### Donations
- `GET /api/donations-picking/:id` - Get picking location

---

## Troubleshooting

### Tests Timing Out
- Increase timeout: `--testTimeout=120000`
- Check database connection
- Verify MongoDB is running

### Memory Issues
- Run tests individually
- Clear node_modules and reinstall
- Check for memory leaks in code

### Database Errors
- Ensure mongodb-memory-server is installed
- Check Node.js version compatibility
- Clear Jest cache: `npm test -- --clearCache`

### Port Conflicts
- Change test port in configuration
- Kill processes using port 5000

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npm run test:ngo:all

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Jenkins Example
```groovy
stage('Test') {
  steps {
    sh 'npm run test:ngo:all'
  }
}
```

---

## Best Practices

1. **Run tests before committing**
   ```bash
   npm run test:ngo:all
   ```

2. **Keep tests isolated**
   - Each test should be independent
   - Use fresh database for each test

3. **Use meaningful test names**
   - Describe what is being tested
   - Use "should" pattern

4. **Mock external services**
   - Don't call real APIs
   - Use in-memory databases

5. **Monitor performance**
   - Track test execution time
   - Alert on performance regressions

---

## Documentation

- **Unit Tests**: Validation logic testing
- **Integration Tests**: API endpoint testing
- **Performance Tests**: JavaScript performance metrics
- **Test Data**: Realistic test scenarios
- **Error Handling**: Graceful error recovery

---

## Support

For issues or questions:
1. Check test output for error messages
2. Review test file comments
3. Check API documentation
4. Review database schema

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial release with 3 test types |

---

**Status**: ✅ Production Ready
**Last Updated**: April 1, 2026
**Total Tests**: 60
**Success Rate**: 100%
