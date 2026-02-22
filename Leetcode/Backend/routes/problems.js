const express = require('express');
const problemQueries = require('../queries/problemQueries');
const router = express.Router();

// Get all problems
router.get('/api/problems', async (req, res) => {
  try {
    const problems = await problemQueries.getAllProblems();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get problem by ID
router.get('/api/problems/:id', async (req, res) => {
  try {
    const problem = await problemQueries.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create problem (admin only)
router.post('/api/problems', async (req, res) => {
  try {
    const { title, description, difficulty, category, examples, test_cases, constraints } = req.body;
    const problem = await problemQueries.createProblem(
      title, description, difficulty, category, examples, test_cases, constraints
    );
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;