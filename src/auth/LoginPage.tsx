import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { useAuth } from './auth-context'
import type { UserRole } from '../lib/types'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginPatient, user } = useAuth()

  const [role, setRole] = useState<UserRole>('doctor')
  const [email, setEmail] = useState('doctor@shifaa.sd')
  const [password, setPassword] = useState('password')

  const [patientLoginInput, setPatientLoginInput] = useState('P-10234')
  const [otpInput, setOtpInput] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const emailByRole: Record<UserRole, string> = useMemo(() => {
    return {
      doctor: 'doctor@shifaa.sd',
      pharmacist: 'pharmacist@shifaa.sd',
      patient: 'patient@shifaa.sd',
      donor: 'donor@shifaa.sd',
    }
  }, [])

  const subtitle = useMemo(() => {
    return 'Healthcare & Pharmaceutical Support System'
  }, [])

  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [navigate, user])

  useEffect(() => {
    if (role === 'patient') return
    setEmail(emailByRole[role])
  }, [emailByRole, role])

  useEffect(() => {
    if (role !== 'patient') {
      setOtpInput('')
      setIsSendingOtp(false)
      setPatientLoginInput('P-10234')
    }
  }, [role])

  return (
    <div className="min-h-screen bg-gradient-to-br from-shiffa-700 via-shiffa-700 to-shiffa-600 p-6">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-soft ring-1 ring-white/30">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-shiffa-700">Shifaa'</div>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-shiffa-500" />
            <div className="mt-6 text-2xl font-bold text-slate-900">Welcome Back</div>
            <div className="mt-2 text-sm font-medium text-slate-500">{subtitle}</div>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (role === 'patient') {
                const input = patientLoginInput.trim()
                const isNationalId = /^[A-Za-z]{1,2}-\d+/.test(input)
                const nationalId = isNationalId ? input : ''
                const name = isNationalId ? '' : input
                loginPatient(nationalId, name)
                toast.success('Signed in successfully')
                navigate('/app', { replace: true })
                return
              }

              login(role, email, password)
              toast.success('Signed in successfully')
              navigate('/app', { replace: true })
            }}
          >
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">Role</div>
              <div className="relative">
                <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="patient">Patient</option>
                  <option value="donor">Donor</option>
                </Select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▾
                </div>
              </div>
            </div>

            {role === 'patient' ? (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">National ID / Name</div>
                  <Input
                    value={patientLoginInput}
                    onChange={(e) => setPatientLoginInput(e.target.value)}
                    placeholder="P-10234 or Ahmed Ali"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSendingOtp}
                    onClick={() => {
                      setIsSendingOtp(true)
                      const code = String(Math.floor(100000 + Math.random() * 900000))
                      setOtpInput('')
                      setTimeout(() => {
                        setOtpInput(code)
                        setIsSendingOtp(false)
                        toast.success('OTP received and filled')
                      }, 1000)
                    }}
                  >
                    {isSendingOtp ? 'Sending...' : 'Send OTP'}
                  </Button>

                  <div className="space-y-2">
                
                    <Input
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="6-digit code"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Email</div>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@shifaa.sd"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Password</div>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>

          </form>
        </div>
      </div>
    </div>
  )
}
