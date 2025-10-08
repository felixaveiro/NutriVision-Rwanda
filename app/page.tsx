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

        {/* Map and Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#005BAB]" />
              <h3 className="text-lg font-semibold text-gray-800">Malnutrition Hotspot Map</h3>
            </div>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <MapView />
            </div>
          </div>

          {/* Risk Chart */}
          <div className="lg:col-span-1 bg-white/95 backdrop-blur rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#005BAB]" />
              <h3 className="text-lg font-semibold text-gray-800">Risk Analysis</h3>
            </div>
            <RiskChart />
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