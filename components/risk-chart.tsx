/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useEffect, useState } from "react"

export function RiskChart() {
  const [data, setData] = useState<Array<{ name: string; risk: number; level: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/predictions")
        const result = await response.json()

        if (result.predictions && result.predictions.length > 0) {
          const chartData = result.predictions
            .filter((p: any) => p.currentRisk != null && !isNaN(p.currentRisk))
            .sort((a: any, b: any) => (b.currentRisk ?? 0) - (a.currentRisk ?? 0))
            .slice(0, 10)
            .map((p: any) => {
              const riskValue = p.currentRisk ?? 0
              return {
                name: p.district && p.district.length > 10 ? p.district.substring(0, 10) : p.district || "Unknown",
                risk: Math.round(riskValue),
                level: riskValue >= 70 ? "critical" : riskValue >= 55 ? "high" : riskValue >= 40 ? "medium" : "low",
              }
            })

          setData(chartData)
        }
      } catch (error) {
        console.error("[v0] Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getColor = (level: string) => {
    switch (level) {
      case "critical":
        return "hsl(var(--destructive))"
      case "high":
        return "hsl(var(--chart-3))"
      case "medium":
        return "hsl(var(--chart-1))"
      case "low":
        return "hsl(var(--chart-4))"
      default:
        return "hsl(var(--muted))"
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Risk Score by District</h3>
            <p className="text-sm text-muted-foreground">Current malnutrition risk assessment</p>
          </div>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart data...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Risk Score by District</h3>
          <p className="text-sm text-muted-foreground">Top 10 highest risk districts</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.level)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
