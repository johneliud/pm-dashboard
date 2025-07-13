const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is up and running ✅" });
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
