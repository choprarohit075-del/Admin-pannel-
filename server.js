const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 IMPORTANT (admin.html show karne ke liye)
app.use(express.static(__dirname));

/* DB */
mongoose.connect("mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

/* Schema */
const keySchema = new mongoose.Schema({
  key: String,
  expiry: Number,
  deviceId: String,
  banned: { type: Boolean, default: false }
});

const Key = mongoose.model("Key", keySchema);

/* ======================
   🌐 HOME (ADMIN PANEL)
====================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

/* ======================
   🔓 VERIFY
====================== */
app.post("/verify", async (req, res) => {
  try {
    let { key, deviceId } = req.body;

    const data = await Key.findOne({ key });

    if (!data) return res.json({ status: "invalid" });

    if (data.banned) return res.json({ status: "banned" });

    if (Date.now() > data.expiry)
      return res.json({ status: "expired" });

    if (!data.deviceId) {
      data.deviceId = deviceId;
      await data.save();
    } else if (data.deviceId !== deviceId) {
      return res.json({ status: "device_mismatch" });
    }

    res.json({ status: "active", expiry: data.expiry });

  } catch (err) {
    res.json({ status: "error" });
  }
});

/* ======================
   🔑 CREATE KEY
====================== */
app.post("/create", async (req, res) => {
  try {
    let { key, days } = req.body;

    const expiry = Date.now() + days * 86400000;

    await Key.create({ key, expiry });

    res.json({ status: "created" });

  } catch (err) {
    res.json({ status: "error" });
  }
});

/* ======================
   🚫 BAN
====================== */
app.post("/ban", async (req, res) => {
  await Key.updateOne({ key: req.body.key }, { banned: true });
  res.json({ status: "banned" });
});

/* ======================
   ✅ UNBAN
====================== */
app.post("/unban", async (req, res) => {
  await Key.updateOne({ key: req.body.key }, { banned: false });
  res.json({ status: "unbanned" });
});

/* ======================
   📊 ALL KEYS
====================== */
app.get("/keys", async (req, res) => {
  const data = await Key.find();
  res.json(data);
});

/* ======================
   🧪 TEST ROUTE
====================== */
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

/* ======================
   🚀 START SERVER (FIXED)
====================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
