const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

const cookieParser = require('cookie-parser');
const globalErrorHandlerController = require('./controllers/errorController');
const authRoutes = require('./routes/authRoutes');
const AppError = require('./utils/appError');
const path = require('path');

dotenv.config();

const app = express();
// Trust proxy if behind a load balancer (e.g. Heroku, Render, Nginx)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true // Important for cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Optimization Middleware
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet()); // Set security HTTP headers
app.use(compression()); // Compress all responses

// Rate Limiting
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); // Apply to all API routes

// Database Connection
// Database Connection
const DB = process.env.MONGODB_URI;
if (!DB) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
}

mongoose.connect(DB, {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        console.error('Make sure your IP is whitelisted in MongoDB Atlas and the URI is correct.');
    });

// Routes Configuration
app.get('/', (req, res) => {
    res.send('Scholarship Portal API is running');
});

// API Routes
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/scholarships', require('./routes/scholarshipRoutes'));
app.use('/api/v1/applications', require('./routes/applicationRoutes'));
app.use('/api/v1/documents', require('./routes/documentRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection (for real-time notifications)
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// Handle Unhandled Routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandlerController);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Trigger restart for cleanup
