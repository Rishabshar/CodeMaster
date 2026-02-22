const pool = require('../config/database');

// Get or create user
const getOrCreateUser = async (clerkId, email, username, fullName) => {
    try {
        // Check if user exists
        let result = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
        
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        
        // Create new user
        result = await pool.query(
            'INSERT INTO users (clerk_id, email, username, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
            [clerkId, email, username, fullName]
        );
        
        const userId = result.rows[0].id;
        
        // Create user stats
        await pool.query(
            'INSERT INTO user_stats (user_id) VALUES ($1)',
            [userId]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Error getting/creating user:', error);
        throw error;
    }
};

// Get user by ID ✅ NEW FUNCTION
const getUserById = async (userId) => {
    try {
        const result = await pool.query(
            'SELECT id, clerk_id, username, email, full_name, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Get user stats
const getUserStats = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
};

// Update user stats
const updateUserStats = async (userId, problemId, isCorrect) => {
    try {
        if (!isCorrect) return;

        // 1. Get problem difficulty
        const problemResult = await pool.query('SELECT difficulty FROM problems WHERE id = $1', [problemId]);
        if (!problemResult.rows[0]) return;
        const difficulty = problemResult.rows[0].difficulty.toLowerCase();

        // 2. Check if this user solved this problem BEFORE this current attempt
        // We look for Accepted submissions, excluding the one we might have just created 
        // Or simply check if total count of Accepted for this problem is exactly 1
        const solveCountResult = await pool.query(
            'SELECT count(*) FROM submissions WHERE user_id = $1 AND problem_id = $2 AND status = $3',
            [userId, problemId, 'Accepted']
        );
        
        const solveCount = parseInt(solveCountResult.rows[0].count);

        // 3. Only increment if this is their FIRST accepted submission
        if (solveCount === 1) {
            console.log(`🎯 First time solve! Updating ${difficulty} stats for user ${userId}`);
            await pool.query(
                `UPDATE user_stats SET 
                 total_solved = total_solved + 1, 
                 ${difficulty}_solved = ${difficulty}_solved + 1,
                 updated_at = NOW()
                 WHERE user_id = $1`,
                [userId]
            );
        } else {
            console.log(`ℹ️ User ${userId} already solved problem ${problemId} previously. No stat change.`);
        }
    } catch (error) {
        console.error('❌ Error updating user stats:', error);
        throw error;
    }
};

module.exports = {
    getOrCreateUser,
    getUserById,        // ✅ ADDED THIS
    getUserStats,
    updateUserStats
};