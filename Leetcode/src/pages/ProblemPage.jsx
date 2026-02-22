import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import CodeEditor from '../components/CodeEditor';

// ✅ API Base URL from environment
const API_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL ||
  typeof import.meta !== 'undefined' && import.meta.env?.REACT_APP_API_BASE_URL ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ||
  'http://localhost:5000'
);

console.log('API Base URL:', API_BASE_URL);

// ✅ CLEAN CODE FUNCTION - Remove special characters
function cleanCode(code) {
  if (!code) return '';
  return code
    // Replace smart quotes with regular quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Replace em-dashes and en-dashes with regular hyphen
    .replace(/[–—]/g, '-')
    // Replace special spaces with regular space
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Remove any remaining non-ASCII characters except common ones
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    .trim();
}

const ProblemPage = () => {
  const { problemId } = useParams();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [problem, setProblem] = useState(null);
  const [dbUserId, setDbUserId] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // ✅ FIXED: Separate effect for problem fetch
  useEffect(() => {
    if (problemId) {
      setProblemLoading(true);
      setErrorMessage(null);
      
      fetch(`${API_BASE_URL}/api/problems/${problemId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load problem: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // ✅ FIXED: Validate problem data
          if (!data || !data.id || !data.title) {
            throw new Error('Invalid problem data received from server');
          }
          
          // Ensure numeric ID
          data.id = parseInt(data.id);
          if (isNaN(data.id)) {
            throw new Error('Invalid problem ID');
          }
          
          setProblem(data);
        })
        .catch(error => {
          console.error('❌ Error fetching problem:', error);
          setErrorMessage(error.message || 'Failed to load problem');
          setProblem(null);
        })
        .finally(() => setProblemLoading(false));
    }
  }, [problemId]);

  // ✅ FIXED: Separate effect for user sync
  useEffect(() => {
    if (isLoaded && user) {
      setUserLoading(true);
      
      (async () => {
        try {
          // ✅ FIXED: Removed JWT template - just use getToken()
          let token = null;
          try {
            token = await getToken();  // ✅ FIXED: Removed { template: 'integration_clerk' }
          } catch (e) {
            console.warn('Could not get token:', e);
          }
          
          // ✅ FIXED: Validate email exists
          const email = user.emailAddresses?.[0]?.emailAddress;
          if (!email) {
            throw new Error('Your Clerk account has no email address');
          }

          const userRes = await fetch(`${API_BASE_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
              clerkId: user.id,
              email: email,
              username: user.username || `user_${user.id.substring(0, 8)}`,
              fullName: user.fullName || 'User'
            })
          });

          if (!userRes.ok) {
            const errorData = await userRes.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to sync user: ${userRes.status}`);
          }
          
          const userData = await userRes.json();
          
          if (!userData.id) {
            throw new Error('Invalid user data received from server');
          }
          
          console.log('✅ User synced - DB ID:', userData.id);
          setDbUserId(userData.id);
        } catch (error) {
          console.error('❌ Error syncing user:', error);
          setErrorMessage(error.message || 'Failed to sync user');
          setDbUserId(null);
        } finally {
          setUserLoading(false);
        }
      })();
    }
  }, [isLoaded, user, getToken]);

  // Submit solution
  const submitSolution = async () => {
    // ✅ FIXED: Better validation
    if (!user) {
      setErrorMessage('Please log in first');
      return;
    }
    
    if (!problem) {
      setErrorMessage('Problem is not loaded');
      return;
    }
    
    if (!dbUserId) {
      setErrorMessage('User profile is not loaded');
      return;
    }

    setSubmitting(true);
    setSubmission(null);
    setErrorMessage(null);
    
    try {
      // ✅ CLEAN CODE BEFORE SUBMISSION
      const cleanedCode = cleanCode(code);
      
      if (!cleanedCode) {
        throw new Error('Code cannot be empty');
      }

      if (cleanedCode.length > 50000) {
        throw new Error('Code is too long (max 50,000 characters)');
      }

      // ✅ FIXED: Removed JWT template - just use getToken()
      let token = null;
      try {
        token = await getToken();  // ✅ FIXED: Removed { template: 'integration_clerk' }
      } catch (e) {
        console.warn('Could not get token for submission:', e);
      }

      const payload = {
        problem_id: parseInt(problem.id),
        language,
        code: cleanedCode,  // ✅ SEND CLEANED CODE
        user_id: parseInt(dbUserId)
      };

      // Validate payload
      if (isNaN(payload.problem_id) || isNaN(payload.user_id)) {
        throw new Error('Invalid problem or user ID');
      }

      console.log('✅ Submitting with payload:', {
        ...payload,
        code: `${cleanedCode.substring(0, 50)}... (${cleanedCode.length} chars)`
      });

      const res = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      // ✅ FIXED: Always check response status
      if (!res.ok) {
        let errorMsg;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || `Server error: ${res.status}`;
        } catch {
          errorMsg = `Server error: ${res.status}`;
        }
        throw new Error(errorMsg);
      }

      const result = await res.json();
      console.log('✅ Submission result:', result);
      setSubmission(result);
    } catch (error) {
      console.error('❌ Submission error:', error);
      setErrorMessage(error.message || 'Submission failed');
      setSubmission({ error: error.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  const isLoading = problemLoading || userLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
          <div className="text-2xl font-semibold text-gray-600">
            {problemLoading && userLoading ? 'Loading...' : 
             problemLoading ? 'Loading problem...' : 
             'Loading your profile...'}
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600 mb-2">Problem not found</div>
          {errorMessage && <p className="text-gray-600">{errorMessage}</p>}
        </div>
      </div>
    );
  }

  // Parse examples
  let examples = [];
  try {
    if (problem.examples) {
      if (typeof problem.examples === 'string') {
        examples = JSON.parse(problem.examples);
      } else if (Array.isArray(problem.examples)) {
        examples = problem.examples;
      }
    }
  } catch (e) {
    console.warn('Could not parse examples:', e);
    examples = [];
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8">
        
        {/* Problem Statement */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              #{problem.id} {problem.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty || 'Medium'}
            </span>
          </div>

          {problem.category && (
            <p className="text-gray-500 mb-4">Category: {problem.category}</p>
          )}

          <div className="prose max-w-none text-gray-700 mb-6">
            <p>{problem.description}</p>
          </div>

          {/* Examples */}
          {examples.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Examples:</h3>
              {examples.map((example, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg mb-3">
                  <p className="text-sm mb-2">
                    <strong>Input:</strong> {JSON.stringify(example.input || example.in || '')}
                  </p>
                  <p className="text-sm">
                    <strong>Output:</strong> {JSON.stringify(example.output || example.out || '')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Constraints:</h3>
              <p className="text-gray-700 text-sm">{problem.constraints}</p>
            </div>
          )}
        </div>

        {/* Code Editor + Submit */}
        <div className="space-y-4">
          {/* Error message display */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* ✅ FIXED: Only supported languages */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-48 bg-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <CodeEditor 
            code={code} 
            onChange={setCode} 
            language={language}
            height="400px"
          />

          {/* Code length display */}
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            Code length: {code.length} characters {code.length > 50000 && <span className="text-red-600">(exceeds limit)</span>}
          </div>
          
          {/* Submit button */}
          <button 
            onClick={submitSolution}
            disabled={submitting || !dbUserId || problemLoading || code.length === 0 || code.length > 50000}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            title={!dbUserId ? 'Loading user profile...' : code.length === 0 ? 'Please write some code' : code.length > 50000 ? 'Code too long' : ''}
          >
            {submitting ? 'Running...' : !dbUserId ? 'Loading...' : 'Run Code'}
          </button>

          {/* Submission result */}
          {submission && (
            <div className={`p-4 rounded-xl border ${
              submission.error ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
            }`}>
              {submission.error ? (
                <p className="text-red-600 font-semibold">❌ Error: {submission.error}</p>
              ) : (
                <>
                  <p className="font-semibold text-lg mb-2">{submission.message}</p>
                  
                  {/* Test results */}
                  {submission.tests && submission.tests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">
                        {submission.tests.filter(t => t.passed).length} / {submission.tests.length} tests passed
                      </p>
                      <div className="max-h-64 overflow-auto">
                        <pre className="text-sm bg-gray-50 p-3 rounded">
                          {JSON.stringify(submission.tests, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;