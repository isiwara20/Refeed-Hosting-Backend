import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import Admin from "../src/models/Admin.js";
import Donator from "../src/models/Donator.js";
import Ngo from "../src/models/Ngo.js";
import Notification from "../src/models/notification.js";
import Conversation from "../src/models/Conversation.js";
import { setupDB, clearDB, closeDB } from "../test-administration/setup.js";

beforeAll(async () => await setupDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const donorHeaders = {
  "x-username": "perf-donor",
  "x-role": "DONATOR"
};

const ngoHeaders = {
  "x-username": "perf-ngo",
  "x-role": "NGO"
};

let donorUser;
let ngoUser;

const measureRequest = async (fn) => {
  const startTime = Date.now();
  const response = await fn();
  return {
    response,
    elapsed: Date.now() - startTime
  };
};

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash("Test@123", 10);

  donorUser = await Donator.create({
    name: "Performance Donor",
    username: donorHeaders["x-username"],
    email: "perf-donor@refeed.lk",
    password: hashedPassword,
    phone: "0772000001"
  });

  ngoUser = await Ngo.create({
    name: "Performance NGO",
    username: ngoHeaders["x-username"],
    email: "perf-ngo@refeed.lk",
    password: hashedPassword,
    phone: "0772000002"
  });

  await Admin.create({
    name: "Performance Admin",
    username: "perf-admin",
    email: "perf-admin@refeed.lk",
    password: hashedPassword,
    phone: "0772000003"
  });
});

describe("Notification Performance Tests", () => {
  test("should create an in-app notification within 250ms", async () => {
    const { response, elapsed } = await measureRequest(() =>
      request(app)
        .post("/api/notifications/send")
        .send({
          userId: donorUser._id.toString(),
          eventType: "DONATION_CREATED",
          channel: "INAPP",
          subject: "Donation created",
          message: "Your donation is ready",
          priority: "NORMAL"
        })
    );

    expect(response.status).toBe(201);
    expect(elapsed).toBeLessThan(250);
  });

  test("should fetch user notifications within 180ms", async () => {
    await Notification.create({
      userId: donorUser._id,
      eventType: "NEW_MESSAGE",
      channel: "INAPP",
      message: "Performance notification",
      status: "SENT",
      isRead: false
    });

    const { response, elapsed } = await measureRequest(() =>
      request(app).get(`/api/notifications/user/${donorUser._id}`)
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.notifications)).toBe(true);
    expect(elapsed).toBeLessThan(180);
  });

  test("should fetch unread count within 120ms", async () => {
    await Notification.create({
      userId: donorUser._id,
      eventType: "NEW_MESSAGE",
      channel: "INAPP",
      message: "Unread performance notification",
      status: "SENT",
      isRead: false
    });

    const { response, elapsed } = await measureRequest(() =>
      request(app).get(`/api/notifications/user/${donorUser._id}/unread-count`)
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("unreadCount", 1);
    expect(elapsed).toBeLessThan(120);
  });

  test("should mark all notifications as read within 180ms", async () => {
    await Notification.create([
      {
        userId: donorUser._id,
        eventType: "NEW_MESSAGE",
        channel: "INAPP",
        message: "n1",
        status: "SENT",
        isRead: false
      },
      {
        userId: donorUser._id,
        eventType: "NEW_MESSAGE",
        channel: "INAPP",
        message: "n2",
        status: "SENT",
        isRead: false
      }
    ]);

    const { response, elapsed } = await measureRequest(() =>
      request(app)
        .patch("/api/notifications/read-all")
        .send({ userId: donorUser._id.toString() })
    );

    expect(response.status).toBe(200);
    expect(response.body.modifiedCount).toBe(2);
    expect(elapsed).toBeLessThan(180);
  });

  test("should handle 10 concurrent notification sends", async () => {
    const requests = Array.from({ length: 10 }, (_, index) =>
      request(app).post("/api/notifications/send").send({
        userId: donorUser._id.toString(),
        eventType: "DONATION_CREATED",
        channel: "INAPP",
        subject: `Notification ${index}`,
        message: `Message ${index}`,
        priority: "NORMAL"
      })
    );

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const elapsed = Date.now() - startTime;

    results.forEach((response) => {
      expect(response.status).toBe(201);
    });
    expect(elapsed).toBeLessThan(1500);
  });
});

describe("Conversation and Message Performance Tests", () => {
  const createConversation = async () =>
    request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

  test("should list communication users within 150ms", async () => {
    const { response, elapsed } = await measureRequest(() =>
      request(app).get("/api/conversations/users").set(donorHeaders)
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(elapsed).toBeLessThan(150);
  });

  test("should create a conversation within 220ms", async () => {
    const { response, elapsed } = await measureRequest(() => createConversation());

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(elapsed).toBeLessThan(220);
  });

  test("should send a message and notification within 250ms", async () => {
    const conversation = await createConversation();
    const conversationId = conversation.body._id;

    const { response, elapsed } = await measureRequest(() =>
      request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set(donorHeaders)
        .send({ body: "Performance message" })
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("body", "Performance message");
    expect(elapsed).toBeLessThan(250);
  });

  test("should fetch conversation messages within 200ms", async () => {
    const conversation = await createConversation();
    const conversationId = conversation.body._id;

    await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set(donorHeaders)
      .send({ body: "First message" });

    const { response, elapsed } = await measureRequest(() =>
      request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set(ngoHeaders)
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.messages)).toBe(true);
    expect(elapsed).toBeLessThan(200);
  });

  test("should handle 10 concurrent message sends", async () => {
    const conversation = await createConversation();
    const conversationId = conversation.body._id;

    const requests = Array.from({ length: 10 }, (_, index) =>
      request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set(donorHeaders)
        .send({ body: `Concurrent message ${index}` })
    );

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const elapsed = Date.now() - startTime;

    results.forEach((response) => {
      expect(response.status).toBe(201);
    });
    expect(elapsed).toBeLessThan(1800);
  });

  test("should mark conversation as read within 150ms", async () => {
    const conversation = await createConversation();
    const conversationId = conversation.body._id;

    const { response, elapsed } = await measureRequest(() =>
      request(app)
        .patch(`/api/conversations/${conversationId}/read`)
        .set(ngoHeaders)
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("unreadCount", 0);
    expect(elapsed).toBeLessThan(150);
  });
});

describe("Notification and Message Stress Benchmark", () => {
  test("should sustain mixed notification and message load", async () => {
    const conversation = await Conversation.create({
      participants: [
        {
          userId: donorUser._id,
          username: donorHeaders["x-username"],
          role: "DONATOR",
          name: "Performance Donor",
          lastReadAt: null
        },
        {
          userId: ngoUser._id,
          username: ngoHeaders["x-username"],
          role: "NGO",
          name: "Performance NGO",
          lastReadAt: null
        }
      ],
      messages: []
    });

    const operations = [];
    for (let index = 0; index < 5; index++) {
      operations.push(
        request(app)
          .post("/api/notifications/send")
          .send({
            userId: donorUser._id.toString(),
            eventType: "DONATION_CREATED",
            channel: "INAPP",
            subject: `Batch ${index}`,
            message: `Batch notification ${index}`,
            priority: "NORMAL"
          })
      );
      operations.push(
        request(app)
          .post(`/api/conversations/${conversation._id}/messages`)
          .set(donorHeaders)
          .send({ body: `Batch message ${index}` })
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(operations);
    const elapsed = Date.now() - startTime;

    results.forEach((response) => {
      expect(response.status).toBe(201);
    });
    expect(elapsed).toBeLessThan(2500);
  });
});