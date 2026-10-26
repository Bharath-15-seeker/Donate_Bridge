import React from 'react'
import { Link } from 'react-router-dom'
import {
  HeartHandshake,
  Gift,
  Building,
  Truck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Package,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cfded8] text-xs font-bold text-[#912f56] shadow-sm mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Impact, Transparent Redistribution</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#23332f] tracking-tight leading-tight max-w-4xl mx-auto">
          Turn Unused Goods Into Hope For{' '}
          <span className="text-[#912f56] underline decoration-[#912f56]/30">Communities In Need</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#66736f] max-w-2xl mx-auto leading-relaxed">
          DonateBridge seamlessly connects generous donors, verified non-profit organizations, and dedicated delivery volunteers to redistribute clothes, books, medical aids, and supplies where they matter most.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register?role=DONOR">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Donating Now
            </Button>
          </Link>
          <Link to="/register?role=NGO">
            <Button variant="outline" size="lg" leftIcon={<Building className="w-5 h-5" />}>
              Join as Verified NGO
            </Button>
          </Link>
          <Link to="/register?role=VOLUNTEER">
            <Button variant="subtle" size="lg" leftIcon={<Truck className="w-5 h-5" />}>
              Become a Volunteer
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-[#23332f]">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#912f56]" />
            Verified Non-Profits Only
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#912f56]" />
            Direct Volunteer Pickups
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#912f56]" />
            End-to-End Status Tracking
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#912f56]">
            Transparent Process
          </h2>
          <h3 className="text-3xl font-extrabold text-[#23332f] mt-1">
            How The Redistribution Lifecycle Works
          </h3>
          <p className="text-sm text-[#66736f] max-w-xl mx-auto mt-2">
            Every step is coordinated directly in the platform to guarantee accountability and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 relative bg-white border border-[#cfded8] hover:border-[#912f56]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#f6e8ee] text-[#912f56] flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h4 className="font-bold text-base text-[#23332f] mb-2">Donor Lists Items</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Donors upload photos, condition details, quantity, and pickup address for items they wish to pass on.
            </p>
          </Card>

          <Card className="p-6 relative bg-white border border-[#cfded8] hover:border-[#912f56]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#eaf2ef] text-[#23332f] flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h4 className="font-bold text-base text-[#23332f] mb-2">NGO Match & Request</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Vetted NGOs browse available listings or publish targeted community requirements to match supplies with real needs.
            </p>
          </Card>

          <Card className="p-6 relative bg-white border border-[#cfded8] hover:border-[#912f56]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#f6e8ee] text-[#912f56] flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h4 className="font-bold text-base text-[#23332f] mb-2">Volunteer Dispatch</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Upon donor approval, available volunteers accept pickup assignments and transit goods from the donor’s doorstep.
            </p>
          </Card>

          <Card className="p-6 relative bg-white border border-[#cfded8] hover:border-[#912f56]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h4 className="font-bold text-base text-[#23332f] mb-2">Safe Delivery & Impact</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Goods are delivered to the NGO hub, verified, and distributed to community beneficiaries.
            </p>
          </Card>
        </div>
      </section>

      {/* Role Deep-Dives */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#912f56]">
            Dedicated Portals
          </h2>
          <h3 className="text-3xl font-extrabold text-[#23332f] mt-1">
            Built For Each Role In The Ecosystem
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Donor */}
          <Card className="p-8 bg-white border border-[#cfded8] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f6e8ee] text-[#912f56] flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#23332f]">For Donors</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Declutter responsibly without waste. Give your gently used goods a second life with verified charitable groups.
            </p>
            <ul className="space-y-2 text-xs text-[#23332f] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Doorstep pickup by verified volunteers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Browse real-time NGO requirements
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Real-time status notifications
              </li>
            </ul>
            <div className="pt-4">
              <Link to="/register?role=DONOR">
                <Button variant="outline" size="sm" className="w-full">
                  Sign Up as Donor
                </Button>
              </Link>
            </div>
          </Card>

          {/* NGO */}
          <Card className="p-8 bg-white border border-[#cfded8] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#eaf2ef] text-[#23332f] flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#23332f]">For NGOs</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Source needed goods reliably. Post requirements for urgent community crises and request available items directly.
            </p>
            <ul className="space-y-2 text-xs text-[#23332f] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Post specific community supply needs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Browse inventory with condition & images
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Automated volunteer delivery logistics
              </li>
            </ul>
            <div className="pt-4">
              <Link to="/register?role=NGO">
                <Button variant="outline" size="sm" className="w-full">
                  Sign Up as NGO
                </Button>
              </Link>
            </div>
          </Card>

          {/* Volunteer */}
          <Card className="p-8 bg-white border border-[#cfded8] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#dce8e4] text-[#23332f] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-[#23332f]">For Volunteers</h4>
            <p className="text-xs text-[#66736f] leading-relaxed">
              Help bridge the last mile. Use your spare time and vehicle to pick up donations and deliver them to non-profits.
            </p>
            <ul className="space-y-2 text-xs text-[#23332f] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Choose pickups based on your availability
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Integrated address routing & directions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" /> Track completed delivery milestones
              </li>
            </ul>
            <div className="pt-4">
              <Link to="/register?role=VOLUNTEER">
                <Button variant="outline" size="sm" className="w-full">
                  Sign Up as Volunteer
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust & Verification System */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#23332f] text-white p-8 sm:p-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#912f56] text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Platform Integrity & Governance
            </h3>
            <p className="text-sm text-[#a3b3af] leading-relaxed">
              Trust is the backbone of community redistribution. DonateBridge implements multi-layered administrative verification to protect all participants:
            </p>
            <ul className="space-y-2.5 text-xs text-[#cfded8] pt-2">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" />
                NGO legal registration number and organizational audit review.
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" />
                Volunteer profile screening, vehicle validation, and availability state management.
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#912f56]" />
                Full administrative oversight with status moderation and audit log tracking.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Package className="w-6 h-6 text-[#912f56] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">Full Lifecycle</p>
              <p className="text-xs text-[#a3b3af] mt-1">Available to Delivered</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Clock className="w-6 h-6 text-[#912f56] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">Timely Response</p>
              <p className="text-xs text-[#a3b3af] mt-1">Direct request review</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Building className="w-6 h-6 text-[#912f56] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">Verified NGOs</p>
              <p className="text-xs text-[#a3b3af] mt-1">Vetted non-profits only</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Truck className="w-6 h-6 text-[#912f56] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">Last-Mile Transit</p>
              <p className="text-xs text-[#a3b3af] mt-1">Direct volunteer dispatch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#23332f]">
          Ready to make a tangible difference?
        </h3>
        <p className="text-sm text-[#66736f] max-w-xl mx-auto">
          Create an account today and join our mission to bridge the gap between abundance and community need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Free Account
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Sign In to Your Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
