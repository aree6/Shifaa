import { useMemo } from 'react'
import { toast } from 'sonner'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import PageHeader from '../components/PageHeader'
import { listPrescriptions, listShortages, listSms } from '../lib/storage'
import { useDataChanged } from '../lib/useDataChanged'

function pct(part: number, total: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

export default function AnalysisPage() {
  const dataVersion = useDataChanged()

  const metrics = useMemo(() => {
    const prescriptions = listPrescriptions()
    const shortages = listShortages()
    const sms = listSms()

    const completed = prescriptions.filter((p) => p.status === 'Completed').length
    const verified = prescriptions.filter((p) => p.status === 'Verified').length
    const pending = prescriptions.filter((p) => p.status === 'Pending').length

    const verifiedShortages = shortages.filter((s) => s.verified).length
    const highSeverity = shortages.filter((s) => s.severity === 'High').length

    return {
      totalPrescriptions: prescriptions.length,
      completed,
      verified,
      pending,
      adherenceSmsSent: sms.filter((s) => s.context.type === 'adherence').length,
      statusSmsSent: sms.filter((s) => s.context.type === 'status').length,
      totalSms: sms.length,
      totalShortages: shortages.length,
      verifiedShortages,
      highSeverity,
    }
  }, [dataVersion])

  return (
    <div>
      <PageHeader
        subtitle="Analysis"
        title="System Insights"
        actions={
          <>
            <Button
              onClick={() => {
                toast.success('Refreshed')
              }}
            >
              Refresh
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Total</div>
                <div className="font-extrabold text-slate-900">{metrics.totalPrescriptions}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Completed</div>
                <div className="font-extrabold text-slate-900">{metrics.completed}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Verified</div>
                <div className="font-extrabold text-slate-900">{metrics.verified}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Pending</div>
                <div className="font-extrabold text-slate-900">{metrics.pending}</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Completion rate</div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-shiffa-600"
                  style={{ width: `${pct(metrics.completed, metrics.totalPrescriptions)}%` }}
                />
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {pct(metrics.completed, metrics.totalPrescriptions)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Total SMS</div>
                <div className="font-extrabold text-slate-900">{metrics.totalSms}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Adherence reminders</div>
                <div className="font-extrabold text-slate-900">{metrics.adherenceSmsSent}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Status updates</div>
                <div className="font-extrabold text-slate-900">{metrics.statusSmsSent}</div>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shortage Verification</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Total reports</div>
                <div className="font-extrabold text-slate-900">{metrics.totalShortages}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Verified</div>
                <div className="font-extrabold text-slate-900">{metrics.verifiedShortages}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">High severity</div>
                <div className="font-extrabold text-slate-900">{metrics.highSeverity}</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Verification rate</div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: `${pct(metrics.verifiedShortages, metrics.totalShortages)}%` }}
                />
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {pct(metrics.verifiedShortages, metrics.totalShortages)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
