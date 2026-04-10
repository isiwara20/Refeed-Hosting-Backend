import { SurplusService } from "../src/services/surplus.service.js";
import SurplusDonation from "../src/models/SurplusDonation.model.js";
import { setupDB, clearDB, closeDB } from "./setup.js";

beforeAll(async () => await setupDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const futureDate = () => new Date(Date.now() + 3600 * 1000).toISOString();

const validDraft = () => ({
  foodType: "veg",
  quantity: { amount: 5, unit: "kg" },
  expiryTime: futureDate(),
  selfDelivery: false,
});

describe("SurplusService — createDraft", () => {
  test("creates a draft with DRAFT status", async () => {
    const result = await SurplusService.createDraft("testdonor", validDraft());
    expect(result.lifecycleStatus).toBe("DRAFT");
    expect(result.donorUsername).toBe("testdonor");
    expect(result.foodType).toBe("veg");
  });

  test("throws if expiryTime is in the past", async () => {
    const data = { ...validDraft(), expiryTime: new Date(Date.now() - 60000) };
    await expect(SurplusService.createDraft("testdonor", data)).rejects.toThrow("Expiry must be future");
  });

  test("stores selfDelivery flag correctly", async () => {
    const result = await SurplusService.createDraft("testdonor", { ...validDraft(), selfDelivery: true });
    expect(result.selfDelivery).toBe(true);
  });
});

describe("SurplusService — publish", () => {
  test("transitions DRAFT → PUBLISHED", async () => {
    const draft = await SurplusService.createDraft("testdonor", validDraft());
    const published = await SurplusService.publish(draft._id);
    expect(published.lifecycleStatus).toBe("PUBLISHED");
  });

  test("throws on invalid transition (PUBLISHED → PUBLISHED)", async () => {
    const draft = await SurplusService.createDraft("testdonor", validDraft());
    await SurplusService.publish(draft._id);
    await expect(SurplusService.publish(draft._id)).rejects.toThrow();
  });
});

describe("SurplusService — reserveDonation", () => {
  test("transitions PUBLISHED → RESERVED", async () => {
    const draft = await SurplusService.createDraft("testdonor", validDraft());
    await SurplusService.publish(draft._id);
    const reserved = await SurplusService.reserveDonation(draft._id);
    expect(reserved.lifecycleStatus).toBe("RESERVED");
  });
});

describe("SurplusService — markCollected", () => {
  test("transitions RESERVED → COLLECTED", async () => {
    const draft = await SurplusService.createDraft("testdonor", validDraft());
    await SurplusService.publish(draft._id);
    await SurplusService.reserveDonation(draft._id);
    const collected = await SurplusService.markCollected(draft._id);
    expect(collected.lifecycleStatus).toBe("COLLECTED");
  });
});

describe("SurplusService — getMyDonations", () => {
  test("returns only donations for the given donor", async () => {
    await SurplusService.createDraft("donor1", validDraft());
    await SurplusService.createDraft("donor1", validDraft());
    await SurplusService.createDraft("donor2", validDraft());
    const results = await SurplusService.getMyDonations("donor1");
    expect(results.length).toBe(2);
    results.forEach(d => expect(d.donorUsername).toBe("donor1"));
  });

  test("returns empty array for donor with no donations", async () => {
    const results = await SurplusService.getMyDonations("nobody");
    expect(results).toEqual([]);
  });
});

describe("SurplusService — updateStatus", () => {
  test("updates status via generic updater", async () => {
    const draft = await SurplusService.createDraft("testdonor", validDraft());
    const updated = await SurplusService.updateStatus(draft._id, "PUBLISHED");
    expect(updated.lifecycleStatus).toBe("PUBLISHED");
  });

  test("throws on invalid transition", async () => {
    const draft = await SurplusService.createDraft("testdonor", validDraft());
    await expect(SurplusService.updateStatus(draft._id, "COMPLETED")).rejects.toThrow();
  });
});
