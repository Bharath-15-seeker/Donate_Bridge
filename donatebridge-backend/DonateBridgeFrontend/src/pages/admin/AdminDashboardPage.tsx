import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  Building,
  Truck,
  Gift,
  FileText,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { adminApi } from '@/api/admin.api'
import { StatCard } from '@/components/data-display/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/utils/formatters'

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  const s = stats || {
    totalUsers: 0,
    totalDonors: 0,
    totalNgos: 0,
    totalVolunteers: 0,
    pendingDonors: 0,
    pendingNgos: 0,
    pendingVolunteers: 0,
    verifiedDonors: 0,
    verifiedNgos: 0,
    verifiedVolunteers: 0,
    totalDonations: 0,
    availableDonations: 0,
    acceptedDonations: 0,
    completedDonations: 0,
    cancelledDonations: 0,
    totalRequirements: 0,
    activeRequirements: 0,
    fulfilledRequirements: 0,
    cancelledRequirements: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    totalPickups: 0,
    assignedPickups: 0,
    startedPickups: 0,
    pickedUpPickups: 0,
    deliveredPickups: 0,
    completedPickups: 0,
    cancelledPickups: 0,
  }

  // Chart 1: Users Breakdown
  const userRoleData = [
    { name: 'Donors', count: s.totalDonors, color: '#912f56' },
    { name: 'NGOs', count: s.totalNgos, color: '#23332f' },
    { name: 'Volunteers', count: s.totalVolunteers, color: '#16a34a' },
  ]

  // Chart 2: Donation Status
  const donationStatusData = [
    { name: 'Available', count: s.availableDonations, color: '#d97706' },
    { name: 'Accepted', count: s.acceptedDonations, color: '#912f56' },
    { name: 'Completed', count: s.completedDonations, color: '#16a34a' },
    { name: 'Cancelled', count: s.cancelledDonations, color: '#dc2626' },
  ]

  // Chart 3: Pickup Pipeline
  const pickupPipelineData = [
    { stage: 'Assigned', count: s.assignedPickups },
    { stage: 'Started', count: s.startedPickups },
    { stage: 'Picked Up', count: s.pickedUpPickups },
    { stage: 'Delivered', count: s.deliveredPickups },
    { stage: 'Completed', count: s.completedPickups },
  ]

  const totalPendingVerifications = s.pendingDonors + s.pendingNgos + s.pendingVolunteers

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#23332f]">
            Platform Governance & Analytics
          </h1>
          <p className="text-sm text-[#66736f]">
            Comprehensive operational metrics derived directly from the Spring Boot database.
          </p>
        </div>

        {totalPendingVerifications > 0 && (
          <div className="flex items-center gap-2 p-2.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{totalPendingVerifications} Pending Verification Reviews</span>
          </div>
        )}
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(s.totalUsers)}
          subtitle={`${s.totalDonors} Donors • ${s.totalNgos} NGOs • ${s.totalVolunteers} Volunteers`}
          icon={<Users className="w-5 h-5" />}
          variant="brand"
        />
        <StatCard
          title="Pending Reviews"
          value={formatNumber(totalPendingVerifications)}
          subtitle={`${s.pendingNgos} NGOs, ${s.pendingVolunteers} Volunteers awaiting approval`}
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Total Donations"
          value={formatNumber(s.totalDonations)}
          subtitle={`${s.availableDonations} open • ${s.completedDonations} completed`}
          icon={<Gift className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Completed Deliveries"
          value={formatNumber(s.completedPickups)}
          subtitle={`Out of ${s.totalPickups} total deliveries recorded`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/admin/ngos">
          <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            <span>Verify NGOs</span>
            <span className="font-bold text-[#912f56]">{s.pendingNgos}</span>
          </Button>
        </Link>
        <Link to="/admin/volunteers">
          <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            <span>Verify Volunteers</span>
            <span className="font-bold text-[#912f56]">{s.pendingVolunteers}</span>
          </Button>
        </Link>
        <Link to="/admin/donors">
          <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            <span>Review Donors</span>
            <span className="font-bold text-[#912f56]">{s.pendingDonors}</span>
          </Button>
        </Link>
        <Link to="/admin/users">
          <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            <span>User Management</span>
            <span className="font-bold text-[#23332f]">{s.totalUsers}</span>
          </Button>
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pickup Delivery Pipeline */}
        <Card className="p-6 bg-white border border-[#cfded8] shadow-card">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-[#23332f] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#912f56]" />
              Pickup Delivery Lifecycle
            </CardTitle>
            <p className="text-xs text-[#66736f]">
              Stage distribution of volunteer transport tasks across the platform
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pickupPipelineData}>
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#66736f' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#66736f' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cfded8',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#912f56" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Donations Status Distribution */}
        <Card className="p-6 bg-white border border-[#cfded8] shadow-card">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-[#23332f] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#912f56]" />
              Donations Breakdown
            </CardTitle>
            <p className="text-xs text-[#66736f]">
              Proportion of available, accepted, completed and cancelled inventory
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {donationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cfded8',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operational Matrix Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requirements Status */}
        <Card className="p-6 bg-white border border-[#cfded8] shadow-card space-y-4">
          <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#912f56]" />
            Community Requirements Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-[#eaf2ef]">
              <span className="text-[#66736f]">Active / Open Needs:</span>
              <span className="font-bold text-[#23332f]">{s.activeRequirements}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#eaf2ef]">
              <span className="text-[#66736f]">Fulfilled Needs:</span>
              <span className="font-bold text-emerald-700">{s.fulfilledRequirements}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#eaf2ef]">
              <span className="text-[#66736f]">Cancelled Needs:</span>
              <span className="font-bold text-red-600">{s.cancelledRequirements}</span>
            </div>
            <div className="flex justify-between pt-2 font-bold text-sm text-[#23332f]">
              <span>Total Posted:</span>
              <span>{s.totalRequirements}</span>
            </div>
          </div>
        </Card>

        {/* Requests Status */}
        <Card className="p-6 bg-white border border-[#cfded8] shadow-card space-y-4">
          <h3 className="font-bold text-sm text-[#23332f] uppercase tracking-wider flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#912f56]" />
            Donation Requests Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-[#eaf2ef]">
              <span className="text-[#66736f]">Pending Donor Review:</span>
              <span className="font-bold text-amber-700">{s.pendingRequests}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#eaf2ef]">
              <span className="text-[#66736f]">Accepted by Donors:</span>
              <span className="font-bold text-emerald-700">{s.acceptedRequests}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#eaf2ef]">
              <span className="text-[#66736f]">Rejected Requests:</span>
              <span className="font-bold text-red-600">{s.rejectedRequests}</span>
            </div>
            <div className="flex justify-between pt-2 font-bold text-sm text-[#23332f]">
              <span>Total Requests Logged:</span>
              <span>{s.totalRequests}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
