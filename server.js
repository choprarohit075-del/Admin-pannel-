const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   🔥 MongoDB Connection
========================= */
const MONGO_URI = "mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err.message));

/* =========================
   🔑 Schema (UPDATED)
========================= */
const keySchema = new mongoose.Schema({
  key: { type: String, unique: true },
  expiry: Number,
  deviceId: { type: String, default: null }, // 🔒 device lock
  banned: { type: Boolean, default: false } // 🚫 ban system
});

const Key = mongoose.model("Key", keySchema);

/* =========================
   🌐 Routes
========================= */

// TEST
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// CREATE KEY
app.post("/create-key", async (req, res) => {
  try {
    let { key, days } = req.body;

    key = key.trim().toUpperCase();
    days = parseInt(days);

    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;

    await Key.create({ key, expiry });

    res.json({ status: "created", key });

  } catch (err) {
    res.json({ status: "error", msg: err.message });
  }
});

// VERIFY (🔥 MAIN LOGIC)
app.post("/verify", async (req, res) => {
  try {
    let { key, deviceId } = req.body;

    if (!key || !deviceId) {
      return res.json({ status: "error" });
    }

    key = key.trim().toUpperCase();

    const found = await Key.findOne({ key });

    if (!found) return res.json({ status: "invalid" });

    // 🚫 banned check
    if (found.banned) {
      return res.json({ status: "banned" });
    }

    // ⏳ expiry check
    if (Date.now() > found.expiry) {
      return res.json({ status: "expired" });
    }

    // 🔒 device lock logic
    if (!found.deviceId) {
      // first time login → bind device
      found.deviceId = deviceId;
      await found.save();
    } else if (found.deviceId !== deviceId) {
      return res.json({ status: "device_mismatch" });
    }

    res.json({
      status: "active",
      expiry: found.expiry
    });

  } catch (err) {
    res.json({ status: "error" });
  }
});

// 🚫 BAN KEY (ADMIN)
app.post("/ban-key", async (req, res) => {
  const { key } = req.body;

  await Key.updateOne(
    { key: key.toUpperCase() },
    { banned: true }
  );

  res.json({ status: "banned_done" });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running");
});
