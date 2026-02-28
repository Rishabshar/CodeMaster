const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import all routers
const submissionsRouter = require('./routes/submissions');
const problemsRouter = require('./routes/problems');
const usersRouter = require('./routes/users');  // ✅ MUST HAVE THIS

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Register all routes
app.use('/', submissionsRouter);   // ✅ /api/submissions
app.use('/', problemsRouter);      // ✅ /api/problems
app.use('/', usersRouter);         // ✅ /api/users (CRITICAL)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Routes registered:`);
  console.log(`   - POST /api/submissions`);
  console.log(`   - GET /api/problems`);
  console.log(`   - GET /api/problems/:id`);
  console.log(`   - POST /api/users/sync`);
  console.log(`   - GET /api/users/:userId/stats`);
});