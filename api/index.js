const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ========================
   CORS (Vercel SAFE - SIMPLE)
======================== */
app.use(cors({
  origin: "https://portfolio-frontend-cyan-five.vercel.app"
}));

// JSON middleware
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

// Root route (test)
app.get("/", (req, res) => {
  res.json({ message: "Backend API working" });
});

// Projects route
app.get("/projects", (req, res) => {
  res.json([
    {
      title: "Portfolio Website",
      description: "My personal portfolio"
    },
    {
      title: "E-commerce App",
      description: "React + Node project"
    }
  ]);
});

// Contact route
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