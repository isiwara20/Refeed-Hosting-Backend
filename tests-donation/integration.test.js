import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import Donator from "../src/models/Donator.js";
import { setupDB, clearDB, closeDB } from "./setup.js";

beforeAll(async () => await setupDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const donorHeaders = (username) => ({
  "x-username": username,
  "x-role": "DONOR",
});

let hashedPassword;
beforeEach(async () => {
  hashedPassword = await bcrypt.hash("TestPass@123", 10);
  await Donator.create({
    name: "Integration Donor",
    username: "intdonor",
    email: "int@refeed.lk",
    password: hashedPassword,
    phone: "0771234567",
  });
});

// ── AUTH ──────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  test("200 — valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "intdonor", password: "TestPass@123" });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("intdonor");
    expect(res.body.role).toBe("DONATOR");
    expect(res.body.dashboard).toBe("/donator-dashboard");
  });

  test("401 — wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "intdonor", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("404 — user not found", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "ghost", password: "anything" });
    expect(res.status).toBe(404);
  });

  test("400 — missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "intdonor" });
    expect(res.status).toBe(400);
  });
});

// ── SURPLUS ───────────────────────────────────────────
describe("POST /api/surplus", () => {
  const futureDate = () => new Date(Date.now() + 3600 * 1000).toISOString();

  test("201 — creates draft donation", async () => {
    const res = await request(app)
      .post("/api/surplus")
      .set(donorHeaders("intdonor"))
      .send({
        foodType: "veg",
        quantity: { amount: 5, unit: "kg" },
        expiryTime: futureDate(),
        selfDelivery: false,
      });
    expect(res.status).toBe(201);
    expect(res.body.lifecycleStatus).toBe("DRAFT");
    expect(res.body.donorUsername).toBe("intdonor");
  });

  test("400/500 — missing required fields", async () => {
    const res = await request(app)
      .post("/api/surplus")
      .set(donorHeaders("intdonor"))
      .send({ foodType: "veg" });
    expect([400, 500]).toContain(res.status);
  });

  test("403 — wrong role", async () => {
    const res = await request(app)
      .post("/api/surplus")
      .set({ "x-username": "intdonor", "x-role": "NGO" })
      .send({
        foodType: "veg",
        quantity: { amount: 5, unit: "kg" },
        expiryTime: futureDate(),
      });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/surplus/mine", () => {
  test("200 — returns donor donations", async () => {
    // Create a draft first
    await request(app)
      .post("/api/surplus")
      .set(donorHeaders("intdonor"))
      .send({
        foodType: "cooked",
        quantity: { amount: 3, unit: "portions" },
        expiryTime: new Date(Date.now() + 3600 * 1000).toISOString(),
      });

    const res = await request(app)
      .get("/api/surplus/mine")
      .set(donorHeaders("intdonor"));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("POST /api/surplus/:id/publish", () => {
  test("200 — publishes a draft", async () => {
    const create = await request(app)
      .post("/api/surplus")
      .set(donorHeaders("intdonor"))
      .send({
        foodType: "veg",
        quantity: { amount: 5, unit: "kg" },
        expiryTime: new Date(Date.now() + 3600 * 1000).toISOString(),
      });
    const id = create.body._id;

    const res = await request(app)
      .post(`/api/surplus/${id}/publish`)
      .set(donorHeaders("intdonor"));
    expect(res.status).toBe(200);
    expect(res.body.lifecycleStatus).toBe("PUBLISHED");
  });
});

// ── DONOR PROFILE ─────────────────────────────────────
describe("POST /api/profile", () => {
  test("201 — creates donor profile", async () => {
    const res = await request(app)
      .post("/api/profile")
      .set({ "x-username": "intdonor", "x-role": "DONATOR" })
      .send({
        name: "Integration Donor",
        email: "int@refeed.lk",
        phone: "0771234567",
        nicNumber: "199012345678",
      });
    expect([200, 201]).toContain(res.status);
  });

  test("GET /api/profile/:username — fetches profile", async () => {
    await request(app)
      .post("/api/profile")
      .set({ "x-username": "intdonor", "x-role": "DONATOR" })
      .send({
        name: "Integration Donor",
        email: "int@refeed.lk",
        phone: "0771234567",
      });

    const res = await request(app)
      .get("/api/profile/intdonor")
      .set({ "x-username": "intdonor", "x-role": "DONATOR" });
    expect([200, 404]).toContain(res.status);
  });
});
