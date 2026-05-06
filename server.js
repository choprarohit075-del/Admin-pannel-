const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* DB */
mongoose.connect("mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel");

/* Schema */
const keySchema = new mongoose.Schema({
  key: String,
  expiry: Number,
  deviceId: String,
  banned: { type: Boolean, default: false }
});

const Key = mongoose.model("Key", keySchema);

/* ======================
   🔓 VERIFY
====================== */
app.post("/verify", async (req, res) => {
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
});

/* ======================
   🔑 CREATE KEY
====================== */
app.post("/create", async (req, res) => {
  let { key, days } = req.body;

  const expiry = Date.now() + days * 86400000;

  await Key.create({ key, expiry });

  res.json({ status: "created" });
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
   📊 ALL DATA
====================== */
app.get("/keys", async (req, res) => {
  const data = await Key.find();
  res.json(data);
});

app.listen(10000, () => console.log("🚀 Server running"));
