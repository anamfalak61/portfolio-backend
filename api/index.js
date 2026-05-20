const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ========================
   CORS FIX (Vercel SAFE)
======================== */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://portfolio-frontend-cyan-five.vercel.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// IMPORTANT: preflight fix
app.options("*", cors());

app.use(express.json());

/* ========================
   MONGODB CONNECTION SAFE
======================== */
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB Error:", err));
} else {
  console.log("MONGO_URI missing");
}

/* ========================
   SCHEMA
======================== */
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model("Contact", contactSchema);

/* ========================
   ROUTES
======================== */

// Root
app.get("/", (req, res) => {
  res.json({ message: "Backend API working" });
});

// Projects
app.get("/projects", (req, res) => {
  res.json([
    {
      title: "Portfolio Website",
      description: "My personal portfolio"
    }
  ]);
});

// Contact (SAFE VERSION - NO CRASH)
app.post("/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    res.status(200).json({
      message: "Message saved successfully"
    });

  } catch (error) {
    console.log("Contact Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
});

/* ========================
   EXPORT FOR VERCEL
======================== */
module.exports = app;