"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Activity,
} from "lucide-react"

interface DataSourcesInfo {
  summary: {
    totalSurveys: number
    recentSurveys: number
    dataQuality: number
    temporalCoverage: {
      earliest: number
      latest: number
      span: number
    }
    surveyFrequency: number
  }
  model: {
    algorithm: string
    trainR2: number
    testR2: number
    featureImportance: {
      survey_age: number
      survey_duration: number
      surveys_in_year: number
    }
  }
  datasets: {
    count: number
    authorities: string[]
    uniqueTitles: number
  }
  geography: {
    districtCount: number
    provinces: number
  }
  yearCoverage: Record<string, { count: number; surveys: string[] }>
  aiInsights: {
    strengths: string[]
    gaps: string[]
    reliability: string
    recommendations: string[]
  } | null
}

export default function DataSourcesPage() {
  const [data, setData] = useState<DataSourcesInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data-sources")
        if (!response.ok) throw new Error("Failed to fetch data sources")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load data sources"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const qualityColor =
    data.summary.dataQuality >= 70
      ? "text-green-500"
      : data.summary.dataQuality >= 50
        ? "text-yellow-500"
        : "text-red-500"

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Data Sources</h1>
            <p className="mt-2 text-muted-foreground">
              Real-time analysis of {data.summary.totalSurveys} surveys from Rwanda National Institute of Statistics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Live Data</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.summary.totalSurveys}</div>
              <p className="mt-1 text-xs text-muted-foreground">{data.summary.recentSurveys} in last 5 years</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${qualityColor}`}>{data.summary.dataQuality.toFixed(1)}%</div>
              <p className="mt-1 text-xs text-muted-foreground">Based on recency & coverage</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.summary.temporalCoverage.span}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.summary.temporalCoverage.earliest} - {data.summary.temporalCoverage.latest}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Survey Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.summary.surveyFrequency}</div>
              <p className="mt-1 text-xs text-muted-foreground">Surveys per year (recent)</p>
            </CardContent>
          </Card>
        </div>

        {data.aiInsights && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20 bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>Data Strengths</CardTitle>
                </div>
                <CardDescription>AI-identified coverage advantages</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.aiInsights.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/20 bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Data Gaps</CardTitle>
                </div>
                <CardDescription>Areas for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.aiInsights.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {data.aiInsights && (
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Model Reliability Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{data.aiInsights.reliability}</p>
              {data.aiInsights.recommendations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Recommendations:</h4>
                  <ul className="space-y-1">
                    {data.aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Dataset Information</CardTitle>
              </div>
              <CardDescription>Real-time survey data sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {data.datasets.authorities.length} Data Provider{data.datasets.authorities.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{data.datasets.uniqueTitles} Unique Survey Types</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {data.summary.temporalCoverage.latest - data.summary.temporalCoverage.earliest} Years of Data
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{data.datasets.count} CSV Datasets</Badge>
                <Badge variant="secondary">Nutrition Surveys</Badge>
                <Badge variant="secondary">Health Indicators</Badge>
                <Badge variant="secondary">Household Data</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Model Performance</CardTitle>
              </div>
              <CardDescription>Machine learning predictive accuracy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Algorithm:</span>
                  <span className="font-medium">{data.model.algorithm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Training Accuracy:</span>
                  <span className="font-medium text-green-500">R² = {data.model.trainR2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Test Accuracy:</span>
                  <span className="font-medium text-green-500">R² = {data.model.testR2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Districts Covered:</span>
                  <span className="font-medium">{data.geography.districtCount} Districts</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <h4 className="text-sm font-semibold mb-2">Feature Importance:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Survey Frequency</span>
                    <span className="font-medium">
                      {(data.model.featureImportance.surveys_in_year * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Survey Age</span>
                    <span className="font-medium">{(data.model.featureImportance.survey_age * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Survey Duration</span>
                    <span className="font-medium">
                      {(data.model.featureImportance.survey_duration * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Districts Covered:</span>
                  <span className="font-medium">{data.geography.districtCount} Districts</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Provinces:</span>
                  <span className="font-medium">{data.geography.provinces} Provinces</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Key Features Used in Prediction</CardTitle>
            <CardDescription>Factors analyzed by the machine learning model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Food Security</h3>
                <p className="text-sm text-muted-foreground">
                  Household food access, dietary diversity, and agricultural production
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Healthcare Access</h3>
                <p className="text-sm text-muted-foreground">
                  Distance to health facilities, vaccination rates, and maternal care
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Water & Sanitation</h3>
                <p className="text-sm text-muted-foreground">
                  Clean water access, sanitation facilities, and hygiene practices
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Education</h3>
                <p className="text-sm text-muted-foreground">Maternal education levels and nutrition knowledge</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Data Processing Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-foreground">1. Data Collection</div>
                <p className="text-sm text-muted-foreground">
                  Survey data from NISR covering {data.geography.districtCount} districts across{" "}
                  {data.geography.provinces} provinces
                </p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-foreground">2. Feature Engineering</div>
                <p className="text-sm text-muted-foreground">Extract temporal and spatial patterns</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-foreground">3. Model Training</div>
                <p className="text-sm text-muted-foreground">Random Forest with cross-validation</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-foreground">4. Predictions</div>
                <p className="text-sm text-muted-foreground">3-month and 6-month risk forecasts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
