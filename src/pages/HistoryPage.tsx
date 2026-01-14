import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../auth/auth-context'
import type { Prescription, PrescriptionStatus } from '../lib/types'
import { listPrescriptions, sendSms } from '../lib/storage'
import { useDataChanged } from '../lib/useDataChanged'
import { formatDateTime } from '../lib/utils'

function statusVariant(status: PrescriptionStatus) {
  if (status === 'Completed' || status === 'Verified') return 'green'
  if (status === 'Pending') return 'yellow'
  return 'gray'
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const dataVersion = useDataChanged()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PrescriptionStatus | 'All'>('All')

  const items = useMemo<Prescription[]>(() => {
    const all = listPrescriptions()

    return all
      .filter((p) => {
        if (user?.role === 'patient') {
          const id = (user.patientNationalId ?? '').trim()
          if (id) return p.patient.nationalId.trim() === id
          return p.patient.name === (user?.name ?? '')
        }
        if (status !== 'All' && p.status !== status) return false
        if (!query.trim()) return true
        const q = query.trim().toLowerCase()
        return (
          p.id.toLowerCase().includes(q) ||
          p.patient.name.toLowerCase().includes(q) ||
          p.patient.nationalId.toLowerCase().includes(q) ||
          p.doctor.name.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [dataVersion, query, status, user?.name, user?.patientNationalId, user?.role])

  return (
    <div>
      <PageHeader
        subtitle="History"
        title="Medication History"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by RX ID, patient name, national ID, or doctor"
        />
        <div className="relative">
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Completed">Completed</option>
          </Select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
            ▾
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            setQuery('')
            setStatus('All')
            toast.success('Filters cleared')
          }}
        >
          Clear filters
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{p.patient.name}</CardTitle>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  {p.id} · {formatDateTime(p.createdAt)}
                </div>
              </div>
              <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Patient ID</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {p.patient.nationalId}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Doctor</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{p.doctor.name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Medications</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {p.medications.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate(`/app/prescription/${p.id}`)}>
                  View details
                </Button>

                {user?.role !== 'patient' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const message = `Reminder: Please follow your prescription ${p.id}. Take your medications as directed. Contact your clinic if you have questions.`
                      sendSms(p.patient.phone, message, { prescriptionId: p.id, type: 'adherence' })
                      toast.success('Adherence reminder sent')
                    }}
                  >
                    Send reminder SMS
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-600">
                No prescriptions match your filters.
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
