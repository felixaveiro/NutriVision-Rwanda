import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#005BAB] text-white mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">About NutriVision</h4>
            <p className="text-blue-100 text-sm">
              Empowering Rwanda&apos;s fight against malnutrition through data-driven insights and evidence-based decision making.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Data Sources</h4>
            <p className="text-blue-100 text-sm">
              NISR | DHS | HMIS | Sentinel Site Surveillance | Agricultural Statistics
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Contact</h4>
            <p className="text-blue-100 text-sm">
              Ministry of Health, Rwanda<br />
              nutrition@moh.gov.rw
            </p>
          </div>
        </div>
        <div className="border-t border-blue-400 pt-6 flex items-center justify-between text-sm">
          <p className="text-blue-100">© 2025 NutriVision Rwanda. All rights reserved.</p>
          <p className="text-blue-100">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </footer>
  )
}
