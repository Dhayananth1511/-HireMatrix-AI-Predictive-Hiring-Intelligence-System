// Step 4: Compose Executive Summary Email Body (strictly from predictiveJSON, enterprise template)
;(async function () {
  const predictiveJSON = getContext("predictiveJSON")
  const enterpriseModules = getContext("enterpriseModules")
  const moduleDescriptions = getContext("moduleDescriptions")
  const parsedInputs = getContext("parsedInputs")
  if (!predictiveJSON || !enterpriseModules || !parsedInputs || !moduleDescriptions) throw new Error("Context missing.")

  // Helper for table row rendering
  function tableRow(label, value) {
    return `<tr><td style='padding:2px 10px;'><b>${label}:</b></td><td style='padding:2px 10px;'>${value}</td></tr>`
  }

  // Unified Key Metrics Table
  function renderKeyMetrics(metrics) {
    return `<table border='0' cellpadding='2' cellspacing='0' style='margin-bottom:10px;'>` + tableRow("Skill Match", `${metrics.skillMatchPercentage ?? "-"}%`) + tableRow("Hiring Index", `${metrics.hiringIndex?.score ?? "-"} (${metrics.hiringIndex?.category ?? "-"})`) + tableRow("Benchmark Percentile", metrics.benchmarkPercentile ?? "-") + tableRow("AI Confidence", metrics.aiConfidenceIndex ?? "-") + `</table>`
  }

  // Risk Assessment Table
  function renderRiskTable(j) {
    return `<table border='1' cellpadding='4' cellspacing='0' style='border-collapse:collapse; margin-bottom:10px;'><tr><th>Risk Type</th><th>Assessment</th></tr>` + `<tr><td>Overall Risk</td><td>${j.riskLevel} (${j.riskColor})</td></tr>` + `<tr><td>Technical Risk</td><td>${j.technicalRisk || "-"}</td></tr>` + `<tr><td>Experience Risk</td><td>${j.experienceRisk || "-"}</td></tr>` + `<tr><td>Communication Risk</td><td>${j.communicationRisk || "-"}</td></tr>` + `</table>`
  }

  // Radar Scores Table
  function renderRadarScores(radar) {
    if (!radar) return "-"
    let keys = Object.keys(radar)
    return `<table border='1' cellpadding='4' cellspacing='0' style='border-collapse:collapse; margin-bottom:10px;'><tr>${keys.map(k => `<th>${k}</th>`).join("")}</tr>` + `<tr>${keys.map(k => `<td>${radar[k]}</td>`).join("")}</tr></table>`
  }

  // Success Probability Table
  function renderSuccessProb(s) {
    if (!s) return "-"
    const rounds = ["Screening", "Technical", "Managerial", "HR", "Overall Selection"]
    const keys = ["screeningRound", "technicalRound", "managerialRound", "hrRound", "overallSelection"]
    return `<table border='1' cellpadding='4' cellspacing='0' style='border-collapse:collapse; margin-bottom:10px;'><tr>${rounds.map(r => `<th>${r}</th>`).join("")}</tr>` + `<tr>${keys.map(k => `<td>${s[k] ?? "-"}</td>`).join("")}</tr></table>`
  }

  // Bullet list
  function bulletSection(title, arr) {
    if (!arr || !arr.length) return ""
    return `<b>${title}:</b><ul style='margin:0 0 10px 18px;padding:0;'>` + arr.map(x => `<li>${x}</li>`).join("") + `</ul>`
  }

  // Compose according to user structure
  const emailBody = `
AI Career Twin – Predictive Hiring Intelligence Report<br><br>
<b>Executive Summary</b><br>-----------------<br>${predictiveJSON.executiveSummary || "Data not publicly available."}<br><br>
<b>Key Metrics</b><br>-------------<br>${renderKeyMetrics(predictiveJSON)}<br>
<b>Risk Assessment</b><br>-----------------<br>${renderRiskTable(predictiveJSON)}<br>
<b>Radar Scores</b><br>--------------<br>${renderRadarScores(predictiveJSON.radarScores)}<br>
<b>Success Probability</b><br>---------------------<br>${renderSuccessProb(predictiveJSON.successProbability)}<br>
${bulletSection("Top Strengths", predictiveJSON.topStrengths)}
${bulletSection("Top Development Areas", predictiveJSON.topDevelopmentAreas)}
<b>Final Recommendation:</b> <span style='font-size:1.08em;'>${predictiveJSON.finalRecommendation || predictiveJSON.hiringIndex?.category || "-"}</span><br><br>
Thank you.<br><br>This is an automated evaluation from AI Career Twin.`

  // Email body preview logging removed for privacy
  setContext("emailBody", emailBody)
  setContext("emailRecipient", parsedInputs.recipientEmail)
})()
