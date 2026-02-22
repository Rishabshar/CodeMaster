const pool = require('../config/database');

// Get all problems
const getAllProblems = async () => {
    try {
        const result = await pool.query('SELECT * FROM problems');
        return result.rows;
    } catch (error) {
        console.error('Error fetching problems:', error);
        throw error;
    }
};

// Get problem by ID
const getProblemById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM problems WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching problem:', error);
        throw error;
    }
};

// Create new problem
const createProblem = async (title, description, difficulty, category, examples, test_cases, constraints) => {
    try {
        const result = await pool.query(
            'INSERT INTO problems (title, description, difficulty, category, examples, test_cases, constraints) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description, difficulty, category, examples, test_cases, constraints]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating problem:', error);
        throw error;
    }
};

module.exports = {
    getAllProblems,
    getProblemById,
    createProblem
};