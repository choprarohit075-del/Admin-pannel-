const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Static files serve
app.use(express.static(path.join(__dirname)));

// ✅ Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ✅ Test route
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// ✅ MongoDB Connection (FIXED)
mongoose.connect("mongodb+srv://adminuser:Admin%4012345@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 🔑 Dummy key system
let keys = [];

app.post("/verify", (req, res) => {
  let { key } = req.body;

  if (!key) return res.json({ status: "blocked" });

  key = key.trim().toUpperCase();

  let found = keys.find(k => k.key === key);

  if (!found) return res.json({ status: "blocked" });

  if (Date.now() > found.expiry)
    return res.json({ status: "expired" });

  res.json({ status: "active" });
});

// ❗ Fallback route (Not Found fix)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});