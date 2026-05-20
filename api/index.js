const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://portfolio-frontend-cyan-five.vercel.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Schema
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

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ROOT ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "Backend API working"
  });
});

// PROJECTS ROUTE
app.get("/projects", (req, res) => {
  res.json([
    {
      title: "Portfolio Website",
      description: "My personal portfolio"
    }
  ]);
});

// CONTACT ROUTE
app.post("/contact", async (req, res) => {
  try {

    const newContact = new Contact(req.body);
    await newContact.save();

    await transporter.sendMail({
      from: req.body.email,
      to: process.env.GMAIL_USER,
      subject: `New message from ${req.body.name}`,
      text: `
Name: ${req.body.name}
Email: ${req.body.email}
Message: ${req.body.message}
      `
    });

    res.status(200).json({
      message: "Message sent successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

module.exports = app;