const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Env variables ko load karne ke liye
dotenv.config();

const app = express();

//  MIDDLEWARES (Inka order sahi hona zaroori hai network error se bachne ke liye)
app.use(cors());
app.use(express.json()); 

// MongoDB Connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB Connected Successfully"))
        .catch((err) => console.log("MongoDB Connection Error:", err));
}

// Test Route
app.get('/', (req, res) => {
    res.json({ message: "Portfolio Backend is running successfully on Vercel!" });
});

// --- NODEMAILER CONTACT ROUTE ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Please fill all fields." });
    }

    try {
        // 1. Email Transporter (Aapki .env ke mutabiq GMAIL_USER aur GMAIL_PASS use kiya hai)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, 
                pass: process.env.GMAIL_PASS  
            }
        });

        // 2. Email content setup
        const mailOptions = {
            from: email, 
            to: process.env.GMAIL_USER, // Jis par aapko mail receive karni hai
            subject: `New Portfolio Message from ${name}`,
            text: `You have received a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `
                <h3>New Portfolio Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // 3. Email send karna
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "Email sent successfully!" });

    } catch (error) {
        console.error("Nodemailer Error:", error);
        return res.status(500).json({ success: false, error: "Failed to send email. Try again later." });
    }
});

// Local machine par chalane ke liye
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

// Vercel ke liye export
module.exports = app;