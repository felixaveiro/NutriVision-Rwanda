/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { rwandaDistricts } from "@/lib/mock-data"
import { fetchAllSurveyData, analyzeSurveyPatterns } from "@/lib/survey-data"
import type { Intervention } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const districtId = searchParams.get("districtId")
    const category = searchParams.get("category")

    console.log("[v0] Interventions request:", { districtId, category })

    const surveyData = await fetchAllSurveyData()
    const surveyPatterns = analyzeSurveyPatterns(surveyData)

    const targetDistricts = districtId && districtId !== "all" ? [districtId] : rwandaDistricts.map((d) => d.id)

    const districtDetails = targetDistricts
      .map((id) => {
        const district = rwandaDistricts.find((d) => d.id === id)
        if (!district) return null
        return {
          id: district.id,
          name: district.name,
          riskScore: district.riskScore,
          riskLevel: district.riskLevel,
          stuntingRate: district.stuntingRate,
          anemia: district.anemia,
        }
      })
      .filter(Boolean)

    const groqApiKey = process.env.GROQ_API_KEY

    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured")
    }

    const systemPrompt = `You are a nutrition intervention specialist analyzing data from Rwanda. Generate specific, actionable interventions based on real district data and risk assessments.

Return a JSON array of 5-8 intervention objects with this structure:
[
  {
    "title": "Intervention title",
    "description": "Detailed description",
    "category": "nutrition|agriculture|health|education|infrastructure",
    "targetDistricts": ["district_id1", "district_id2"],
    "estimatedImpact": 0.75,
    "feasibility": 0.80,
    "cost": "$X.XM - $X.XM",
    "timeframe": "X-X months",
    "priority": "high|medium|low"
  }
]

Ensure interventions are:
- Specific to the districts and their risk levels
- Varied in category and approach
- Realistic in cost and timeframe
- Prioritized based on impact and feasibility`

    const categoryFilter = category && category !== "all" ? `Focus on ${category} category interventions.` : ""

    const userPrompt = `Generate nutrition interventions for Rwanda based on this data:

SURVEY DATA:
- Total surveys: ${surveyPatterns.totalSurveys}
- Data quality: ${surveyPatterns.dataQuality.toFixed(1)}/10

TARGET DISTRICTS:
${districtDetails.map((d: any) => `- ${d.name} (${d.id}): Risk ${d.riskScore}/100 (${d.riskLevel}), Stunting ${d.stuntingRate}%, Anemia ${d.anemia}%`).join("\n")}

${categoryFilter}

Generate 5-8 specific interventions tailored to these districts. Vary the categories, costs, and timeframes. Prioritize based on risk levels and impact potential.`

    console.log("[v0] Calling Groq API for interventions...")

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
        temperature: 0.8,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Groq API error:", errorText)
      throw new Error(`Groq API failed: ${errorText}`)
    }

    const groqResponse = await response.json()
    console.log("[v0] Groq response received")

    let interventions: Intervention[]
    try {
      const content = groqResponse.choices[0].message.content
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/) || content.match(/(\[[\s\S]*\])/)
      const jsonStr = jsonMatch ? jsonMatch[1] : content
      const parsed = JSON.parse(jsonStr)

      // Add IDs and ensure proper structure
      interventions = parsed.map((int: any, index: number) => ({
        id: `int-${Date.now()}-${index}`,
        ...int,
      }))
    } catch (parseError) {
      console.error("[v0] Failed to parse Groq response:", parseError)
      throw new Error("Failed to parse AI-generated interventions")
    }

    let filtered = interventions

    if (districtId && districtId !== "all") {
      filtered = filtered.filter((int) => int.targetDistricts.includes(districtId))
    }

    if (category && category !== "all") {
      filtered = filtered.filter((int) => int.category === category)
    }

    // Sort by priority and impact
    const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 }
    const sorted = filtered.sort((a, b) => {
      const scoreA = (priorityWeight[a.priority] || 1) * a.estimatedImpact * a.feasibility
      const scoreB = (priorityWeight[b.priority] || 1) * b.estimatedImpact * b.feasibility
      return scoreB - scoreA
    })

    console.log("[v0] Interventions generated successfully:", sorted.length)

    return NextResponse.json(sorted)
  } catch (error: any) {
    console.error("[v0] Interventions generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate interventions" }, { status: 500 })
  }
}
