/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles, Brain, Settings2 } from "lucide-react"
import Link from "next/link"
import type { PredictionResult } from "@/lib/types"
import { rwandaDistricts } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitFallback, setRateLimitFallback] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [overallAssessment, setOverallAssessment] = useState<any>(null)
  const [provider] = useState("groq")
  const [modelTier, setModelTier] = useState("balanced")
  const [temperature, setTemperature] = useState(0.3)
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isRequestInProgressRef = useRef(false)

  useEffect(() => {
    fetchPredictions()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [selectedDistrict, useAI, modelTier, temperature])

  const fetchPredictions = async () => {
    if (isRequestInProgressRef.current) {
      console.log("[v0] Request already in progress, skipping...")
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isRequestInProgressRef.current = true

    setLoading(true)
    setError(null)
    setRateLimitFallback(false)

    try {
      const aiParam = useAI ? "&ai=true" : ""
      const url =
        selectedDistrict === "all"
          ? `/api/predictions?${aiParam.slice(1)}`
          : `/api/predictions?district=${selectedDistrict}${aiParam}`

      const aiConfig = {
        provider,
        modelTier,
        temperature,
      }

      const response = await fetch(url, {
        method: useAI ? "POST" : "GET",
        headers: useAI ? { "Content-Type": "application/json" } : {},
        body: useAI ? JSON.stringify(aiConfig) : undefined,
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("rate_limit") || errorText.includes("Rate limit")) {
          setRateLimitFallback(true)
          try {
            const data = JSON.parse(errorText)
            if (data.predictions || Array.isArray(data)) {
              if (data.predictions && Array.isArray(data.predictions)) {
                setPredictions(data.predictions)
                setOverallAssessment(null)
                setAnalysisMetadata(null)
              } else if (Array.isArray(data)) {
                setPredictions(data)
                setOverallAssessment(null)
                setAnalysisMetadata(null)
              }
              return
            }
          } catch {}
        }
        throw new Error(`Failed to fetch predictions: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Predictions data received:", JSON.stringify(data).slice(0, 200) + "...")

      if (data.predictions && Array.isArray(data.predictions)) {
        setPredictions(data.predictions)
        setOverallAssessment(data.overallAssessment || null)
        setAnalysisMetadata(data.metadata || null)
      } else if (Array.isArray(data)) {
        setPredictions(data)
        setOverallAssessment(null)
        setAnalysisMetadata(null)
      } else if (data && typeof data === "object") {
        setPredictions([data])
        setOverallAssessment(null)
        setAnalysisMetadata(null)
      } else {
        setPredictions([])
        setOverallAssessment(null)
        setAnalysisMetadata(null)
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("[v0] Request aborted")
        return
      }
      console.error("[v0] Error fetching predictions:", err)
      setError(err instanceof Error ? err.message : "Failed to load predictions")
    } finally {
      setLoading(false)
      isRequestInProgressRef.current = false
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-primary" />
      case "worsening":
        return <TrendingUp className="w-4 h-4 text-destructive" />
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "environmental":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "economic":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "health":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
      case "infrastructure":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Predictive Risk Analysis</h1>
                <p className="text-sm text-muted-foreground">
                  ML-powered malnutrition risk forecasts and root cause analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
                <Brain className="w-4 h-4 text-primary" />
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
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">AI Configuration</h4>
                          <p className="text-xs text-muted-foreground">Customize the AI model and parameters</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Provider</Label>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted">
                            <Brain className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Groq (Fast & Reliable)</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Using Groq&apos;s high-performance inference engine
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Model Tier</Label>
                          <Select value={modelTier} onValueChange={setModelTier}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fast">Fast (llama-3.1-8b-instant)</SelectItem>
                              <SelectItem value="balanced">Balanced (llama-3.3-70b-versatile)</SelectItem>
                              <SelectItem value="accurate">Accurate (llama3-70b-8192)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Temperature</Label>
                            <span className="text-xs text-muted-foreground">{temperature.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[temperature]}
                            onValueChange={([value]) => setTemperature(value)}
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Lower = more consistent, Higher = more creative
                          </p>
                        </div>

                        {analysisMetadata && (
                          <div className="pt-2 border-t space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Model: <span className="font-mono">{analysisMetadata.modelUsed}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Analysis time: {analysisMetadata.analysisTimeMs}ms
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Data quality: {analysisMetadata.dataQualityScore?.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {rwandaDistricts.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {rateLimitFallback && (
          <Card className="p-4 mb-6 border-2 border-chart-1/50 bg-chart-1/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-1 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">AI Rate Limit Reached</h3>
                <p className="text-sm text-muted-foreground">
                  The AI analysis service has reached its daily token limit. Showing statistical predictions instead. AI
                  analysis will be available again soon.
                </p>
              </div>
            </div>
          </Card>
        )}

        {useAI && overallAssessment && (
          <Card className="p-6 mb-6 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-primary mt-1" />
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">AI-Powered National Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced analysis across {predictions.length} districts using{" "}
                      {analysisMetadata?.modelUsed || "AI"}
                    </p>
                  </div>
                  {analysisMetadata && (
                    <Badge variant="outline" className="text-xs">
                      {analysisMetadata.provider} • {analysisMetadata.modelTier}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={overallAssessment.nationalTrend === "worsening" ? "destructive" : "default"}>
                        {overallAssessment.nationalTrend}
                      </Badge>
                      <span className="text-sm font-medium">National Trend</span>
                    </div>
                    {overallAssessment.highRiskDistricts && overallAssessment.highRiskDistricts.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">High-risk districts: </span>
                        <span className="font-medium">{overallAssessment.highRiskDistricts.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {overallAssessment.emergingPatterns && overallAssessment.emergingPatterns.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Emerging Patterns</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {overallAssessment.emergingPatterns.slice(0, 3).map((pattern: string, i: number) => (
                          <li key={i}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                {useAI ? "Running AI analysis..." : "Loading predictions..."}
              </p>
            </div>
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="font-semibold">Error Loading Predictions</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={fetchPredictions} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </Card>
        ) : predictions.length === 0 ? (
          <Card className="p-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No predictions available</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {predictions.map((prediction, idx) => (
              <Card key={prediction.districtId || idx} className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {prediction.districtName || prediction.districtId || "Unknown District"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Model confidence: {((prediction.confidence ?? 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(prediction.trend || "stable")}
                      <Badge variant={prediction.trend === "worsening" ? "destructive" : "default"}>
                        {prediction.trend || "stable"}
                      </Badge>
                    </div>
                  </div>

                  {/* Risk Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Risk</span>
                        <span className="text-2xl font-bold">{(prediction.currentRisk ?? 0).toFixed(1)}</span>
                      </div>
                      <Progress value={prediction.currentRisk ?? 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">3-Month Forecast</span>
                        <span className="text-2xl font-bold">{(prediction.predictedRisk ?? 0).toFixed(1)}</span>
                      </div>
                      <Progress value={prediction.predictedRisk ?? 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">6-Month Forecast</span>
                        <span className="text-2xl font-bold">{(prediction.predictedRisk ?? 0).toFixed(1)}</span>
                      </div>
                      <Progress value={prediction.predictedRisk ?? 0} className="h-2" />
                    </div>
                  </div>

                  {useAI && prediction.insights && (
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">AI Insights</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {prediction.insights.primaryConcerns && prediction.insights.primaryConcerns.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-destructive">Primary Concerns</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {prediction.insights.primaryConcerns.map((concern, i) => (
                                <li key={i}>• {concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {prediction.insights.dataGaps && prediction.insights.dataGaps.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-chart-1">Data Gaps</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {prediction.insights.dataGaps.map((gap, i) => (
                                <li key={i}>• {gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {prediction.insights.recommendations && prediction.insights.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-primary">Recommendations</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {prediction.insights.recommendations.map((rec, i) => (
                                <li key={i}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Root Cause Analysis */}
                  {prediction.factors && prediction.factors.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Root Cause Analysis</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Key factors contributing to malnutrition risk in this district
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(prediction.factors || []).map((factor: any, index: number) => (
                          <Card key={index} className="p-4 border-2">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{factor.factor || "Unknown Factor"}</h4>
                                  {factor.category && (
                                    <Badge
                                      variant="outline"
                                      className={`mt-1 text-xs ${getCategoryColor(factor.category)}`}
                                    >
                                      {factor.category}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">{((factor.impact ?? 0) * 100).toFixed(0)}%</div>
                                  <div className="text-xs text-muted-foreground">impact</div>
                                </div>
                              </div>
                              {factor.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{factor.description}</p>
                              )}
                              <Progress value={(factor.impact ?? 0) * 100} className="h-1" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
