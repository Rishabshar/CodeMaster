
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// ============================================================================
// FORMAT DETECTION
// ============================================================================

async function checkProblems() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     PROBLEM FORMAT DIAGNOSTIC TOOL                     ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // Get all problems
    console.log('📊 Fetching all problems...\n');
    
    const result = await pool.query(`
      SELECT 
        id, 
        title,
        method_name,
        return_type,
        parameters,
        parameter_order
      FROM problems
      ORDER BY id
    `);

    const problems = result.rows;

    if (problems.length === 0) {
      console.log('⚠️  No problems found in database!');
      return;
    }

    console.log(`Found ${problems.length} problems\n`);

    // Analyze each problem
    const standardized = [];
    const legacy = [];
    const partial = [];

    for (const problem of problems) {
      const hasMethodName = !!problem.method_name;
      const hasReturnType = !!problem.return_type;
      const hasParameters = problem.parameters !== null && problem.parameters !== undefined && Object.keys(problem.parameters).length > 0;
      const hasParameterOrder = problem.parameter_order !== null && problem.parameter_order !== undefined && Array.isArray(problem.parameter_order);

      const isStandardized = hasMethodName && hasReturnType && hasParameters && hasParameterOrder;
      const isPartial = (hasMethodName || hasReturnType || hasParameters) && !isStandardized;
      const isLegacy = !hasMethodName && !hasReturnType && !hasParameters;

      if (isStandardized) {
        standardized.push(problem);
      } else if (isPartial) {
        partial.push(problem);
      } else if (isLegacy) {
        legacy.push(problem);
      }
    }

    // Print summary
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                           ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    console.log(`📊 Standardized Format (98%+):   ${standardized.length}/${problems.length} ✅`);
    console.log(`⚠️  Partial Format:               ${partial.length}/${problems.length}`);
    console.log(`❌ Legacy Format (90%):          ${legacy.length}/${problems.length}`);

    // Calculate percentage
    const standardizedPercent = ((standardized.length / problems.length) * 100).toFixed(1);
    console.log(`\n📈 Coverage: ${standardizedPercent}% standardized\n`);

    // Show details
    if (standardized.length > 0) {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║ ✅ STANDARDIZED FORMAT PROBLEMS (98%+ coverage)        ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      standardized.slice(0, 10).forEach((problem, idx) => {
        const params = Array.isArray(problem.parameter_order) ? problem.parameter_order : [];
        console.log(`${idx + 1}. Problem #${problem.id}: ${problem.title}`);
        console.log(`   Method: ${problem.method_name}`);
        console.log(`   Return Type: ${problem.return_type}`);
        console.log(`   Parameters: ${params.join(', ')}`);
        console.log('');
      });

      if (standardized.length > 10) {
        console.log(`... and ${standardized.length - 10} more\n`);
      }
    }

    if (legacy.length > 0) {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║ ❌ LEGACY FORMAT PROBLEMS (90% coverage)               ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      legacy.slice(0, 10).forEach((problem, idx) => {
        console.log(`${idx + 1}. Problem #${problem.id}: ${problem.title}`);
        console.log('   Status: Needs migration');
        console.log('');
      });

      if (legacy.length > 10) {
        console.log(`... and ${legacy.length - 10} more\n`);
      }
    }

    if (partial.length > 0) {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║ ⚠️  PARTIAL FORMAT PROBLEMS (Incomplete metadata)      ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      partial.slice(0, 10).forEach((problem, idx) => {
        console.log(`${idx + 1}. Problem #${problem.id}: ${problem.title}`);
        console.log(`   Method: ${problem.method_name || 'MISSING'}`);
        console.log(`   Return Type: ${problem.return_type || 'MISSING'}`);
        console.log(`   Parameters: ${problem.parameters ? 'OK' : 'MISSING'}`);
        console.log('');
      });

      if (partial.length > 10) {
        console.log(`... and ${partial.length - 10} more\n`);
      }
    }

    // Print recommendations
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                 RECOMMENDATIONS                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (standardized.length === problems.length) {
      console.log('✅ EXCELLENT! All problems are standardized.');
      console.log('   Your system is at 98%+ coverage!');
      console.log('\n   Next steps:');
      console.log('   1. Restart backend: npm run dev');
      console.log('   2. Test by submitting code');
      console.log('   3. Check logs for "NEW FORMAT" message');
      console.log('   4. You\'re done! 🎉\n');
    } else if (standardized.length / problems.length > 0.5) {
      console.log('🟡 GOOD! More than 50% of problems are standardized.');
      console.log(`   ${legacy.length} problems still need migration.\n`);
      console.log('   Next steps:');
      console.log('   1. Add metadata to remaining problems');
      console.log('   2. Run this script again to verify');
      console.log('   3. Restart backend\n');
    } else if (legacy.length === problems.length) {
      console.log('❌ NO STANDARDIZATION - All problems are legacy format.');
      console.log('   Your system is at 90% coverage.\n');
      console.log('   Next steps:');
      console.log('   1. Add metadata using SQL or script');
      console.log('   2. Run this script to verify');
      console.log('   3. Restart backend');
      console.log('   4. Your coverage will jump to 98%!\n');
    } else {
      console.log('⚠️  MIXED - Problems are in different formats.');
      console.log(`   ${standardized.length} standardized`);
      console.log(`   ${partial.length} partial`);
      console.log(`   ${legacy.length} legacy\n`);
      console.log('   Next steps:');
      console.log('   1. Add metadata to remaining problems');
      console.log('   2. Run this script to verify');
      console.log('   3. Restart backend\n');
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkProblems();