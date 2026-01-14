import type { AppUser, DonationPledge, Prescription, ShortageReport, SmsLog, UserRole } from './types'
import { uuid } from './utils'
import { emitDataChanged } from './dataEvents'

const KEYS = {
  user: 'shiffa:user',
  prescriptions: 'shiffa:prescriptions',
  sms: 'shiffa:sms',
  shortages: 'shiffa:shortages',
  pledges: 'shiffa:pledges',
  seeded: 'shiffa:seeded',
} as const

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  emitDataChanged()
}

export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.seeded) === '1') return

  const now = new Date()
  const iso = (offsetMin: number) => new Date(now.getTime() + offsetMin * 60_000).toISOString()

  const prescriptions: Prescription[] = [
    {
      id: 'RX-001',
      createdAt: iso(-120),
      status: 'Verified',
      patient: {
        name: 'Fatima Ibrahim',
        nationalId: 'P-10234',
        age: 34,
        phone: '+249 91 555 1234',
      },
      doctor: { name: 'Dr. Sarah Mohamed', title: 'General Practitioner' },
      notes: 'Monitor blood pressure. Return for follow-up in 2 weeks.',
      medications: [
        {
          id: uuid('med'),
          name: 'Amlodipine',
          genericName: 'Amlodipine Besylate',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          availability: 'Available',
          substitutions: ['Norvasc', 'Amlocard'],
        },
        {
          id: uuid('med'),
          name: 'Aspirin',
          genericName: 'Acetylsalicylic Acid',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: '30 days',
          availability: 'Available',
          substitutions: ['Disprin', 'Ecotrin'],
        },
      ],
      timeline: [
        { id: uuid('tl'), label: 'Prescription Created', at: iso(-120) },
        { id: uuid('tl'), label: 'Verified by Pharmacist', at: iso(-90) },
      ],
    },
    {
      id: 'RX-002',
      createdAt: iso(-240),
      status: 'Completed',
      patient: {
        name: 'Ahmed Hassan',
        nationalId: 'P-12345',
        age: 45,
        phone: '+249 91 234 5678',
      },
      doctor: { name: 'Dr. Sarah Mohamed', title: 'General Practitioner' },
      notes: 'Take medication with food. Return if symptoms worsen.',
      medications: [
        {
          id: uuid('med'),
          name: 'Paracetamol',
          genericName: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '7 days',
          availability: 'Available',
          substitutions: ['Panadol', 'Tylenol'],
        },
        {
          id: uuid('med'),
          name: 'Amoxicillin',
          genericName: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '5 days',
          availability: 'Available',
          substitutions: ['Amoxil', 'Trimox'],
        },
        {
          id: uuid('med'),
          name: 'Vitamin D3',
          genericName: 'Cholecalciferol',
          dosage: '1000 IU',
          frequency: 'Once daily',
          duration: '30 days',
          availability: 'Low',
          substitutions: ['Calci-D', 'D-Caps'],
        },
      ],
      timeline: [
        { id: uuid('tl'), label: 'Prescription Created', at: iso(-240) },
        { id: uuid('tl'), label: 'Verified by Pharmacist', at: iso(-210) },
        { id: uuid('tl'), label: 'SMS Sent to Patient', at: iso(-200) },
        { id: uuid('tl'), label: 'Marked Completed', at: iso(-180) },
      ],
    },
    {
      id: 'RX-003',
      createdAt: iso(-1200),
      status: 'Pending',
      patient: {
        name: 'Mariam Ali',
        nationalId: 'P-77812',
        age: 29,
        phone: '+249 11 909 1020',
      },
      doctor: { name: 'Dr. Musa ElTahir', title: 'Family Medicine' },
      notes: 'Hydration recommended. Follow up in 3 days.',
      medications: [
        {
          id: uuid('med'),
          name: 'Oral Rehydration Salts',
          genericName: 'ORS',
          dosage: '1 sachet',
          frequency: 'After each loose stool',
          duration: '3 days',
          availability: 'Out',
          substitutions: ['Homemade ORS (salt+sugar+water)'],
        },
      ],
      timeline: [{ id: uuid('tl'), label: 'Prescription Created', at: iso(-1200) }],
    },
    {
      id: 'RX-004',
      createdAt: iso(-2400),
      status: 'Completed',
      patient: {
        name: 'Khalid Mahmoud',
        nationalId: 'P-55123',
        age: 52,
        phone: '+249 12 345 6789',
      },
      doctor: { name: 'Dr. Amina Yousif', title: 'Internal Medicine' },
      notes: 'Diabetic patient. Monitor blood glucose levels regularly.',
      medications: [
        {
          id: uuid('med'),
          name: 'Metformin',
          genericName: 'Metformin HCl',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days',
          availability: 'Available',
          substitutions: ['Glucophage', 'Fortamet'],
        },
        {
          id: uuid('med'),
          name: 'Glibenclamide',
          genericName: 'Glyburide',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '90 days',
          availability: 'Low',
          substitutions: ['Daonil', 'Diabeta'],
        },
      ],
      timeline: [
        { id: uuid('tl'), label: 'Prescription Created', at: iso(-2400) },
        { id: uuid('tl'), label: 'Verified by Pharmacist', at: iso(-2350) },
        { id: uuid('tl'), label: 'Marked Completed', at: iso(-2300) },
      ],
    },
    {
      id: 'RX-005',
      createdAt: iso(-3600),
      status: 'Completed',
      patient: {
        name: 'Zainab Osman',
        nationalId: 'P-88901',
        age: 38,
        phone: '+249 91 777 8899',
      },
      doctor: { name: 'Dr. Sarah Mohamed', title: 'General Practitioner' },
      notes: 'Complete the full course of antibiotics.',
      medications: [
        {
          id: uuid('med'),
          name: 'Azithromycin',
          genericName: 'Azithromycin',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '3 days',
          availability: 'Available',
          substitutions: ['Zithromax', 'Azee'],
        },
      ],
      timeline: [
        { id: uuid('tl'), label: 'Prescription Created', at: iso(-3600) },
        { id: uuid('tl'), label: 'Verified by Pharmacist', at: iso(-3550) },
        { id: uuid('tl'), label: 'SMS Sent to Patient', at: iso(-3540) },
        { id: uuid('tl'), label: 'Marked Completed', at: iso(-3500) },
      ],
    },
  ]

  const shortages: ShortageReport[] = [
    {
      id: 'SR-1001',
      facilityName: 'Khartoum Teaching Hospital',
      region: 'Khartoum',
      medicationName: 'Insulin',
      genericName: 'Human insulin',
      severity: 'High',
      quantityNeeded: 250,
      reportedAt: iso(-900),
      reportedBy: 'Pharmacist: Ahmed Osman',
      verified: true,
    },
    {
      id: 'SR-1002',
      facilityName: 'Omdurman Clinic',
      region: 'Omdurman',
      medicationName: 'ORS',
      genericName: 'Oral Rehydration Salts',
      severity: 'Medium',
      quantityNeeded: 600,
      reportedAt: iso(-700),
      reportedBy: 'Doctor: Dr. Musa Idris',
      verified: true,
    },
    {
      id: 'SR-1003',
      facilityName: 'Port Sudan Health Center',
      region: 'Red Sea',
      medicationName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      severity: 'Low',
      quantityNeeded: 120,
      reportedAt: iso(-450),
      reportedBy: 'Pharmacist: Hassan Ahmed',
      verified: false,
    },
    {
      id: 'SR-1004',
      facilityName: 'Wad Madani General Hospital',
      region: 'Gezira',
      medicationName: 'Metformin',
      genericName: 'Metformin HCl',
      severity: 'High',
      quantityNeeded: 400,
      reportedAt: iso(-600),
      reportedBy: 'Doctor: Dr. Amina Yousif',
      verified: true,
    },
    {
      id: 'SR-1005',
      facilityName: 'Nyala Central Hospital',
      region: 'South Darfur',
      medicationName: 'Paracetamol',
      genericName: 'Acetaminophen',
      severity: 'Medium',
      quantityNeeded: 1000,
      reportedAt: iso(-500),
      reportedBy: 'Pharmacist: Fatima Ali',
      verified: true,
    },
    {
      id: 'SR-1006',
      facilityName: 'El Fasher Hospital',
      region: 'North Darfur',
      medicationName: 'Antibiotics (General)',
      genericName: 'Various',
      severity: 'High',
      quantityNeeded: 300,
      reportedAt: iso(-400),
      reportedBy: 'Doctor: Dr. Ibrahim Hassan',
      verified: true,
    },
  ]

  const sms: SmsLog[] = [
    {
      id: uuid('sms'),
      at: iso(-200),
      to: '+249 91 234 5678',
      message: 'Your prescription RX-002 is ready for pickup. Take Paracetamol 500mg twice daily.',
      context: { prescriptionId: 'RX-002', type: 'status' },
    },
    {
      id: uuid('sms'),
      at: iso(-180),
      to: '+249 91 234 5678',
      message: 'Reminder: Please follow your prescription RX-002. Take your medications as directed.',
      context: { prescriptionId: 'RX-002', type: 'adherence' },
    },
    {
      id: uuid('sms'),
      at: iso(-3540),
      to: '+249 91 777 8899',
      message: 'Your prescription RX-005 is ready. Take Azithromycin 500mg once daily for 3 days.',
      context: { prescriptionId: 'RX-005', type: 'status' },
    },
    {
      id: uuid('sms'),
      at: iso(-90),
      to: '+249 91 555 1234',
      message: 'Your prescription RX-001 has been verified. Please visit the pharmacy for pickup.',
      context: { prescriptionId: 'RX-001', type: 'status' },
    },
  ]

  const pledges: DonationPledge[] = [
    {
      id: 'DP-9001',
      donorName: 'Hiba Suleiman',
      donorOrg: 'Sudan Health Aid Foundation',
      reportId: 'SR-1001',
      amountUsd: 1500,
      note: 'Covering emergency insulin supply for diabetic patients.',
      pledgedAt: iso(-300),
      status: 'In Transit',
    },
    {
      id: 'DP-9002',
      donorName: 'Mohamed Khalil',
      donorOrg: 'International Medical Corps',
      reportId: 'SR-1002',
      amountUsd: 800,
      note: 'ORS supplies for dehydration treatment.',
      pledgedAt: iso(-250),
      status: 'Delivered',
    },
    {
      id: 'DP-9003',
      donorName: 'Amira Hassan',
      donorOrg: 'Doctors Without Borders',
      reportId: 'SR-1004',
      amountUsd: 2000,
      note: 'Metformin for diabetes management program.',
      pledgedAt: iso(-200),
      status: 'Pledged',
    },
    {
      id: 'DP-9004',
      donorName: 'Yousif Ahmed',
      donorOrg: 'Sudan Relief Network',
      reportId: 'SR-1006',
      amountUsd: 3500,
      note: 'Antibiotics for El Fasher Hospital emergency ward.',
      pledgedAt: iso(-150),
      status: 'In Transit',
    },
  ]

  writeJson(KEYS.prescriptions, prescriptions)
  writeJson(KEYS.shortages, shortages)
  writeJson(KEYS.sms, sms)
  writeJson(KEYS.pledges, pledges)

  localStorage.setItem(KEYS.seeded, '1')
  emitDataChanged()
}

export function getUser(): AppUser | null {
  return readJson<AppUser | null>(KEYS.user, null)
}

export function login(role: UserRole, email: string): AppUser {
  const nameByRole: Record<UserRole, string> = {
    doctor: 'Dr. Sarah Mohamed',
    pharmacist: 'Ahmed Osman',
    patient: 'Fatima Ibrahim',
    donor: 'Hiba Suleiman',
  }

  const user: AppUser = {
    id: uuid('usr'),
    role,
    name: nameByRole[role],
    email,
  }

  writeJson(KEYS.user, user)
  return user
}

export function getPatientByNationalId(nationalId: string): { name: string; nationalId: string; phone: string } | null {
  const id = nationalId.trim().toLowerCase()
  if (!id) return null
  const match = listPrescriptions().find((p) => p.patient.nationalId.trim().toLowerCase() === id)
  if (!match) return null
  return {
    name: match.patient.name,
    nationalId: match.patient.nationalId,
    phone: match.patient.phone,
  }
}

export function loginPatient(nationalId: string, patientName?: string): AppUser {
  const patient = getPatientByNationalId(nationalId)
  const name = (patientName ?? '').trim()
  const user: AppUser = {
    id: uuid('usr'),
    role: 'patient',
    name: name || patient?.name || 'Patient',
    email: 'patient@shifaa.sd',
    patientNationalId: patient?.nationalId ?? nationalId.trim(),
  }

  writeJson(KEYS.user, user)
  return user
}

export function logout() {
  localStorage.removeItem(KEYS.user)
  emitDataChanged()
}

export function listPrescriptions(): Prescription[] {
  return readJson<Prescription[]>(KEYS.prescriptions, [])
}

export function getPrescription(id: string): Prescription | undefined {
  return listPrescriptions().find((p) => p.id === id)
}

export function upsertPrescription(p: Prescription) {
  const items = listPrescriptions()
  const idx = items.findIndex((x) => x.id === p.id)
  if (idx >= 0) items[idx] = p
  else items.unshift(p)
  writeJson(KEYS.prescriptions, items)
}

export function listSms(): SmsLog[] {
  return readJson<SmsLog[]>(KEYS.sms, [])
}

export function sendSms(to: string, message: string, ctx: SmsLog['context']) {
  const items = listSms()
  const entry: SmsLog = {
    id: uuid('sms'),
    at: new Date().toISOString(),
    to,
    message,
    context: ctx,
  }
  items.unshift(entry)
  writeJson(KEYS.sms, items)
  return entry
}

export function listShortages(): ShortageReport[] {
  return readJson<ShortageReport[]>(KEYS.shortages, [])
}

export function upsertShortage(report: ShortageReport) {
  const items = listShortages()
  const idx = items.findIndex((x) => x.id === report.id)
  if (idx >= 0) items[idx] = report
  else items.unshift(report)
  writeJson(KEYS.shortages, items)
}

export function listPledges(): DonationPledge[] {
  return readJson<DonationPledge[]>(KEYS.pledges, [])
}

export function upsertPledge(pledge: DonationPledge) {
  const items = listPledges()
  const idx = items.findIndex((x) => x.id === pledge.id)
  if (idx >= 0) items[idx] = pledge
  else items.unshift(pledge)
  writeJson(KEYS.pledges, items)
}

export function clearAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  emitDataChanged()
}
