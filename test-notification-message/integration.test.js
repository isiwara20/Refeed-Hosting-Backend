import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import Admin from "../src/models/Admin.js";
import Donator from "../src/models/Donator.js";
import Ngo from "../src/models/Ngo.js";
import Notification from "../src/models/notification.js";
import { setupDB, clearDB, closeDB } from "../test-administration/setup.js";

beforeAll(async () => await setupDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const donorHeaders = {
  "x-username": "donor-msg",
  "x-role": "DONATOR"
};

const ngoHeaders = {
  "x-username": "ngo-msg",
  "x-role": "NGO"
};

let donorUser;
let ngoUser;
let adminUser;

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash("Test@123", 10);

  donorUser = await Donator.create({
    name: "Message Donor",
    username: donorHeaders["x-username"],
    email: "donor-msg@refeed.lk",
    password: hashedPassword,
    phone: "0771000001"
  });

  ngoUser = await Ngo.create({
    name: "Message NGO",
    username: ngoHeaders["x-username"],
    email: "ngo-msg@refeed.lk",
    password: hashedPassword,
    phone: "0771000002"
  });

  adminUser = await Admin.create({
    name: "Message Admin",
    username: "admin-msg",
    email: "admin-msg@refeed.lk",
    password: hashedPassword,
    phone: "0771000003"
  });
});

describe("Notification APIs", () => {
  test("201 - should send in-app notification", async () => {
    const payload = {
      userId: donorUser._id.toString(),
      eventType: "DONATION_CREATED",
      channel: "INAPP",
      subject: "Donation created",
      message: "Your donation has been created",
      priority: "NORMAL"
    };

    const res = await request(app)
      .post("/api/notifications/send")
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.status).toBe("SENT");
    expect(res.body.userId.toString()).toBe(donorUser._id.toString());
  });

  test("GET user notifications should return pagination payload", async () => {
    await Notification.create({
      userId: donorUser._id,
      eventType: "NEW_MESSAGE",
      channel: "INAPP",
      message: "hello",
      status: "SENT"
    });

    const res = await request(app)
      .get(`/api/notifications/user/${donorUser._id}`)
      .query({ limit: 10, skip: 0 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body).toHaveProperty("unreadCount");
  });

  test("GET unread-count should return unreadCount", async () => {
    await Notification.create({
      userId: donorUser._id,
      eventType: "NEW_MESSAGE",
      channel: "INAPP",
      message: "unread message",
      status: "SENT",
      isRead: false
    });

    const res = await request(app).get(
      `/api/notifications/user/${donorUser._id}/unread-count`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("unreadCount", 1);
  });

  test("PATCH /:id/read should mark notification as read", async () => {
    const notification = await Notification.create({
      userId: donorUser._id,
      eventType: "NEW_MESSAGE",
      channel: "INAPP",
      message: "to read",
      status: "SENT",
      isRead: false
    });

    const res = await request(app).patch(
      `/api/notifications/${notification._id}/read`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("isRead", true);
  });

  test("PATCH /read-all should return 400 when userId is missing", async () => {
    const res = await request(app)
      .patch("/api/notifications/read-all")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "userId is required");
  });

  test("PATCH /read-all should mark all user notifications as read", async () => {
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

    const res = await request(app)
      .patch("/api/notifications/read-all")
      .send({ userId: donorUser._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("modifiedCount", 2);
  });

  test("GET user notifications with invalid userId should return empty payload", async () => {
    const res = await request(app).get("/api/notifications/user/not-a-valid-id");

    expect(res.status).toBe(200);
    expect(res.body.notifications).toEqual([]);
    expect(res.body.unreadCount).toBe(0);
  });
});

describe("Conversation and Message APIs", () => {
  test("401 - should reject conversation requests without auth headers", async () => {
    const res = await request(app).get("/api/conversations");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  test("GET /users should return communication users excluding current user", async () => {
    const res = await request(app)
      .get("/api/conversations/users")
      .set(donorHeaders);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (user) =>
          user.username === ngoHeaders["x-username"] && user.role === "NGO"
      )
    ).toBe(true);
    expect(
      res.body.some(
        (user) => user.username === donorHeaders["x-username"]
      )
    ).toBe(false);
  });

  test("POST / should create conversation with recipient", async () => {
    const res = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(Array.isArray(res.body.participants)).toBe(true);
    expect(res.body.participants).toHaveLength(2);
  });

  test("POST /:id/messages should send message and create recipient notification", async () => {
    const createConversation = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    const conversationId = createConversation.body._id;

    const res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set(donorHeaders)
      .send({ body: "Hello NGO" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("body", "Hello NGO");

    const createdNotification = await Notification.findOne({
      userId: ngoUser._id,
      eventType: "NEW_MESSAGE"
    });
    expect(createdNotification).toBeTruthy();
    expect(createdNotification.message).toContain("donor-msg sent you a message");
  });

  test("GET /:id/messages should return conversation and messages", async () => {
    const createConversation = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    const conversationId = createConversation.body._id;

    await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set(donorHeaders)
      .send({ body: "First message" });

    const res = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set(ngoHeaders);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("conversation");
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages.length).toBe(1);
  });

  test("PATCH /:id/messages/:messageId should update sender's message", async () => {
    const createConversation = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    const conversationId = createConversation.body._id;

    const sendRes = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set(donorHeaders)
      .send({ body: "Editable message" });

    const messageId = sendRes.body._id;

    const updateRes = await request(app)
      .patch(`/api/conversations/${conversationId}/messages/${messageId}`)
      .set(donorHeaders)
      .send({ body: "Updated body" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty("body", "Updated body");
    expect(updateRes.body.editedAt).toBeTruthy();
  });

  test("PATCH /:id/messages/:messageId should reject updates from non-sender", async () => {
    const createConversation = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    const conversationId = createConversation.body._id;

    const sendRes = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set(donorHeaders)
      .send({ body: "Only donor can edit" });

    const messageId = sendRes.body._id;

    const updateRes = await request(app)
      .patch(`/api/conversations/${conversationId}/messages/${messageId}`)
      .set(ngoHeaders)
      .send({ body: "NGO trying edit" });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body).toHaveProperty(
      "message",
      "Only sender can edit this message"
    );
  });

  test("DELETE /:id/messages/:messageId should delete sender message", async () => {
    const createConversation = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    const conversationId = createConversation.body._id;

    const sendRes = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set(donorHeaders)
      .send({ body: "Delete me" });

    const messageId = sendRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/conversations/${conversationId}/messages/${messageId}`)
      .set(donorHeaders);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty("message", "Message deleted");
  });

  test("PATCH /:id/read should mark conversation as read", async () => {
    const createConversation = await request(app)
      .post("/api/conversations")
      .set(donorHeaders)
      .send({ username: ngoHeaders["x-username"], role: "NGO" });

    const conversationId = createConversation.body._id;

    const readRes = await request(app)
      .patch(`/api/conversations/${conversationId}/read`)
      .set(ngoHeaders);

    expect(readRes.status).toBe(200);
    expect(readRes.body).toHaveProperty("message", "Conversation marked as read");
    expect(readRes.body).toHaveProperty("unreadCount", 0);
  });
});
