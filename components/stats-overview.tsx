/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

export function StatsOverview() {
  const [stats, setStats] = useState({
    totalDistricts: 0,
    highRiskCount: 0,
    criticalCount: 0,
    avgRisk: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/predictions")
        const data = await response.json()

        if (data.predictions && data.predictions.length > 0) {
          const predictions = data.predictions
          const highRisk = predictions.filter((p: any) => (p.currentRisk ?? 0) >= 55).length
          const critical = predictions.filter((p: any) => (p.currentRisk ?? 0) >= 70).length
          const totalRisk = predictions.reduce((sum: number, p: any) => sum + (p.currentRisk ?? 0), 0)
          const avgRisk = predictions.length > 0 ? totalRisk / predictions.length : 0

          setStats({
            totalDistricts: predictions.length,
            highRiskCount: highRisk,
            criticalCount: critical,
            avgRisk: avgRisk,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const displayStats = [
    {
      label: "Districts Monitored",
      value: loading ? "..." : stats.totalDistricts.toString(),
      subtext: "Real-time tracking",
      icon: Users,
      trend: null,
    },
    {
      label: "Average Risk Score",
      value: loading ? "..." : isNaN(stats.avgRisk) ? "0" : Math.round(stats.avgRisk).toString(),
      subtext: "National average",
      icon: TrendingDown,
      trend: stats.avgRisk > 55 ? "up" : "down",
    },
    {
      label: "High Risk Districts",
      value: loading ? "..." : stats.highRiskCount.toString(),
      subtext: `${stats.criticalCount} critical`,
      icon: AlertTriangle,
      trend: "up",
    },
    {
      label: "Data Sources",
      value: "NISR",
      subtext: "Rwanda surveys 2008-2024",
      icon: TrendingUp,
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayStats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                stat.trend === "up"
                  ? "bg-destructive/10 text-destructive"
                  : stat.trend === "down"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
