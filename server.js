const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ✅ MongoDB Connect (YOUR WORKING URL)
mongoose.connect("mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// ✅ Schema
const keySchema = new mongoose.Schema({
  key: { type: String, unique: true },
  expiry: Number
});

const Key = mongoose.model("Key", keySchema);

// ✅ Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ✅ Test Route
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// 🔥 CREATE KEY (FINAL SAFE VERSION)
app.post("/create-key", async (req, res) => {
  try {
    let { key, days } = req.body;

    if (!key || !days) {
      return res.json({ status: "error", msg: "Missing key or days" });
    }

    key = key.trim().toUpperCase();
    days = parseInt(days);

    if (isNaN(days)) {
      return res.json({ status: "error", msg: "Invalid days" });
    }

    let expiry = Date.now() + days * 24 * 60 * 60 * 1000;

    // 🔥 Check duplicate
    let existing = await Key.findOne({ key });
    if (existing) {
      return res.json({ status: "