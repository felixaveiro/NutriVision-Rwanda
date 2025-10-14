"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Activity, Sparkles, Database, TrendingUp, Target, FileText, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname() || '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isActive = (href: string) => pathname.startsWith(href)

  const navItems = [
    { href: '/insights', icon: Sparkles, label: 'AI Insights' },
    { href: '/data-sources', icon: Database, label: 'Data Sources' },
    { href: '/predictions', icon: TrendingUp, label: 'Predictions' },
    { href: '/interventions', icon: Target, label: 'Interventions' },
    { href: '/policy-briefs', icon: FileText, label: 'Policy Briefs' },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#005BAB] to-[#0078D4] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#005BAB] leading-tight">
                NutriVision Rwanda
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                Geospatial Early Warning & Decision Support System
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-[#005BAB]">NutriVision</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-gray-700 hover:text-[#005BAB] hover:bg-blue-50 transition-all duration-200',
                    'font-medium text-sm xl:text-base',
                    isActive(item.href) && 'text-[#005BAB] bg-blue-50'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-700 hover:text-[#005BAB] hover:bg-blue-50 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-gray-700 hover:text-[#005BAB] hover:bg-blue-50 transition-all duration-200',
                    'font-medium text-sm py-3',
                    isActive(item.href) && 'text-[#005BAB] bg-blue-50'
                  )}
                  asChild
                  onClick={closeMobileMenu}
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}