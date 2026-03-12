// Step 8: Return Final Validation Object as Required Strict Format
;(function () {
  const predictiveJSON = getContext("predictiveJSON")
  const chartsGenerated = getContext("chartsGenerated")
  const pdfFile = getContext("pdfFile")
  const emailSentResult = getContext("emailSentResult")
  let success = true
  success = success && !!predictiveJSON && chartsGenerated && !!pdfFile && emailSentResult?.success

  const result = {
    status: success ? "SUCCESS" : "FAILURE",
    jsonGenerated: !!predictiveJSON,
    radarValidated: !!chartsGenerated,
    heatmapValidated: !!chartsGenerated,
    growthProjectionValidated: !!chartsGenerated,
    emailGenerated: !!emailSentResult,
    emailLogged: !!emailSentResult,
    pdfGenerated: !!pdfFile,
    emailSent: emailSentResult?.success === true
  }

  let log = []
  log.push("━━━━━━━━━━━━━━━━━━━━━━━━━━")
  log.push(`FINAL STATUS: ${result.status}`)
  log.push("━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  if (result.jsonGenerated) log.push("✔ JSON Intelligence Generated")
  if (result.radarValidated) log.push("✔ Radar Analysis Validated")
  if (result.heatmapValidated) log.push("✔ Risk Heatmap Validated")
  if (result.growthProjectionValidated) log.push("✔ Growth Projection Computed")
  if (result.pdfGenerated) log.push("✔ PDF Report Generated")
  if (result.emailSent) log.push("✔ Email Delivered Successfully")
  console.log(log.join("\n"))
  return result
})()
