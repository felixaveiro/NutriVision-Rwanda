"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { Activity, Sparkles, Database, TrendingUp, Target, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname() || '/'
  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-lg flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#005BAB]">NutriVision Rwanda</h1>
              <p className="text-xs text-gray-600">Geospatial Early Warning & Decision Support System</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-700 hover:text-[#005BAB] hover:bg-blue-50',
                isActive('/insights') && 'text-[#005BAB] bg-blue-50'
              )}
              asChild
            >
              <Link href="/insights">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Insights
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-700 hover:text-[#005BAB] hover:bg-blue-50',
                isActive('/data-sources') && 'text-[#005BAB] bg-blue-50'
              )}
              asChild
            >
              <Link href="/data-sources">
                <Database className="w-4 h-4 mr-2" />
                Data Sources
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-700 hover:text-[#005BAB] hover:bg-blue-50',
                isActive('/predictions') && 'text-[#005BAB] bg-blue-50'
              )}
              asChild
            >
              <Link href="/predictions">
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictions
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-700 hover:text-[#005BAB] hover:bg-blue-50',
                isActive('/interventions') && 'text-[#005BAB] bg-blue-50'
              )}
              asChild
            >
              <Link href="/interventions">
                <Target className="w-4 h-4 mr-2" />
                Interventions
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-700 hover:text-[#005BAB] hover:bg-blue-50',
                isActive('/policy-briefs') && 'text-[#005BAB] bg-blue-50'
              )}
              asChild
            >
              <Link href="/policy-briefs">
                <FileText className="w-4 h-4 mr-2" />
                Policy Briefs
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
