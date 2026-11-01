require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const connectDB = require('./config/database');
const socketHandler = require('./websocket/socketHandler');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO Handler
socketHandler(io);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/blockages', require('./routes/blockageRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NE Logistics Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'NE Smart Logistics Platform API',
    version: '1.0.0',
    description: 'Real-time logistics intelligence for North Eastern Region',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      deliveries: '/api/deliveries',
      blockages: '/api/blockages',
      health: '/api/health'
    }
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Do not report a healthy API until the database has connected.
const PORT = process.env.PORT || 5000;
server.on('error', (error) => {
  console.error(`API could not start: ${error.code === 'EADDRINUSE' ? `Port ${PORT} is already in use.` : error.message}`);
  process.exit(1);
});

const start = async () => {
  await connectDB();
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing from backend/.env.');
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚛 NE SMART LOGISTICS PLATFORM - API SERVER             ║
║                                                            ║
║   Status: ✅ RUNNING                                       ║
║   Port: ${PORT}                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║   Socket.IO: ✅ ENABLED                                    ║
║                                                            ║
║   Endpoints:                                               ║
║   → http://localhost:${PORT}/api/auth                        ║
║   → http://localhost:${PORT}/api/deliveries                  ║
║   → http://localhost:${PORT}/api/blockages                   ║
║   → http://localhost:${PORT}/api/users                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
};

start().catch((error) => {
  console.error(`API startup failed: ${error.message}`);
  process.exit(1);
});

module.exports = { app, server, io };
