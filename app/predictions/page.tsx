"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Brain, TrendingUp, ArrowLeft, TrendingDown, Minus, AlertCircle, Settings2, Sparkles, MapPin, Filter } from "lucide-react"

// Complete list of Rwanda districts by province
const rwandaDistricts = [
  // Kigali City
  { id: "1", name: "Gasabo", province: "Kigali" },
  { id: "2", name: "Kicukiro", province: "Kigali" },
  { id: "3", name: "Nyarugenge", province: "Kigali" },
  
  // Southern Province
  { id: "4", name: "Gisagara", province: "Southern" },
  { id: "5", name: "Huye", province: "Southern" },
  { id: "6", name: "Kamonyi", province: "Southern" },
  { id: "7", name: "Muhanga", province: "Southern" },
  { id: "8", name: "Nyamagabe", province: "Southern" },
  { id: "9", name: "Nyanza", province: "Southern" },
  { id: "10", name: "Nyaruguru", province: "Southern" },
  { id: "11", name: "Ruhango", province: "Southern" },
  
  // Western Province
  { id: "12", name: "Karongi", province: "Western" },
  { id: "13", name: "Ngororero", province: "Western" },
  { id: "14", name: "Nyabihu", province: "Western" },
  { id: "15", name: "Nyamasheke", province: "Western" },
  { id: "16", name: "Rubavu", province: "Western" },
  { id: "17", name: "Rusizi", province: "Western" },
  { id: "18", name: "Rutsiro", province: "Western" },
  
  // Northern Province
  { id: "19", name: "Burera", province: "Northern" },
  { id: "20", name: "Gakenke", province: "Northern" },
  { id: "21", name: "Gicumbi", province: "Northern" },
  { id: "22", name: "Musanze", province: "Northern" },
  { id: "23", name: "Rulindo", province: "Northern" },
  
  // Eastern Province
  { id: "24", name: "Bugesera", province: "Eastern" },
  { id: "25", name: "Gatsibo", province: "Eastern" },
  { id: "26", name: "Kayonza", province: "Eastern" },
  { id: "27", name: "Kirehe", province: "Eastern" },
  { id: "28", name: "Ngoma", province: "Eastern" },
  { id: "29", name: "Nyagatare", province: "Eastern" },
  { id: "30", name: "Rwamagana", province: "Eastern" },
]

interface PredictionResult {
  districtId: string
  districtName: string
  province: string
  trend: string
  confidence: number
  currentRisk: number
  predictedRisk: number
  factors: Array<{ name: string; category: string; impact: number }>
  insights?: string
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<PredictionResult[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useAI, setUseAI] = useState(false)
  interface OverallAssessment {
    nationalTrend?: string
    highRiskDistricts?: string[]
    emergingPatterns?: string[]
  }

  interface AnalysisMetadata {
    provider?: string
    modelTier?: string
  }

  const [overallAssessment, setOverallAssessment] = useState<OverallAssessment | null>(null)
  const [modelTier, setModelTier] = useState("balanced")
  const [temperature, setTemperature] = useState(0.3)
  const [analysisMetadata, setAnalysisMetadata] = useState<AnalysisMetadata | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Map API prediction object to local UI PredictionResult
  const mapApiToPrediction = (apiObj: unknown): PredictionResult => {
    const api = (apiObj ?? {}) as Record<string, unknown>
    const nameFromApi = (api["districtName"] as string | undefined) || (api["district"] as string | undefined) || ""
    const found = rwandaDistricts.find((d) => d.name.toLowerCase() === String(nameFromApi).toLowerCase())
    const districtId = found ? found.id : ((api["districtId"] as string | undefined) || (api["district"] as string | undefined) || "unknown")

    const rawFactors = (api["factors"] ?? api["keyFactors"] ?? api["key_factors"] ?? []) as unknown[]
    const factors = rawFactors.map((f: unknown) => {
      const ff = (f ?? {}) as Record<string, unknown>
      const impactVal = ff["impact"]
      const rawImpact = typeof impactVal === "number" ? (impactVal as number) : Number(String(impactVal)) || 0
      const impactPercent = rawImpact <= 1 ? rawImpact * 100 : rawImpact

      const rawName = (ff["name"] as string | undefined) || (ff["factor"] as string | undefined) || (ff["label"] as string | undefined) || "Unknown"
      const categoryGuess = (ff["category"] as string | undefined) || (String(rawName).toLowerCase().includes("stunt") ? "health" : "economic")

      return {
        name: rawName,
        category: categoryGuess || "economic",
        impact: Number(Number(impactPercent).toFixed(1)),
      }
    })

    let insightText: string | undefined
    const insightsVal = api["insights"]
    if (typeof insightsVal === "string") {
      insightText = insightsVal
    } else if (insightsVal && typeof insightsVal === "object") {
      const i = insightsVal as Record<string, unknown>
      const primary = Array.isArray(i["primaryConcerns"]) ? (i["primaryConcerns"] as string[]).join("; ") : Array.isArray(i["primary_concerns"]) ? (i["primary_concerns"] as string[]).join("; ") : undefined
      const dataGap = Array.isArray(i["dataGaps"]) ? (i["dataGaps"] as string[]).join("; ") : Array.isArray(i["data_gaps"]) ? (i["data_gaps"] as string[]).join("; ") : undefined
      const recs = Array.isArray(i["recommendations"]) ? (i["recommendations"] as string[]).join("; ") : undefined

      const parts: string[] = []
      if (primary) parts.push(`Top concerns: ${primary}`)
      if (dataGap) parts.push(`Data gaps: ${dataGap}`)
      if (recs) parts.push(`Recommendations: ${recs}`)

      insightText = parts.join(" \n") || undefined
    }

    return {
      districtId: String(districtId),
      districtName: (api["districtName"] as string | undefined) || (api["district"] as string | undefined) || rwandaDistricts.find((d) => d.id === String(districtId))?.name || "Unknown District",
      province: (api["province"] as string | undefined) || rwandaDistricts.find((d) => d.id === String(districtId))?.province || "",
      trend: (api["trend"] as string | undefined) || "stable",
      confidence: typeof api["confidence"] === "number" ? (api["confidence"] as number) : Number(String(api["confidence"])) || 0,
      currentRisk: (api["currentRisk"] as number | undefined) || (api["current_risk"] as number | undefined) || 0,
      predictedRisk:
        (api["predictedRisk"] as number | undefined) ||
        (api["predicted_risk"] as number | undefined) ||
        (api["predictedRisk3m"] as number | undefined) ||
        (api["predicted_risk_3m"] as number | undefined) ||
        0,
      factors,
      insights: insightText,
    }
  }

  // fetchPredictions is stable via useCallback below

  const filterPredictionsCb = useCallback(() => {
    if (selectedDistrict === "all") {
      setFilteredPredictions(predictions)
    } else {
      const filtered = predictions.filter(p => p.districtName === selectedDistrict)
      setFilteredPredictions(filtered)
    }
  }, [selectedDistrict, predictions])

  useEffect(() => {
    filterPredictionsCb()
  }, [filterPredictionsCb])

  const fetchPredictions = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      // Call the backend predictions API. Use POST when AI is enabled (server expects config), otherwise GET.
      const query = selectedDistrict && selectedDistrict !== "all" ? `?district=${encodeURIComponent(selectedDistrict)}` : ""
      const aiQuery = useAI ? (query ? `${query}&ai=true` : `?ai=true`) : query

      const res = await fetch(`/api/predictions${aiQuery}`,
        useAI
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ provider: "groq", modelTier, temperature }),
              signal: abortControllerRef.current?.signal,
            }
          : { signal: abortControllerRef.current?.signal },
      )

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `API returned status ${res.status}`)
      }

  const data = await res.json()

      // Normalize API shapes: support { predictions: [] } or single prediction { district: ... }
  let predictionsFromApi: unknown[] = []
      if (Array.isArray(data.predictions)) predictionsFromApi = data.predictions
      else if (Array.isArray(data)) predictionsFromApi = data
      else if (data.prediction) predictionsFromApi = [data.prediction]
      else if (data.district) predictionsFromApi = [data]

      const mapped = predictionsFromApi.map(mapApiToPrediction)
      setPredictions(mapped)

      // overall assessment / metadata
  setOverallAssessment((data.overallAssessment || data.overall_assessment || data.overall) ?? null)
  setAnalysisMetadata((data.metadata || data.analysisMetadata || null) ?? null)
      
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return
      }
      setError("Failed to load predictions")
    } finally {
      setLoading(false)
    }
  }, [selectedDistrict, useAI, modelTier, temperature])

  // Trigger initial fetch and re-fetch when dependencies change
  useEffect(() => {
    fetchPredictions()
    return () => {
      // ensure any in-flight request is aborted when component unmounts or deps change
      abortControllerRef.current?.abort()
    }
  }, [fetchPredictions])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-green-600" />
      case "worsening":
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "environmental":
        return "bg-green-100 text-green-800 border-green-200"
      case "economic":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "health":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendBadgeColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "bg-green-100 text-green-800 border-green-200"
      case "worsening":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Predictive Risk Analysis</h1>
                <p className="text-sm text-gray-600">
                  Rwanda - {filteredPredictions.length} of {predictions.length} districts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white">
                <Brain className="w-4 h-4 text-blue-600" />
                <Label htmlFor="ai-mode" className="text-sm font-medium cursor-pointer">
                  AI Analysis
                </Label>
                <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} />
                {useAI && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings2 className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">AI Configuration</h4>
                          <p className="text-xs text-gray-600">Customize the AI model parameters</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Model Tier</Label>
                          <Select value={modelTier} onValueChange={setModelTier}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fast">Fast (8B)</SelectItem>
                              <SelectItem value="balanced">Balanced (70B)</SelectItem>
                              <SelectItem value="accurate">Accurate (70B+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Temperature</Label>
                            <span className="text-xs text-gray-600">{temperature.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[temperature]}
                            onValueChange={([value]) => setTemperature(value)}
                            min={0}
                            max={1}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="All Districts" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      All Districts
                    </div>
                  </SelectItem>
                  {rwandaDistricts.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name} ({d.province})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {useAI && overallAssessment && selectedDistrict === "all" && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">National Assessment</h3>
                      <p className="text-sm text-gray-600">
                        Analysis across all {predictions.length} districts
                      </p>
                    </div>
                    {analysisMetadata && (
                      <Badge variant="outline" className="text-xs">
                        {analysisMetadata.provider ?? 'AI'} • {analysisMetadata.modelTier ?? modelTier}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getTrendBadgeColor(String(overallAssessment?.nationalTrend ?? 'stable'))}>
                          {overallAssessment?.nationalTrend ?? 'stable'}
                        </Badge>
                        <span className="text-sm font-medium">National Trend</span>
                      </div>
                      {overallAssessment?.highRiskDistricts && overallAssessment.highRiskDistricts.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-600">High-risk: </span>
                          <span className="font-medium">{overallAssessment.highRiskDistricts.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    
                    {overallAssessment?.emergingPatterns && overallAssessment.emergingPatterns.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Emerging Patterns</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {overallAssessment.emergingPatterns.map((pattern: string, i: number) => (
                            <li key={i}>• {pattern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-600">
                    {useAI ? "Running AI analysis..." : "Loading predictions..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
                <h3 className="font-semibold">Error Loading Predictions</h3>
                <p className="text-gray-600">{error}</p>
                <Button onClick={fetchPredictions} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredPredictions.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <p className="text-gray-600">No predictions available for selected district</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPredictions.map((prediction) => (
              <Card key={prediction.districtId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{prediction.districtName}</CardTitle>
                      <CardDescription>{prediction.province} Province</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(prediction.trend)}
                      <Badge className={getTrendBadgeColor(prediction.trend)}>
                        {prediction.trend}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Model confidence:</span>
                    <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Current Risk</div>
                      <div className="text-2xl font-bold text-blue-600">{prediction.currentRisk}%</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Predicted Risk</div>
                      <div className="text-2xl font-bold text-purple-600">{prediction.predictedRisk}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Risk Factors</h4>
                    <div className="space-y-2">
                      {prediction.factors.slice(0, 3).map((factor, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Badge variant="outline" className={getCategoryColor(factor.category)}>
                            {factor.name}
                          </Badge>
                          <span className="text-sm text-gray-600">{factor.impact.toFixed(1)}% impact</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {prediction.insights && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">AI Insights</h4>
                      <p className="text-sm text-gray-600">{prediction.insights}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}