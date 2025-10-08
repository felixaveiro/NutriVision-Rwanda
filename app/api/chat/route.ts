import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { fetchAllSurveyData, analyzeSurveyPatterns } from "@/lib/survey-data"

export const maxDuration = 30

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Check for Groq API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 })
    }

    // Fetch context data
    const surveys = await fetchAllSurveyData()
    const patterns = analyzeSurveyPatterns(surveys)

    // Build system context
  const systemContext = `You are an AI assistant for NutriVision Rwanda, a Geospatial Early Warning & Decision Support System for mapping micronutrient deficiency hotspots in Rwanda.

PROJECT OVERVIEW:
- NutriMapRW analyzes nutrition data across Rwanda's 30 districts in 5 provinces
- Uses machine learning to predict malnutrition risk and recommend interventions
- Generates policy briefs and intervention strategies based on real survey data

CURRENT DATA:
- Total Surveys: ${patterns.totalSurveys}
- Data Quality Score: ${(patterns.dataQuality * 100).toFixed(1)}%
- Survey Frequency: ${patterns.surveyFrequency.toFixed(1)} surveys/year
- Most Recent Year: ${patterns.mostRecentYear || "N/A"}
- Districts Covered: 30 districts across 5 provinces (Kigali City, Eastern, Northern, Southern, Western)

SYSTEM CAPABILITIES:
1. Predictive Risk Analysis: ML models forecast malnutrition risk 3-6 months ahead with 95-100% confidence
2. Root Cause Analysis: Identifies key risk factors (food insecurity, poverty, healthcare access, water/sanitation)
3. Intervention Recommender: Suggests evidence-based interventions ranked by impact and feasibility
4. Policy Brief Generator: Creates sector-specific policy recommendations for Health, Agriculture, Education, Social Protection, and WASH

DISTRICTS BY PROVINCE:
- Kigali City (3): Gasabo, Kicukiro, Nyarugenge
- Eastern Province (7): Bugesera, Gatsibo, Kayonza, Kirehe, Ngoma, Nyagatare, Rwamagana
- Northern Province (5): Burera, Gakenke, Gicumbi, Musanze, Rulindo
- Southern Province (8): Gisagara, Huye, Kamonyi, Muhanga, Nyamagabe, Nyanza, Nyaruguru, Ruhango
- Western Province (7): Karongi, Ngororero, Nyabihu, Nyamasheke, Rubavu, Rusizi, Rutsiro

You should answer questions about:
- Nutrition data and trends in Rwanda
- District-specific risk assessments
- Intervention strategies and their effectiveness
- Policy recommendations
- System features and how to use them
- Data sources and methodology

Be helpful, accurate, and provide actionable insights based on the data.`

    // Prepare messages for Groq
    const groqMessages = [
      { role: "system", content: systemContext },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    console.log("[v0] Sending chat request to Groq...")

    // Call Groq API directly
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Groq API error:", errorText)
      return NextResponse.json({ error: `Groq API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    const assistantMessage = data?.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from Groq" }, { status: 500 })
    }

    console.log("[v0] Chat response generated successfully")

    return NextResponse.json({
      message: assistantMessage,
      usage: data?.usage,
    })
  } catch (error) {
    console.error("[v0] Error in chat:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
