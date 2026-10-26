import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Search, PlusCircle, ArrowRight, HeartHandshake, Layers } from 'lucide-react'
import { requirementApi } from '@/api/requirement.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/utils/formatters'

export const DonorRequirementsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements', 'available'],
    queryFn: requirementApi.getAvailableRequirements,
  })

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === 'ALL' || req.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = ['ALL', ...Array.from(new Set(requirements.map((r) => r.category))).filter(Boolean)]

  const urgencyVariants: Record<string, 'destructive' | 'warning' | 'default'> = {
    URGENT: 'destructive',
    HIGH: 'warning',
    MEDIUM: 'default',
    LOW: 'default',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Active NGO Requirements</h1>
        <p className="text-sm text-[#66736f]">
          Non-profit organizations post their current supply shortages here. Fulfill a requirement to send requested goods directly to their distribution team.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#cfded8] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search requirements by item or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#912f56] text-white shadow-sm'
                  : 'bg-[#eaf2ef] text-[#23332f] hover:bg-[#dce8e4]'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      ) : filteredRequirements.length === 0 ? (
        <EmptyState
          title="No requirements found"
          description={
            searchTerm || categoryFilter !== 'ALL'
              ? 'Try modifying your search or category filter.'
              : 'There are no open NGO supply requests right now. You can still list available donations directly!'
          }
          actionLabel="Create General Donation"
          onAction={() => (window.location.href = '/donor/donations/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequirements.map((req) => (
            <Card
              key={req.id}
              className="p-6 bg-white border border-[#cfded8] hover:shadow-elevated transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#912f56]">
                    {req.category}
                  </span>
                  <Badge
                    variant={urgencyVariants[req.urgency?.toUpperCase()] || 'default'}
                    size="sm"
                  >
                    {req.urgency} URGENCY
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-[#23332f] line-clamp-1">
                  {req.title}
                </h3>

                <p className="text-xs text-[#66736f] line-clamp-3 leading-relaxed">
                  {req.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#eaf2ef]">
                <div className="flex items-center justify-between text-xs text-[#23332f]">
                  <span>
                    <strong>Quantity Needed:</strong>
                  </span>
                  <span className="font-bold text-sm text-[#912f56]">
                    {req.quantity} {req.unit}
                  </span>
                </div>

                <Link to={`/donor/donations/new?requirementId=${req.id}`}>
                  <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Fulfill This Requirement
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
