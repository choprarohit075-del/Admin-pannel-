const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 static fix (IMPORTANT)
app.use(express.static(__dirname));

// 🔥 root route fix
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// 🔥 MongoDB
mongoose.connect("mongodb+srv://ownerrohiy_db_user:AQz30SNAvf6dJaPQ@cluster0.hx4m2ww.mongodb.net/adminpanel?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// test route
app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

// verify
let keys = [];

app.post("/verify", (req, res) => {
  let { key } = req.body;
  key = key.trim().toUpperCase();

  let found = keys.find(k => k.key === key);

  if (!found) return res.json({ status: "blocked" });

  if (Date.now() > found.expiry)
    return res.json({ status: "expired" });

  res.json({ status: "active" });
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});