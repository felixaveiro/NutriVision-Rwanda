import { MapView } from "@/components/map-view"
import { StatsOverview } from "@/components/stats-overview"
import { RiskChart } from "@/components/risk-chart"
import { Button } from "@/components/ui/button"
import { FileText, TrendingUp, Target, Database, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-balance">NutriVision Rwanda</h1>
              <p className="text-sm text-muted-foreground">Geospatial Early Warning & Decision Support System</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/insights">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Insights
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/data-sources">
                  <Database className="w-4 h-4 mr-2" />
                  Data Sources
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/predictions">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Predictions
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/interventions">
                  <Target className="w-4 h-4 mr-2" />
                  Interventions
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/policy-briefs">
                  <FileText className="w-4 h-4 mr-2" />
                  Policy Briefs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Map and Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div className="h-[600px]">
              <MapView />
            </div>
          </div>

          {/* Risk Chart */}
          <div className="lg:col-span-1">
            <RiskChart />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
            <Link href="/predictions">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">View Predictions</div>
                <div className="text-xs text-muted-foreground">ML-powered risk forecasts</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
            <Link href="/interventions">
              <Target className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Recommended Interventions</div>
                <div className="text-xs text-muted-foreground">Prioritized by impact & feasibility</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
            <Link href="/policy-briefs">
              <FileText className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Generate Policy Brief</div>
                <div className="text-xs text-muted-foreground">Sector-specific recommendations</div>
              </div>
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Data sources: NISR, DHS, HMIS, Sentinel</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
