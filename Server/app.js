const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');

const errorHandler = require('./middleware/errorHandler');
const { protect, requireRole } = require('./middleware/protect');

// Route modules
const authRoutes          = require('./routes/auth.routes');
const usersRoutes         = require('./routes/users.routes');
const chatRoutes          = require('./routes/chat.routes');
const routeRoutes         = require('./routes/route.routes');
const routesRoutes        = require('./routes/routes.routes');
const transportRoutes     = require('./routes/transport.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const hubRoutes           = require('./routes/hub.routes');
const placeRoutes         = require('./routes/place.routes');
const analyticsRoutes     = require('./routes/analytics.routes');

const app = express();
const server = http.createServer(app);

// ── Socket.IO setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) return next(new Error('User not found'));
    
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected`);
  
  // Join user-specific room for private messages
  socket.join(`user_${socket.userId}`);
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected`);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true
  })
);

// ── Cookie parsing ────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health / test ─────────────────────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Travel Addis Ababa API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
// Auth (public)
app.use('/api/auth', authRoutes);

// Analytics (public tracking, protected dashboard)
app.use('/api/analytics', analyticsRoutes);

// User management (superadmin only)
app.use('/api/users', usersRoutes);

// Chat (authenticated users)
app.use('/api/chat', chatRoutes);

// Public traveler endpoints
app.use('/api/route',           routeRoutes);
app.use('/api/transport',       transportRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Admin-protected endpoints
app.use('/api/routes',    protect, routesRoutes);
app.use('/api/transports', protect, transportRoutes);
app.use('/api/hubs',       protect, hubRoutes);
app.use('/api/places',     protect, placeRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = { app, server };
