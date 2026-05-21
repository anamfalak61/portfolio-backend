const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ========================
   CORS (Vercel SAFE & OPTIMIZED)
======================== */
app.use(cors({
  origin:"https://portfolio-backend-black-rho.vercel.app/",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// JSON middleware  
app.use(express.json());

/* ========================
   MONGODB CONNECTION (SERVERLESS SAFE)
======================== */
// Serverless environments me connection re-use karna zaroori hai
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return; // Agar pehle se connected hai toh dubara connect mat karo
  }

  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI missing in env variables");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

// Har request se pehle database connection check karne ke liye middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

/* ========================
   SCHEMA & MODEL
======================== */
// Serverless me model dubara compile hone par error deta hai, isliye yeh check zaroori hai
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

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
    const { name, email, message } = req.body;

    // Choti si validation takki empty data save na ho
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(200).json({
      message: "Message saved successfully"
    });

  } catch (error) {
    console.error("Contact Error:", error);
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