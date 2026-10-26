import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, MapPin, Truck, ArrowRight } from 'lucide-react'
import { pickupApi } from '@/api/pickup.api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/utils/formatters'

export const VolunteerHistoryPage: React.FC = () => {
  const { data: pickups = [], isLoading } = useQuery({
    queryKey: ['pickups', 'my'],
    queryFn: pickupApi.getMyPickups,
  })

  const completed = pickups.filter((p) => p.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#23332f]">Delivery History & Milestones</h1>
        <p className="text-sm text-[#66736f]">
          A permanent record of all completed donation transport tasks completed by you.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : completed.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-7 h-7" />}
          title="No completed deliveries yet"
          description="Once you accept dispatches and mark them complete, they will appear in your delivery log."
          actionLabel="Find Available Pickups"
          onAction={() => (window.location.href = '/volunteer/pickups/available')}
        />
      ) : (
        <div className="space-y-4">
          {completed.map((p) => (
            <Card
              key={p.id}
              className="p-6 bg-white border border-[#cfded8] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#912f56] uppercase tracking-wider">
                    Completed Delivery #{p.id}
                  </span>
                  <StatusBadge status={p.status} />
                  {p.completedAt && (
                    <span className="text-[11px] text-[#66736f]">
                      Finished on {formatDateTime(p.completedAt)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <p className="text-[#23332f]">
                    <strong className="text-[#66736f]">Picked Up From:</strong> {p.pickupAddress}
                  </p>
                  <p className="text-[#23332f]">
                    <strong className="text-[#66736f]">Delivered To:</strong> {p.deliveryAddress}
                  </p>
                </div>
              </div>

              <Link to={`/volunteer/pickups/${p.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Record
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
