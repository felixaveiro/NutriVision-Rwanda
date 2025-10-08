"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Target, DollarSign, Clock, TrendingUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { Intervention } from "@/lib/types"
import { rwandaDistricts } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterventions()
  }, [selectedDistrict, selectedCategory])

  const fetchInterventions = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedDistrict !== "all") params.append("districtId", selectedDistrict)
    if (selectedCategory !== "all") params.append("category", selectedCategory)

    const response = await fetch(`/api/interventions?${params.toString()}`)
    const data = await response.json()
    setInterventions(data)
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5"
    switch (category) {
      case "nutrition":
        return <Target className={iconClass} />
      case "agriculture":
        return <TrendingUp className={iconClass} />
      case "health":
        return <CheckCircle2 className={iconClass} />
      default:
        return <Target className={iconClass} />
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
                <h1 className="text-2xl font-bold">Intervention Recommender</h1>
                <p className="text-sm text-muted-foreground">
                  Prioritized interventions ranked by impact and feasibility
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {rwandaDistricts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading interventions...</p>
            </div>
          </div>
        ) : interventions.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No interventions found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters to see more results</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total Interventions</div>
                <div className="text-2xl font-bold">{interventions.length}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">High Priority</div>
                <div className="text-2xl font-bold text-destructive">
                  {interventions.filter((i) => i.priority === "high").length}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Avg Impact</div>
                <div className="text-2xl font-bold">
                  {(
                    (interventions.reduce((sum, i) => sum + i.estimatedImpact, 0) / interventions.length) *
                    100
                  ).toFixed(0)}
                  %
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Avg Feasibility</div>
                <div className="text-2xl font-bold">
                  {((interventions.reduce((sum, i) => sum + i.feasibility, 0) / interventions.length) * 100).toFixed(0)}
                  %
                </div>
              </Card>
            </div>

            {/* Interventions List */}
            <div className="space-y-4">
              {interventions.map((intervention, index) => (
                <Card key={intervention.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {getCategoryIcon(intervention.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-muted-foreground">#{index + 1}</span>
                            <Badge variant={getPriorityColor(intervention.priority)}>
                              {intervention.priority} priority
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {intervention.category}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold">{intervention.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {intervention.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Impact</span>
                          <span className="font-semibold">{(intervention.estimatedImpact * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={intervention.estimatedImpact * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Feasibility</span>
                          <span className="font-semibold">{(intervention.feasibility * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={intervention.feasibility * 100} className="h-2" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Estimated Cost</div>
                          <div className="font-medium">{intervention.cost}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Timeframe</div>
                          <div className="font-medium">{intervention.timeframe}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Target Districts</div>
                          <div className="font-medium">{intervention.targetDistricts.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Target Districts */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Target districts:</span>
                      {intervention.targetDistricts.map((districtId) => {
                        const district = rwandaDistricts.find((d) => d.id === districtId)
                        return (
                          <Badge key={districtId} variant="secondary">
                            {district?.name || districtId}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
