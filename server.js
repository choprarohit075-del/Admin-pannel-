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
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch(err => {
  console.log("❌ MongoDB Error:", err.message);
});

/* =========================
   🔑 Schema (UPGRADED)
========================= */
const keySchema = new mongoose.Schema({
  key: { type: String, unique: true },
  expiry: Number,
  deviceId: { type: String, default: null } // 🔥 NEW
});

const Key = mongoose.model("Key", keySchema);

/* =========================
   🌐 Routes
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

/* =========================
   🔑 CREATE KEY
========================= */
app.post("/create-key", async (req, res) => {
  try {
    let { key, days } = req.body;

    if (!key || !days) {
      return res.json({ status: "error", msg: "Missing data" });
    }

    key = key.trim().toUpperCase();
    days = parseInt(days);

    if (isNaN(days)) {
      return res.json({ status: "error", msg: "Invalid days" });
    }

    const existing = await Key.findOne({ key });
    if (existing) {
      return res.json({ status: "error", msg: "Key exists" });
    }

    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;

    await Key.create({ key, expiry });

    res.json({ status: "created", key, expiry });

  } catch (err) {
    console.log("❌ CREATE ERROR:", err.message);
    res.json({ status: "error", msg: err.message });
  }
});

/* =========================
   🔓 VERIFY KEY (FIXED + UPGRADED)
========================= */
app.post("/verify", async (req, res) => {
  try {
    let { key, deviceId } = req.body;

    if (!key) return res.json({ status: "blocked" });

    key = key.trim().toUpperCase();

    const found = await Key.findOne({ key });

    if (!found) return res.json({ status: "blocked" });

    // ❌ Expired
    if (Date.now() > found.expiry) {
      return res.json({ status: "expired" });
    }

    // 🔒 Device lock (1 key = 1 device)
    if (!found.deviceId) {
      found.deviceId = deviceId;
      await found.save();
    } else if (found.deviceId !== deviceId) {
      return res.json({ status: "blocked" });
    }

    // ✅ FINAL RESPONSE (IMPORTANT)
    res.json({
      status: "active",
      expiry: found.expiry
    });

  } catch (err) {
    console.log("❌ VERIFY ERROR:", err.message);
    res.json({ status: "error" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
