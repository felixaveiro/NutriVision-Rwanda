/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DistrictPrediction {
  district: string
  // compatibility fields
  districtId?: string
  districtName?: string
  currentRisk: number
  predictedRisk3m: number
  predictedRisk6m: number
  confidence: number
  trend: "improving" | "stable" | "worsening"
  keyFactors: Array<{
    factor: string
    impact: number
  }>
}

export function MapView() {
  const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null)
  const [predictions, setPredictions] = useState<DistrictPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const response = await fetch("/api/predictions")
        const data = await response.json()
        setPredictions(data.predictions || [])
      } catch (error) {
        console.error("[v0] Error fetching predictions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPredictions()
  }, [])

  const getRiskColor = (riskScore: number) => {
    if (!riskScore || isNaN(riskScore)) return "rgb(107, 114, 128)" // gray for invalid
    if (riskScore >= 70) return "rgb(220, 38, 38)" // critical
    if (riskScore >= 55) return "rgb(249, 115, 22)" // high
    if (riskScore >= 40) return "rgb(234, 179, 8)" // medium
    return "rgb(34, 197, 94)" // low
  }

  const getRiskLevel = (riskScore: number) => {
    if (!riskScore || isNaN(riskScore)) return "unknown"
    if (riskScore >= 70) return "critical"
    if (riskScore >= 55) return "high"
    if (riskScore >= 40) return "medium"
    return "low"
  }

  const getRiskSize = (riskScore: number) => {
    if (!riskScore || isNaN(riskScore)) return 50
    return Math.max(40, Math.min(120, riskScore * 1.2))
  }

  const getDistrictCoordinates = (districtName: string): [number, number] => {
    const coordMap: Record<string, [number, number]> = {
      Kigali: [-1.9536, 30.0606],
      Nyarugenge: [-1.9667, 30.0583],
      Gasabo: [-1.9167, 30.1167],
      Kicukiro: [-1.9833, 30.1],
      Nyanza: [-2.35, 29.75],
      Gisagara: [-2.6, 29.8],
      Nyaruguru: [-2.7, 29.5],
      Huye: [-2.6, 29.75],
      Nyamagabe: [-2.5, 29.6],
      Ruhango: [-2.2333, 29.7833],
      Muhanga: [-2.0833, 29.75],
      Kamonyi: [-2.0167, 29.9833],
      Karongi: [-2.0, 29.4],
      Rutsiro: [-1.9833, 29.3333],
      Rubavu: [-1.6833, 29.2667],
      Nyabihu: [-1.65, 29.5],
      Ngororero: [-1.8333, 29.5],
      Rusizi: [-2.4833, 28.9],
      Nyamasheke: [-2.3333, 29.1667],
      Rulindo: [-1.7667, 30.0667],
      Gakenke: [-1.6833, 29.8],
      Musanze: [-1.5, 29.6333],
      Burera: [-1.4833, 29.8833],
      Gicumbi: [-1.5833, 30.0667],
      Rwamagana: [-1.95, 30.4333],
      Nyagatare: [-1.3, 30.3333],
      Gatsibo: [-1.5833, 30.4167],
      Kayonza: [-1.8833, 30.5833],
      Kirehe: [-2.2167, 30.7167],
      Ngoma: [-2.15, 30.5],
      Bugesera: [-2.2833, 30.2],
    }
    return coordMap[districtName] || [-2.0, 29.9]
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-muted-foreground">Loading map data...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full bg-muted/30 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23666666' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Rwanda map outline */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}
        >
          <path
            d="M 300 150 L 500 140 L 550 200 L 540 350 L 480 420 L 380 430 L 300 400 L 260 320 L 270 220 Z"
            fill="currentColor"
            className="text-muted/20"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        {/* District markers */}
        {predictions.map((prediction) => {
          const coords = getDistrictCoordinates(prediction.district)
          const x = 400 + (coords[1] - 29.8) * 200
          const y = 300 - (coords[0] + 2) * 150
          const size = getRiskSize(prediction.currentRisk)

          return (
            <div
              key={prediction.district}
              className="absolute cursor-pointer transition-all hover:scale-110"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => setSelectedDistrict(prediction)}
            >
              <div
                className="rounded-full flex items-center justify-center font-mono font-semibold text-sm shadow-lg"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: getRiskColor(prediction.currentRisk),
                  color: "white",
                }}
              >
                {prediction.currentRisk && !isNaN(prediction.currentRisk) ? Math.round(prediction.currentRisk) : "?"}
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-card px-2 py-1 rounded shadow-md">
                {prediction.district}
              </div>
            </div>
          )
        })}
      </div>

      {/* District details panel */}
      {selectedDistrict && (
        <Card className="absolute top-4 right-4 w-80 p-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedDistrict.district}</h3>
                <p className="text-sm text-muted-foreground capitalize">Trend: {selectedDistrict.trend}</p>
              </div>
              <Badge
                variant={getRiskLevel(selectedDistrict.currentRisk) === "critical" ? "destructive" : "default"}
                className="capitalize"
              >
                {getRiskLevel(selectedDistrict.currentRisk)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Risk</span>
                <span className="font-semibold">
                  {selectedDistrict.currentRisk && !isNaN(selectedDistrict.currentRisk)
                    ? Math.round(selectedDistrict.currentRisk)
                    : "N/A"}
                  /100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">3-Month Forecast</span>
                <span className="font-semibold">
                  {selectedDistrict.predictedRisk3m && !isNaN(selectedDistrict.predictedRisk3m)
                    ? Math.round(selectedDistrict.predictedRisk3m)
                    : "N/A"}
                  /100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">6-Month Forecast</span>
                <span className="font-semibold">
                  {selectedDistrict.predictedRisk6m && !isNaN(selectedDistrict.predictedRisk6m)
                    ? Math.round(selectedDistrict.predictedRisk6m)
                    : "N/A"}
                  /100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold">
                  {selectedDistrict.confidence && !isNaN(selectedDistrict.confidence)
                    ? Math.round(selectedDistrict.confidence * 100)
                    : "N/A"}
                  %
                </span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-xs font-semibold mb-2">Key Risk Factors</h4>
              <div className="space-y-1">
                {selectedDistrict.keyFactors?.slice(0, 3).map((factor: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{factor.factor}</span>
                    <span className="font-medium">
                      {factor.impact && !isNaN(factor.impact) ? Math.round(factor.impact * 100) : "N/A"}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3">
        <h4 className="text-xs font-semibold mb-2">Risk Level</h4>
        <div className="space-y-1">
          {[
            { level: "critical", score: 70 },
            { level: "high", score: 55 },
            { level: "medium", score: 40 },
            { level: "low", score: 25 },
          ].map(({ level, score }) => (
            <div key={level} className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getRiskColor(score) }} />
              <span className="capitalize">{level}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
