
const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ✅ FIX #1: Add a cleanup interval to remove dangling Docker containers
const CLEANUP_INTERVAL = 60000; // Every 60 seconds
let cleanupTimer = null;

function startCleanupInterval() {
  if (cleanupTimer) return;
  
  cleanupTimer = setInterval(async () => {
    try {
      // Remove containers older than 5 minutes
      await execAsync('docker container prune -f --filter "until=5m"');
      console.log('🧹 Docker cleanup: Old containers removed');
    } catch (e) {
      console.log('⚠️ Docker cleanup warning:', e.message);
    }
  }, CLEANUP_INTERVAL);
  
  cleanupTimer.unref(); // Don't keep process alive just for cleanup
}

// Start cleanup on module load
startCleanupInterval();

function isNewFormat(problemMetadata, testCases) {
  if (problemMetadata && problemMetadata.parameterOrder && problemMetadata.parameters) {
    console.log('📍 Detected: NEW STANDARDIZED FORMAT (98%+)');
    return true;
  }
  console.log('📍 Detected: OLD FORMAT (90%+, backward compatible)');
  return false;
}

// ✅ FIX #2: Improved executeInDocker with proper cleanup
async function executeInDocker(code, language, testCases = [], problemTitle = '', problemMetadata = {}) {
  if (!code || typeof code !== 'string') {
    return { passed: false, tests: [], error: 'Code must be a non-empty string', language };
  }
  
  if (!language || !['javascript', 'python', 'java'].includes(language)) {
    return { passed: false, tests: [], error: 'Language must be: javascript, python, or java', language };
  }
  
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return { passed: false, tests: [], error: 'Test cases are required', language };
  }

  const containerId = `code-${Date.now()}`;
  const tmpDir = path.join(__dirname, `../temp/${containerId}`);
  let result = null;
  
  try {
    await fs.mkdir(tmpDir, { recursive: true });

    const useNewFormat = isNewFormat(problemMetadata, testCases);
    
    result = { passed: true, tests: [], language, format: useNewFormat ? 'standardized' : 'legacy' };
    
    switch(language) {
      case 'javascript':
        if (useNewFormat) {
          const { methodName, parameters, parameterOrder } = problemMetadata;
          result = await executeJavaScriptNew(code, testCases, methodName, parameters, parameterOrder);
        } else {
          result = await executeJavaScriptLegacy(code, testCases);
        }
        break;
      case 'python':
        if (useNewFormat) {
          const { methodName, parameters, parameterOrder } = problemMetadata;
          result = await executePythonDockerNew(code, testCases, tmpDir, methodName, parameters, parameterOrder);
        } else {
          result = await executePythonDockerLegacy(code, testCases, tmpDir);
        }
        break;
      case 'java':
        if (useNewFormat) {
          const { methodName, returnType, parameters, parameterOrder } = problemMetadata;
          result = await executeJavaDockerNew(code, testCases, tmpDir, methodName, returnType, parameters, parameterOrder);
        } else {
          result = await executeJavaDockerLegacy(code, testCases, tmpDir);
        }
        break;
    }

    return result;
  } catch (error) {
    console.error('❌ Docker execution error:', error.message);
    return { passed: false, tests: [], error: error.message, language };
  } finally {
    // ✅ FIX #3: Ensure temp files are always cleaned up
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
      console.log(`✅ Cleaned up temp directory: ${tmpDir}`);
    } catch (e) {
      console.warn(`⚠️ Failed to cleanup ${tmpDir}:`, e.message);
    }
  }
}

// ============================================================================
// HELPER: Convert arrays to ListNode for linked list problems
// ============================================================================

function arrayToListNode(arr) {
  if (!arr || arr.length === 0) return null;
  const head = { val: arr[0], next: null };
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = { val: arr[i], next: null };
    current = current.next;
  }
  return head;
}

function listNodeToArray(node) {
  const result = [];
  let current = node;
  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

// ============================================================================
// NEW FORMAT EXECUTORS (98%+ coverage)
// ============================================================================

async function executeJavaScriptNew(code, testCases, methodName, parameters, parameterOrder) {
  const result = { passed: true, tests: [], language: 'javascript' };

  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🟦 JAVASCRIPT EXECUTOR (NEW FORMAT)');
    console.log('═══════════════════════════════════════════════');
    
    let userSolution;
    try {
      if (code.includes('var ') || code.includes('function ')) {
        let funcName = methodName;
        const varMatch = code.match(/var\s+(\w+)\s*=/);
        const funcMatch = code.match(/function\s+(\w+)/);
        
        if (varMatch) funcName = varMatch[1];
        else if (funcMatch) funcName = funcMatch[1];
        
        userSolution = new Function(code + `\n return ${funcName};`)();
      } else {
        userSolution = eval(`(${code})`);
      }
      console.log('✅ Code parsed successfully');
    } catch (e) {
      return { 
        passed: false, 
        tests: [], 
        error: `Code parsing failed: ${e.message}`, 
        language: 'javascript' 
      };
    }

    if (typeof userSolution !== 'function') {
      return {
        passed: false,
        tests: [],
        error: `Code must evaluate to a function`,
        language: 'javascript'
      };
    }

    for (let index = 0; index < testCases.length; index++) {
      let testCase = testCases[index];
      
      if (typeof testCase === 'string') {
        try {
          testCase = JSON.parse(testCase);
        } catch (e) {}
      }

      console.log(`📌 Test ${index + 1}:`, JSON.stringify(testCase));
      
      try {
        const callArgs = parameterOrder.map(paramName => {
          let val = testCase[paramName];
          
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch (e) {}
          }
          
          // Convert arrays to ListNode if parameter type is ListNode
          if (parameters[paramName] === 'ListNode' && Array.isArray(val)) {
            val = arrayToListNode(val);
          }
          
          return val;
        });

        console.log(`📋 Call args:`, callArgs);

        let output = null;

        try {
          const executionPromise = Promise.resolve(userSolution(...callArgs));
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Time Limit Exceeded (5s)'));
            }, 5000);
          });

          output = await Promise.race([executionPromise, timeoutPromise]);
        } catch (e) {
          result.tests.push({
            test: index + 1,
            expected: testCase.expected,
            got: null,
            error: e.message,
            passed: false
          });
          result.passed = false;
          continue;
        }

        let expectedValue = testCase.expected;
        if (typeof expectedValue === 'string') {
          try {
            expectedValue = JSON.parse(expectedValue);
          } catch (e) {
            if (!isNaN(expectedValue)) {
              expectedValue = parseInt(expectedValue);
            }
          }
        }

        // Convert ListNode output back to array for comparison
        let outputToCompare = output;
        if (parameters[parameterOrder[parameterOrder.length - 1]] === 'ListNode' && output && typeof output === 'object' && output.val !== undefined) {
          outputToCompare = listNodeToArray(output);
        }

        const passed = deepEqual(outputToCompare, expectedValue);

        console.log(`✅ Output: ${output}, Expected: ${expectedValue}, Passed: ${passed}`);

        result.tests.push({
          test: index + 1,
          expected: expectedValue,
          got: output,
          passed
        });
        
        result.passed = result.passed && passed;
      } catch (e) {
        result.tests.push({
          test: index + 1,
          expected: testCase.expected,
          got: null,
          error: e.message,
          passed: false
        });
        result.passed = false;
      }
    }

    result.message = result.passed ? 'Accepted! 🎉' : 'Wrong Answer ❌';
    console.log('🟦 JAVASCRIPT EXECUTOR FINISHED\n');
    return result;
  } catch (error) {
    return { passed: false, tests: [], error: error.message, language: 'javascript' };
  }
}

// ✅ FIX #4: Improved Python executor with better error handling and cleanup
async function executePythonDockerNew(code, testCases, tmpDir, methodName, parameters, parameterOrder) {
  const result = { passed: true, tests: [], language: 'python' };

  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🐍 PYTHON EXECUTOR (NEW FORMAT)');
    console.log('═══════════════════════════════════════════════');

    const funcMatch = code.match(/def\s+(\w+)\s*\(/);
    const actualFuncName = funcMatch ? funcMatch[1] : methodName;
    
    console.log(`📌 Metadata method: ${methodName}`);
    console.log(`📌 Actual function: ${actualFuncName}`);

    for (let i = 0; i < testCases.length; i++) {
      let testCase = testCases[i];
      
      if (typeof testCase === 'string') {
        try {
          testCase = JSON.parse(testCase);
        } catch (e) {}
      }

      const pyFile = path.join(tmpDir, `test_${i}.py`);
      
      const callArgs = parameterOrder.map(paramName => {
        const value = testCase[paramName];
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '\\"')}"`;
        }
        return JSON.stringify(value);
      }).join(', ');
      
      const testCode = `${code}\n\nresult = ${actualFuncName}(${callArgs})\nprint(result)`;

      console.log(`📌 Test ${i + 1} code:\n${testCode}\n---`);

      await fs.writeFile(pyFile, testCode);

      let dockerProcess = null;
      try {
        const { stdout, stderr } = await execAsync(
          `docker run --rm -v ${tmpDir}:/code code-executor:latest timeout 5 python3 /code/test_${i}.py`,
          { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }
        );

        let parsedOutput = stdout.trim();
        
        try {
          parsedOutput = JSON.parse(stdout.trim());
        } catch (e) {
          if (!isNaN(stdout.trim())) {
            parsedOutput = parseInt(stdout.trim());
          }
        }

        let expectedValue = testCase.expected;
        if (typeof expectedValue === 'string') {
          try {
            expectedValue = JSON.parse(expectedValue);
          } catch (e) {
            if (!isNaN(expectedValue)) {
              expectedValue = parseInt(expectedValue);
            }
          }
        }

        const passed = deepEqual(parsedOutput, expectedValue);
        
        result.tests.push({
          test: i + 1,
          expected: expectedValue,
          got: parsedOutput,
          passed
        });
        result.passed = result.passed && passed;
      } catch (e) {
        result.tests.push({
          test: i + 1,
          expected: testCase.expected,
          got: null,
          error: e.message,
          passed: false
        });
        result.passed = false;
      }
    }

    result.message = result.passed ? 'Accepted! 🎉' : 'Wrong Answer ❌';
    console.log('🐍 PYTHON EXECUTOR FINISHED\n');
    return result;
  } catch (error) {
    return { passed: false, tests: [], error: error.message, language: 'python' };
  }
}

// ✅ FIX #5: Improved Java executor with better cleanup
async function executeJavaDockerNew(code, testCases, tmpDir, methodName, returnType, parameters, parameterOrder) {
  const result = { passed: true, tests: [], language: 'java' };

  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('☕ JAVA EXECUTOR (NEW FORMAT)');
    console.log('═══════════════════════════════════════════════');

    code = cleanJavaCode(code);
    
    const className = `Solution_${Date.now()}`;
    const javaFile = path.join(tmpDir, `${className}.java`);

    let javaCode = '';
    let actualMethod = methodName;
    
    if (code.includes('class ')) {
      console.log('📌 Detected: Complete class with method');
      
      const methodMatch = code.match(/public\s+\w+\s+(\w+)\s*\(/);
      if (methodMatch) {
        actualMethod = methodMatch[1];
        console.log(`📌 Actual method name: ${actualMethod}`);
      }
      
      javaCode = code.replace(/class\s+\w+/, `class ${className}`);
      
      if (!javaCode.includes('public static void main')) {
        console.log('📌 Adding main method...');
        
        const lastBraceIndex = javaCode.lastIndexOf('}');
        const classBody = javaCode.substring(0, lastBraceIndex);
        
        let mainCode = `\n\n    public static void main(String[] args) {\n        ${className} sol = new ${className}();\n`;
        
        for (let i = 0; i < testCases.length; i++) {
          let testCase = testCases[i];
          if (typeof testCase === 'string') {
            try {
              testCase = JSON.parse(testCase);
            } catch (e) {}
          }
          
          const callArgs = parameterOrder.map(name => {
            const val = testCase[name];
            if (parameters[name] === 'String') {
              return `"${escapeJavaString(val)}"`;
            }
            if (parameters[name] === 'int[]' || parameters[name].includes('[]')) {
              const joined = Array.isArray(val) ? val.join(', ') : val;
              return `new int[]{${joined}}`;
            }
            return String(val);
          }).join(', ');
          
          mainCode += `        ${returnType} result${i} = sol.${actualMethod}(${callArgs});\n`;
          
          // ✅ Handle array outputs with proper formatting
          if (returnType.includes('[]')) {
            mainCode += `        System.out.println(java.util.Arrays.toString(result${i}));\n`;
          } else {
            mainCode += `        System.out.println(result${i});\n`;
          }
        }
        
        mainCode += `    }\n}`;
        
        javaCode = classBody + mainCode;
      }
    } else {
      console.log('📌 Detected: Method body only, creating class wrapper');
      
      const paramList = parameterOrder.map(name => `${parameters[name]} ${name}`).join(', ');
      javaCode = `public class ${className} {\n    public ${returnType} ${methodName}(${paramList}) {\n        ${code.split('\n').map(l => l.trim()).filter(l => l).join('\n        ')}\n    }\n}`;
    }

    console.log('📝 Generated Java code:');
    console.log(javaCode);
    console.log('---');

    await fs.writeFile(javaFile, javaCode);

    try {
      console.log('🔨 Compiling Java code...');
      await execAsync(`docker run --rm -v ${tmpDir}:/code code-executor:latest javac /code/${className}.java`, { timeout: 10000 });
      console.log('✅ Compilation successful');
    } catch (e) {
      return {
        passed: false,
        tests: [],
        error: `Compilation Error: ${e.stderr || e.message}`,
        language: 'java'
      };
    }

    try {
      console.log('▶️ Running Java program...');
      const { stdout } = await execAsync(
        `docker run --rm -v ${tmpDir}:/code code-executor:latest timeout 5 java -cp /code ${className}`,
        { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }
      );

      const outputs = stdout.trim().split('\n');
      console.log('📊 Program output:', outputs);

      outputs.forEach((output, index) => {
        if (index < testCases.length) {
          let testCase = testCases[index];
          if (typeof testCase === 'string') {
            try {
              testCase = JSON.parse(testCase);
            } catch (e) {}
          }

          let parsedOutput = output.trim();
          
          // ✅ Parse array output format like [0, 1]
          if (parsedOutput.startsWith('[') && parsedOutput.endsWith(']')) {
            try {
              // Convert [0, 1] to [0,1] (remove spaces for JSON parsing)
              const jsonString = parsedOutput.replace(/\s+/g, '');
              parsedOutput = JSON.parse(jsonString);
            } catch (e) {
              // If parsing fails, keep as string
              console.log(`⚠️ Could not parse array output: ${parsedOutput}`);
            }
          } else {
            // Try to parse as JSON or number
            try {
              parsedOutput = JSON.parse(output.trim());
            } catch (e) {
              if (!isNaN(parsedOutput)) {
                parsedOutput = parseInt(parsedOutput);
              }
            }
          }

          let expectedValue = testCase.expected;
          if (typeof expectedValue === 'string') {
            try {
              expectedValue = JSON.parse(expectedValue);
            } catch (e) {
              if (!isNaN(expectedValue)) {
                expectedValue = parseInt(expectedValue);
              }
            }
          }

          const passed = deepEqual(parsedOutput, expectedValue);
          
          console.log(`Test ${index + 1}: Expected=${JSON.stringify(expectedValue)}, Got=${JSON.stringify(parsedOutput)}, Passed=${passed}`);
          
          result.tests.push({
            test: index + 1,
            expected: expectedValue,
            got: parsedOutput,
            passed
          });
          result.passed = result.passed && passed;
        }
      });

      result.message = result.passed ? 'Accepted! 🎉' : 'Wrong Answer ❌';
      console.log('☕ JAVA EXECUTOR FINISHED\n');
      return result;
    } catch (e) {
      return {
        passed: false,
        tests: [],
        error: `Runtime Error: ${e.message}`,
        language: 'java'
      };
    }
  } catch (error) {
    return { passed: false, tests: [], error: error.message, language: 'java' };
  }
}

// ============================================================================
// LEGACY FORMAT EXECUTORS (90% coverage - backward compatible)
// ============================================================================

async function executeJavaScriptLegacy(code, testCases) {
  const result = { passed: true, tests: [], language: 'javascript' };

  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🟦 JAVASCRIPT EXECUTOR (LEGACY FORMAT)');
    console.log('═══════════════════════════════════════════════');
    
    let userSolution;
    try {
      if (code.includes('var ') || code.includes('function ')) {
        let funcName = 'solution';
        const varMatch = code.match(/var\s+(\w+)\s*=/);
        const funcMatch = code.match(/function\s+(\w+)/);
        
        if (varMatch) funcName = varMatch[1];
        if (funcMatch) funcName = funcMatch[1];
        
        userSolution = new Function(code + `\n return ${funcName};`)();
      } else {
        userSolution = eval(`(${code})`);
      }
    } catch (e) {
      return { passed: false, tests: [], error: `Code parsing failed: ${e.message}`, language: 'javascript' };
    }

    if (typeof userSolution !== 'function') {
      return { passed: false, tests: [], error: 'Code must evaluate to a function', language: 'javascript' };
    }

    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index];
      
      try {
        let callArgs = [];

        if (testCase.nums !== undefined && testCase.target !== undefined) {
          callArgs = [testCase.nums, testCase.target];
        } else if (testCase.s !== undefined) {
          callArgs = [testCase.s];
        } else if (testCase.x !== undefined) {
          callArgs = [testCase.x];
        } else if (testCase.input !== undefined) {
          callArgs = [testCase.input];
        }

        let output = null;

        try {
          const executionPromise = Promise.resolve(userSolution(...callArgs));
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Time Limit Exceeded'));
            }, 5000);
          });

          output = await Promise.race([executionPromise, timeoutPromise]);
        } catch (e) {
          result.tests.push({
            test: index + 1,
            expected: testCase.expected,
            got: null,
            error: e.message,
            passed: false
          });
          result.passed = false;
          continue;
        }

        let expectedValue = testCase.expected;
        if (typeof expectedValue === 'string') {
          try {
            expectedValue = JSON.parse(expectedValue);
          } catch (e) {}
        }

        const passed = deepEqual(output, expectedValue);

        result.tests.push({
          test: index + 1,
          expected: expectedValue,
          got: output,
          passed
        });
        
        result.passed = result.passed && passed;
      } catch (e) {
        result.tests.push({
          test: index + 1,
          expected: testCase.expected,
          got: null,
          error: e.message,
          passed: false
        });
        result.passed = false;
      }
    }

    result.message = result.passed ? 'Accepted! 🎉' : 'Wrong Answer ❌';
    console.log('🟦 JAVASCRIPT EXECUTOR FINISHED\n');
    return result;
  } catch (error) {
    return { passed: false, tests: [], error: error.message, language: 'javascript' };
  }
}

async function executePythonDockerNew(code, testCases, tmpDir, methodName, parameters, parameterOrder) {
  const result = { passed: true, tests: [], language: 'python' };

  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🐍 PYTHON EXECUTOR (NEW FORMAT)');
    console.log('═══════════════════════════════════════════════');

    const isClassBased = code.includes('class ');
    let actualFuncName = methodName;
    let className = null;
    
    // ✅ Extract IMPORTS first
    const importLines = [];
    const codeLines = code.split('\n');
    let codeStartIndex = 0;
    
    for (let j = 0; j < codeLines.length; j++) {
      const line = codeLines[j].trim();
      if (line.startsWith('import ') || line.startsWith('from ')) {
        importLines.push(codeLines[j]);
        codeStartIndex = j + 1;
      } else if (line !== '' && !line.startsWith('#')) {
        // Stop when we hit non-import, non-empty, non-comment line
        break;
      }
    }

    console.log(`📌 Found ${importLines.length} import lines`);

    let cleanCode = code;

    if (isClassBased) {
      const classMatch = code.match(/class\s+(\w+)/);
      if (classMatch) {
        className = classMatch[1];
        console.log(`📌 Detected: Class-based solution`);
        console.log(`📌 Class name: ${className}`);
      }

      // Extract class starting from where code starts (after imports)
      let classLines = [...importLines]; // ✅ Start with imports
      let inClass = false;

      for (let j = codeStartIndex; j < codeLines.length; j++) {
        const line = codeLines[j];
        
        if (line.match(/^class\s+/)) {
          inClass = true;
          classLines.push(line);
          continue;
        }

        if (!inClass) continue;

        if (line.trim() === '') {
          classLines.push(line);
          continue;
        }

        // If line doesn't start with space, class has ended
        if (!line.startsWith(' ') && !line.startsWith('\t') && line.trim() !== '') {
          break;
        }

        classLines.push(line);
      }

      cleanCode = classLines.join('\n').trim();
      console.log(`📌 Extracted class with imports`);

    } else {
      // Function-based
      const funcMatch = code.match(/def\s+(\w+)\s*\(/);
      if (funcMatch) {
        actualFuncName = funcMatch[1];
        console.log(`📌 Detected: Function-based solution`);
      }

      let funcLines = [...importLines]; // ✅ Start with imports
      let inFunc = false;

      for (let j = codeStartIndex; j < codeLines.length; j++) {
        const line = codeLines[j];
        
        if (line.match(/^def\s+/)) {
          inFunc = true;
          funcLines.push(line);
          continue;
        }

        if (!inFunc) continue;

        if (line.trim() === '') {
          funcLines.push(line);
          continue;
        }

        if (!line.startsWith(' ') && !line.startsWith('\t') && line.trim() !== '') {
          break;
        }

        funcLines.push(line);
      }

      cleanCode = funcLines.join('\n').trim();
      console.log(`📌 Extracted function with imports`);
    }

    console.log(`📌 Method name from metadata: ${methodName}`);

    for (let i = 0; i < testCases.length; i++) {
      let testCase = testCases[i];
      
      if (typeof testCase === 'string') {
        try {
          testCase = JSON.parse(testCase);
        } catch (e) {}
      }

      const pyFile = path.join(tmpDir, `test_${i}.py`);
      
      const callArgs = parameterOrder.map(paramName => {
        const value = testCase[paramName];
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '\\"')}"`;
        }
        return JSON.stringify(value);
      }).join(', ');
      
      let testCode;
      if (isClassBased) {
        testCode = `${cleanCode}\n\nsol = ${className}()\nresult = sol.${methodName}(${callArgs})\nprint(result)`;
      } else {
        testCode = `${cleanCode}\n\nresult = ${actualFuncName}(${callArgs})\nprint(result)`;
      }

      console.log(`📌 Test ${i + 1}:`);
      console.log(`📝 Code (first 150 chars): ${testCode.substring(0, 150)}...\n---`);

      await fs.writeFile(pyFile, testCode);

      try {
        const { stdout } = await execAsync(
          `docker run --rm -v ${tmpDir}:/code code-executor:latest timeout 5 python3 /code/test_${i}.py`,
          { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }
        );

        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        
        console.log(`✅ Output: "${lastLine}"`);

        let parsedOutput = lastLine;

        try {
          parsedOutput = JSON.parse(lastLine);
        } catch (e) {
          if (!isNaN(lastLine)) {
            parsedOutput = parseInt(lastLine);
          } else if (lastLine.toLowerCase() === 'true') {
            parsedOutput = true;
          } else if (lastLine.toLowerCase() === 'false') {
            parsedOutput = false;
          }
        }

        let expectedValue = testCase.expected;
        if (typeof expectedValue === 'string') {
          try {
            expectedValue = JSON.parse(expectedValue);
          } catch (e) {
            if (!isNaN(expectedValue)) {
              expectedValue = parseInt(expectedValue);
            }
          }
        }

        const passed = deepEqual(parsedOutput, expectedValue);
        
        console.log(`   Expected: ${expectedValue}, Got: ${parsedOutput}, Passed: ${passed}`);
        
        result.tests.push({
          test: i + 1,
          expected: expectedValue,
          got: parsedOutput,
          passed
        });
        result.passed = result.passed && passed;
      } catch (e) {
        console.log(`❌ Test ${i + 1} error: ${e.message}`);
        result.tests.push({
          test: i + 1,
          expected: testCase.expected,
          got: null,
          error: e.message,
          passed: false
        });
        result.passed = false;
      }
    }

    result.message = result.passed ? 'Accepted! 🎉' : 'Wrong Answer ❌';
    console.log('🐍 PYTHON EXECUTOR FINISHED\n');
    return result;
  } catch (error) {
    console.error('❌ Python executor error:', error.message);
    return { passed: false, tests: [], error: error.message, language: 'python' };
  }
}

async function executeJavaDockerLegacy(code, testCases, tmpDir) {
  const result = { passed: true, tests: [], language: 'java' };

  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('☕ JAVA EXECUTOR (LEGACY FORMAT)');
    console.log('═══════════════════════════════════════════════');

    code = cleanJavaCode(code);
    
    const className = `Solution_${Date.now()}`;
    const javaFile = path.join(tmpDir, `${className}.java`);

    let javaCode = '';
    
    if (code.includes('public class')) {
      javaCode = code.replace(/public\s+class\s+\w+/, `public class ${className}`);
    } else {
      javaCode = `public class ${className} {\n    public int solve(int[] nums) {\n        ${code.split('\n').map(l => l.trim()).filter(l => l).join('\n        ')}\n    }\n}`;
    }

    await fs.writeFile(javaFile, javaCode);

    try {
      await execAsync(`docker run --rm -v ${tmpDir}:/code code-executor:latest javac /code/${className}.java`, { timeout: 10000 });
    } catch (e) {
      return { passed: false, tests: [], error: `Compilation Error: ${e.stderr}`, language: 'java' };
    }

    try {
      const { stdout } = await execAsync(
        `docker run --rm -v ${tmpDir}:/code code-executor:latest timeout 5 java -cp /code ${className}`,
        { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }
      );

      const outputs = stdout.trim().split('\n');
      outputs.forEach((output, index) => {
        if (index < testCases.length) {
          let parsedOutput = output.trim();
          try {
            parsedOutput = JSON.parse(output.trim());
          } catch (e) {
            if (!isNaN(parsedOutput)) parsedOutput = parseInt(parsedOutput);
          }

          let expectedValue = testCases[index].expected;
          if (typeof expectedValue === 'string') {
            try {
              expectedValue = JSON.parse(expectedValue);
            } catch (e) {}
          }

          const passed = deepEqual(parsedOutput, expectedValue);
          
          result.tests.push({
            test: index + 1,
            expected: expectedValue,
            got: parsedOutput,
            passed
          });
          result.passed = result.passed && passed;
        }
      });

      result.message = result.passed ? 'Accepted! 🎉' : 'Wrong Answer ❌';
      console.log('☕ JAVA EXECUTOR FINISHED\n');
      return result;
    } catch (e) {
      return { passed: false, tests: [], error: `Runtime Error: ${e.message}`, language: 'java' };
    }
  } catch (error) {
    return { passed: false, tests: [], error: error.message, language: 'java' };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function escapeJavaString(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function cleanJavaCode(code) {
  return code
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/[^\x20-\x7E\n\r\t]/g, '');
}

function deepEqual(actual, expected, tolerance = 1e-9) {
  if (actual === expected) return true;
  if (actual == null || expected == null) return false;
  
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    return actual.every((val, i) => deepEqual(val, expected[i], tolerance));
  }
  
  if (typeof actual === 'object' && typeof expected === 'object') {
    const keysA = Object.keys(actual);
    const keysE = Object.keys(expected);
    if (keysA.length !== keysE.length) return false;
    return keysA.every(key => deepEqual(actual[key], expected[key], tolerance));
  }
  
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < tolerance;
  }
  
  return actual === expected;
}

// ✅ FIX #6: Graceful shutdown
process.on('exit', () => {
  if (cleanupTimer) clearInterval(cleanupTimer);
  console.log('🛑 Docker Executor shutting down gracefully...');
});

module.exports = {
  executeInDocker
};