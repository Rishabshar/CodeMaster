const pool = require('../config/database');

// Create submission
const createSubmission = async (userId, problemId, code, language) => {
    try {
        const result = await pool.query(
            'INSERT INTO submissions (user_id, problem_id, code, language, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, problemId, code, language, 'Pending']
        );
        return result.rows[0].id;
    } catch (error) {
        console.error('Error creating submission:', error);
        throw error;
    }
};

// Update submission result
const updateSubmissionResult = async (submissionId, status, runtime, memory, output, errorMessage) => {
    try {
        // Ensure status is one of the allowed values
        const allowedStatuses = ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'];
        const validStatus = allowedStatuses.includes(status) ? status : 'Runtime Error';
        
        const result = await pool.query(
            'UPDATE submissions SET status = $1, runtime = $2, memory = $3, output = $4, error_message = $5, created_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [validStatus, runtime, memory, output, errorMessage, submissionId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating submission:', error);
        throw error;
    }
};

// Get user submissions
const getUserSubmissions = async (userId, problemId) => {
    try {
        const result = await pool.query(
            'SELECT * FROM submissions WHERE user_id = $1 AND problem_id = $2 ORDER BY created_at DESC',
            [userId, problemId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }
};

module.exports = {
    createSubmission,
    updateSubmissionResult,
    getUserSubmissions
};