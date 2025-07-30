const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { initializeDatabase } = require('./db/init');

const port = process.env.PORT || 5000;

// Middlewares
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN || 'https://pm-dashboard-roan.vercel.app']
    : ['http://localhost:3000'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is up and running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
