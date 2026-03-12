// Step 6: Build and Save Career Report PDF with Generated Charts - with input/image/file existence checks and robust logging
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib")
const fs = require("fs")

;(async () => {
  try {
    const predictiveJSON = getContext("predictiveJSON")
    const parsedInputs = getContext("parsedInputs")
    if (!predictiveJSON || !parsedInputs) throw new Error("Predictive JSON or Inputs missing")

    // Chart image files to validate before reading
    const chartImageFiles = ["radar_chart.png", "heatmap_chart.png", "growth_chart.png", "benchmark_chart.png"]
    for (const f of chartImageFiles) {
      if (!fs.existsSync(f)) {
        console.error(`Required chart image missing: ${f}`)
        process.exit(1)
      }
    }
    console.log("All required chart images found. Proceeding with PDF generation.")

    // Load chart images
    const radarPng = fs.readFileSync("radar_chart.png")
    const heatmapPng = fs.readFileSync("heatmap_chart.png")
    const growthPng = fs.readFileSync("growth_chart.png")
    const benchmarkPng = fs.readFileSync("benchmark_chart.png")

    // Create a new PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 850])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Cover Page and Title
    page.drawText("AI Career Twin – Predictive Interview Intelligence Architecture", { x: 40, y: 800, size: 18, font })
    page.drawText(`Candidate Role: ${parsedInputs.candidateRole || "Data not publicly available."}`, { x: 40, y: 780, size: 12, font })
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 40, y: 765, size: 12, font })

    // Executive Summary
    page.drawText("Executive Summary:", { x: 40, y: 735, size: 13, font, color: rgb(0.1, 0.15, 0.5) })
    page.drawText(predictiveJSON.executiveSummary?.slice(0, 200) || "Data not publicly available.", { x: 40, y: 720, size: 11, font })

    // Insert charts (Radar, Heatmap, Growth, Benchmark)
    const radarImage = await pdfDoc.embedPng(radarPng)
    page.drawText("Radar Chart:", { x: 40, y: 700, size: 12, font })
    page.drawImage(radarImage, { x: 40, y: 570, width: 220, height: 120 })

    const heatmapImage = await pdfDoc.embedPng(heatmapPng)
    page.drawText("Risk Heatmap Chart:", { x: 300, y: 700, size: 12, font })
    page.drawImage(heatmapImage, { x: 300, y: 570, width: 220, height: 120 })

    const growthImage = await pdfDoc.embedPng(growthPng)
    page.drawText("Growth Projection Chart:", { x: 40, y: 530, size: 12, font })
    page.drawImage(growthImage, { x: 40, y: 390, width: 220, height: 120 })

    const benchmarkImage = await pdfDoc.embedPng(benchmarkPng)
    page.drawText("Benchmark Comparison Chart:", { x: 300, y: 530, size: 12, font })
    page.drawImage(benchmarkImage, { x: 300, y: 390, width: 220, height: 120 })

    // Key scores/metrics
    page.drawText(`Hiring Index: ${predictiveJSON.hiringIndex?.score} (${predictiveJSON.hiringIndex?.category})`, { x: 40, y: 340, size: 12, font })
    page.drawText(`Potential Index: ${predictiveJSON.potentialIndex}`, { x: 300, y: 340, size: 12, font })

    // Footer
    page.drawText("AI Career Twin – Multi-Layer Predictive Intelligence Architecture", { x: 40, y: 20, size: 10, font, color: rgb(0.5, 0.5, 0.5) })

    // All 20 Modules (list)
    const modules = getContext("enterpriseModules")
    let y = 320
    page.drawText("Modules:", { x: 40, y, size: 12, font })
    y -= 16
    if (Array.isArray(modules)) {
      modules.forEach((mod, idx) => {
        if (y < 40) return // avoid overlap with footer
        page.drawText(`${idx + 1}. ${mod}`, { x: 48, y, size: 10, font })
        y -= 13
      })
    }

    // Save PDF file
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync("career_report.pdf", pdfBytes)
    // Verify if PDF was actually written
    if (!fs.existsSync("career_report.pdf")) {
      console.error("Failed to write 'career_report.pdf' to working directory!")
      process.exit(1)
    }
    setContext("pdfFile", "career_report.pdf")
    console.log("Career report PDF generated and saved to working directory.")
  } catch (e) {
    console.error("Error in PDF generation:", e && e.message ? e.message : e)
    process.exit(1)
  }
})()
