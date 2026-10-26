import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { HeartHandshake, LogIn, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, getRoleDashboardPath } = useAuth()

  return (
    <div className="min-h-screen bg-[#eaf2ef] flex flex-col font-sans selection:bg-[#912f56] selection:text-white">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#cfded8] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-[#23332f] group">
          <div className="w-10 h-10 rounded-xl bg-[#912f56] text-white flex items-center justify-center shadow-sm group-hover:bg-[#782445] transition-colors">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <span>
            Donate<span className="text-[#912f56]">Bridge</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#23332f]">
          <Link to="/" className="hover:text-[#912f56] transition-colors">Overview</Link>
          <a href="#how-it-works" className="hover:text-[#912f56] transition-colors">How It Works</a>
          <a href="#roles" className="hover:text-[#912f56] transition-colors">Roles</a>
          <a href="#trust" className="hover:text-[#912f56] transition-colors">Trust & Verification</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={getRoleDashboardPath()}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
