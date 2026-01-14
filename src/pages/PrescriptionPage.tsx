import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import Modal from '../components/Modal'
import Input from '../components/Input'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../auth/auth-context'
import type { Prescription, PrescriptionStatus } from '../lib/types'
import { listPrescriptions, listShortages, upsertPrescription } from '../lib/storage'
import { useDataChanged } from '../lib/useDataChanged'
import { uuid } from '../lib/utils'

function statusVariant(status: PrescriptionStatus) {
  if (status === 'Completed') return 'green'
  if (status === 'Verified') return 'green'
  if (status === 'Pending') return 'yellow'
  return 'gray'
}

export default function PrescriptionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const dataVersion = useDataChanged()

  const [items, setItems] = useState<Prescription[]>(() => listPrescriptions())
  const [openNew, setOpenNew] = useState(false)

  const [patientName, setPatientName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [phone, setPhone] = useState('')

  const [selectedMedicine, setSelectedMedicine] = useState('')
  const [customMedicine, setCustomMedicine] = useState('')
  const [dosage, setDosage] = useState('500mg')
  const [frequency, setFrequency] = useState('Twice daily')
  const [duration, setDuration] = useState('5 days')

  const canCreate = user?.role === 'doctor'

  function refresh() {
    const all = listPrescriptions()
    if (user?.role === 'patient') {
      const id = (user.patientNationalId ?? '').trim()
      if (id) {
        const byId = all.filter((p) => p.patient.nationalId.trim() === id)
        if (byId.length > 0) {
          setItems(byId)
          return
        }
        setItems(all.filter((p) => p.patient.name === (user?.name ?? '')))
        return
      }
      setItems(all.filter((p) => p.patient.name === (user?.name ?? '')))
      return
    }
    setItems(all)
  }

  useEffect(() => {
    refresh()
  }, [dataVersion, user?.name, user?.role])

  const visibleItems = useMemo(() => {
    if (user?.role !== 'patient') return items
    const id = (user.patientNationalId ?? '').trim()
    if (id) {
      const byId = items.filter((p) => p.patient.nationalId.trim() === id)
      if (byId.length > 0) return byId
      return items.filter((p) => p.patient.name === (user?.name ?? ''))
    }
    return items.filter((p) => p.patient.name === (user?.name ?? ''))
  }, [items, user?.name, user?.patientNationalId, user?.role])

  const medicineOptions = useMemo(() => {
    const map = new Map<string, string[]>()
    listPrescriptions().forEach((p) => p.medications.forEach((m) => {
      const existing = map.get(m.name) || []
      map.set(m.name, [...new Set([...existing, ...m.substitutions])])
    }))
    listShortages().forEach((s) => {
      if (!map.has(s.medicationName)) map.set(s.medicationName, [])
    })
    return Array.from(map.entries())
      .map(([name, subs]) => ({ name, subs }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [dataVersion])

  function createDummyPrescription() {
    if (!patientName.trim() || !patientId.trim() || !phone.trim()) {
      toast.error('Please fill in patient name, ID, and phone')
      return
    }

    const medName = (customMedicine.trim() || selectedMedicine.trim())
    if (!medName) {
      toast.error('Please add at least one medicine')
      return
    }

    // Pull substitutions from the selected dropdown option if available
    const selectedOption = medicineOptions.find(opt => opt.name === selectedMedicine.trim())
    const substitutions = selectedOption ? selectedOption.subs : []

    const id = `RX-${Math.floor(100 + Math.random() * 900)}`

    const next: Prescription = {
      id,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      patient: {
        name: patientName.trim(),
        nationalId: patientId.trim(),
        age: 30,
        phone: phone.trim(),
      },
      doctor: { name: user?.name ?? 'Dr. User', title: 'General Practitioner' },
      notes: 'Take medication with food. Return if symptoms worsen.',
      medications: [
        {
          id: uuid('med'),
          name: medName,
          genericName: medName,
          dosage: dosage.trim() || '500mg',
          frequency: frequency.trim() || 'Twice daily',
          duration: duration.trim() || '5 days',
          availability: 'Available',
          substitutions,
        },
      ],
      timeline: [{ id: uuid('tl'), label: 'Prescription Created', at: new Date().toISOString() }],
    }

    upsertPrescription(next)
    toast.success('Prescription created successfully')
    setOpenNew(false)
    setPatientName('')
    setPatientId('')
    setPhone('')
    setSelectedMedicine('')
    setCustomMedicine('')
    refresh()
    navigate(`/app/prescription/${id}`)
  }

  return (
    <div>
      <PageHeader
        subtitle="Prescription"
        title="Prescriptions"
        actions={
          canCreate ? (
            <Button onClick={() => setOpenNew(true)}>New Prescription</Button>
          ) : null
        }
      />

      <div className="grid gap-6">
        <div className="space-y-4">
          {visibleItems.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{p.patient.name}</CardTitle>
                  <div className="mt-1 text-xs font-medium text-slate-500">{p.id}</div>
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
                    <div className="text-xs font-semibold text-slate-500">Contact</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{p.patient.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Doctor</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{p.doctor.name}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate(`/app/prescription/${p.id}`)}>
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        open={openNew}
        title="New Prescription"
        onClose={() => setOpenNew(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenNew(false)}>
              Cancel
            </Button>
            <Button onClick={createDummyPrescription}>Create</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Patient Name</div>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Patient ID</div>
            <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Phone</div>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Medicine (dropdown)</div>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-shiffa-500 focus:ring-2 focus:ring-shiffa-200"
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
              >
                <option value="">Select a medicine…</option>
                {medicineOptions.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}{m.subs.length > 0 ? ` (${m.subs.slice(0, 2).join(', ')}${m.subs.length > 2 ? '…' : ''})` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">▾</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Medicine (text)</div>
            <Input
              value={customMedicine}
              onChange={(e) => setCustomMedicine(e.target.value)}
              placeholder="Type a medicine name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Dosage</div>
              <Input value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Frequency</div>
              <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-900">Duration</div>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
