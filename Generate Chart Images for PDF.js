// Step 5: Generate and Save Chart Images for PDF
const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const fs = require("fs")
const path = require("path")

;(async () => {
  const predictiveJSON = getContext("predictiveJSON")
  if (!predictiveJSON) throw new Error("Predictive intelligence JSON missing")

  // Helper to generate a chart and save as PNG
  async function generateAndSaveChart(fileName, config, width = 600, height = 400) {
    const chartCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: "white" })
    const image = await chartCanvas.renderToBuffer(config)
    fs.writeFileSync(path.join(process.cwd(), fileName), image)
    return fileName
  }

  // Radar Chart
  const radarConfig = {
    type: "radar",
    data: {
      labels: Object.keys(predictiveJSON.radarScores),
      datasets: [
        {
          label: "Radar Scores",
          data: Object.values(predictiveJSON.radarScores),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2
        }
      ]
    },
    options: { scales: { r: { min: 0, max: 100 } } }
  }

  // Heatmap (risk heatmap as bar chart for PDF)
  const heatmapConfig = {
    type: "bar",
    data: {
      labels: Object.keys(predictiveJSON.riskHeatmap),
      datasets: [
        {
          label: "Risk Heatmap",
          data: Object.values(predictiveJSON.riskHeatmap),
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 2
        }
      ]
    },
    options: { indexAxis: "y", scales: { x: { min: 0, max: 100 }, y: {} } }
  }

  // Growth Projection (line)
  const growthConfig = {
    type: "line",
    data: {
      labels: Object.keys(predictiveJSON.growthProjection),
      datasets: [
        {
          label: "Growth Projection (6 months)",
          data: Object.values(predictiveJSON.growthProjection),
          fill: false,
          borderColor: "rgba(75,192,192,1)",
          tension: 0.3
        }
      ]
    },
    options: { scales: { y: { min: 0, max: 100 } } }
  }

  // Benchmark Comparison (bar)
  const benchmarkConfig = {
    type: "bar",
    data: {
      labels: ["Ideal Technical Score", "Candidate Technical Score"],
      datasets: [
        {
          label: "Role Benchmark",
          data: [predictiveJSON.roleBenchmarkComparison.idealTechnicalScore, predictiveJSON.roleBenchmarkComparison.candidateTechnicalScore],
          backgroundColor: ["rgba(150,200,50,0.7)", "rgba(54, 162, 235, 0.7)"],
          borderWidth: 2
        }
      ]
    },
    options: { scales: { y: { min: 0, max: 100 } } }
  }

  // Render and save each chart in working directory
  await generateAndSaveChart("radar_chart.png", radarConfig)
  await generateAndSaveChart("heatmap_chart.png", heatmapConfig)
  await generateAndSaveChart("growth_chart.png", growthConfig)
  await generateAndSaveChart("benchmark_chart.png", benchmarkConfig)

  setContext("chartsGenerated", true)
  console.log("All charts generated and saved as PNG images.")
})()
