import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import Stepper from '../components/Stepper'
import { useAuth } from '../auth/auth-context'
import type { DonationPledge, ShortageReport } from '../lib/types'
import { listPledges, listShortages, upsertPledge } from '../lib/storage'
import { useDataChanged } from '../lib/useDataChanged'
import { formatDateTime } from '../lib/utils'

type PledgeStatus = DonationPledge['status'] | 'All'

function statusVariant(status: DonationPledge['status']) {
  if (status === 'Delivered') return 'green'
  if (status === 'In Transit') return 'yellow'
  return 'gray'
}

function statusToStepIndex(status: DonationPledge['status']) {
  if (status === 'Delivered') return 2
  if (status === 'In Transit') return 1
  return 0
}

export default function DonationsPage() {
  const { user } = useAuth()

  const dataVersion = useDataChanged()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PledgeStatus>('All')

  const [openNew, setOpenNew] = useState(false)
  const [amount, setAmount] = useState('500')
  const [note, setNote] = useState('')
  const [reportId, setReportId] = useState('')

  const canPledge = user?.role === 'donor'

  const shortages = useMemo<ShortageReport[]>(() => {
    return listShortages().filter((s) => s.verified)
  }, [dataVersion])

  const shortageById = useMemo(() => {
    const map = new Map<string, ShortageReport>()
    shortages.forEach((s) => map.set(s.id, s))
    return map
  }, [shortages])

  const pledges = useMemo<DonationPledge[]>(() => {
    const all = listPledges().filter((p) => {
      if (!canPledge) return false
      return p.donorName === (user?.name ?? '')
    })

    const q = query.trim().toLowerCase()
    return all
      .filter((p) => {
        if (status !== 'All' && p.status !== status) return false
        if (!q) return true

        const shortage = shortageById.get(p.reportId)
        const shortageText = shortage
          ? `${shortage.medicationName} ${shortage.genericName} ${shortage.facilityName} ${shortage.region}`.toLowerCase()
          : ''

        return (
          p.id.toLowerCase().includes(q) ||
          p.donorName.toLowerCase().includes(q) ||
          p.donorOrg.toLowerCase().includes(q) ||
          p.reportId.toLowerCase().includes(q) ||
          shortageText.includes(q)
        )
      })
      .sort((a, b) => b.pledgedAt.localeCompare(a.pledgedAt))
  }, [canPledge, dataVersion, query, shortageById, status, user?.name])

  function submitNew() {
    if (!reportId.trim()) {
      toast.error('Please select a shortage report')
      return
    }

    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Amount must be a positive number')
      return
    }

    upsertPledge({
      id: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName: user?.name ?? 'Donor',
      donorOrg: 'Aid Organization',
      reportId,
      amountUsd: amt,
      note: note.trim() || 'Donation pledge',
      pledgedAt: new Date().toISOString(),
      status: 'Pledged',
    })

    toast.success('Pledge created successfully')
    setOpenNew(false)
    setAmount('500')
    setNote('')
    setReportId('')
  }

  return (
    <div>
      <PageHeader
        subtitle="Donations"
        title="My Pledges"
        actions={
          <>
            {canPledge ? (
            <Button onClick={() => setOpenNew(true)}>
              New pledge
            </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by pledge ID, medicine, facility, region, or report ID"
        />
        <div className="relative">
          <Select value={status} onChange={(e) => setStatus(e.target.value as PledgeStatus)}>
            <option value="All">All statuses</option>
            <option value="Pledged">Pledged</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
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

      <div className="grid gap-6">
        <div className="space-y-4">
          {pledges.map((p) => (
            (() => {
              const report = shortageById.get(p.reportId)
              return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{p.donorOrg}</CardTitle>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {p.id} · {formatDateTime(p.pledgedAt)}
                  </div>
                  {report ? (
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      For: {report.medicationName} · {report.facilityName} · {report.region}
                    </div>
                  ) : null}
                </div>
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="mb-4">
                  <Stepper
                    size="sm"
                    steps={[
                      { key: 'Pledged', label: 'Pledged' },
                      { key: 'In Transit', label: 'In Transit' },
                      { key: 'Delivered', label: 'Delivered' },
                    ]}
                    activeIndex={statusToStepIndex(p.status)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Donor</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{p.donorName}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Report</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{p.reportId}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Amount</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">${p.amountUsd}</div>
                  </div>
                </div>

                {report ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Medication</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {report.medicationName}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Generic</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{report.genericName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Quantity needed</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{report.quantityNeeded}</div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 text-sm font-semibold text-slate-700">{p.note}</div>
              </CardContent>
            </Card>
              )
            })()
          ))}

          {pledges.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600">No pledges found.</div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={openNew}
        title="New Pledge"
        onClose={() => setOpenNew(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenNew(false)}>
              Cancel
            </Button>
            <Button onClick={submitNew}>Create</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Shortage report</div>
            <div className="relative">
              <Select value={reportId} onChange={(e) => setReportId(e.target.value)}>
                <option value="">Select a verified shortage…</option>
                {shortages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.medicationName} ({s.region}) — {s.id}
                  </option>
                ))}
              </Select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">▾</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Amount (USD)</div>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Note</div>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
