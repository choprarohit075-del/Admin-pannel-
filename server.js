const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ✅ MongoDB Connect
mongoose.connect("mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ Schema
const keySchema = new mongoose.Schema({
  key: String,
  expiry: Number
});

const Key = mongoose.model("Key", keySchema);

// ✅ Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ✅ Test
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// 🔥 Create Key (FIXED)
app.post("/create-key", async (req, res) => {
  let { key, days } = req.body;

  if (!key || !days) {
    return res.json({ status: "error", msg: "Missing data" });
  }

  key = key.trim().toUpperCase();
  days = parseInt(days);

  if (isNaN(days)) {
    return res.json({ status: "error", msg: "Invalid days" });
  }

  let expiry = Date.now() + days * 24 * 60 * 60 * 1000;

  await Key.create({ key, expiry });

  res.json({ status: "created", key, expiry });
});

// 🔑 Verify Key
app.post("/verify", async (req, res) => {
  let { key } = req.body;

  if (!key) return res.json({ status: "blocked" });

  key = key.trim().toUpperCase();

  let found = await Key.findOne({ key });

  if (!found) return res.json({ status: "blocked" });

  if (Date.now() > found.expiry)
    return res.json({ status: "expired" });

  res.json({ status: "active" });
});

// ❗ fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});