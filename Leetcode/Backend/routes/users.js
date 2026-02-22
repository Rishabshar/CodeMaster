const express = require('express');
const userQueries = require('../queries/userQueries');
const router = express.Router();

// 1. Sync user with database
router.post('/api/users/sync', async (req, res) => {
  try {
    const { clerkId, email, username, fullName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' });
    }

    let generatedUsername = username || email.split('@')[0] || `user_${Date.now()}`;
    let generatedFullName = fullName || 'User';

    console.log('👤 Syncing user:', generatedUsername);
    
    const user = await userQueries.getOrCreateUser(
      clerkId,
      email,
      generatedUsername,
      generatedFullName
    );

    console.log('✅ User synced with ID:', user.id);
    res.json(user);
  } catch (error) {
    console.error('❌ Error syncing user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get user stats (with cache busting)
router.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    console.log('📊 Fetching stats for user:', userId);
    
    const stats = await userQueries.getUserStats(userId);

    if (!stats) {
      console.warn('⚠️ Stats not found for user:', userId);
      return res.status(404).json({ error: 'User stats not found' });
    }

    // ✅ Force no cache for live updates
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log('✅ Stats retrieved for user:', userId);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching user stats:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get user profile
router.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('👤 Fetching profile for user:', userId);
    
    const user = await userQueries.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Profile retrieved for user:', userId);
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user profile:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. DEBUG ROUTE: Manually trigger a solve (for testing)
router.post('/api/users/:userId/test-solve', async (req, res) => {
  try {
    const { userId } = req.params;
    const { difficulty = 'easy' } = req.body; 

    console.log('🧪 Test solve triggered for user:', userId);
    
    const result = await userQueries.updateUserStats(userId, 1, true); 
    
    console.log('✅ Test solve completed for user:', userId);
    res.json({ message: "Stat updated successfully!", difficulty });
  } catch (error) {
    console.error('❌ Error in test solve:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
