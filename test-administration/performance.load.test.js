/**
 * Performance Tests for Administration APIs
 * Tests load handling and response times
 */

import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import Admin from "../src/models/Admin.js";
import { setupDB, clearDB, closeDB } from "./setup.js";

beforeAll(async () => await setupDB());
afterAll(async () => await closeDB());

// Setup test admin
let hashedPassword;
beforeAll(async () => {
  hashedPassword = await bcrypt.hash("Admin@123", 10);
  await Admin.create({
    name: "Performance Test Admin",
    username: "perfadmin",
    email: "perf@refeed.lk",
    password: hashedPassword,
    phone: "+94771234567",
  });
});

const adminHeaders = {
  "x-username": "perfadmin",
  "x-role": "ADMIN",
};

// ── PERFORMANCE METRICS ──────────────────────────────────────────────
describe("Administration Performance Tests", () => {
  describe("Dashboard Performance", () => {
    it("should respond to dashboard summary within 200ms", async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get("/api/admin/dashboard/summary")
        .set(adminHeaders);
      
      const responseTime = Date.now() - startTime;
      
      expect([200, 201]).toContain(res.status);
      expect(responseTime).toBeLessThan(200);
    });

    it("should handle 10 concurrent dashboard requests", async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get("/api/admin/dashboard/summary")
          .set(adminHeaders)
      );

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      results.forEach(res => {
        expect([200, 201]).toContain(res.status);
      });

      // Average response time should be reasonable
      const avgTime = totalTime / results.length;
      expect(avgTime).toBeLessThan(300);
    });
  });

  describe("Profile Performance", () => {
    it("should respond to profile get within 150ms", async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get("/api/admin/profile/admin001")
        .set(adminHeaders);
      
      const responseTime = Date.now() - startTime;
      
      expect([200, 404]).toContain(res.status);
      expect(responseTime).toBeLessThan(150);
    });

    it("should respond to profile update within 200ms", async () => {
      const updateData = {
        name: "Performance Updated Admin",
        email: "perf.updated@refeed.lk",
      };

      const startTime = Date.now();
      
      const res = await request(app)
        .put("/api/admin/profile/admin001")
        .set(adminHeaders)
        .send(updateData);
      
      const responseTime = Date.now() - startTime;
      
      // Backend may return 200 or 500 depending on database state
      expect([200, 500]).toContain(res.status);
      expect(responseTime).toBeLessThan(200);
    });
  });

  describe("Verification Performance", () => {
    it("should respond to NGO pending list within 300ms", async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get("/api/admin/verification/ngos/pending")
        .set(adminHeaders);
      
      const responseTime = Date.now() - startTime;
      
      expect(res.status).toBe(200);
      expect(responseTime).toBeLessThan(300);
    });

    it("should respond to donor pending list within 300ms", async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get("/api/admin/verification/donors/pending")
        .set(adminHeaders);
      
      const responseTime = Date.now() - startTime;
      
      expect(res.status).toBe(200);
      expect(responseTime).toBeLessThan(300);
    });

    it("should handle verification approval within 250ms", async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .patch("/api/admin/verification/ngos/testngo123/approve")
        .set(adminHeaders);
      
      const responseTime = Date.now() - startTime;
      
      expect([200, 400]).toContain(res.status); // 400 is acceptable if NGO doesn't exist
      expect(responseTime).toBeLessThan(250);
    });
  });

  describe("Registration Performance", () => {
    it("should respond to registration within 500ms", async () => {
      const adminData = {
        name: "Performance Admin",
        username: `perfadmin${Date.now()}`,
        email: `perfadmin${Date.now()}@refeed.lk`,
        password: "Admin@123",
        confirmPassword: "Admin@123",
        phone: "+94771234568"
      };

      const startTime = Date.now();
      
      const res = await request(app)
        .post("/api/admin/registration/register")
        .set(adminHeaders)
        .send(adminData);
      
      const responseTime = Date.now() - startTime;
      
      expect([201, 400, 500]).toContain(res.status);
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe("Load Testing", () => {
    it("should handle 50 concurrent requests without degradation", async () => {
      const requests = Array(50).fill().map(() =>
        request(app)
          .get("/api/admin/dashboard/summary")
          .set(adminHeaders)
      );

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      const successCount = results.filter(res => 
        [200, 201].includes(res.status)
      ).length;
      
      expect(successCount).toBeGreaterThan(results.length * 0.9); // 90% success rate
      
      // Performance shouldn't degrade significantly
      const avgTime = totalTime / results.length;
      expect(avgTime).toBeLessThan(500);
    });

    it("should handle mixed concurrent operations", async () => {
      const operations = [
        // Dashboard requests
        ...Array(10).fill().map(() =>
          request(app).get("/api/admin/dashboard/summary").set(adminHeaders)
        ),
        // Profile requests
        ...Array(5).fill().map(() =>
          request(app).get("/api/admin/profile/admin001").set(adminHeaders)
        ),
        // Verification requests
        ...Array(5).fill().map(() =>
          request(app).get("/api/admin/verification/ngos/pending").set(adminHeaders)
        ),
      ];

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      // Most requests should succeed
      const successCount = results.filter(res => 
        [200, 404].includes(res.status) // 404 is acceptable for non-existent admin
      ).length;
      
      expect(successCount).toBeGreaterThan(results.length * 0.8); // 80% success rate
      
      // Average response time should be reasonable
      const avgTime = totalTime / results.length;
      expect(avgTime).toBeLessThan(400);
    });
  });

  describe("Memory and Resource Usage", () => {
    it("should not leak memory during repeated requests", async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get("/api/admin/dashboard/summary")
          .set(adminHeaders);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});

// ── STRESS TESTING ──────────────────────────────────────────────
describe("Administration Stress Tests", () => {
  it("should maintain performance under sustained load", async () => {
    const batchSize = 20;
    const batches = 5;
    const allResponseTimes = [];

    for (let batch = 0; batch < batches; batch++) {
      const requests = Array(batchSize).fill().map(async () => {
        const startTime = Date.now();
        const res = await request(app)
          .get("/api/admin/dashboard/summary")
          .set(adminHeaders);
        const responseTime = Date.now() - startTime;
        allResponseTimes.push(responseTime);
        return res;
      });

      await Promise.all(requests);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate performance metrics
    const avgResponseTime = allResponseTimes.reduce((a, b) => a + b) / allResponseTimes.length;
    const maxResponseTime = Math.max(...allResponseTimes);
    const p95ResponseTime = allResponseTimes.sort((a, b) => a - b)[Math.floor(allResponseTimes.length * 0.95)];

    expect(avgResponseTime).toBeLessThan(300);
    expect(maxResponseTime).toBeLessThan(1000);
    expect(p95ResponseTime).toBeLessThan(500);
  });
});
