const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://portfolio-frontend-o66we99rb-anamfalak61s-projects.vercel.app',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.options('*', cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.log('MongoDB Connection Error:', err));
}

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio Backend is running successfully on Vercel!',
  });
});

// PROJECTS ROUTE
app.get('/projects', (req, res) => {
  res.json([
    {
      title: 'Maryapp',
      type: 'Full Stack',
      typeColor: 'text-cyan-400',
      desc: 'Multi-vendor marketplace with AI chatbot and tracking.',
      tech: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    },
    {
      title: 'Sundial Home',
      type: 'DevOps',
      typeColor: 'text-purple-400',
      desc: 'E-commerce platform with CI/CD and inventory system.',
      tech: ['React', 'Node.js', 'Kubernetes', 'AWS', 'PostgreSQL'],
    },
    {
      title: 'Zed Live',
      type: 'Backend',
      typeColor: 'text-pink-400',
      desc: 'Live streaming platform with NFT integration.',
      tech: ['.NET', 'React', 'Redis', 'Kafka'],
    },
  ]);
});

// CONTACT ROUTE
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Please fill all fields.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      replyTo: email,
      to: process.env.GMAIL_USER,
      subject: `New Portfolio Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
      html: `
        <h3>New Portfolio Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
    });
  } catch (error) {
    console.error('Nodemailer Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to send email. Try again later.',
    });
  }
});

// Fallback for unmatched backend routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.originalUrl,
  });
});

// Local Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;