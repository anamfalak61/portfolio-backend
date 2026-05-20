const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Backend API is working" });
});

app.post("/contact", async (req, res) => {
  try {
    // 1. Save to DB
    const newContact = new Contact(req.body);
    await newContact.save();

    // 2. Send email
    await transporter.sendMail({
      from: req.body.email,
      to: process.env.GMAIL_USER,
      subject: `New message from ${req.body.name}`,
      text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
    });

    res.status(200).json({ message: "Message received & email sent!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server on 5000"));