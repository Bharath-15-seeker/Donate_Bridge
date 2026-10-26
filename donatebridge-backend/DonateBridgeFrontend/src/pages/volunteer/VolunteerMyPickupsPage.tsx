import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Truck, MapPin, CheckCircle2, Clock, ArrowRight, Package } from 'lucide-react'
import { pickupApi } from '@/api/pickup.api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/utils/formatters'

export const VolunteerMyPickupsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE')

  const { data: myPickups = [], isLoading } = useQuery({
    queryKey: ['pickups', 'my'],
    queryFn: pickupApi.getMyPickups,
  })

  const activePickups = myPickups.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED')
  const completedPickups = myPickups.filter((p) => p.status === 'COMPLETED')

  const displayedPickups = filter === 'ACTIVE' ? activePickups : completedPickups

  const tabs = [
    { id: 'ACTIVE', label: 'Active Deliveries', count: activePickups.length },
    { id: 'COMPLETED', label: 'Completed Deliveries', count: completedPickups.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#23332f]">My Pickups & Routes</h1>
          <p className="text-sm text-[#66736f]">
            Manage your ongoing deliveries and advance the donation through its delivery stages.
          </p>
        </div>
        <Link to="/volunteer/pickups/available">
          <Button variant="primary" size="md" leftIcon={<Truck className="w-4 h-4" />}>
            Find Available Jobs
          </Button>
        </Link>
      </div>

      <Tabs tabs={tabs} activeTab={filter} onChange={(id) => setFilter(id as 'ACTIVE' | 'COMPLETED')} />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : displayedPickups.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-7 h-7" />}
          title={filter === 'ACTIVE' ? 'No active delivery tasks' : 'No completed deliveries yet'}
          description={
            filter === 'ACTIVE'
              ? 'You do not have any in-progress delivery assignments. Check available pickups to accept a new one.'
              : 'Pickups you successfully complete will be archived here in your delivery records.'
          }
          actionLabel={filter === 'ACTIVE' ? 'Browse Available Pickups' : undefined}
          onAction={filter === 'ACTIVE' ? () => (window.location.href = '/volunteer/pickups/available') : undefined}
        />
      ) : (
        <div className="space-y-4">
          {displayedPickups.map((pickup) => (
            <Card
              key={pickup.id}
              className="p-6 bg-white border border-[#cfded8] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#912f56]/40 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider">
                    Pickup #{pickup.id}
                  </span>
                  <StatusBadge status={pickup.status} />
                  <span className="text-[11px] text-[#66736f]">
                    Assigned on {formatDateTime(pickup.assignedAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <p className="text-[#23332f]">
                    <strong className="text-[#66736f]">From (Donor):</strong> {pickup.pickupAddress}
                  </p>
                  <p className="text-[#23332f]">
                    <strong className="text-[#66736f]">To (NGO):</strong> {pickup.deliveryAddress}
                  </p>
                </div>
              </div>

              <Link to={`/volunteer/pickups/${pickup.id}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {pickup.status === 'COMPLETED' ? 'View Summary' : 'Update Status'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
