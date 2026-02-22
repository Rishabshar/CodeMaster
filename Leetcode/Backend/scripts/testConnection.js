require('dotenv').config();

const { Pool } = require('pg');

// Create connection pool using .env variables
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function testConnection() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║          DATABASE CONNECTION TEST                      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('Testing connection with these credentials:');
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log('');

  try {
    console.log('🔄 Connecting to database...');
    
    const client = await pool.connect();
    
    console.log('✅ Connection successful!\n');

    // Test query
    console.log('🔍 Fetching database info...');
    const result = await client.query('SELECT COUNT(*) as problem_count FROM problems');
    
    console.log(`✅ Problems in database: ${result.rows[0].problem_count}`);

    // Check columns
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'problems'
      AND column_name IN ('method_name', 'return_type', 'parameters', 'parameter_order')
    `);

    console.log(`✅ Standardized columns found: ${columnsResult.rows.length}/4`);
    if (columnsResult.rows.length > 0) {
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}`);
      });
    }

    client.release();

    console.log('\n✨ Database connection is working perfectly!');
    console.log('\n🚀 You can now run the migration script:');
    console.log('   node scripts/migrateProblems.js\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check .env file has correct credentials');
    console.error('2. Make sure PostgreSQL is running');
    console.error('3. Verify password is correct');
    console.error('4. Check database name exists');
    console.error('\nYour current .env settings:');
    console.error(`  DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
    console.error(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
    console.error(`  DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
    console.error(`  DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`);
    console.error(`  DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();