// Step: Parse and Validate Input
// Purpose: Consolidate and validate required environment variables as a single context object

function validateEnvVar(key) {
  const value = process.env[key]
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

try {
  const parsedInputs = {
    resume: validateEnvVar("resume"),
    jobDescription: validateEnvVar("jobDescription"),
    candidateRole: validateEnvVar("candidateRole"),
    companyType: validateEnvVar("companyType"),
    interviewAnswers: validateEnvVar("interviewAnswers"),
    linkedinProfile: validateEnvVar("linkedinProfile"),
    githubProfile: validateEnvVar("githubProfile"),
    leetcodeProfile: validateEnvVar("leetcodeProfile"),
    recipientEmail: validateEnvVar("recipientEmail"),
    mode: validateEnvVar("mode"),
    geminiModel: validateEnvVar("geminiModel")
  }

  setContext("parsedInputs", parsedInputs)

  // Concise validation status logs
  console.log("✔ Input validation completed")
  console.log(`✔ Mode: ${parsedInputs.mode}`)
  console.log("✔ Required files detected")
} catch (e) {
  console.error("Input validation failed:", e.message)
  process.exit(1)
}
