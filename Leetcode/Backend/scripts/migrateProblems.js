// Backend/scripts/migrateProblems.js
// FIXED VERSION - Corrected regex patterns & .env loading
// Automated migration script: Converts old format problems to new standardized format
// Usage: node migrateProblems.js

// IMPORTANT: Load .env FIRST
require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'leetcode'
});

// ============================================================================
// METADATA EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract method name from code
 */
function extractMethodName(code) {
  // Java
  let match = code.match(/public\s+\w+(?:\[\])*\s+(\w+)\s*\(/);
  if (match) return match[1];
  
  // Python
  match = code.match(/def\s+(\w+)\s*\(/);
  if (match) return match[1];
  
  // JavaScript - simplified version
  match = code.match(/function\s+(\w+)/);
  if (match) return match[1];
  
  match = code.match(/const\s+(\w+)\s*=/);
  if (match) return match[1];
  
  match = code.match(/(\w+)\s*=\s*(?:function|\()/);
  if (match) return match[1];
  
  return null;
}

/**
 * Extract return type from code
 */
function extractReturnType(code, problem) {
  // Try to infer from problem title or description
  const title = problem.title.toLowerCase();
  const desc = (problem.description || '').toLowerCase();
  
  // Check for array returns
  if (title.includes('two sum') || title.includes('3sum') || title.includes('indices')) {
    return 'int[]';
  }
  if (code.includes('return new int[]') || code.includes('return []')) {
    return 'int[]';
  }
  if (code.includes('return "') || title.includes('string')) {
    return 'String';
  }
  if (code.includes('return true') || code.includes('return false') || title.includes('valid') || title.includes('palindrome')) {
    return 'boolean';
  }
  if (code.includes('return new List') || code.includes('List<')) {
    return 'List<Integer>';
  }
  
  // Default
  return 'int';
}

/**
 * Extract parameters from code signature
 */
function extractParameters(code, language) {
  const params = {};
  let paramNames = [];
  
  if (language === 'java') {
    const match = code.match(/public\s+\w+(?:\[\])*\s+\w+\s*\(([^)]*)\)/);
    if (match) {
      const paramString = match[1];
      const parts = paramString.split(',');
      parts.forEach(part => {
        part = part.trim();
        if (part) {
          const nameParts = part.split(/\s+/);
          const paramName = nameParts[nameParts.length - 1];
          const paramType = part.substring(0, part.lastIndexOf(paramName)).trim();
          params[paramName] = paramType;
          paramNames.push(paramName);
        }
      });
    }
  } else if (language === 'python') {
    const match = code.match(/def\s+\w+\s*\(([^)]*)\)/);
    if (match) {
      const paramString = match[1];
      paramNames = paramString.split(',').map(p => p.trim().split('=')[0].trim()).filter(p => p && p !== 'self');
      paramNames.forEach(name => {
        // Infer type from name
        if (name.includes('num') || name === 'x' || name === 'target' || name === 'k') {
          params[name] = 'int';
        } else if (name === 's' || name.includes('str')) {
          params[name] = 'String';
        } else {
          params[name] = 'int';
        }
      });
    }
  } else if (language === 'javascript') {
    // Try function declaration
    let match = code.match(/function\s+\w+\s*\(([^)]*)\)/);
    if (match) {
      const paramString = match[1];
      paramNames = paramString.split(',').map(p => p.trim()).filter(p => p);
    } else {
      // Try const/arrow function
      match = code.match(/const\s+\w+\s*=\s*\(([^)]*)\)/);
      if (match) {
        const paramString = match[1];
        paramNames = paramString.split(',').map(p => p.trim()).filter(p => p);
      }
    }
    
    paramNames.forEach(name => {
      if (name.includes('num') || name === 'x' || name === 'target' || name === 'k') {
        params[name] = 'int';
      } else if (name === 's') {
        params[name] = 'String';
      } else {
        params[name] = 'int';
      }
    });
  }
  
  return { params, paramNames };
}

/**
 * Detect language from code
 */
function detectLanguage(code) {
  if (code.includes('public class') || code.includes('public int') || code.includes('new ArrayList')) {
    return 'java';
  }
  if (code.includes('def ') || code.includes('for i in range')) {
    return 'python';
  }
  if (code.includes('function') || code.includes('=>') || code.includes('const ')) {
    return 'javascript';
  }
  return 'unknown';
}

/**
 * Convert test case from old to new format
 */
function convertTestCase(oldTestCase) {
  const newTestCase = {};
  
  // Try common field patterns
  if (oldTestCase.nums && oldTestCase.target) {
    newTestCase.nums = Array.isArray(oldTestCase.nums) ? oldTestCase.nums : JSON.parse(oldTestCase.nums);
    newTestCase.target = parseInt(oldTestCase.target);
  } else if (oldTestCase.s) {
    newTestCase.s = oldTestCase.s;
  } else if (oldTestCase.x) {
    newTestCase.x = parseInt(oldTestCase.x);
  } else if (oldTestCase.input) {
    newTestCase.input = oldTestCase.input;
  } else {
    // Copy all fields except expected
    Object.keys(oldTestCase).forEach(key => {
      if (key !== 'expected' && key !== 'id' && key !== 'problem_id' && key !== 'created_at' && key !== 'updated_at') {
        try {
          newTestCase[key] = typeof oldTestCase[key] === 'string' ? JSON.parse(oldTestCase[key]) : oldTestCase[key];
        } catch (e) {
          newTestCase[key] = oldTestCase[key];
        }
      }
    });
  }
  
  // Add expected
  if (oldTestCase.expected !== undefined) {
    try {
      newTestCase.expected = typeof oldTestCase.expected === 'string' ? JSON.parse(oldTestCase.expected) : oldTestCase.expected;
    } catch (e) {
      newTestCase.expected = oldTestCase.expected;
    }
  }
  
  return newTestCase;
}

// ============================================================================
// MIGRATION MAIN FUNCTION
// ============================================================================

async function migrateProblems() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     LEETCODE PROBLEM MIGRATION TO STANDARDIZED FORMAT     ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // Fetch all problems
    console.log('🔍 Fetching problems from database...');
    const problemsResult = await pool.query('SELECT * FROM problems ORDER BY id');
    const problems = problemsResult.rows;
    
    console.log(`📊 Found ${problems.length} problems to migrate\n`);

    const report = {
      totalProblems: problems.length,
      successfullyMigrated: 0,
      failedMigrations: [],
      totalTestCasesMigrated: 0,
      details: []
    };

    // Migrate each problem
    for (const problem of problems) {
      console.log(`\n📌 Migrating Problem #${problem.id}: "${problem.title}"`);
      console.log('─'.repeat(60));

      try {
        // Skip if already migrated
        if (problem.method_name && problem.return_type && problem.parameters) {
          console.log(`⏭️  Already migrated, skipping...`);
          report.successfullyMigrated++;
          continue;
        }

        // Detect language from code samples
        let language = 'unknown';
        if (problem.code_java) language = 'java';
        else if (problem.code_python) language = 'python';
        else if (problem.code_javascript) language = 'javascript';

        const codeToAnalyze = problem.code_java || problem.code_python || problem.code_javascript || '';
        
        if (!codeToAnalyze) {
          console.log('⚠️  No code found, skipping...');
          continue;
        }

        console.log(`🔍 Detected language: ${language}`);

        // Extract metadata
        const methodName = extractMethodName(codeToAnalyze);
        const returnType = extractReturnType(codeToAnalyze, problem);
        const { params, paramNames } = extractParameters(codeToAnalyze, language);

        console.log(`✅ Extracted metadata:`);
        console.log(`   Method: ${methodName}`);
        console.log(`   Return Type: ${returnType}`);
        console.log(`   Parameters: ${paramNames.join(', ')}`);

        // Update problem with metadata
        const updateProblemQuery = `
          UPDATE problems
          SET 
            method_name = $1,
            return_type = $2,
            parameters = $3,
            parameter_order = $4
          WHERE id = $5
        `;

        await pool.query(updateProblemQuery, [
          methodName,
          returnType,
          JSON.stringify(params),
          JSON.stringify(paramNames),
          problem.id
        ]);

        console.log(`✅ Problem metadata updated`);

        // Migrate test cases
        console.log(`\n  🔄 Migrating test cases...`);
        const testCasesResult = await pool.query(
          'SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY test_number',
          [problem.id]
        );

        let migratedTestCases = 0;
        for (const testCase of testCasesResult.rows) {
          try {
            // Parse inputs if string
            let inputs = testCase.inputs;
            try {
              inputs = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;
            } catch (e) {
              inputs = testCase.inputs;
            }

            // Convert to new format
            const newTestCase = convertTestCase({ ...inputs, expected: testCase.expected });

            // Update test case
            const updateTestQuery = `
              UPDATE test_cases
              SET inputs = $1
              WHERE id = $2
            `;

            await pool.query(updateTestQuery, [
              JSON.stringify(newTestCase),
              testCase.id
            ]);

            migratedTestCases++;
          } catch (e) {
            console.error(`  ❌ Failed to migrate test case #${testCase.id}: ${e.message}`);
          }
        }

        console.log(`  ✅ Migrated ${migratedTestCases} test cases`);

        report.successfullyMigrated++;
        report.totalTestCasesMigrated += migratedTestCases;
        report.details.push({
          id: problem.id,
          title: problem.title,
          methodName,
          returnType,
          parameters: paramNames,
          testCases: migratedTestCases,
          status: 'SUCCESS'
        });

      } catch (error) {
        console.error(`❌ Error migrating problem #${problem.id}: ${error.message}`);
        report.failedMigrations.push({
          id: problem.id,
          title: problem.title,
          error: error.message
        });
      }
    }

    // Print migration report
    console.log('\n\n╔══════════════════════════════════════════════════════╗');
    console.log('║              MIGRATION REPORT                          ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    console.log(`✅ Successfully migrated: ${report.successfullyMigrated}/${report.totalProblems}`);
    console.log(`📊 Total test cases migrated: ${report.totalTestCasesMigrated}`);
    console.log(`❌ Failed migrations: ${report.failedMigrations.length}`);

    if (report.failedMigrations.length > 0) {
      console.log('\n⚠️  Failed Migrations:');
      report.failedMigrations.forEach(item => {
        console.log(`   - Problem #${item.id} (${item.title}): ${item.error}`);
      });
    }

    console.log('\n📝 Successful Migrations:');
    report.details.filter(d => d.status === 'SUCCESS').slice(0, 10).forEach(item => {
      console.log(`   ✅ #${item.id} ${item.title}`);
      console.log(`      Method: ${item.methodName}, Return: ${item.returnType}, Params: ${item.parameters.join(', ')}`);
      console.log(`      Test cases: ${item.testCases}`);
    });

    // Save report to file
    const reportFile = path.join(__dirname, 'migration_report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportFile}`);

    console.log('\n✨ Migration complete!\n');

    return report;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

if (require.main === module) {
  migrateProblems()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}

module.exports = { migrateProblems };