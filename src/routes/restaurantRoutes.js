import express from "express";
import Restaurant from "../models/Restaurant.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET all restaurants (public)
router.get("/all", async (req, res) => {
  try {
    const docs = await Restaurant.find({}).lean();
    res.json(docs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET my restaurant
router.get("/mine", auth, async (req, res) => {
  try {
    const doc = await Restaurant.findOne({ donorUsername: req.user.username });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// CREATE or UPDATE (upsert)
router.post("/", auth, async (req, res) => {
  try {
    const { name, address, phone, description, foodsServed, openingHours, image } = req.body;
    if (!name || !address) return res.status(400).json({ message: "Name and address are required" });

    const doc = await Restaurant.findOneAndUpdate(
      { donorUsername: req.user.username },
      { name, address, phone, description, foodsServed, openingHours, image },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
