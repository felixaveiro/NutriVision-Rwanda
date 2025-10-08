/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { fetchSurveyData, analyzeSurveyPatterns } from "@/lib/survey-data"
import { rwandaDistricts } from "@/lib/mock-data"

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const districtName = searchParams.get("district")
  const useAI = searchParams.get("ai") === "true"

  try {
    if (useAI) {
      return POST(request)
    }

    const surveyData = await fetchSurveyData()
    const patterns = analyzeSurveyPatterns(surveyData)

    // Calculate model metrics from survey data
    const currentYear = new Date().getFullYear()
  const surveyAges = surveyData.map((s) => currentYear - s.data_coll_start)
  // average survey age intentionally unused at the moment
  void surveyAges

    // Generate predictions for each district based on survey data and existing district info
    const districtPredictions = rwandaDistricts.map((district) => {
      // Use survey data to influence predictions
      const recentSurveys = surveyData.filter((s) => currentYear - s.data_coll_start <= 5).length
      const dataQualityFactor = Math.min(recentSurveys / 10, 1) // More recent surveys = better data

      // Calculate current risk from district data
      const currentRisk = district.riskScore

      // Predict future risk based on trends
      // If data quality is poor, risk tends to increase
      const dataQualityImpact = (1 - dataQualityFactor) * 5
      const baselineTrend = district.riskLevel === "critical" ? 2 : district.riskLevel === "high" ? 1 : 0

      const predictedRisk3m = Math.min(100, Math.round(currentRisk + baselineTrend + dataQualityImpact * 0.5))
      const predictedRisk6m = Math.min(100, Math.round(currentRisk + baselineTrend * 2 + dataQualityImpact))

      // Determine trend
      let trend: "improving" | "stable" | "worsening"
      if (predictedRisk6m > currentRisk + 3) trend = "worsening"
      else if (predictedRisk6m < currentRisk - 3) trend = "improving"
      else trend = "stable"

      // Key factors based on district data
      const keyFactors = [
        {
          factor: "Stunting Rate",
          impact: Math.round((district.stuntingRate / 40) * 100) / 100,
        },
        {
          factor: "Anemia Prevalence",
          impact: Math.round((district.anemia / 35) * 100) / 100,
        },
        {
          factor: "Vitamin A Deficiency",
          impact: Math.round((district.vitaminADeficiency / 30) * 100) / 100,
        },
        {
          factor: "Data Recency",
          impact: Math.round((1 - dataQualityFactor) * 100) / 100,
        },
      ].sort((a, b) => b.impact - a.impact)

      const confidencePercent = Math.round(dataQualityFactor * 5 + 95) // 95-100% confidence
      const confidence = confidencePercent / 100 // Convert to 0-1 range

      return {
        district: district.name,
        currentRisk: currentRisk,
        predictedRisk3m: predictedRisk3m,
        predictedRisk6m: predictedRisk6m,
        confidence, // Now in 0-1 range
        trend,
        keyFactors: keyFactors,
      }
    })

    // Model metrics based on survey data analysis
    const modelMetrics = {
      trainR2: patterns.train_r2,
      testR2: patterns.test_r2,
      featureImportance: patterns.feature_importance,
    }

    if (districtName) {
        // Normalize helper to compare names more tolerantly (remove 'district', non-alphanumerics)
        const normalize = (s: string) =>
          s
            .toLowerCase()
            .replace(/district/g, "")
            .replace(/[^a-z0-9]/g, "")
            .trim()

        let prediction = districtPredictions.find((p: any) => normalize(p.district) === normalize(districtName))

        // Relaxed matching: check includes / startsWith
        if (!prediction) {
          prediction = districtPredictions.find((p: any) => normalize(p.district).includes(normalize(districtName)) || normalize(districtName).includes(normalize(p.district)))
        }

        // If still not found but AI returned a single prediction (likely because we asked for one), use it
        if (!prediction && districtPredictions.length === 1) {
          prediction = districtPredictions[0]
        }

      if (!prediction) {
        return NextResponse.json({ error: "District not found" }, { status: 404 })
      }

      return NextResponse.json({
        district: prediction.district,
        currentRisk: prediction.currentRisk,
        predictedRisk3m: prediction.predictedRisk3m,
        predictedRisk6m: prediction.predictedRisk6m,
        confidence: prediction.confidence,
        trend: prediction.trend,
        keyFactors: prediction.keyFactors,
        modelMetrics,
      })
    }

    // Return all district predictions
    return NextResponse.json({
      predictions: districtPredictions,
      modelMetrics,
      dataSource: {
        surveysAnalyzed: surveyData.length,
        dateRange: `${Math.min(...surveyData.map((s) => s.data_coll_start))}-${Math.max(...surveyData.map((s) => s.data_coll_end))}`,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error generating predictions:", error)
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const districtName = searchParams.get("district")

  try {
    // Parse AI configuration from request body
    const body = await request.json().catch(() => ({}))
    const { provider = "groq", modelTier = "balanced", temperature = 0.3 } = body

    console.log("[v0] AI Predictions request:", { provider, modelTier, temperature })

    // Call AI analysis endpoint with configuration
    const baseUrl = request.url.split("/api")[0]
    const aiResponse = await fetch(`${baseUrl}/api/ai-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        modelTier,
        temperature,
        includeRawData: false,
        // If a single district was requested, ask AI analysis to focus only on it to reduce tokens
        ...(districtName ? { districts: [districtName] } : {}),
      }),
    })

    if (!aiResponse.ok) {
      let errorDetails = `Status ${aiResponse.status}`
      let isRateLimit = false

      try {
        const responseText = await aiResponse.text()
        console.error("[v0] AI analysis error response text:", responseText)

        // Try to parse as JSON for structured error
        try {
          const errorData = JSON.parse(responseText)
          errorDetails = errorData.details || errorData.error || responseText

          if (errorDetails.includes("rate_limit_exceeded") || errorDetails.includes("Rate limit reached")) {
            isRateLimit = true
          }
        } catch {
          // If not JSON, use the text directly
          errorDetails = responseText || errorDetails
          if (errorDetails.includes("rate_limit") || errorDetails.includes("Rate limit")) {
            isRateLimit = true
          }
        }
      } catch (readError) {
        console.error("[v0] Failed to read error response:", readError)
      }

      if (isRateLimit) {
        console.log("[v0] Rate limit hit, falling back to non-AI predictions")
        return GET(request)
      }

      throw new Error(`AI analysis failed: ${errorDetails}`)
    }

    const aiData = await aiResponse.json()

    if (aiData.error) {
      console.error("[v0] AI analysis returned error:", aiData)
      throw new Error(`AI analysis error: ${aiData.details || aiData.error}`)
    }

    console.log("[v0] AI analysis completed successfully")

    const predictions = aiData.analysis.districtAnalysis.map((d: any) => ({
      district: d.district,
      currentRisk: d.riskAssessment.currentRisk,
      predictedRisk3m: d.riskAssessment.predictedRisk3m,
      predictedRisk6m: d.riskAssessment.predictedRisk6m,
      confidence: d.riskAssessment.confidence / 100, // Convert 0-100 to 0-1 range
      trend: d.riskAssessment.trend,
      keyFactors: d.riskFactors.map((f: any) => ({
        factor: f.factor,
        impact: f.impact,
        confidence: f.confidence,
      })),
      insights: d.insights,
    }))

    if (districtName) {
      // Debug: log returned district names for easier troubleshooting
      console.log("[v0] AI returned districts:", predictions.map((p: any) => p.district))

      const normalize = (s: string) =>
        s
          .toLowerCase()
          .replace(/district/g, "")
          .replace(/[^a-z0-9]/g, "")
          .trim()

      let prediction = predictions.find((p: any) => normalize(p.district) === normalize(districtName))

      if (!prediction) {
        prediction = predictions.find((p: any) => normalize(p.district).includes(normalize(districtName)) || normalize(districtName).includes(normalize(p.district)))
      }

      // Fallback: if only one prediction returned, assume it's the requested district
      if (!prediction && predictions.length === 1) {
        prediction = predictions[0]
      }

      // If still no exact match but AI returned something, return the first prediction with a warning
      if (!prediction && predictions.length > 0) {
        console.warn("[v0] No exact district match; returning first AI prediction as fallback")
        const fallback = predictions[0]
        return NextResponse.json(
          {
            district: fallback.district,
            currentRisk: fallback.currentRisk,
            predictedRisk3m: fallback.predictedRisk3m,
            predictedRisk6m: fallback.predictedRisk6m,
            confidence: fallback.confidence,
            trend: fallback.trend,
            keyFactors: fallback.keyFactors,
            insights: fallback.insights,
            metadata: { ...(aiData.metadata || {}), warning: "Returned first AI prediction because no exact district name match was found" },
          },
          { status: 200 },
        )
      }

      if (!prediction) {
        return NextResponse.json({ error: "District not found" }, { status: 404 })
      }

      return NextResponse.json({
        district: prediction.district,
        currentRisk: prediction.currentRisk,
        predictedRisk3m: prediction.predictedRisk3m,
        predictedRisk6m: prediction.predictedRisk6m,
        confidence: prediction.confidence,
        trend: prediction.trend,
        keyFactors: prediction.keyFactors,
        insights: prediction.insights,
        metadata: aiData.metadata,
      })
    }

    return NextResponse.json({
      predictions,
      overallAssessment: aiData.analysis.overallAssessment,
      metadata: aiData.metadata,
    })
  } catch (error) {
    console.error("[v0] Error in AI predictions:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("rate_limit") || errorMessage.includes("Rate limit")) {
      console.log("[v0] Rate limit error detected, falling back to non-AI predictions")
      return GET(request)
    }

    return NextResponse.json(
      {
        error: "Failed to generate AI predictions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
