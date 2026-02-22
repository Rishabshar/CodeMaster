// Backend/routes/submissions.js - Fixed with Dynamic Test Cases

const express = require("express");
const submissionQueries = require("../queries/submissionQueries");
const userQueries = require("../queries/userQueries");
const { executeInDocker } = require("../utils/dockerExecutor");
const pool = require("../config/database");
const router = express.Router();

router.post("/api/submissions", async (req, res) => {
  try {
    console.log("🔍 RAW REQUEST BODY:", JSON.stringify(req.body, null, 2));

    const { code, language, problem_id, user_id } = req.body;

    console.log("📋 EXTRACTED VALUES:");
    console.log("  - code type:", typeof code);
    console.log("  - code length:", code?.length);
    console.log("  - code first 100 chars:", code?.substring(0, 100));
    console.log("  - language:", language);
    console.log("  - problem_id:", problem_id);
    console.log("  - user_id:", user_id);

    // ✅ Validate all fields
    if (!code) return res.status(400).json({ error: "Code is required" });
    if (!language)
      return res.status(400).json({ error: "Language is required" });
    if (!problem_id)
      return res.status(400).json({ error: "Problem ID is required" });
    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    console.log("✅ Valid submission, processing...");

    // ✅ Fetch problem from database to get test cases
    console.log("🔄 Fetching problem details...");
    const problemResult = await pool.query(
      "SELECT * FROM problems WHERE id = $1",
      [problem_id],
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const problem = problemResult.rows[0];
    console.log("✅ Problem found:", problem.title);

    // ✅ Parse test cases from database
    let testCases = [];
    try {
      if (problem.test_cases) {
        if (typeof problem.test_cases === "string") {
          testCases = JSON.parse(problem.test_cases);
        } else {
          testCases = problem.test_cases;
        }
      }
    } catch (e) {
      console.error("Error parsing test cases:", e);
      testCases = [];
    }

    console.log("✅ Test cases loaded:", testCases.length, "cases");

    // Create submission in database
    const submissionId = await submissionQueries.createSubmission(
      user_id,
      problem_id,
      code,
      language,
    );

    console.log("✅ Submission created with ID:", submissionId);

    // ✅ Execute code in Docker with DYNAMIC test cases

    const problemMetadata = {
      methodName: problem.method_name,
      returnType: problem.return_type,
      parameters: problem.parameters,
      parameterOrder: problem.parameter_order,
    };

    console.log("📍 Problem metadata:", JSON.stringify(problemMetadata));

    console.log("🔄 Executing", language, "code in Docker...");
    const result = await executeInDocker(
      code,
      language,
      testCases,
      problem.title,
      problemMetadata,
    );
    console.log("✅ Execution result:", result);

    // Update submission with result
    const passed = result.passed;
    await submissionQueries.updateSubmissionResult(
      submissionId,
      passed ? "Accepted" : result.error ? "Error" : "Wrong Answer",
      result.runtime || 0,
      result.memory || 0,
      JSON.stringify(result.tests),
      result.error || null,
    );

    console.log("✅ Submission updated");

    // Update user stats if passed
    if (passed) {
      await userQueries.updateUserStats(user_id, problem_id, true);
      console.log("✅ User stats updated");
    }

    res.json({
      submission_id: submissionId,
      problem_title: problem.title,
      ...result,
    });
  } catch (error) {
    console.error("❌ Error in submission:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
