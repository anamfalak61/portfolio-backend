const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Env variables ko load karne ke liye
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Frontend se aane wale JSON data ko read karne ke liye

// MongoDB Connection (Agar use kar rahi hain)
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

    // Validation: Check agar user ne saari fields fill ki hain
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Please fill all fields." });
    }

    try {
        // 1. Email bhejne wale (Transporter) ki setting
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Aapki Gmail id
                pass: process.env.EMAIL_PASS  // Aapka Gmail App Password
            }
        });

        // 2. Email ka content aur layout
        const mailOptions = {
            from: email, // Sender ka email (jo user form fill kar raha hai)
            to: process.env.EMAIL_USER, // Jis par aapko mail chahiye (Aapki apni id)
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

        // Success Response
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