/* =========================================
   SERVER ENTRY POINT
   ========================================= */
require('dotenv').config({ path: './config/.env' }); // Load secrets
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================
   MIDDLEWARE (Security & Utilities)
   ========================================= */

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS (Allow Frontend to connect)
// In production, we will restrict 'origin' to your specific domain
app.use(cors({
    origin: '*', // Allow all for development phase
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsing (Read JSON data from requests)
app.use(express.json({ limit: '5mb' })); // Limit body size for security

// 4. Logging (See requests in console)
app.use(morgan('dev'));

// 5. Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

/* =========================================
   DATABASE CONNECTION
   ========================================= */
// We will define the connection string in config/env.js or .env later
// For now, this placeholder prevents crash if URI is missing
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mylink', {
            // These options are no longer needed in Mongoose 6+, 
            // but keeping them blank for backward compatibility awareness
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Connect to DB
connectDB();

/* =========================================
   ROUTES
   ========================================= */
// Health Check Route (To test if server is running)
app.get('/', (req, res) => {
    res.send({ status: 'active', message: 'MyLink API is running...' });
});

// Import Routes (We will create these files next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/links', require('./routes/linkRoutes'));

/* =========================================
   ERROR HANDLING
   ========================================= */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Server Error', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

/* =========================================
   START SERVER
   ========================================= */
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});