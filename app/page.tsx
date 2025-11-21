import { MapView } from "@/components/map-view"
import { StatsOverview } from "@/components/stats-overview"
import { RiskChart } from "@/components/risk-chart"
import { FileText, TrendingUp, Target, MapPin, BarChart3 } from "lucide-react"
import Link from "next/link"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005BAB] via-[#0078D4] to-[#E6E8EB]">
    

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Welcome to NutriVision Rwanda
          </h2>
          <p className="text-2xl text-blue-100 font-medium">
            Smart Insights for a Healthier Rwanda
          </p>
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-left space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed">
              NutriVision Rwanda is a data-driven platform designed to identify and address hidden hunger across Rwanda. By combining national statistics, geospatial data, and predictive analytics, the system maps malnutrition hotspots, uncovers root causes, and recommends targeted interventions.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Through an interactive dashboard, decision-makers can explore district-level insights, track progress, and access evidence-based policy briefs that link health, agriculture, and education efforts.
            </p>
          </div>
        </div>
        
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-12 space-y-8">
        {/* Stats Overview */}
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-6">
          <StatsOverview />
        </div>

        {/* Map and Chart Grid - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Map */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden hover:shadow-3xl transition-all duration-300 flex flex-col">
            <div className="bg-gradient-to-r from-[#005BAB] to-[#0078D4] px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Malnutrition Hotspot Map</h3>
                  <p className="text-xs text-blue-100">Interactive district-level visualization</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-3">
              <div className="h-full rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner">
                <MapView />
              </div>
            </div>
          </div>

          {/* Risk Chart */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden hover:shadow-3xl transition-all duration-300 flex flex-col">
            <div className="bg-gradient-to-r from-[#005BAB] to-[#0078D4] px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Risk Analysis</h3>
                  <p className="text-xs text-blue-100">Top 10 highest risk districts</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-3">
              <RiskChart />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-[#005BAB]">
            <Link href="/predictions" className="block text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">View Predictions</h3>
                <p className="text-sm text-gray-600">ML-powered risk forecasts for early intervention planning</p>
              </div>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-[#005BAB]">
            <Link href="/interventions" className="block text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Recommended Interventions</h3>
                <p className="text-sm text-gray-600">Prioritized strategies by impact and feasibility</p>
              </div>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-[#005BAB]">
            <Link href="/policy-briefs" className="block text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Generate Policy Brief</h3>
                <p className="text-sm text-gray-600">Sector-specific evidence-based recommendations</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

    </div>
  )
}