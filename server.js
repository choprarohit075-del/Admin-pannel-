const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// static files
app.use(express.static(__dirname));

// root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// test route
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// dummy verify
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

// fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});