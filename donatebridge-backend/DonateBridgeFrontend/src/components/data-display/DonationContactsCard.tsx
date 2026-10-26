import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Phone, MapPin, UserRound, Building2, Truck } from 'lucide-react'
import { profileApi, type ContactProfile } from '@/api/profile.api'
import { Card } from '@/components/ui/card'

const Contact: React.FC<{ profile: ContactProfile; title?: string }> = ({ profile, title }) => {
  const Icon = profile.role === 'NGO' ? Building2 : profile.role === 'VOLUNTEER' ? Truck : UserRound
  return (
    <div className="rounded-xl border border-[#cfded8] bg-white p-4 space-y-2">
      <div className="flex items-center gap-2 text-[#912f56]">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wide">{title || profile.role}</span>
      </div>
      <p className="font-semibold text-sm text-[#23332f]">{profile.organizationName || profile.name || `${profile.role} #${profile.profileId}`}</p>
      {profile.name && profile.organizationName && <p className="text-xs text-[#66736f]">Contact: {profile.name}</p>}
      {profile.phone && <a className="flex items-center gap-2 text-xs text-[#23332f] hover:text-[#912f56]" href={`tel:${profile.phone}`}><Phone className="h-3.5 w-3.5" />{profile.phone}</a>}
      {profile.email && <a className="flex items-center gap-2 text-xs text-[#23332f] hover:text-[#912f56] break-all" href={`mailto:${profile.email}`}><Mail className="h-3.5 w-3.5" />{profile.email}</a>}
      {profile.address && <p className="flex items-start gap-2 text-xs text-[#66736f]"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />{profile.address}</p>}
      {profile.vehicleType && <p className="text-xs text-[#66736f]">Vehicle: {profile.vehicleType}{profile.vehicleNumber ? ` (${profile.vehicleNumber})` : ''}</p>}
      {profile.requestStatus && <p className="text-[11px] text-[#66736f]">Request: {profile.requestStatus}</p>}
    </div>
  )
}

export const DonationContactsCard: React.FC<{ donationId: number; title?: string }> = ({ donationId, title = 'Contact details' }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['donation-contacts', donationId],
    queryFn: () => profileApi.getDonationContacts(donationId),
    retry: false,
  })
  if (isLoading) return <Card className="p-4 text-xs text-[#66736f]">Loading contact details…</Card>
  if (isError || !data) return null
  const profiles = [data.donor, data.ngo, data.volunteer, ...(data.ngos || [])].filter(Boolean) as ContactProfile[]
  const unique = profiles.filter((profile, index, all) => all.findIndex(p => `${p.role}-${p.profileId}` === `${profile.role}-${profile.profileId}`) === index)
  if (!unique.length) return null
  return (
    <Card className="p-4 space-y-3 bg-[#f8fbf9] border border-[#cfded8]">
      <h3 className="font-bold text-sm text-[#23332f]">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {unique.map(profile => <Contact key={`${profile.role}-${profile.profileId}`} profile={profile} title={profile.role === 'NGO' ? (profile.organizationName || 'NGO') : profile.role === 'DONOR' ? 'Donor' : 'Assigned volunteer'} />)}
      </div>
    </Card>
  )
}
