import { DonorService } from "../src/services/donor.service.js";
import DonorProfile from "../src/models/DonorProfile.js";
import { setupDB, clearDB, closeDB } from "./setup.js";

beforeAll(async () => await setupDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validProfile = () => ({
  name: "Test Donor",
  email: "donor@refeed.lk",
  phone: "0771234567",
  nicNumber: "199012345678",
  businessRegNumber: "REG-001",
});

describe("DonorService — createProfile", () => {
  test("creates a donor profile with PENDING verification", async () => {
    const result = await DonorService.createProfile("testdonor", validProfile());
    expect(result.username).toBe("testdonor");
    expect(result.verificationStatus).toBe("PENDING");
  });

  test("throws on duplicate username", async () => {
    await DonorService.createProfile("testdonor", validProfile());
    await expect(DonorService.createProfile("testdonor", validProfile())).rejects.toThrow();
  });
});

describe("DonorService — getProfile", () => {
  test("returns profile by username", async () => {
    await DonorService.createProfile("testdonor", validProfile());
    const result = await DonorService.getProfile("testdonor");
    expect(result.username).toBe("testdonor");
  });

  test("returns null for non-existent username", async () => {
    const result = await DonorService.getProfile("nobody");
    expect(result).toBeNull();
  });
});

describe("DonorService — updateProfile", () => {
  test("updates allowed fields", async () => {
    await DonorService.createProfile("testdonor", validProfile());
    const updated = await DonorService.updateProfile("testdonor", { nicNumber: "200012345678" });
    expect(updated).toBeDefined();
  });
});

describe("DonorService — deleteProfile (soft)", () => {
  test("soft deletes profile", async () => {
    await DonorService.createProfile("testdonor", validProfile());
    await DonorService.deleteProfile("testdonor");
    const result = await DonorProfile.findOne({ username: "testdonor" });
    expect(result.isDeleted).toBe(true);
  });
});
