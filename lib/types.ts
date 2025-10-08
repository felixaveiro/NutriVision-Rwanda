export interface District {
  id: string
  name: string
  province: string // Added province field to identify which province each district belongs to
  coordinates: [number, number]
  population: number
  malnutritionRate: number
  stuntingRate: number
  wastingRate: number
  anemia: number
  vitaminADeficiency: number
  zincDeficiency: number
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
}

export interface PredictionResult {
  districtId: string
  districtName: string
  // Legacy/compatibility fields used across the UI
  district?: string
  currentRisk: number
  predictedRisk: number
  predictedRisk3m?: number
  predictedRisk6m?: number
  trend: "improving" | "stable" | "worsening"
  confidence: number
  factors: RiskFactor[]
  // Legacy alias used in some components
  keyFactors?: RiskFactor[]
  insights?: {
    primaryConcerns: string[]
    dataGaps: string[]
    recommendations: string[]
  }
}

export interface RiskFactor {
  name: string
  impact: number
  category: "environmental" | "economic" | "health" | "infrastructure"
  description: string
}

export interface Intervention {
  id: string
  title: string
  description: string
  targetDistricts: string[]
  estimatedImpact: number
  feasibility: number
  cost: string
  timeframe: string
  priority: "high" | "medium" | "low"
  category: "nutrition" | "agriculture" | "health" | "education" | "infrastructure"
}

export interface PolicyBrief {
  id: string
  sector: string
  title: string
  summary: string
  keyFindings: string[]
  recommendations: string[]
  targetDistricts: string[]
  generatedAt: Date
}
