"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, FileText, Download, Loader2, CheckCircle2, AlertCircle, Sparkles, MapPin, Calendar, TrendingUp, Target, BookOpen, Briefcase } from "lucide-react"
import Link from "next/link"

interface PolicyBrief {
  id: string
  title: string
  sector: string
  summary: string
  keyFindings: string[]
  recommendations: string[]
  targetDistricts: string[]
  generatedAt: string
}

const rwandaDistricts = [
  { id: "1", name: "Gasabo", province: "Kigali", riskLevel: "moderate" },
  { id: "2", name: "Kicukiro", province: "Kigali", riskLevel: "moderate" },
  { id: "3", name: "Nyarugenge", province: "Kigali", riskLevel: "low" },
  { id: "4", name: "Gisagara", province: "Southern", riskLevel: "critical" },
  { id: "5", name: "Huye", province: "Southern", riskLevel: "high" },
  { id: "6", name: "Kamonyi", province: "Southern", riskLevel: "moderate" },
  { id: "7", name: "Muhanga", province: "Southern", riskLevel: "high" },
  { id: "8", name: "Nyamagabe", province: "Southern", riskLevel: "critical" },
  { id: "9", name: "Nyanza", province: "Southern", riskLevel: "high" },
  { id: "10", name: "Nyaruguru", province: "Southern", riskLevel: "critical" },
  { id: "11", name: "Ruhango", province: "Southern", riskLevel: "high" },
  { id: "12", name: "Karongi", province: "Western", riskLevel: "moderate" },
  { id: "13", name: "Ngororero", province: "Western", riskLevel: "high" },
  { id: "14", name: "Nyabihu", province: "Western", riskLevel: "high" },
  { id: "15", name: "Nyamasheke", province: "Western", riskLevel: "critical" },
  { id: "16", name: "Rubavu", province: "Western", riskLevel: "moderate" },
  { id: "17", name: "Rusizi", province: "Western", riskLevel: "critical" },
  { id: "18", name: "Rutsiro", province: "Western", riskLevel: "high" },
  { id: "19", name: "Burera", province: "Northern", riskLevel: "critical" },
  { id: "20", name: "Gakenke", province: "Northern", riskLevel: "critical" },
  { id: "21", name: "Gicumbi", province: "Northern", riskLevel: "high" },
  { id: "22", name: "Musanze", province: "Northern", riskLevel: "moderate" },
  { id: "23", name: "Rulindo", province: "Northern", riskLevel: "high" },
  { id: "24", name: "Bugesera", province: "Eastern", riskLevel: "high" },
  { id: "25", name: "Gatsibo", province: "Eastern", riskLevel: "moderate" },
  { id: "26", name: "Kayonza", province: "Eastern", riskLevel: "moderate" },
  { id: "27", name: "Kirehe", province: "Eastern", riskLevel: "high" },
  { id: "28", name: "Ngoma", province: "Eastern", riskLevel: "high" },
  { id: "29", name: "Nyagatare", province: "Eastern", riskLevel: "critical" },
  { id: "30", name: "Rwamagana", province: "Eastern", riskLevel: "moderate" },
]

const generateMockBrief = (sector: string, districts: string[]): PolicyBrief => {
  const targetDistricts = districts.length > 0 
    ? districts 
    : rwandaDistricts.filter(d => d.riskLevel === "critical").map(d => d.id).slice(0, 5)

  const sectorData = {
    health: {
      title: "Strengthening Health Systems for Malnutrition Prevention and Treatment",
      findings: [
        "Critical shortage of trained nutrition counselors in 8 high-risk districts, with staff-to-population ratios 45% below WHO standards",
        "Mobile health clinics covering only 32% of rural communities in target areas, leaving vulnerable populations underserved",
        "Malnutrition screening rates at health centers remain at 58%, below the national target of 85% for children under 5",
        "Supply chain disruptions affecting micronutrient supplementation programs, with stock-outs reported in 6 districts"
      ],
      recommendations: [
        "Deploy 120 additional community health workers with specialized nutrition training to priority districts within 6 months",
        "Expand mobile health clinic coverage by 40% to reach underserved rural communities, prioritizing critical malnutrition hotspots",
        "Implement digital screening tools at all health centers to achieve 90% coverage for children under 5 by end of 2025",
        "Establish district-level buffer stocks of micronutrient supplements to prevent supply chain disruptions and ensure continuous access"
      ]
    },
    agriculture: {
      title: "Nutrition-Sensitive Agriculture: Building Resilient Food Systems",
      findings: [
        "Crop diversity index shows 68% of households relying on only 2-3 staple crops, limiting dietary variety and micronutrient intake",
        "Limited access to climate-resilient seeds and farming techniques affecting 12 districts with high malnutrition rates",
        "Post-harvest losses estimated at 35% for nutrient-rich vegetables due to inadequate storage and processing infrastructure",
        "Small-scale farmers lack market linkages, with 72% selling produce at below-market prices or consuming exclusively"
      ],
      recommendations: [
        "Distribute climate-resilient seeds for 8 nutrient-rich crops to 25,000 farming households in priority districts",
        "Establish 15 community-based food processing and storage centers to reduce post-harvest losses by 50%",
        "Create cooperatives linking 10,000 smallholder farmers to urban markets, ensuring fair prices and improved household income",
        "Implement nutrition-sensitive agriculture training for 5,000 farmers, emphasizing crop diversification and kitchen gardens"
      ]
    },
    education: {
      title: "Nutrition Education: Empowering Communities for Lasting Change",
      findings: [
        "Only 42% of caregivers demonstrate adequate knowledge of complementary feeding practices for children 6-24 months",
        "School feeding programs reach 65% of primary schools, with significant gaps in high-malnutrition districts",
        "Adolescent girls in 9 districts show concerning rates of anemia (48%) and undernutrition, affecting future maternal health",
        "Limited integration of nutrition education into school curricula, with only 28% of schools implementing structured programs"
      ],
      recommendations: [
        "Launch comprehensive caregiver education program reaching 50,000 mothers in target districts within 12 months",
        "Expand school feeding to 100% coverage in critical districts, providing fortified meals to 80,000 additional students",
        "Implement adolescent nutrition program in 150 secondary schools, focusing on iron supplementation and nutrition literacy",
        "Integrate standardized nutrition curriculum into all primary schools, training 2,500 teachers as nutrition champions"
      ]
    }
  }

  const data = sectorData[sector as keyof typeof sectorData]

  return {
    id: `brief-${Date.now()}`,
    title: data.title,
    sector,
    summary: `This policy brief presents evidence-based recommendations for addressing malnutrition in Rwanda through ${sector}-focused interventions. Drawing from comprehensive data analysis across ${targetDistricts.length} high-priority districts, this brief identifies critical gaps, emerging opportunities, and actionable strategies for stakeholders. The recommendations are designed to be implementable within 12-36 months and are prioritized based on potential impact, feasibility, and alignment with Rwanda's national development goals. Successful implementation could reach an estimated 150,000-250,000 beneficiaries and reduce malnutrition indicators by 15-25% in target areas.`,
    keyFindings: data.findings,
    recommendations: data.recommendations,
    targetDistricts,
    generatedAt: new Date().toISOString()
  }
}

export default function PolicyBriefsPage() {
  const [sector, setSector] = useState<string>("health")
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [generatedBrief, setGeneratedBrief] = useState<PolicyBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [useAI, setUseAI] = useState<boolean>(true)

  const handleDistrictToggle = (districtId: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(districtId) ? prev.filter((id) => id !== districtId) : [...prev, districtId],
    )
  }

  const generateBrief = async () => {
    setLoading(true)
    try {
      if (useAI) {
        const res = await fetch('/api/policy-briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sector, targetDistricts: selectedDistricts }),
        })

        if (!res.ok) {
          console.warn('AI brief generation failed, falling back to mock')
          const brief = generateMockBrief(sector, selectedDistricts)
          setGeneratedBrief(brief)
        } else {
          const brief = await res.json()
          // normalize generatedAt to ISO string
          brief.generatedAt = new Date(brief.generatedAt).toISOString()
          setGeneratedBrief(brief)
        }
      } else {
        // quick mock
        await new Promise((r) => setTimeout(r, 500))
        const brief = generateMockBrief(sector, selectedDistricts)
        setGeneratedBrief(brief)
      }
    } catch (error) {
      console.error("Failed to generate brief:", error)
      const brief = generateMockBrief(sector, selectedDistricts)
      setGeneratedBrief(brief)
    } finally {
      setLoading(false)
    }
  }

  const downloadBrief = () => {
    if (!generatedBrief) return

    const content = `
POLICY BRIEF: ${generatedBrief.title}
Sector: ${generatedBrief.sector.toUpperCase()}
Generated: ${new Date(generatedBrief.generatedAt).toLocaleDateString()}

EXECUTIVE SUMMARY
${generatedBrief.summary}

KEY FINDINGS
${generatedBrief.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

RECOMMENDATIONS
${generatedBrief.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

TARGET DISTRICTS
${generatedBrief.targetDistricts
  .map((id) => {
    const district = rwandaDistricts.find((d) => d.id === id)
    return district?.name || id
  })
  .join(", ")}

---
Generated by NutriVision Rwanda - Geospatial Early Warning System
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `policy-brief-${generatedBrief.sector}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSectorIcon = (sectorName: string) => {
    switch (sectorName) {
      case "health":
        return <Target className="w-5 h-5" />
      case "agriculture":
        return <TrendingUp className="w-5 h-5" />
      case "education":
        return <BookOpen className="w-5 h-5" />
      default:
        return <Briefcase className="w-5 h-5" />
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E8EB] to-[#005BAB]/10">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-[#005BAB]/10 to-[#E6E8EB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-[#005BAB]/10 to-[#E6E8EB]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Policy Brief Generator</h1>
              </div>
              <p className="text-sm text-gray-600">
                AI-powered policy recommendations based on comprehensive data analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#005BAB]/10 to-[#005BAB]/5">
                  <Sparkles className="w-5 h-5 text-[#005BAB]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Brief Configuration</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    {getSectorIcon(sector)}
                    Sector Focus
                  </label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="border-[#E6E8EB] focus:ring-[#005BAB] focus:border-[#005BAB] h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          Health Systems
                        </div>
                      </SelectItem>
                      <SelectItem value="agriculture">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Agriculture & Food Security
                        </div>
                      </SelectItem>
                      <SelectItem value="education">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          Nutrition Education
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#005BAB]" />
                    Target Districts
                  </label>
                  <p className="text-xs text-gray-500 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    💡 Leave empty to auto-select critical districts based on malnutrition data
                  </p>
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {rwandaDistricts.map((district) => (
                      <div 
                        key={district.id} 
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all hover:shadow-md ${
                          selectedDistricts.includes(district.id) 
                            ? 'bg-[#005BAB]/5 border-[#005BAB]/30' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Checkbox
                          id={district.id}
                          checked={selectedDistricts.includes(district.id)}
                          onCheckedChange={() => handleDistrictToggle(district.id)}
                          className="border-[#005BAB]"
                        />
                        <label
                          htmlFor={district.id}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{district.name}</span>
                            <Badge className={`${getRiskLevelColor(district.riskLevel)} text-xs font-semibold capitalize`}>
                              {district.riskLevel}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{district.province} Province</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Checkbox id="use-ai" checked={useAI} onCheckedChange={() => setUseAI((v) => !v)} />
                  <label htmlFor="use-ai" className="text-sm font-medium">Use AI-generated brief </label>
                </div>

                <Button 
                  onClick={generateBrief} 
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-[#005BAB] to-[#005BAB]/80 hover:from-[#004A8C] hover:to-[#005BAB] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Policy Brief...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Brief
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 rounded-2xl shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-900">About Policy Briefs</p>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Policy briefs synthesize data from NISR surveys, predictive models, and root cause analysis to
                    provide actionable, evidence-based recommendations for government stakeholders and development partners.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Generated Brief Display */}
          <div className="lg:col-span-2">
            {!generatedBrief ? (
              <Card className="p-16 text-center bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#005BAB]/10 to-[#005BAB]/5 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-[#005BAB]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">No Brief Generated Yet</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Select a sector focus and target districts from the configuration panel, then click <strong>Generate Brief</strong> to create a comprehensive policy recommendation document.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-8 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border-none">
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-6 border-b-2 border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-[#005BAB]/10 text-[#005BAB] border-[#005BAB]/20 capitalize text-sm px-3 py-1">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {generatedBrief.sector} Sector
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(generatedBrief.generatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Badge>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{generatedBrief.title}</h2>
                      <p className="text-sm text-gray-600">
                        Evidence-based recommendations for {generatedBrief.targetDistricts.length} priority districts
                      </p>
                    </div>
                    <Button 
                      onClick={downloadBrief} 
                      variant="outline" 
                      className="border-[#005BAB] text-[#005BAB] hover:bg-[#005BAB] hover:text-white transition-all ml-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Executive Summary */}
                  <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-[#005BAB]/5 to-[#E6E8EB]/50 border border-[#005BAB]/20">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#005BAB]">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{generatedBrief.summary}</p>
                  </div>

                  {/* Key Findings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-500">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Key Findings</h3>
                    </div>
                    <div className="space-y-3">
                      {generatedBrief.keyFindings.map((finding, index) => (
                        <div key={index} className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed pt-1">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-500">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Strategic Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {generatedBrief.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-5 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-r-xl hover:shadow-md transition-shadow"
                        >
                          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-800 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Districts */}
                  <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#005BAB]">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Target Districts ({generatedBrief.targetDistricts.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedBrief.targetDistricts.map((districtId) => {
                        const district = rwandaDistricts.find((d) => d.id === districtId)
                        return (
                          <Badge key={districtId} className="bg-[#005BAB]/10 text-[#005BAB] border-[#005BAB]/20 hover:bg-[#005BAB]/20 transition-colors px-3 py-1.5">
                            {district?.name || districtId}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #E6E8EB;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #005BAB;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #004A8C;
        }
      `}</style>
    </div>
  )
}