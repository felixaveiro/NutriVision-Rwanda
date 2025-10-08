"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Target, DollarSign, Clock, TrendingUp, CheckCircle2, Heart, BookOpen, Building2, Filter, Sparkles, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface Intervention {
  id: string
  title: string
  description: string
  category: string
  priority: string
  estimatedImpact: number
  feasibility: number
  cost: string
  timeframe: string
  targetDistricts: string[]
  targetPopulation?: number
  successRate?: number
}

const rwandaDistricts = [
  { id: "1", name: "Gasabo", province: "Kigali" },
  { id: "2", name: "Kicukiro", province: "Kigali" },
  { id: "3", name: "Nyarugenge", province: "Kigali" },
  { id: "4", name: "Gisagara", province: "Southern" },
  { id: "5", name: "Huye", province: "Southern" },
  { id: "6", name: "Kamonyi", province: "Southern" },
  { id: "7", name: "Muhanga", province: "Southern" },
  { id: "8", name: "Nyamagabe", province: "Southern" },
  { id: "9", name: "Nyanza", province: "Southern" },
  { id: "10", name: "Nyaruguru", province: "Southern" },
  { id: "11", name: "Ruhango", province: "Southern" },
  { id: "12", name: "Karongi", province: "Western" },
  { id: "13", name: "Ngororero", province: "Western" },
  { id: "14", name: "Nyabihu", province: "Western" },
  { id: "15", name: "Nyamasheke", province: "Western" },
  { id: "16", name: "Rubavu", province: "Western" },
  { id: "17", name: "Rusizi", province: "Western" },
  { id: "18", name: "Rutsiro", province: "Western" },
  { id: "19", name: "Burera", province: "Northern" },
  { id: "20", name: "Gakenke", province: "Northern" },
  { id: "21", name: "Gicumbi", province: "Northern" },
  { id: "22", name: "Musanze", province: "Northern" },
  { id: "23", name: "Rulindo", province: "Northern" },
  { id: "24", name: "Bugesera", province: "Eastern" },
  { id: "25", name: "Gatsibo", province: "Eastern" },
  { id: "26", name: "Kayonza", province: "Eastern" },
  { id: "27", name: "Kirehe", province: "Eastern" },
  { id: "28", name: "Ngoma", province: "Eastern" },
  { id: "29", name: "Nyagatare", province: "Eastern" },
  { id: "30", name: "Rwamagana", province: "Eastern" },
]

// Mock data generator
const generateMockInterventions = (): Intervention[] => {
  const interventions = [
    {
      id: "1",
      title: "Community Nutrition Education Program",
      description: "Comprehensive nutrition education targeting mothers and caregivers to improve child feeding practices and dietary diversity through community health workers.",
      category: "nutrition",
      priority: "high",
      estimatedImpact: 0.85,
      feasibility: 0.92,
      cost: "$250,000 - $400,000",
      timeframe: "12-18 months",
      targetDistricts: ["4", "8", "10", "15"],
      targetPopulation: 45000,
      successRate: 87
    },
    {
      id: "2",
      title: "School Feeding Enhancement Initiative",
      description: "Expand and improve school feeding programs with fortified meals, focusing on primary schools in high-malnutrition districts to improve attendance and learning outcomes.",
      category: "nutrition",
      priority: "high",
      estimatedImpact: 0.78,
      feasibility: 0.88,
      cost: "$500,000 - $750,000",
      timeframe: "18-24 months",
      targetDistricts: ["4", "8", "10", "15", "17", "19"],
      targetPopulation: 68000,
      successRate: 82
    },
    {
      id: "3",
      title: "Agricultural Diversification Support",
      description: "Provide farmers with seeds, training, and resources to diversify crops beyond staples, promoting nutrient-rich vegetables and legumes for household consumption.",
      category: "agriculture",
      priority: "high",
      estimatedImpact: 0.82,
      feasibility: 0.85,
      cost: "$300,000 - $500,000",
      timeframe: "24-36 months",
      targetDistricts: ["12", "13", "15", "18", "24", "27"],
      targetPopulation: 35000,
      successRate: 79
    },
    {
      id: "4",
      title: "Mobile Health Nutrition Clinics",
      description: "Deploy mobile health units to remote areas for regular nutritional screening, supplementation distribution, and treatment of acute malnutrition cases.",
      category: "health",
      priority: "high",
      estimatedImpact: 0.90,
      feasibility: 0.75,
      cost: "$400,000 - $600,000",
      timeframe: "12-18 months",
      targetDistricts: ["19", "20", "21", "29"],
      targetPopulation: 52000,
      successRate: 91
    },
    {
      id: "5",
      title: "Micronutrient Supplementation Campaign",
      description: "Large-scale distribution of vitamin A, iron, and zinc supplements through health centers and community health workers, targeting children under 5 and pregnant women.",
      category: "health",
      priority: "high",
      estimatedImpact: 0.88,
      feasibility: 0.95,
      cost: "$150,000 - $250,000",
      timeframe: "6-12 months",
      targetDistricts: ["4", "8", "10", "15", "17", "19", "20"],
      targetPopulation: 95000,
      successRate: 94
    },
    {
      id: "6",
      title: "Water and Sanitation Infrastructure",
      description: "Construct safe water points and improved sanitation facilities in target communities to reduce water-borne diseases that contribute to malnutrition.",
      category: "infrastructure",
      priority: "medium",
      estimatedImpact: 0.72,
      feasibility: 0.68,
      cost: "$800,000 - $1,200,000",
      timeframe: "24-36 months",
      targetDistricts: ["24", "27", "29"],
      targetPopulation: 28000,
      successRate: 75
    },
    {
      id: "7",
      title: "Kitchen Garden Training Program",
      description: "Train households in establishing and maintaining kitchen gardens for year-round access to fresh vegetables, with focus on nutrition-sensitive agriculture practices.",
      category: "agriculture",
      priority: "medium",
      estimatedImpact: 0.76,
      feasibility: 0.90,
      cost: "$100,000 - $200,000",
      timeframe: "12-18 months",
      targetDistricts: ["1", "2", "3", "6", "9"],
      targetPopulation: 22000,
      successRate: 85
    },
    {
      id: "8",
      title: "Adolescent Nutrition Education",
      description: "School-based nutrition education program targeting adolescents to promote healthy eating habits, with special focus on adolescent girls to break intergenerational malnutrition cycles.",
      category: "education",
      priority: "medium",
      estimatedImpact: 0.70,
      feasibility: 0.88,
      cost: "$180,000 - $300,000",
      timeframe: "18-24 months",
      targetDistricts: ["1", "2", "3", "5", "7", "16"],
      targetPopulation: 41000,
      successRate: 81
    },
    {
      id: "9",
      title: "Community Health Worker Capacity Building",
      description: "Enhanced training and equipment for community health workers to improve early detection and management of malnutrition cases at the community level.",
      category: "health",
      priority: "high",
      estimatedImpact: 0.84,
      feasibility: 0.92,
      cost: "$200,000 - $350,000",
      timeframe: "6-12 months",
      targetDistricts: ["4", "8", "10", "15", "17", "19", "20", "29"],
      targetPopulation: 78000,
      successRate: 89
    },
    {
      id: "10",
      title: "Food Fortification Market Incentives",
      description: "Provide incentives to local food processors to fortify staple foods with essential micronutrients and improve market access for fortified products.",
      category: "nutrition",
      priority: "medium",
      estimatedImpact: 0.80,
      feasibility: 0.78,
      cost: "$350,000 - $550,000",
      timeframe: "18-30 months",
      targetDistricts: ["1", "2", "3", "5", "16", "22"],
      targetPopulation: 125000,
      successRate: 77
    },
  ]
  return interventions
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterventions()
  }, [])

  const filterInterventionsCb = useCallback(() => {
    let filtered = [...interventions]
    
    if (selectedDistrict !== "all") {
      filtered = filtered.filter(i => i.targetDistricts.includes(selectedDistrict))
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(i => i.category === selectedCategory)
    }
    
    // Sort by priority and impact
    filtered.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      if (priorityDiff !== 0) return priorityDiff
      return b.estimatedImpact - a.estimatedImpact
    })
    
    setFilteredInterventions(filtered)
  }, [selectedDistrict, selectedCategory, interventions])

  useEffect(() => {
    filterInterventionsCb()
  }, [filterInterventionsCb])

  const fetchInterventions = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockData = generateMockInterventions()
    setInterventions(mockData)
    setLoading(false)
  }

  // filterInterventions is handled via filterInterventionsCb (useCallback)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5"
    switch (category) {
      case "nutrition":
        return <Heart className={iconClass} />
      case "agriculture":
        return <TrendingUp className={iconClass} />
      case "health":
        return <CheckCircle2 className={iconClass} />
      case "education":
        return <BookOpen className={iconClass} />
      case "infrastructure":
        return <Building2 className={iconClass} />
      default:
        return <Target className={iconClass} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "nutrition":
        return "bg-[#005BAB]/10 text-[#005BAB] border-[#005BAB]/20"
      case "agriculture":
        return "bg-green-50 text-green-700 border-green-200"
      case "health":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "education":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "infrastructure":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E8EB] to-[#005BAB]/10">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-[#005BAB]/10 to-[#E6E8EB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-[#005BAB]/10 to-[#E6E8EB]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-[#005BAB]/10">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2 text-[#005BAB]" />
                  <span className="text-[#005BAB] font-medium">Back</span>
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#005BAB] to-[#005BAB]/80">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Intervention Recommender</h1>
                </div>
                <p className="text-sm text-gray-600">
                  Evidence-based interventions prioritized by impact and feasibility
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-full sm:w-[200px] border-[#E6E8EB] focus:ring-[#005BAB] focus:border-[#005BAB]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#005BAB]" />
                    <SelectValue placeholder="District" />
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
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.province})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] border-[#E6E8EB] focus:ring-[#005BAB] focus:border-[#005BAB]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#005BAB]" />
                    <SelectValue placeholder="Category" />
                  </div>
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {loading ? (
          <Card className="p-12 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#005BAB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-600">Loading interventions...</p>
              </div>
            </div>
          </Card>
        ) : filteredInterventions.length === 0 ? (
          <Card className="p-12 text-center bg-white/95 backdrop-blur-md shadow-lg rounded-2xl">
            <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No interventions found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#005BAB] to-[#005BAB]/80">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Total Interventions</div>
                    <div className="text-3xl font-bold text-gray-900">{filteredInterventions.length}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">High Priority</div>
                    <div className="text-3xl font-bold text-red-600">
                      {filteredInterventions.filter((i) => i.priority === "high").length}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Avg Impact</div>
                    <div className="text-3xl font-bold text-green-600">
                      {(
                        (filteredInterventions.reduce((sum, i) => sum + i.estimatedImpact, 0) / filteredInterventions.length) *
                        100
                      ).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#005BAB] to-[#005BAB]/80">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Target Population</div>
                    <div className="text-3xl font-bold text-[#005BAB]">
                      {(filteredInterventions.reduce((sum, i) => sum + (i.targetPopulation || 0), 0) / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interventions List */}
            <div className="space-y-6">
              {filteredInterventions.map((intervention, index) => (
                <Card key={intervention.id} className="p-6 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-[#005BAB]/10 to-[#005BAB]/5 text-[#005BAB]">
                          {getCategoryIcon(intervention.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-[#005BAB]/10 text-[#005BAB] text-xs font-bold">
                              #{index + 1}
                            </span>
                            <Badge className={`${getPriorityColor(intervention.priority)} font-semibold`}>
                              {intervention.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <Badge className={`${getCategoryColor(intervention.category)} font-medium capitalize`}>
                              {intervention.category}
                            </Badge>
                            {intervention.successRate && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {intervention.successRate}% Success Rate
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{intervention.title}</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {intervention.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gradient-to-r from-[#E6E8EB]/50 to-[#005BAB]/5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#005BAB]" />
                            Estimated Impact
                          </span>
                          <span className="text-lg font-bold text-[#005BAB]">{(intervention.estimatedImpact * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={intervention.estimatedImpact * 100} className="h-3 bg-gray-200" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Feasibility
                          </span>
                          <span className="text-lg font-bold text-green-600">{(intervention.feasibility * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={intervention.feasibility * 100} className="h-3 bg-gray-200" />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-blue-700 font-semibold mb-1">Estimated Cost</div>
                          <div className="text-sm font-bold text-blue-900">{intervention.cost}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-purple-700 font-semibold mb-1">Timeframe</div>
                          <div className="text-sm font-bold text-purple-900">{intervention.timeframe}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
                        <div className="p-2 rounded-lg bg-green-500 text-white">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-green-700 font-semibold mb-1">Target Districts</div>
                          <div className="text-sm font-bold text-green-900">{intervention.targetDistricts.length} Districts</div>
                        </div>
                      </div>
                      
                      {intervention.targetPopulation && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200">
                          <div className="p-2 rounded-lg bg-orange-500 text-white">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs text-orange-700 font-semibold mb-1">Target Population</div>
                            <div className="text-sm font-bold text-orange-900">{intervention.targetPopulation.toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Districts */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-[#005BAB]" />
                        <span className="text-sm font-semibold text-gray-700">Target Districts:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {intervention.targetDistricts.map((districtId) => {
                          const district = rwandaDistricts.find((d) => d.id === districtId)
                          return (
                            <Badge key={districtId} variant="secondary" className="bg-[#005BAB]/10 text-[#005BAB] border-[#005BAB]/20 hover:bg-[#005BAB]/20 transition-colors">
                              {district?.name || districtId}
                            </Badge>
                          )
                        })}
                      </div>
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


