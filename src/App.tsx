import { Toaster } from 'sonner'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import { AuthProvider } from './auth/auth-context'
import { useAuth } from './auth/auth-context'
import ProtectedRoute from './auth/ProtectedRoute'
import DashboardLayout from './dashboard/DashboardLayout'
import PrescriptionDetailsPage from './pages/PrescriptionDetailsPage'
import PrescriptionPage from './pages/PrescriptionPage'
import HistoryPage from './pages/HistoryPage'
import ShortagesPage from './pages/ShortagesPage'
import AnalysisPage from './pages/AnalysisPage'
import DonationsPage from './pages/DonationsPage'

function RoleLandingRedirect() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'donor') return <Navigate to="/app/shortages" replace />
  return <Navigate to="/app/prescription" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<RoleLandingRedirect />} />

            <Route element={<ProtectedRoute allowedRoles={['doctor', 'pharmacist', 'patient']} />}>
              <Route path="prescription" element={<PrescriptionPage />} />
              <Route path="prescription/:id" element={<PrescriptionDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['doctor', 'pharmacist', 'patient']} />}>
              <Route path="history" element={<HistoryPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['doctor', 'pharmacist', 'donor']} />}>
              <Route path="shortages" element={<ShortagesPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['doctor', 'pharmacist']} />}>
              <Route path="analysis" element={<AnalysisPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
              <Route path="donations" element={<DonationsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}

export default App
