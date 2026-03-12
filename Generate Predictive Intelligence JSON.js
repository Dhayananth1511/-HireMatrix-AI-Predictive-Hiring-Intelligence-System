// Step 2: Generate Predictive Intelligence JSON with extended schema (strengths, areas, full risk)
const { GoogleGenAI } = require("@google/genai")

;(async () => {
  const parsedInputs = getContext("parsedInputs")
  if (!parsedInputs) throw new Error("Parsed inputs missing in context.")

  // Expanded enterprise schema (request strict bullets/risks)
  const strictSchema = `{
    "executiveSummary": "",
    "radarScores": { "Technical": 0, "ProblemSolving": 0, "Communication": 0, "Leadership": 0, "LearningAgility": 0 },
    "skillMatchPercentage": 0,
    "successProbability": { "screeningRound": 0, "technicalRound": 0, "managerialRound": 0, "hrRound": 0, "overallSelection": 0 },
    "riskLevel": "",
    "riskColor": "",
    "riskHeatmap": { "TechnicalRisk": 0, "ExperienceRisk": 0, "CommunicationRisk": 0, "ExecutionRisk": 0, "CulturalRisk": 0 },
    "technicalRisk": "",
    "experienceRisk": "",
    "communicationRisk": "",
    "riskHeatmapExplanation": "",
    "radarInterpretation": "",
    "benchmarkPercentile": 0,
    "hiringIndex": { "score": 0, "category": "" },
    "potentialIndex": 0,
    "growthProjection": { "Technical6Months": 0, "DSA6Months": 0, "SystemDesign6Months": 0, "OverallSelection6Months": 0 },
    "roleBenchmarkComparison": { "idealTechnicalScore": 0, "candidateTechnicalScore": 0, "gap": 0 },
    "aiConfidenceIndex": 0,
    "topStrengths": ["", "", ""],
    "topDevelopmentAreas": ["", "", ""],
    "candidateHiringSummary": "",
    "finalRecommendation": "",
    "recruiterRecommendation": ""
  }`

  const geminiKey = process.env.GEMINI_API_KEY
  const geminiModelEnv = process.env.GEMINI_MODEL
  let finalJson = null
  let responseRaw = ""
  let tried = 0
  let modelVendor = null
  let geminiModel = geminiModelEnv || null

  function extractFirstJson(str) {
    const first = str.indexOf("{")
    if (first === -1) return null
    let open = 1,
      i = first + 1
    for (; i < str.length; i++) {
      if (str[i] === "{") open++
      if (str[i] === "}") open--
      if (open === 0) {
        try {
          return str.substring(first, i + 1)
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  async function listGeminiModels(ai) {
    try {
      if (typeof ai.models.list === "function") {
        const result = await ai.models.list()
        return result.filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  }

  async function callGeminiApi(inputText, dynamicModel) {
    const ai = new GoogleGenAI({ apiKey: geminiKey })
    let modelToUse = dynamicModel
    let availableModels = null
    if (!modelToUse) {
      const models = await listGeminiModels(ai)
      if (models && models.length > 0) {
        modelToUse = models[0].name
        geminiModel = modelToUse
        availableModels = models.map(m => m.name)
        console.log(`Using dynamically discovered Gemini model: ${modelToUse}`)
      } else {
        const candidates = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro", "gemini-pro-vision"]
        modelToUse = candidates[0]
        geminiModel = modelToUse
        availableModels = candidates
        console.log(`Falling back to default Gemini model: ${modelToUse}`)
      }
    }
    try {
      // Strictly request bullets & risks
      const prompt = `You are Gemini Enterprise AI Career Twin. OUTPUT STRICT JSON ONLY as per provided schema (including: executiveSummary, skillMatchPercentage, hiringIndex, riskLevel, riskColor, riskHeatmap, technicalRisk, experienceRisk, communicationRisk, riskHeatmapExplanation, radarScores, radarInterpretation, benchmarkPercentile, successProbability, candidateHiringSummary, recruiterRecommendation, growthProjection, roleBenchmarkComparison, aiConfidenceIndex, topStrengths, topDevelopmentAreas, finalRecommendation). DO NOT respond with any explanation, markdown, or filler, ONLY JSON complying strictly with SCHEMA fields (if unavailable, use \"Data not publicly available.\"). All bullets should be concise. For risks, fill technicalRisk, experienceRisk, and communicationRisk as short explanations for each dimension. Output must start with '{' and end with '}'. --- SCHEMA: ${strictSchema} --- INPUT: Resume: ${parsedInputs.resume}\nJob Description: ${parsedInputs.jobDescription}\nCandidate Role: ${parsedInputs.candidateRole}\nCompany Type: ${parsedInputs.companyType}\nInterview Answers: ${parsedInputs.interviewAnswers}\nLinkedIn: ${parsedInputs.linkedinProfile}\nGitHub: ${parsedInputs.githubProfile}\nLeetCode: ${parsedInputs.leetcodeProfile}\nMode: ${parsedInputs.mode}`
      const result = await ai.models.generateContent({ model: modelToUse, contents: prompt })
      return { text: result.text, availableModels }
    } catch (err) {
      if (err && err.error && err.error.code === 404) {
        throw new Error(`Gemini model '${modelToUse}' not found or not accessible. See: https://ai.google.dev/api/models. Full error: ${JSON.stringify(err)}`)
      }
      throw err
    }
  }

  async function callOpenAI() {
    const messages = [
      {
        role: "system",
        content: `You are Gemini 3.0 Pro operating as an Enterprise AI Career Twin – Predictive Interview Intelligence Engine.\nCRITICAL OUTPUT RULES (READ CAREFULLY):\n1. You must respond ONLY with a valid JSON object MATCHING the example schema provided below.\n2. DO NOT include explanations, commentary, or markdown formatting.\n3. Output MUST start with '{' and end with '}'.\n4. No filler, no extraneous text, no preamble or conclusions.---\nEXACT SCHEMA TEMPLATE (return with real values):\n${strictSchema}\n---\nSTRICTLY FOLLOW THE SCHEMA.\nRisk Mapping: Low → Green, Moderate → Orange, High → Red. Hiring Index: 80–100=Strong Hire, 60–79=Conditional Hire, 40–59=Risky Hire, <40=Do Not Hire. For explanations and recommendations, always provide concise, actionable text. For bullets, fill topStrengths and topDevelopmentAreas as 3 concise points each. Also ensure technicalRisk, experienceRisk, and communicationRisk are filled as short explanations. If data is unavailable, use "Data not publicly available." for the field.`
      },
      { role: "user", content: `INPUT DATA\n==================\nResume:\n${parsedInputs.resume}\nJob Description:\n${parsedInputs.jobDescription}\nCandidate Role:\n${parsedInputs.candidateRole}\nCompany Type:\n${parsedInputs.companyType}\nInterview Answers:\n${parsedInputs.interviewAnswers}\nLinkedIn:\n${parsedInputs.linkedinProfile}\nGitHub:\n${parsedInputs.githubProfile}\nLeetCode:\n${parsedInputs.leetcodeProfile}\nMode:\n${parsedInputs.mode}` }
    ]
    const response = await TurboticOpenAI(messages, { model: "gpt-4.1", temperature: 0, max_tokens: 1850 })
    return response.content
  }

  function userNextStepError(details, availableModels) {
    let msg = `[ERROR]: Failed to generate predictive intelligence using Gemini and OpenAI.`
    msg += `\n\n== Gemini step failed: ==\n${details.gemini || "(unknown)"}`
    msg += `\n\n== OpenAI step failed: ==\n${details.openai || "(unknown)"}`
    msg += `\n\nACTIONABLE NEXT STEPS:`
    msg += `\n- For Gemini: Check which models your Google Cloud project/API key can access at https://ai.google.dev/api/models. If not, use another model. Available: ${Array.isArray(availableModels) ? availableModels.join(", ") : "see docs"}`
    msg += `\n- For OpenAI: Confirm OpenAI key is valid (gpt-4.1). For help, contact support.`
    return msg
  }

  let availableGeminiModels = null,
    geminiError = null,
    openaiError = null
  try {
    if (geminiKey) {
      modelVendor = "Gemini"
      let geminiResult
      try {
        geminiResult = await callGeminiApi(strictSchema, geminiModel)
        responseRaw = geminiResult.text
        availableGeminiModels = geminiResult.availableModels
        let candidate = extractFirstJson(responseRaw)
        if (!candidate) {
          console.error("Could not find a JSON block in Gemini response. Full response:", responseRaw)
          candidate = responseRaw
        }
        finalJson = JSON.parse(candidate)
        setContext("predictiveJSON", finalJson)
        setContext("predictiveInputs", parsedInputs)
        console.log(`Predictive intelligence JSON generated via Gemini (model: ${geminiModel}) in one call.`)
        return
      } catch (err) {
        geminiError = err && err.message ? err.message : err
        console.error(`[Gemini error]: ${geminiError}`)
        console.error("Gemini model failures: next trying OpenAI...")
      }
    }
    modelVendor = "OpenAI"
    try {
      responseRaw = await callOpenAI()
      let candidate = extractFirstJson(responseRaw)
      if (!candidate) {
        console.error("Could not find a JSON block in OpenAI response. Full response:", responseRaw)
        candidate = responseRaw
      }
      finalJson = JSON.parse(candidate)
      setContext("predictiveJSON", finalJson)
      setContext("predictiveInputs", parsedInputs)
      console.log("Predictive intelligence JSON generated via OpenAI in one call.")
      return
    } catch (err) {
      openaiError = err && err.message ? err.message : err
      console.error(`[OpenAI error]: ${openaiError}`)
    }
    let errorMessage = userNextStepError({ gemini: geminiError, openai: openaiError }, availableGeminiModels)
    console.error(errorMessage)
    throw new Error(errorMessage)
  } catch (e) {
    let message = typeof e === "string" ? e : e && e.message ? e.message : JSON.stringify(e)
    console.error(`Unhandled error in predictive JSON generation: ${message}`)
    throw new Error(message)
  }
})()
