import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import { useAuth } from '../auth/auth-context'
import type { ShortageReport, ShortageSeverity } from '../lib/types'
import { listShortages, upsertShortage, upsertPledge } from '../lib/storage'
import { useDataChanged } from '../lib/useDataChanged'
import { formatDateTime } from '../lib/utils'

function severityVariant(s: ShortageSeverity) {
  if (s === 'High') return 'red'
  if (s === 'Medium') return 'yellow'
  return 'gray'
}

export default function ShortagesPage() {
  const { user } = useAuth()

  const dataVersion = useDataChanged()

  const [items, setItems] = useState<ShortageReport[]>(() => {
    const all = listShortages()
    if (user?.role === 'donor') return all.filter((s) => s.verified)
    return all
  })
  const [query, setQuery] = useState('')

  const [newOpen, setNewOpen] = useState(false)
  const [facilityName, setFacilityName] = useState('')
  const [region, setRegion] = useState('')
  const [medicationName, setMedicationName] = useState('')
  const [genericName, setGenericName] = useState('')
  const [severity, setSeverity] = useState<ShortageSeverity>('Medium')
  const [quantityNeeded, setQuantityNeeded] = useState('')

  const [pledgeOpen, setPledgeOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ShortageReport | null>(null)
  const [pledgeAmount, setPledgeAmount] = useState('500')
  const [pledgeNote, setPledgeNote] = useState('')

  const canReport = user?.role === 'doctor' || user?.role === 'pharmacist'
  const canVerify = user?.role === 'pharmacist'
  const canPledge = user?.role === 'donor'

  function refresh() {
    const all = listShortages()
    if (user?.role === 'donor') {
      setItems(all.filter((s) => s.verified))
      return
    }
    setItems(all)
  }

  useEffect(() => {
    refresh()
  }, [dataVersion, user?.role])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((r) => {
      if (!q) return true
      return (
        r.id.toLowerCase().includes(q) ||
        r.facilityName.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.medicationName.toLowerCase().includes(q) ||
        r.genericName.toLowerCase().includes(q)
      )
    })
  }, [items, query])

  function submitNew() {
    if (!facilityName.trim() || !region.trim() || !medicationName.trim() || !quantityNeeded.trim()) {
      toast.error('Please fill required fields')
      return
    }

    const qty = Number(quantityNeeded)
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error('Quantity must be a positive number')
      return
    }

    const report: ShortageReport = {
      id: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityName: facilityName.trim(),
      region: region.trim(),
      medicationName: medicationName.trim(),
      genericName: genericName.trim() || medicationName.trim(),
      severity,
      quantityNeeded: qty,
      reportedAt: new Date().toISOString(),
      reportedBy: `${user?.role === 'doctor' ? 'Doctor' : 'Pharmacist'}: ${user?.name ?? 'User'}`,
      verified: user?.role === 'pharmacist',
    }

    upsertShortage(report)
    toast.success('Shortage reported successfully')
    setNewOpen(false)
    setFacilityName('')
    setRegion('')
    setMedicationName('')
    setGenericName('')
    setSeverity('Medium')
    setQuantityNeeded('')
    refresh()
  }

  function verifyReport(r: ShortageReport) {
    upsertShortage({ ...r, verified: true })
    toast.success('Report verified')
    refresh()
  }

  function openPledge(r: ShortageReport) {
    setSelectedReport(r)
    setPledgeOpen(true)
  }

  function submitPledge() {
    if (!selectedReport) return

    const amount = Number(pledgeAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Amount must be a positive number')
      return
    }

    upsertPledge({
      id: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName: user?.name ?? 'Donor',
      donorOrg: 'Aid Organization',
      reportId: selectedReport.id,
      amountUsd: amount,
      note: pledgeNote.trim() || 'Donation pledge',
      pledgedAt: new Date().toISOString(),
      status: 'Pledged',
    })

    toast.success('Donation pledged successfully')
    setPledgeOpen(false)
    setSelectedReport(null)
    setPledgeNote('')
    refresh()
  }

  return (
    <div>
      <PageHeader
        subtitle="Shortages"
        title={user?.role === 'donor' ? 'Verified Shortage Reports' : 'Shortage Reports'}
        actions={
          <>
            {canReport ? (
              <Button onClick={() => setNewOpen(true)}>Report Shortage</Button>
            ) : null}
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search facility, region, medicine, or report ID"
        />
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{r.medicationName}</CardTitle>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {r.facilityName} · {r.region}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {r.id} · {formatDateTime(r.reportedAt)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={severityVariant(r.severity)}>{r.severity}</Badge>
                  <Badge variant={r.verified ? 'green' : 'yellow'}>
                    {r.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Generic</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{r.genericName}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Quantity needed</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{r.quantityNeeded}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Reported by</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{r.reportedBy}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canVerify && !r.verified ? (
                    <Button size="sm" onClick={() => verifyReport(r)}>
                      Verify
                    </Button>
                  ) : null}

                  {canPledge && r.verified ? (
                    <Button size="sm" onClick={() => openPledge(r)}>
                      Pledge donation
                    </Button>
                  ) : null}

                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600">No reports found.</div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={newOpen}
        title="Report Shortage"
        onClose={() => setNewOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNew}>Submit</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Facility name</div>
            <Input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Region</div>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Medication name</div>
            <Input value={medicationName} onChange={(e) => setMedicationName(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Generic name</div>
            <Input value={genericName} onChange={(e) => setGenericName(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Severity</div>
              <div className="relative">
                <Select value={severity} onChange={(e) => setSeverity(e.target.value as ShortageSeverity)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">▾</div>
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Quantity needed</div>
              <Input value={quantityNeeded} onChange={(e) => setQuantityNeeded(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={pledgeOpen}
        title="Pledge Donation"
        onClose={() => setPledgeOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPledgeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPledge}>Pledge</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Report</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {selectedReport ? `${selectedReport.medicationName} (${selectedReport.id})` : '—'}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Amount (USD)</div>
            <Input value={pledgeAmount} onChange={(e) => setPledgeAmount(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Note</div>
            <Input value={pledgeNote} onChange={(e) => setPledgeNote(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
