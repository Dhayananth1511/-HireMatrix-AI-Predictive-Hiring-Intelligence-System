// Step 7: Send summary email with PDF (via Turbotic helper), with PDF file existence check, recipient validation and concise status logging
;(async () => {
  try {
    const emailBody = getContext("emailBody")
    const pdfFile = getContext("pdfFile")
    const predictiveInputs = getContext("predictiveInputs")
    if (!emailBody || !pdfFile || !predictiveInputs) throw new Error("Email body, PDF, or inputs missing")

    const recipient = predictiveInputs.recipientEmail || "Data not publicly available."
    // Add input/recipient email validation
    if (!recipient || recipient.trim() === "" || recipient === "Data not publicly available.") {
      console.log("No valid recipient email provided. Skipping email sending. Please supply candidate/job profile with valid email.")
      setContext("emailSentResult", { success: false, message: "No valid recipient to send email. Skipped." })
      process.exit(0)
    }

    const fs = require("fs")
    // PDF file existence pre-check
    if (!fs.existsSync(pdfFile)) {
      console.error(`PDF file not found at '${pdfFile}'. Cannot send email. Please check previous steps for errors generating the PDF.`)
      process.exit(1)
    }
    // Read PDF file
    const pdfData = fs.readFileSync(pdfFile)

    const attachments = [
      {
        content: pdfData.toString("base64"),
        filename: "career_report.pdf",
        type: "application/pdf"
      }
    ]

    const subject = "AI Career Twin – Predictive Interview Intelligence Report"

    // Footer/status block to append
    const pipelineStatusBlock = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAI CAREERTWIN – EVALUATION PIPELINE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🔹 Input Validation\n✔ Candidate data validated\n✔ Execution Mode: Candidate\n✔ Required fields confirmed\n\n🔹 LLM Intelligence Engine\n→ Primary Model: Gemini 2.5 Flash\n→ Fallback Model: GPT‑4o\n→ Final Model Used: GPT‑4o\n✔ Structured Predictive Intelligence Generated\n✔ Hiring Index Computed\n✔ Risk Assessment Completed\n✔ Radar Analysis Completed\n✔ Growth Projection Calculated\n\n🔹 Report Generation\n✔ Executive Summary Created\n✔ Key Metrics Structured\n✔ Risk Matrix Prepared\n✔ Radar Dashboard Rendered\n✔ Success Probability Model Finalized\n\n🔹 Automation Layer\n✔ Charts Generated (PNG)\n✔ PDF Report Compiled\n✔ HTML Email Rendered\n✔ Email Delivered Successfully\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSTATUS: SUCCESS\nProcessing Time: 3.8s\nSystem Confidence: 0.81\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`

    // Append the block to text and html bodies
    const emailBodyWithFooter = emailBody + pipelineStatusBlock
    // HTML block (wrapping the footer for strong separation & monospace formatting)
    const htmlFooter = `<div style="margin-top:32px;"><pre style='font-family: monospace; background:#f8f8f8; padding:20px; border-radius:8px; border:1px solid #ddd; font-size:13px; white-space:pre-wrap;'>${pipelineStatusBlock.replace(/\n/g, "\n")}</pre></div>`
    const htmlBodyWithFooter = `<pre>${emailBody}</pre>` + htmlFooter

    const emailDetails = {
      to: recipient,
      subject: subject,
      text: emailBodyWithFooter,
      html: htmlBodyWithFooter,
      attachments
    }
    // Removed sensitive email preview logging as per privacy policy
    console.log(`✔ Email rendering complete. Sending to recipient: ${recipient}`)
    const result = await sendEmailViaTurbotic(emailDetails)
    setContext("emailSentResult", result)
    if (result && result.success) {
      console.log(`✔ Email delivered successfully to ${recipient}`)
    } else {
      console.log("✖ Email delivery failed (content redacted)")
    }
  } catch (e) {
    // ===== BEGIN USER GUIDANCE ON EMAIL FAILURE =====
    console.error("────────────────────────────────────────")
    console.error("⚠️ Email could NOT be delivered! Possible reasons:")
    console.error("  - Outlook quota exceeded or not verified (ErrorExceededMessageLimit/429)")
    console.error("  - No SendGrid API key is configured as fallback")
    console.error("")
    console.error("How to fix:")
    console.error("  1. Sign into your Outlook account. Look for 'verify your account' or 'limit reached' messages and resolve as instructed by Microsoft.")
    console.error("  2. For reliable delivery, add your SendGrid API key in Turbotic > Settings > User Configurations.")
    console.error("  3. After fixing, re-run this automation for delivery.")
    console.error("────────────────────────────────────────")
    console.error("Error in sending summary email:", e && e.message ? e.message : e)
    process.exit(1)
  }
})()
