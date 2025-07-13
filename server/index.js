const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { initializeDatabase } = require('./db/init');

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is up and running ✅" });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log('Available endpoints:');
      console.log('  GET  /api/health');
      console.log('  POST /api/auth/register');
      console.log('  POST /api/auth/login');
      console.log('  GET  /api/projects');
      console.log('  POST /api/projects');
      console.log('  POST /api/projects/:id/sync');
      console.log('  GET  /api/projects/:id/items');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
