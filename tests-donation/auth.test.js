import bcrypt from "bcrypt";
import { loginUser } from "../src/controllers/loginController.js";
import Donator from "../src/models/Donator.js";
import { setupDB, clearDB, closeDB } from "./setup.js";

beforeAll(async () => await setupDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

// Helper to build mock req/res
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("loginUser controller", () => {
  let hashedPassword;

  beforeEach(async () => {
    hashedPassword = await bcrypt.hash("TestPass@123", 10);
    await Donator.create({
      name: "Test Donor",
      username: "testdonor",
      email: "test@refeed.lk",
      password: hashedPassword,
      phone: "0771234567",
    });
  });

  test("login success — returns 200 with username, role, dashboard", async () => {
    const req = { body: { username: "testdonor", password: "TestPass@123" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.json.mock.calls[0][0];
    expect(data.message).toBe("Login successful");
    expect(data.username).toBe("testdonor");
    expect(data.role).toBe("DONATOR");
    expect(data.dashboard).toBe("/donator-dashboard");
  });

  test("login fails — wrong password returns 401", async () => {
    const req = { body: { username: "testdonor", password: "WrongPass" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe("Invalid password");
  });

  test("login fails — user not found returns 404", async () => {
    const req = { body: { username: "nobody", password: "anything" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0].message).toBe("User not found");
  });

  test("login fails — missing username returns 400", async () => {
    const req = { body: { password: "TestPass@123" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login fails — missing password returns 400", async () => {
    const req = { body: { username: "testdonor" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login fails — both fields missing returns 400", async () => {
    const req = { body: {} };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
