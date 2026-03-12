// Step 3: Generate the List of 20 Enterprise Modules with Descriptions (candidate/recruiter mode)
;(function () {
  const parsedInputs = getContext("parsedInputs")
  const predictiveJSON = getContext("predictiveJSON")
  if (!parsedInputs || !predictiveJSON) throw new Error("Required context not found")
  const mode = parsedInputs.mode

  // All 20 Modules with Example Descriptions
  const allModules = [
    { name: "Resume Intelligence Engine", description: "Evaluates the quality and relevance of the candidate's resume against the job role." },
    { name: "Skill Match Analyzer", description: "Analyzes candidate skills versus role requirements for optimal fit assessment." },
    { name: "Interview Simulator", description: "Simulates interview scenarios to gauge candidate real-time responses." },
    { name: "Answer Evaluator", description: "Rates the depth, accuracy, and relevance of candidate answers." },
    { name: "Success Probability Predictor", description: "Calculates predicted success probability across different interview stages." },
    { name: "Risk Analyzer", description: "Identifies potential red flags and risk factors in candidate profile." },
    { name: "Skill Gap Roadmap", description: "Provides a roadmap of skill areas to improve based on the evaluation." },
    { name: "Career DNA Mapper", description: "Maps unique career traits for personalized development planning." },
    { name: "Rejection Recovery Plan", description: "Personalized plan to address weaknesses and recover from rejections." },
    { name: "Executive Summary", description: "Summarizes the overall AI-driven career assessment results." },
    { name: "Radar Dashboard", description: "Visualizes candidate competency, strengths, and development areas." },
    { name: "Risk Heatmap Analysis", description: "Provides a visual heatmap of candidate risk areas by interview stages." },
    { name: "Benchmark Percentile Engine", description: "Shows where the candidate’s abilities rank versus industry benchmarks." },
    { name: "Hiring Index Engine", description: "Generates a comprehensive hiring index score for candidate suitability." },
    { name: "6-Month Growth Model", description: "Forecasts candidate growth potential over a 6-month period." },
    { name: "Recruiter Decision Dashboard", description: "Centralizes recruiter insights and key recommendations." },
    { name: "AI Confidence Score", description: "Indicates AI confidence in the overall assessment result." },
    { name: "Role Benchmark Comparison", description: "Compares candidate profile with ideal role benchmarks." },
    { name: "Candidate Potential Index", description: "Estimates overall candidate potential and upward mobility." },
    { name: "End-to-End Execution Log", description: "Provides a transparent log of all assessment steps taken." }
  ]

  let displayModules = allModules
  if (mode === "recruiter") {
    // Hide Rejection Recovery Plan, emphasize hiring index, include salary/training
    displayModules = allModules.filter(m => m.name !== "Rejection Recovery Plan")
    displayModules.push({ name: "Salary Suitability Analysis", description: "Assesses salary expectations and alignment with company benchmarks." })
    displayModules.push({ name: "Training Timeline Suggestion", description: "Suggests personalized training timelines for candidate onboarding." })
  } else if (mode === "candidate") {
    displayModules = allModules
  }

  setContext(
    "enterpriseModules",
    displayModules.map(m => m.name)
  )
  setContext("moduleDescriptions", displayModules)
  console.log("Enterprise modules with descriptions (mode: " + mode + ") generated.")
})()
