import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import Modal from '../components/Modal'
import Input from '../components/Input'
import PageHeader from '../components/PageHeader'
import Stepper from '../components/Stepper'
import { useAuth } from '../auth/auth-context'
import { downloadPdfText } from '../lib/download'
import { useDataChanged } from '../lib/useDataChanged'
import type { Medication, PrescriptionStatus } from '../lib/types'
import {
  getPrescription,
  sendSms,
  upsertPrescription,
} from '../lib/storage'
import { formatDateTime, uuid } from '../lib/utils'

function statusVariant(status: PrescriptionStatus) {
  if (status === 'Completed') return 'green'
  if (status === 'Verified') return 'green'
  if (status === 'Pending') return 'yellow'
  return 'gray'
}

function availabilityVariant(a: Medication['availability']) {
  if (a === 'Available') return 'green'
  if (a === 'Low') return 'yellow'
  return 'red'
}

function statusToStepIndex(status: PrescriptionStatus) {
  if (status === 'Completed') return 2
  if (status === 'Verified') return 1
  return 0
}

export default function PrescriptionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const dataVersion = useDataChanged()

  const [smsOpen, setSmsOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [activeMed, setActiveMed] = useState<Medication | null>(null)

  const prescription = useMemo(() => (id ? getPrescription(id) : undefined), [dataVersion, id])

  const [smsMessage, setSmsMessage] = useState('')

  useEffect(() => {
    if (!prescription) return
    setSmsMessage(`Your prescription ${prescription.id} is updated. Please follow the dosage instructions.`)
  }, [prescription?.id])

  if (!prescription) {
    return (
      <div>
        <PageHeader
          subtitle="Prescription"
          title="Not Found"
          actions={
            <Button variant="secondary" onClick={() => navigate('/app')}>
              Back
            </Button>
          }
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-slate-600">
              We couldn't find this prescription. Try opening a different one from the list.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const p = prescription

  if (user?.role === 'patient') {
    const idMatch = (user.patientNationalId ?? '').trim()
    if (idMatch) {
      if (p.patient.nationalId.trim() !== idMatch) {
        if (p.patient.name === (user?.name ?? '')) {
          // Allow demo access when patient uses name-based matching.
        } else {
        return (
          <div>
            <PageHeader
              subtitle="Prescription"
              title="Not Found"
              actions={
                <Button variant="secondary" onClick={() => navigate('/app')}>
                  Back
                </Button>
              }
            />
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600">
                  We couldn't find this prescription. Try opening a different one from the list.
                </div>
              </CardContent>
            </Card>
          </div>
        )
        }
      }
    } else if (p.patient.name !== (user?.name ?? '')) {
      return (
        <div>
          <PageHeader
            subtitle="Prescription"
            title="Not Found"
            actions={
              <Button variant="secondary" onClick={() => navigate('/app')}>
                Back
              </Button>
            }
          />
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-600">
                We couldn't find this prescription. Try opening a different one from the list.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  const canSendSms = user?.role === 'doctor' || user?.role === 'pharmacist'

  const canVerify = user?.role === 'pharmacist'
  const canComplete = user?.role === 'pharmacist'

  function updateStatus(next: PrescriptionStatus, label: string) {
    const updated = {
      ...p,
      status: next,
      timeline: [{ id: uuid('tl'), label, at: new Date().toISOString() }, ...p.timeline],
    }
    upsertPrescription(updated)
    toast.success(`Status updated to ${next}`)
  }

  function downloadPdf() {
    const lines = [
      "Shifaa' Prescription",
      '',
      `ID: ${p.id}`,
      `Patient: ${p.patient.name} (${p.patient.nationalId})`,
      `Doctor: ${p.doctor.name}`,
      `Status: ${p.status}`,
      '',
      'Medications:',
      ...p.medications.map((m) => `- ${m.name} (${m.dosage}) | ${m.frequency} | ${m.duration}`),
      '',
      'Notes:',
      p.notes || '-',
    ]

    downloadPdfText(`${p.id}.pdf`, lines)
    toast.success('Prescription PDF downloaded')
  }

  function openSubstitutions(med: Medication) {
    setActiveMed(med)
    setSubOpen(true)
  }

  function sendDefaultOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const message = `Your Shifaa' verification code is: ${otp}. Use this to access your prescription.`
    sendSms(p.patient.phone, message, { prescriptionId: p.id, type: 'otp' })
    toast.success('OTP sent to your phone')
  }

  return (
    <div>
      <PageHeader
        subtitle="Prescription"
        title="Prescription Details"
        actions={
          <>
            <Button variant="secondary" onClick={downloadPdf}>
              Download PDF
            </Button>
            {canSendSms ? <Button onClick={() => setSmsOpen(true)}>Send SMS</Button> : null}
          </>
        }
      />

      <div className="-mt-2 mb-6 text-sm font-semibold text-slate-500">{p.id}</div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">Patient Name</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{p.patient.name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Patient ID</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{p.patient.nationalId}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Age</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{p.patient.age} years</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Contact</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{p.patient.phone}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Created</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(p.createdAt)}</div>
              </div>
            </div>

            {user?.role === 'patient' ? (
              <div className="mt-4">
                <Button size="sm" variant="secondary" onClick={sendDefaultOtp}>
                  Request OTP
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="mb-4">
              <Stepper
                steps={[
                  { key: 'Pending', label: 'Created' },
                  { key: 'Verified', label: 'Verified' },
                  { key: 'Completed', label: 'Completed' },
                ]}
                activeIndex={statusToStepIndex(p.status)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                <div className="text-xs font-semibold text-slate-500">Ready for pickup</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {canVerify && p.status === 'Pending' ? (
                  <Button size="sm" onClick={() => updateStatus('Verified', 'Verified by Pharmacist')}>
                    Verify
                  </Button>
                ) : null}

                {canComplete && p.status !== 'Completed' ? (
                  <Button size="sm" onClick={() => updateStatus('Completed', 'Marked Completed')}>
                    Complete
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {p.timeline.map((t) => (
                <div key={t.id} className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{formatDateTime(t.at)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Prescribed Medications</CardTitle>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                Prescribed by {p.doctor.name} · {p.doctor.title}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              {p.medications.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-extrabold text-slate-900">{m.name}</div>
                    <Badge variant={availabilityVariant(m.availability)}>{m.availability}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Dosage</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{m.dosage}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Frequency</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{m.frequency}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Duration</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{m.duration}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        toast.message('Generic Name', {
                          description: `${m.name} → Generic: ${m.genericName}`,
                        })
                      }}
                    >
                      View Generic
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openSubstitutions(m)}
                      disabled={m.substitutions.length === 0}
                    >
                      {m.substitutions.length > 0
                        ? `Alternatives (${m.substitutions.slice(0, 2).join(', ')}${m.substitutions.length > 2 ? '…' : ''})`
                        : 'Alternatives'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={smsOpen}
        title="Send SMS"
        onClose={() => setSmsOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSmsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!smsMessage.trim()) {
                  toast.error('Message cannot be empty')
                  return
                }
                sendSms(p.patient.phone, smsMessage.trim(), {
                  prescriptionId: p.id,
                  type: 'status',
                })
                upsertPrescription({
                  ...p,
                  timeline: [
                    { id: uuid('tl'), label: 'SMS Sent to Patient', at: new Date().toISOString() },
                    ...p.timeline,
                  ],
                })
                toast.success('SMS sent successfully')
                setSmsOpen(false)
              }}
            >
              Send
            </Button>
          </>
        }
      >
        <div className="grid gap-2">
          <div className="text-sm font-semibold text-slate-900">To</div>
          <div className="text-sm font-semibold text-slate-700">{p.patient.phone}</div>

          <div className="mt-3 text-sm font-semibold text-slate-900">Message</div>
          <Input value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={subOpen}
        title="Medication Alternatives"
        onClose={() => setSubOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setSubOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900">Medication</div>
          <div className="text-sm font-semibold text-slate-700">{activeMed?.name}</div>

          <div className="mt-4 text-sm font-semibold text-slate-900">Suggested substitutions</div>
          <div className="space-y-2">
            {(activeMed?.substitutions ?? []).map((s) => (
              <div key={s} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                {s}
              </div>
            ))}
            {(activeMed?.substitutions ?? []).length === 0 ? (
              <div className="text-sm font-medium text-slate-500">No substitutions listed.</div>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  )
}
