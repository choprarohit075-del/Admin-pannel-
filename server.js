const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 🔥 MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/adminpanel");

// 🔥 Schema
const Key = mongoose.model("Key", {
  key: String,
  expiry: Number
});

// 🔥 server check
app.get("/", (req, res) => {
  res.send("Server chal raha hai");
});

// 🔥 ADD KEY
app.post("/add-key", async (req, res) => {
  const { days } = req.body;

  let key = Math.random().toString(36).substring(2,10).toUpperCase();
  let expiry = Date.now() + (days || 1) * 24 * 60 * 60 * 1000;

  await Key.create({ key, expiry });

  console.log("New Key:", key);

  res.json({ key });
});

// 🔥 VERIFY (sirf एक ही रखना है)
app.post("/verify", async (req, res) => {
  let { key } = req.body;

  key = key.trim().toUpperCase();

  let found = await Key.findOne({ key });

  if (!found) return res.json({ status: "blocked" });

  if (Date.now() > found.expiry)
    return res.json({ status: "expired" });

  res.json({ status: "active" });
});

// 🔥 SHOW ALL
app.get("/keys", async (req, res) => {
  let all = await Key.find();
  res.json(all);
});

// 🔥 START SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});