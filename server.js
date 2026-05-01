const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ STATIC FILES (correct path)
app.use(express.static(path.join(__dirname)));

// ✅ ROOT → admin.html open करेगा
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ✅ TEST ROUTE (check working)
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// ✅ MongoDB (safe connect)
mongoose.connect("mongodb+srv://ownerrohiy_db_user:AQz30SNAvf6dJaPQ@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => {
  console.log("MongoDB Error:", err.message);
});

// 🔑 temporary storage
let keys = [];

// ✅ VERIFY API
app.post("/verify", (req, res) => {
  try {
    let { key } = req.body;

    if (!key) return res.json({ status: "blocked" });

    key = key.trim().toUpperCase();

    let found = keys.find(k => k.key === key);

    if (!found) return res.json({ status: "blocked" });

    if (Date.now() > found.expiry) {
      return res.json({ status: "expired" });
    }

    res.json({ status: "active" });

  } catch (err) {
    res.json({ status: "error" });
  }
});

// ❗ 404 HANDLE (IMPORTANT FIX)
app.use((req, res) => {
  res.status(404).send("Page Not Found ❌");
});

// ✅ PORT FIX
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});