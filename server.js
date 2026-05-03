const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   🔥 MongoDB Connection (FINAL FIX)
========================= */
const MONGO_URI = "mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority";

// ❌ OLD options hata diye (important)
mongoose.connect(MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
})
.catch(err => {
  console.log("❌ MongoDB Connection Error:", err.message);
});


/* =========================
   🔑 Schema
========================= */
const keySchema = new mongoose.Schema({
  key: { type: String, unique: true },
  expiry: Number
});

const Key = mongoose.model("Key", keySchema);


/* =========================
   🌐 Routes
========================= */

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Test
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// 🔥 Create Key
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

    // duplicate check
    const existing = await Key.findOne({ key });
    if (existing) {
      return res.json({ status: "error", msg: "Key already exists" });
    }

    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;

    await Key.create({ key, expiry });

    res.json({
      status: "created",
      key,
      expiry
    });

  } catch (err) {
    console.log("❌ CREATE ERROR:", err.message);

    res.json({
      status: "error",
      msg: err.message
    });
  }
});


// 🔑 Verify Key
app.post("/verify", async (req, res) => {
  try {
    let { key } = req.body;

    if (!key) return res.json({ status: "blocked" });

    key = key.trim().toUpperCase();

    const found = await Key.findOne({ key });

    if (!found) return res.json({ status: "blocked" });

    if (Date.now() > found.expiry) {
      return res.json({ status: "expired" });
    }

    res.json({ status: "active" });

  } catch (err) {
    console.log("❌ VERIFY ERROR:", err.message);
    res.json({ status: "error" });
  }
});


// fallback (IMPORTANT for Render)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});


/* =========================
   🚀 Server Start
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});