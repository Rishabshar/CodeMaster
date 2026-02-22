const pool = require('../config/database');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully:', result.rows[0]);
    
    const problems = await pool.query('SELECT COUNT(*) FROM problems');
    console.log('✅ Problems count:', problems.rows[0].count);
    
    const users = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users count:', users.rows[0].count);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();