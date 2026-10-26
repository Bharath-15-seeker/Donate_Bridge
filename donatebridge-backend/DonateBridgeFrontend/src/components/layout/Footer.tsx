import React from 'react'
import { HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#23332f] text-white border-t border-[#1a2623] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-lg text-white">
            <div className="w-8 h-8 rounded-lg bg-[#912f56] text-white flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span>DonateBridge</span>
          </div>
          <p className="text-xs text-[#a3b3af] leading-relaxed">
            A premium full-stack platform empowering donors, verified NGOs, and passionate volunteers to redistribute essential goods to vulnerable communities.
          </p>
        </div>

        {/* Roles */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfded8] mb-3">
            Roles & Portals
          </h4>
          <ul className="space-y-2 text-xs text-[#a3b3af]">
            <li><Link to="/login" className="hover:text-white transition-colors">Donor Portal</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">NGO Redistribution Hub</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Volunteer Dispatch</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Administrative Governance</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfded8] mb-3">
            How It Works
          </h4>
          <ul className="space-y-2 text-xs text-[#a3b3af]">
            <li>Item Donation Lifecycle</li>
            <li>NGO Verification Process</li>
            <li>Volunteer Dispatch & Pickups</li>
            <li>Impact Transparency</li>
          </ul>
        </div>

        {/* Legal & Status */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfded8] mb-3">
            Compliance & Security
          </h4>
          <ul className="space-y-2 text-xs text-[#a3b3af]">
            <li>Privacy Policy</li>
            <li>Terms of Donation</li>
            <li>Verification Guidelines</li>
            <li className="text-[11px] text-[#7d918c] pt-2">© 2026 DonateBridge. All rights reserved.</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
