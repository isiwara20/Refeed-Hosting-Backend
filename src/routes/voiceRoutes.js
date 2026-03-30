import express from "express";
import FoodRequest from "../models/FoodRequest.js";
import SurplusDonation from "../models/SurplusDonation.model.js";

const router = express.Router();

/*
  POST /api/voice/query
  Body: { text: "Which NGO needs vegetarian food?" }
  Returns: { response: "2 NGOs need vegetarian food. Locations: Colombo, Kandy." }
*/
router.post("/query", async (req, res) => {
  try {
    const text = (req.body.text || "").toLowerCase();

    // ── Intent: food requests by category ──
    const CATEGORY_MAP = {
      vegetarian: "vegetable",
      vegetable:  "vegetable",
      veg:        "vegetable",
      "non-veg":  "non-vegetable",
      meat:       "non-vegetable",
      cooked:     "cooked",
      packed:     "packed",
      bakery:     "bakery",
      mixed:      "mixed",
    };

    const URGENCY_WORDS = ["critical", "urgent", "high", "medium", "low"];

    // Detect category from text
    let detectedCategory = null;
    for (const [word, cat] of Object.entries(CATEGORY_MAP)) {
      if (text.includes(word)) { detectedCategory = cat; break; }
    }

    // Detect urgency from text
    let detectedUrgency = null;
    for (const u of URGENCY_WORDS) {
      if (text.includes(u)) { detectedUrgency = u; break; }
    }

    // ── Intent: pending donations / surplus ──
    const asksDonations = text.includes("donation") || text.includes("surplus") || text.includes("posted");

    // ── Intent: summary / how many ──
    const asksSummary = text.includes("how many") || text.includes("total") || text.includes("count") || text.includes("summary");

    // ── Intent: status check ──
    const asksCompleted = text.includes("completed") || text.includes("done") || text.includes("finished");
    const asksPending   = text.includes("pending") || text.includes("waiting");

    let response = "";

    if (asksDonations) {
      // Query surplus donations
      const query = {};
      if (asksCompleted) query.lifecycleStatus = "COMPLETED";
      else if (asksPending) query.lifecycleStatus = { $in: ["DRAFT","PUBLISHED","RESERVED"] };
      if (detectedCategory) query.foodType = detectedCategory;

      const donations = await SurplusDonation.find({ ...query, isDeleted: false }).limit(10);

      if (donations.length === 0) {
        response = detectedCategory
          ? `No ${detectedCategory} surplus donations found right now.`
          : "No surplus donations found matching your query.";
      } else {
        const locations = [...new Set(donations.map(d => d.location?.address).filter(Boolean))].slice(0, 3);
        response = `${donations.length} surplus donation${donations.length > 1 ? "s" : ""} found`;
        if (detectedCategory) response += ` for ${detectedCategory} food`;
        if (locations.length > 0) response += `. Locations include: ${locations.join(", ")}`;
        response += ".";
      }

    } else {
      // Default: query food requests
      const query = { status: { $in: ["pending", "matched"] } };
      if (detectedCategory) query.category = detectedCategory;
      if (detectedUrgency)  query.urgencyLevel = detectedUrgency;
      if (asksPending)      query.status = "pending";

      const requests = await FoodRequest.find(query).limit(10);

      if (requests.length === 0) {
        response = detectedCategory
          ? `No NGOs currently need ${detectedCategory} food.`
          : "No active food requests found right now.";
      } else {
        const locations = [...new Set(requests.map(r => r.location).filter(Boolean))].slice(0, 3);
        const critical  = requests.filter(r => r.urgencyLevel === "critical").length;

        response = `${requests.length} NGO${requests.length > 1 ? "s" : ""} need${requests.length === 1 ? "s" : ""}`;
        if (detectedCategory) response += ` ${detectedCategory}`;
        response += " food";
        if (locations.length > 0) response += `. Nearest locations: ${locations.join(", ")}`;
        if (critical > 0) response += `. ${critical} request${critical > 1 ? "s are" : " is"} critical`;
        response += ".";
      }
    }

    res.json({ response });
  } catch (err) {
    res.status(500).json({ response: "Sorry, I could not process that request." });
  }
});

export default router;
