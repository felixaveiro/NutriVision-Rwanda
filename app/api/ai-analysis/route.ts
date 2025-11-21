/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchSurveyData, analyzeSurveyPatterns } from "@/lib/survey-data"
import { rwandaDistricts } from "@/lib/mock-data"

const predictionSchema = z.object({
  districtAnalysis: z.array(
    z.object({
      district: z.string(),
      riskAssessment: z.object({
        currentRisk: z.number().min(0).max(100),
        predictedRisk3m: z.number().min(0).max(100),
        predictedRisk6m: z.number().min(0).max(100),
        confidence: z.number().min(95).max(100),
        trend: z.enum(["improving", "stable", "worsening"]),
      }),
      insights: z.object({
        primaryConcerns: z.array(z.string()),
        dataGaps: z.array(z.string()),
        recommendations: z.array(z.string()),
      }),
      riskFactors: z.array(
        z.object({
          factor: z.string(),
          impact: z.number().min(0).max(1),
          confidence: z.number().min(0).max(1),
        }),
      ),
    }),
  ),
  overallAssessment: z.object({
    nationalTrend: z.enum(["improving", "stable", "worsening"]),
    highRiskDistricts: z.array(z.string()),
    emergingPatterns: z.array(z.string()),
    dataQualityNotes: z.array(z.string()),
  }),
})

const GROQ_MODELS = {
  fast: "llama-3.1-8b-instant", // Fastest inference, lowest token usage - DEFAULT
  balanced: "llama-3.3-70b-versatile", // Best balance of speed and quality
  accurate: "llama3-70b-8192", // Most accurate with larger context
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: Request) {
  try {
    console.log("[v0] AI Analysis POST started - Using Groq API directly")

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY is not set")
      return NextResponse.json(
        {
          error: "GROQ_API_KEY environment variable is not configured",
          details: "Please add the Groq API key to your environment variables",
        },
        { status: 500 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const provider = body.provider || "groq"
    const modelTier = body.modelTier || "fast"
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.3
  // Use a safer default for max tokens to avoid truncation. Allow caller override.
  const maxTokens = typeof body.maxTokens === "number" ? body.maxTokens : 2000
    const includeRawData = body.includeRawData || false

    console.log("[v0] AI Analysis request:", { provider, modelTier, temperature })
    console.log("[v0] Using Groq API endpoint:", GROQ_API_URL)

    const surveyData = await fetchSurveyData()
    const patterns = analyzeSurveyPatterns(surveyData)

    console.log("[v0] Survey patterns analyzed:", {
      totalSurveys: patterns.totalSurveys,
      dataQuality: patterns.dataQualityScore,
    })

    // Allow caller to request a subset of districts to analyze (reduces tokens)
    const requestedDistricts: string[] | undefined = Array.isArray(body.districts) ? body.districts.map(String) : undefined

    let districtContext = rwandaDistricts.map((d) => ({
      name: d.name || "Unknown",
      province: d.province || "Unknown",
      population: d.population || 0,
      stuntingRate: d.stuntingRate || 0,
      anemia: d.anemia || 0,
      vitaminADeficiency: d.vitaminADeficiency || 0,
      riskScore: d.riskScore || 0,
      riskLevel: d.riskLevel || "Unknown",
    }))

    if (requestedDistricts && requestedDistricts.length > 0) {
      districtContext = districtContext.filter((d) => requestedDistricts!.includes(d.name))
    }

  const analysisPromptBase = `You are an expert epidemiologist analyzing malnutrition data for Rwanda from NISR Dataset (National Institute of Statistics of Rwanda). 

NISR DATASET SURVEY DATA ANALYSIS:
- Total surveys: ${patterns.totalSurveys}
- Recent surveys: ${patterns.recentSurveys}
- Data quality: ${patterns.dataQualityScore.toFixed(1)}%
- Coverage: ${patterns.temporalCoverage.earliest}-${patterns.temporalCoverage.latest}

DISTRICT DATA (${districtContext.length} districts):
{DISTRICT_LIST}

TASK: Analyze each district concisely. For each district provide:
1. Risk scores (current, 3m, 6m) as numbers 0-100
2. Confidence as number 95-100 (NOT decimal, use whole numbers like 97, not 0.97)
3. Trend: "improving", "stable", or "worsening"
4. Top 2 concerns, 1 data gap, 2 recommendations (brief)
5. Top 3 risk factors with:
   - impact: decimal 0-1 (e.g., 0.75 for 75% impact)
   - confidence: decimal 0-1 (e.g., 0.95 for 95% confidence)

IMPORTANT: 
- Main confidence: Use whole numbers 95-100 (e.g., 97)
- Risk factor impact/confidence: Use decimals 0-1 (e.g., 0.85)

Keep responses concise. Respond ONLY with valid JSON:
{
  "districtAnalysis": [
    {
      "district": "name",
      "riskAssessment": {
        "currentRisk": number 0-100,
        "predictedRisk3m": number 0-100,
        "predictedRisk6m": number 0-100,
        "confidence": number 95-100,
        "trend": "improving"|"stable"|"worsening"
      },
      "insights": {
        "primaryConcerns": ["max 2 items"],
        "dataGaps": ["max 1 item"],
        "recommendations": ["max 2 items"]
      },
      "riskFactors": [
        {"factor": "name", "impact": decimal 0-1, "confidence": decimal 0-1}
      ]
    }
  ],
  "overallAssessment": {
    "nationalTrend": "improving"|"stable"|"worsening",
    "highRiskDistricts": ["top 5"],
    "emergingPatterns": ["max 3"],
    "dataQualityNotes": ["max 2"]
  }
}`

  // startTime removed (unused) — we aggregate per-batch instead

  // Narrow modelTier to the known keys and provide a safe fallback
  const tierKey = (modelTier as keyof typeof GROQ_MODELS) || "fast"
  const selectedModel = GROQ_MODELS[tierKey] ?? GROQ_MODELS.fast
  const safeModelTier = typeof tierKey === "string" ? tierKey : "fast"
    // To avoid truncated responses, split districts into smaller batches and call the model per batch.
  const BATCH_SIZE = districtContext.length === 1 ? 1 : 8 // if single district, send a single small batch
    const districtBatches: typeof districtContext[] = []
    for (let i = 0; i < districtContext.length; i += BATCH_SIZE) {
      districtBatches.push(districtContext.slice(i, i + BATCH_SIZE))
    }

    const aggregatedAnalysis: any[] = []
    let totalTokensUsed = 0
    let totalAnalysisTime = 0

    for (let batchIndex = 0; batchIndex < districtBatches.length; batchIndex++) {
      const batch = districtBatches[batchIndex]
      const districtListText = batch
        .map((d) => `${d.name} (${d.province}): Pop ${(d.population / 1000).toFixed(0)}k, Stunting ${d.stuntingRate}%, Anemia ${d.anemia}%, VitA ${d.vitaminADeficiency}%, Risk ${d.riskScore}`)
        .join("\n")

      const analysisPrompt = analysisPromptBase.replace("{DISTRICT_LIST}", districtListText)

      console.log(`[v0] Sending batch ${batchIndex + 1}/${districtBatches.length} to Groq - ${batch.length} districts`)

      let completion: any
      const batchStart = Date.now()
      try {
        const requestBody = {
          model: selectedModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert epidemiologist. Respond ONLY with valid, complete JSON. Be concise. Main confidence: 95-100 (whole numbers). Risk factor impact/confidence: 0-1 (decimals). Ensure JSON is properly closed.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          temperature: Math.max(0, Math.min(2, temperature)),
          max_tokens: Math.max(100, Math.min(8000, maxTokens)),
        }

        const groqResponse = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify(requestBody),
        })

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text()
          console.error("[v0] Groq API error response (batch):", errorText)
          if (groqResponse.status === 429) {
            throw new Error(`RATE_LIMIT: ${errorText}`)
          }
          throw new Error(`Groq API returned ${groqResponse.status}: ${errorText}`)
        }

        completion = await groqResponse.json()
      } catch (groqError: any) {
        console.error("[v0] Groq API error details (batch):", groqError?.message)
        if (groqError?.message?.includes("RATE_LIMIT")) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              details: groqError.message.replace("RATE_LIMIT: ", ""),
              retryAfter: 360,
            },
            { status: 429 },
          )
        }

        return NextResponse.json(
          {
            error: "Groq API call failed",
            details: groqError?.message || "Unknown Groq API error",
          },
          { status: 500 },
        )
      }

      const batchTime = Date.now() - batchStart
      totalAnalysisTime += batchTime

      const responseText = completion.choices?.[0]?.message?.content
      const finishReason = completion.choices?.[0]?.finish_reason
      console.log(`[v0] Batch ${batchIndex + 1} finish reason:`, finishReason)

      if (finishReason === "length") {
        console.warn(`[v0] Batch ${batchIndex + 1} response truncated due to token limit`)
        return NextResponse.json(
          {
            error: "Response truncated",
            details: "The AI response exceeded the token limit for one of the batches. Try using a smaller batch size or lower maxTokens.",
          },
          { status: 500 },
        )
      }

      if (!responseText) {
        console.error(`[v0] No response content from Groq for batch ${batchIndex + 1}`)
        return NextResponse.json(
          {
            error: "No response from Groq API",
            details: "The API returned an empty response for a batch",
          },
          { status: 500 },
        )
      }

      // Strip code fences if present
      let jsonText = responseText.trim()
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      let parsedResponse
      try {
        parsedResponse = JSON.parse(jsonText)
        console.log(`[v0] Batch ${batchIndex + 1} JSON parsed successfully`)
      } catch (parseError: any) {
        console.error(`[v0] Batch ${batchIndex + 1} JSON parse error:`, parseError?.message)
        console.error(`[v0] Batch ${batchIndex + 1} response preview:`, jsonText.substring(0, 500))
        return NextResponse.json(
          {
            error: "Failed to parse AI response",
            details: `JSON parsing failed for a batch: ${parseError?.message}. Response may have been truncated.`,
          },
          { status: 500 },
        )
      }

      // Validate structure
      if (!parsedResponse.districtAnalysis || !Array.isArray(parsedResponse.districtAnalysis)) {
        console.error(`[v0] Invalid response structure for batch ${batchIndex + 1}:`, Object.keys(parsedResponse))
        return NextResponse.json(
          {
            error: "Invalid AI response structure",
            details: "Response missing districtAnalysis array in a batch",
          },
          { status: 500 },
        )
      }

      // Validate with Zod per batch
      try {
        const validated = predictionSchema.parse(parsedResponse)
        aggregatedAnalysis.push(...validated.districtAnalysis)
        totalTokensUsed += completion.usage?.total_tokens || 0
      } catch (zodError: any) {
        console.error(`[v0] Zod validation error for batch ${batchIndex + 1}:`, zodError?.errors?.[0] || zodError?.message)
        return NextResponse.json(
          {
            error: "AI response validation failed",
            details: zodError?.errors?.[0]?.message || zodError?.message || "Invalid schema in batch",
          },
          { status: 500 },
        )
      }
    }

    console.log("[v0] Analysis completed successfully for all batches in", totalAnalysisTime, "ms")

    const response: any = {
      analysis: {
        districtAnalysis: aggregatedAnalysis,
        overallAssessment: {
          // Derive a lightweight overall assessment from aggregated results (best-effort)
          nationalTrend: "stable",
          highRiskDistricts: aggregatedAnalysis
            .sort((a: any, b: any) => b.riskAssessment.currentRisk - a.riskAssessment.currentRisk)
            .slice(0, 5)
            .map((d: any) => d.district),
          emergingPatterns: [],
          dataQualityNotes: [],
        },
      },
      metadata: {
        surveyDataUsed: patterns.totalSurveys,
        dataQualityScore: patterns.dataQualityScore,
        analysisDate: new Date().toISOString(),
        modelUsed: selectedModel,
        provider: "groq",
        modelTier: safeModelTier,
        analysisTimeMs: totalAnalysisTime,
        temperature: temperature,
        tokensUsed: totalTokensUsed,
        endpoint: "Groq API (direct fetch, batched)",
      },
    }

    if (includeRawData) {
      response.rawData = {
        surveyPatterns: patterns,
        districtData: districtContext,
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Unexpected error in AI analysis:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.split("\n").slice(0, 3),
    })
    return NextResponse.json(
      {
        error: "Internal server error in AI analysis",
        details: error?.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
