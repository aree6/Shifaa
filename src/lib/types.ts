export type UserRole = 'doctor' | 'pharmacist' | 'patient' | 'donor'

export type AppUser = {
  id: string
  role: UserRole
  name: string
  email: string
  patientNationalId?: string
}

export type PrescriptionStatus = 'Draft' | 'Pending' | 'Verified' | 'Completed'

export type Medication = {
  id: string
  name: string
  genericName: string
  dosage: string
  frequency: string
  duration: string
  availability: 'Available' | 'Low' | 'Out'
  substitutions: string[]
}

export type PrescriptionTimelineItem = {
  id: string
  label: string
  at: string
}

export type Prescription = {
  id: string
  createdAt: string
  status: PrescriptionStatus
  patient: {
    name: string
    nationalId: string
    age: number
    phone: string
  }
  doctor: {
    name: string
    title: string
  }
  notes: string
  medications: Medication[]
  timeline: PrescriptionTimelineItem[]
}

export type SmsLog = {
  id: string
  at: string
  to: string
  message: string
  context: {
    prescriptionId?: string
    type: 'adherence' | 'refill' | 'status' | 'otp'
  }
}

export type ShortageSeverity = 'Low' | 'Medium' | 'High'

export type ShortageReport = {
  id: string
  facilityName: string
  region: string
  medicationName: string
  genericName: string
  severity: ShortageSeverity
  quantityNeeded: number
  reportedAt: string
  reportedBy: string
  verified: boolean
}

export type DonationPledge = {
  id: string
  donorName: string
  donorOrg: string
  reportId: string
  amountUsd: number
  note: string
  pledgedAt: string
  status: 'Pledged' | 'In Transit' | 'Delivered'
}
