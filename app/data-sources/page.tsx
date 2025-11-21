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
  ArrowRight,
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
      <div className="min-h-screen bg-gradient-to-b from-[#005BAB] to-[#E6E8EB] p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <Skeleton className="h-16 w-80 bg-white/20" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-40 bg-white/20" />
            <Skeleton className="h-40 bg-white/20" />
            <Skeleton className="h-40 bg-white/20" />
            <Skeleton className="h-40 bg-white/20" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#005BAB] to-[#E6E8EB] p-8">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive" className="bg-white shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Failed to load data sources"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const qualityColor =
    data.summary.dataQuality >= 70
      ? "text-green-600"
      : data.summary.dataQuality >= 50
        ? "text-amber-600"
        : "text-red-600"

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005BAB] to-[#E6E8EB]">
      {/* Header Section */}
      <div className="bg-[#005BAB] pt-12 pb-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-white tracking-tight">Data Sources</h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                Comprehensive analysis of {data.summary.totalSurveys} surveys from Rwanda National Institute of Statistics
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Activity className="h-5 w-5 text-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white">Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-8 -mt-16 pb-16 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Surveys</CardTitle>
                <Database className="h-5 w-5 text-[#005BAB]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{data.summary.totalSurveys}</div>
              <p className="mt-2 text-sm text-gray-500">{data.summary.recentSurveys} in last 5 years</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Data Quality</CardTitle>
                <BarChart3 className="h-5 w-5 text-[#005BAB]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${qualityColor}`}>{data.summary.dataQuality.toFixed(1)}%</div>
              <p className="mt-2 text-sm text-gray-500">Based on recency & coverage</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Time Coverage</CardTitle>
                <Calendar className="h-5 w-5 text-[#005BAB]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.summary.temporalCoverage.earliest > 0 && data.summary.temporalCoverage.latest > 0 
                  ? `${data.summary.temporalCoverage.earliest} - ${data.summary.temporalCoverage.latest}`
                  : 'Loading...'}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {data.summary.temporalCoverage.span > 0 
                  ? `${data.summary.temporalCoverage.span} year${data.summary.temporalCoverage.span !== 1 ? 's' : ''} of NISR data`
                  : 'NISR Dataset coverage'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Survey Frequency</CardTitle>
                <TrendingUp className="h-5 w-5 text-[#005BAB]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{data.summary.surveyFrequency}</div>
              <p className="mt-2 text-sm text-gray-500">Surveys per year (recent)</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        {data.aiInsights && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white shadow-xl border-0 border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Data Strengths</CardTitle>
                    <CardDescription className="text-gray-600">AI-identified coverage advantages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.aiInsights.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                      <div className="mt-1 p-1 bg-green-100 rounded-full">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 border-l-4 border-l-amber-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Data Gaps</CardTitle>
                    <CardDescription className="text-gray-600">Areas for improvement</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.aiInsights.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                      <div className="mt-1 p-1 bg-amber-100 rounded-full">
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                      </div>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Model Reliability Section */}
        {data.aiInsights && (
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-[#005BAB]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Model Reliability Assessment</CardTitle>
                  <CardDescription className="text-gray-600">AI-powered analysis and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm leading-relaxed text-gray-800">{data.aiInsights.reliability}</p>
              </div>
              {data.aiInsights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3 uppercase tracking-wide">Recommendations</h4>
                  <div className="grid gap-3">
                    {data.aiInsights.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-[#005BAB] flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dataset & Model Performance Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-6 w-6 text-[#005BAB]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Dataset Information</CardTitle>
                  <CardDescription className="text-gray-600">Real-time survey data sources</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-[#005BAB]" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{data.datasets.authorities.length} Data Providers</div>
                    <div className="text-xs text-gray-500">Official government sources</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-[#005BAB]" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{data.datasets.uniqueTitles} Unique Survey Types</div>
                    <div className="text-xs text-gray-500">Diverse data collection methods</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-[#005BAB]" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {data.summary.temporalCoverage.latest - data.summary.temporalCoverage.earliest} Years Historical Data
                    </div>
                    <div className="text-xs text-gray-500">Longitudinal analysis capability</div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#005BAB] hover:bg-[#004a8f] text-white">{data.datasets.count} CSV Datasets</Badge>
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Nutrition Surveys</Badge>
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Health Indicators</Badge>
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Household Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-[#005BAB]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Model Performance</CardTitle>
                  <CardDescription className="text-gray-600">Machine learning predictive accuracy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Algorithm</span>
                  <span className="font-semibold text-gray-900">{data.model.algorithm}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm text-gray-600">Training Accuracy</span>
                  <span className="font-semibold text-green-700">R² = {data.model.trainR2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm text-gray-600">Test Accuracy</span>
                  <span className="font-semibold text-green-700">R² = {data.model.testR2.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Feature Importance</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Survey Frequency</span>
                      <span className="font-medium">{(data.model.featureImportance.surveys_in_year * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#005BAB]" style={{width: `${data.model.featureImportance.surveys_in_year * 100}%`}}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Survey Age</span>
                      <span className="font-medium">{(data.model.featureImportance.survey_age * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#005BAB]" style={{width: `${data.model.featureImportance.survey_age * 100}%`}}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Survey Duration</span>
                      <span className="font-medium">{(data.model.featureImportance.survey_duration * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#005BAB]" style={{width: `${data.model.featureImportance.survey_duration * 100}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#005BAB]">{data.geography.districtCount}</div>
                    <div className="text-xs text-gray-600 mt-1">Districts Covered</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#005BAB]">{data.geography.provinces}</div>
                    <div className="text-xs text-gray-600 mt-1">Provinces</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features Section */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Key Features Used in Prediction</CardTitle>
            <CardDescription className="text-gray-600">Factors analyzed by the machine learning model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-2">Food Security</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Household food access, dietary diversity, and agricultural production
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                <h3 className="font-bold text-gray-900 mb-2">Healthcare Access</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Distance to health facilities, vaccination rates, and maternal care
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <h3 className="font-bold text-gray-900 mb-2">Water & Sanitation</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Clean water access, sanitation facilities, and hygiene practices
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100">
                <h3 className="font-bold text-gray-900 mb-2">Education</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Maternal education levels and nutrition knowledge
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing Pipeline */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Data Processing Pipeline</CardTitle>
            <CardDescription className="text-gray-600">End-to-end machine learning workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-5 bg-gradient-to-br from-[#005BAB] to-[#0077d4] rounded-lg text-white relative">
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-[#005BAB]" />
                </div>
                <div className="text-3xl font-bold mb-2">01</div>
                <div className="font-bold mb-2">Data Collection</div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Survey data from NISR covering {data.geography.districtCount} districts across {data.geography.provinces} provinces
                </p>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-[#005BAB] to-[#0077d4] rounded-lg text-white relative">
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-[#005BAB]" />
                </div>
                <div className="text-3xl font-bold mb-2">02</div>
                <div className="font-bold mb-2">Feature Engineering</div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Extract temporal and spatial patterns from raw data
                </p>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-[#005BAB] to-[#0077d4] rounded-lg text-white relative">
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-[#005BAB]" />
                </div>
                <div className="text-3xl font-bold mb-2">03</div>
                <div className="font-bold mb-2">Model Training</div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Random Forest with cross-validation
                </p>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-[#005BAB] to-[#0077d4] rounded-lg text-white">
                <div className="text-3xl font-bold mb-2">04</div>
                <div className="font-bold mb-2">Predictions</div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  3-month and 6-month risk forecasts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}