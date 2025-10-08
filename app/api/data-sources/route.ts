import { NextResponse } from "next/server"
import { fetchAllSurveyData, analyzeSurveyPatterns } from "@/lib/survey-data"
import { rwandaDistricts } from "@/lib/mock-data"

export async function GET() {
  try {
    console.log("[v0] Fetching data sources information...")

    // Fetch all survey data
    const surveys = await fetchAllSurveyData()
    console.log("[v0] Fetched surveys:", surveys.length)

    // Analyze patterns
    const patterns = analyzeSurveyPatterns(surveys)
    console.log("[v0] Analysis complete:", patterns)

    // Get unique authorities
    const authorities = Array.from(new Set(surveys.map((s) => s.authenty)))

    // Get survey titles
    const uniqueTitles = Array.from(new Set(surveys.map((s) => s.titl)))

    // Calculate coverage by year
    const yearCoverage = surveys.reduce(
      (acc, survey) => {
        const year = survey.data_coll_start
        if (!acc[year]) {
          acc[year] = { count: 0, surveys: [] }
        }
        acc[year].count++
        acc[year].surveys.push(survey.titl)
        return acc
      },
      {} as Record<number, { count: number; surveys: string[] }>,
    )

    // Generate AI insights using Groq
    let aiInsights = null
    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a data quality analyst for nutrition and health surveys in Rwanda. Provide concise, actionable insights about data coverage and quality.",
            },
            {
              role: "user",
              content: `Analyze this survey data coverage for Rwanda nutrition monitoring:

Total Surveys: ${patterns.totalSurveys}
Time Period: ${patterns.temporalCoverage.earliest} - ${patterns.temporalCoverage.latest}
Recent Surveys (last 5 years): ${patterns.recentSurveys}
Data Quality Score: ${patterns.dataQualityScore.toFixed(1)}/100
Survey Frequency: ${patterns.surveyFrequency} surveys/year (recent)
Model Performance: Train R²=${patterns.train_r2}, Test R²=${patterns.test_r2}

Provide 3-4 key insights about:
1. Data coverage strengths
2. Potential gaps or limitations
3. Reliability for predictive modeling
4. Recommendations for improvement

Format as JSON: {"strengths": ["..."], "gaps": ["..."], "reliability": "...", "recommendations": ["..."]}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      })

      if (groqResponse.ok) {
        const groqData = await groqResponse.json()
        const content = groqData.choices[0]?.message?.content || ""

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0])
          console.log("[v0] AI insights generated successfully")
        }
      }
    } catch (error) {
      console.error("[v0] Error generating AI insights:", error)
    }

    return NextResponse.json({
      summary: {
        totalSurveys: patterns.totalSurveys,
        recentSurveys: patterns.recentSurveys,
        dataQuality: patterns.dataQualityScore,
        temporalCoverage: patterns.temporalCoverage,
        surveyFrequency: patterns.surveyFrequency,
      },
      model: {
        algorithm: "Random Forest Regressor",
        trainR2: patterns.train_r2,
        testR2: patterns.test_r2,
        featureImportance: patterns.feature_importance,
      },
      datasets: {
        count: 5,
        authorities: authorities,
        uniqueTitles: uniqueTitles.length,
      },
      geography: {
        districtCount: rwandaDistricts.length,
        provinces: Array.from(new Set(rwandaDistricts.map((d) => d.province))).length,
      },
      yearCoverage: yearCoverage,
      aiInsights: aiInsights,
    })
  } catch (error) {
    console.error("[v0] Error in data sources API:", error)
    return NextResponse.json({ error: "Failed to fetch data sources information" }, { status: 500 })
  }
}
