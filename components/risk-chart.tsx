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
        return "#DC2626" // Red-600
      case "high":
        return "#F97316" // Orange-500
      case "medium":
        return "#EAB308" // Yellow-500
      case "low":
        return "#22C55E" // Green-500
      default:
        return "#9CA3AF" // Gray-400
    }
  }

  const getGradient = (level: string) => {
    switch (level) {
      case "critical":
        return "url(#criticalGradient)"
      case "high":
        return "url(#highGradient)"
      case "medium":
        return "url(#mediumGradient)"
      case "low":
        return "url(#lowGradient)"
      default:
        return "#9CA3AF"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-[300px] sm:h-[400px] lg:h-[520px] flex items-center justify-center text-gray-400 text-base sm:text-lg">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#005BAB] mx-auto"></div>
            <p className="text-sm sm:text-base">Loading chart data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Professional Legend with Statistics */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border sm:border-2 border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-1 sm:gap-0">
          <h4 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-slate-700 tracking-wide">RISK CLASSIFICATION</h4>
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 font-medium">Top 10 Districts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
          <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 lg:p-3 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-red-500 to-red-600 rounded shadow-sm flex-shrink-0"></div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-700">CRITICAL</p>
            </div>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 font-medium">Score ≥ 70</p>
          </div>
          <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 lg:p-3 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded shadow-sm flex-shrink-0"></div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-700">HIGH</p>
            </div>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 font-medium">Score 55-69</p>
          </div>
          <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 lg:p-3 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded shadow-sm flex-shrink-0"></div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-700">MEDIUM</p>
            </div>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 font-medium">Score 40-54</p>
          </div>
          <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 lg:p-3 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-green-500 to-green-600 rounded shadow-sm flex-shrink-0"></div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-700">LOW</p>
            </div>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 font-medium">Score &lt; 40</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Chart */}
      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
        <ResponsiveContainer width="100%" height={300} className="sm:hidden">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 5, left: -5, bottom: 60 }}
            barGap={4}
          >
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={1}/>
                <stop offset="100%" stopColor="#991B1B" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={1}/>
                <stop offset="100%" stopColor="#C2410C" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EAB308" stopOpacity={1}/>
                <stop offset="100%" stopColor="#A16207" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={1}/>
                <stop offset="100%" stopColor="#15803D" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E2E8F0" 
              vertical={false}
              strokeOpacity={0.6}
            />
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={9}
              fontWeight={600}
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 1.5 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={9}
              fontWeight={600}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 1.5 }}
              tickLine={{ stroke: '#CBD5E1' }}
              width={35}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "2px solid #E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "10px 12px",
                fontSize: "11px"
              }}
              labelStyle={{ 
                fontWeight: 700, 
                color: "#0F172A", 
                marginBottom: "4px",
                fontSize: "11px",
              }}
              itemStyle={{
                color: "#475569",
                fontWeight: 600,
                fontSize: "10px"
              }}
              formatter={(value: any, name: string, props: any) => {
                const level = props.payload.level
                const levelText = level.charAt(0).toUpperCase() + level.slice(1)
                return [
                  <span key="value" style={{ color: getColor(level), fontWeight: 700 }}>{value}</span>, 
                  <span key="label" style={{ color: '#64748B' }}>{`${levelText} Risk`}</span>
                ]
              }}
            />
            <Bar 
              dataKey="risk" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={30}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getGradient(entry.level)}
                  stroke={getColor(entry.level)}
                  strokeWidth={1}
                  opacity={0.95}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <ResponsiveContainer width="100%" height={380} className="hidden sm:block lg:hidden">
          <BarChart 
            data={data} 
            margin={{ top: 15, right: 10, left: 0, bottom: 70 }}
            barGap={6}
          >
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={1}/>
                <stop offset="100%" stopColor="#991B1B" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={1}/>
                <stop offset="100%" stopColor="#C2410C" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EAB308" stopOpacity={1}/>
                <stop offset="100%" stopColor="#A16207" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={1}/>
                <stop offset="100%" stopColor="#15803D" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E2E8F0" 
              vertical={false}
              strokeOpacity={0.6}
            />
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={11}
              fontWeight={600}
              angle={-45}
              textAnchor="end"
              height={85}
              tick={{ fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 1.5 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={11}
              fontWeight={600}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 1.5 }}
              tickLine={{ stroke: '#CBD5E1' }}
              label={{ 
                value: 'Risk Score', 
                angle: -90, 
                position: 'insideLeft', 
                style: { 
                  fill: '#1E293B', 
                  fontWeight: 700,
                  fontSize: 11,
                } 
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "2px solid #E2E8F0",
                borderRadius: "14px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "12px 14px",
              }}
              labelStyle={{ 
                fontWeight: 700, 
                color: "#0F172A", 
                marginBottom: "5px",
                fontSize: "12px",
              }}
              itemStyle={{
                color: "#475569",
                fontWeight: 600,
                fontSize: "11px"
              }}
              formatter={(value: any, name: string, props: any) => {
                const level = props.payload.level
                const levelText = level.charAt(0).toUpperCase() + level.slice(1)
                return [
                  <span key="value" style={{ color: getColor(level), fontWeight: 700 }}>{value}</span>, 
                  <span key="label" style={{ color: '#64748B' }}>{`${levelText} Risk`}</span>
                ]
              }}
            />
            <Bar 
              dataKey="risk" 
              radius={[8, 8, 0, 0]} 
              maxBarSize={40}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getGradient(entry.level)}
                  stroke={getColor(entry.level)}
                  strokeWidth={1.5}
                  opacity={0.95}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <ResponsiveContainer width="100%" height={450} className="hidden lg:block">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 15, left: 5, bottom: 80 }}
            barGap={8}
          >
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={1}/>
                <stop offset="100%" stopColor="#991B1B" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={1}/>
                <stop offset="100%" stopColor="#C2410C" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EAB308" stopOpacity={1}/>
                <stop offset="100%" stopColor="#A16207" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={1}/>
                <stop offset="100%" stopColor="#15803D" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E2E8F0" 
              vertical={false}
              strokeOpacity={0.6}
            />
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={12}
              fontWeight={600}
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 2 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={12}
              fontWeight={600}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1', strokeWidth: 2 }}
              tickLine={{ stroke: '#CBD5E1' }}
              label={{ 
                value: 'Malnutrition Risk Score', 
                angle: -90, 
                position: 'insideLeft', 
                style: { 
                  fill: '#1E293B', 
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.5px'
                } 
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "2px solid #E2E8F0",
                borderRadius: "16px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                padding: "14px 16px",
              }}
              labelStyle={{ 
                fontWeight: 700, 
                color: "#0F172A", 
                marginBottom: "6px",
                fontSize: "13px",
                letterSpacing: "0.3px"
              }}
              itemStyle={{
                color: "#475569",
                fontWeight: 600,
                fontSize: "12px"
              }}
              formatter={(value: any, name: string, props: any) => {
                const level = props.payload.level
                const levelText = level.charAt(0).toUpperCase() + level.slice(1)
                return [
                  <span style={{ color: getColor(level), fontWeight: 700 }}>{value}</span>, 
                  <span style={{ color: '#64748B' }}>{`${levelText} Risk`}</span>
                ]
              }}
            />
            <Bar 
              dataKey="risk" 
              radius={[10, 10, 0, 0]} 
              maxBarSize={50}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getGradient(entry.level)}
                  stroke={getColor(entry.level)}
                  strokeWidth={1.5}
                  opacity={0.95}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Data Source Footer */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 text-center font-medium">
            Data Source: NISR Dataset | Updated: November 2025 | Confidence Level: 95%+
          </p>
        </div>
      </div>
    </div>
  )
}
