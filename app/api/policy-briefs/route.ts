/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { rwandaDistricts } from "@/lib/mock-data"
import type { PolicyBrief } from "@/lib/types"
import { fetchAllSurveyData, analyzeSurveyPatterns } from "@/lib/survey-data"

export async function POST(request: Request) {
  try {
    const { sector, targetDistricts } = await request.json()

    console.log("[v0] Policy Brief generation started", { sector, targetDistricts })

    const surveyData = await fetchAllSurveyData()
    const surveyPatterns = analyzeSurveyPatterns(surveyData)

    const districts =
      targetDistricts && targetDistricts.length > 0
        ? targetDistricts
        : rwandaDistricts.filter((d) => d.riskLevel === "critical" || d.riskLevel === "high").map((d) => d.id)

    const districtDetails = districts
      .map((id: string) => {
        const district = rwandaDistricts.find((d) => d.id === id)
        if (!district) return null
        return {
          name: district.name,
          riskScore: district.riskScore,
          riskLevel: district.riskLevel,
          stuntingRate: district.stuntingRate,
          anemia: district.anemia,
          population: district.population,
        }
      })
      .filter(Boolean)

    const groqApiKey = process.env.GROQ_API_KEY

    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured")
    }

    const systemPrompt = `You are a nutrition policy expert analyzing data from Rwanda's National Institute of Statistics. Generate a comprehensive, evidence-based policy brief based on real survey data and district risk assessments.

Your analysis should be:
- Data-driven and specific to the provided districts
- Actionable with concrete recommendations
- Evidence-based with quantitative findings
- Sector-specific and contextually relevant
- Different each time based on the specific context provided

Return a JSON object with this structure:
{
  "title": "Brief title (specific to sector and districts)",
  "summary": "Executive summary (2-3 sentences)",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4", "Recommendation 5"]
}`

    const userPrompt = `Generate a ${sector} sector policy brief for Rwanda based on this data:

SURVEY DATA ANALYSIS:
- Total surveys analyzed: ${surveyPatterns.totalSurveys}
- Data quality score: ${surveyPatterns.dataQuality.toFixed(1)}/10
- Survey coverage: ${surveyPatterns.surveyFrequency} surveys per year average
- Data recency: Most recent survey from ${surveyPatterns.mostRecentYear}

TARGET DISTRICTS:
${districtDetails.map((d: any) => `- ${d.name}: Risk Score ${d.riskScore}/100 (${d.riskLevel}), Stunting ${d.stuntingRate}%, Anemia ${d.anemia}%, Population ${d.population.toLocaleString()}`).join("\n")}

SECTOR FOCUS: ${sector.toUpperCase()}

Generate a comprehensive policy brief with:
1. A specific title addressing the ${sector} sector challenges in these districts
2. An executive summary highlighting the urgency and scope
3. 4 key findings with specific data points and percentages
4. 5 actionable recommendations with concrete implementation steps

Make the content specific to the actual data provided. Use real numbers and district names. Ensure recommendations are practical and evidence-based.`

    console.log("[v0] Calling Groq API for policy brief generation...")

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Groq API error:", errorText)
      throw new Error(`Groq API failed: ${errorText}`)
    }

    const groqResponse = await response.json()
    console.log("[v0] Groq response received")

    let briefContent
    try {
      const content = groqResponse.choices[0].message.content
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/)
      const jsonStr = jsonMatch ? jsonMatch[1] : content
      briefContent = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error("[v0] Failed to parse Groq response:", parseError)
      throw new Error("Failed to parse AI-generated policy brief")
    }

    const policyBrief: PolicyBrief = {
      id: `brief-${Date.now()}`,
      sector: sector,
      title: briefContent.title,
      summary: briefContent.summary,
      keyFindings: briefContent.keyFindings,
      recommendations: briefContent.recommendations,
      targetDistricts: districts,
      generatedAt: new Date(),
    }

    console.log("[v0] Policy brief generated successfully")

    return NextResponse.json(policyBrief)
  } catch (error: any) {
    console.error("[v0] Policy brief generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate policy brief" }, { status: 500 })
  }
}

export async function GET() {
  // Return empty array - briefs are generated on demand
  return NextResponse.json([])
}
