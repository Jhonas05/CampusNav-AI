import { Toaster } from "@/components/ui/toaster"
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { APP_ROLES } from '@/lib/authorization';

const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Facilities = lazy(() => import('@/pages/Facilities'));
const FacilityDetail = lazy(() => import('@/pages/FacilityDetail'));
const Clara = lazy(() => import('@/pages/Clara'));
const Map = lazy(() => import('@/pages/Map'));
const Alerts = lazy(() => import('@/pages/Alerts'));
const Events = lazy(() => import('@/pages/Events'));
const Emergency = lazy(() => import('@/pages/Emergency'));
const Login = lazy(() => import('@/pages/Login'));
const QRCheckpoints = lazy(() => import('@/pages/admin/QRCheckpoints'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage'));
const AdminAudit = lazy(() => import('@/pages/admin/AdminAudit'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

const RouteFallback = () => (
  <main aria-label="Loading CampusNav" className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-4 py-10 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="h-4 w-40 animate-pulse rounded-full bg-[#E8E8ED] motion-reduce:animate-none" />
      <div className="mt-5 h-11 w-[min(420px,80%)] animate-pulse rounded-2xl bg-[#E8E8ED] motion-reduce:animate-none" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-3xl bg-[#E8E8ED] motion-reduce:animate-none" />
        ))}
      </div>
      <p className="mt-8 text-sm font-medium text-[#6E6E73]">Loading CampusNav...</p>
    </div>
  </main>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route path="/clara" element={<Clara />} />
              <Route path="/map" element={<Map />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/events" element={<Events />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><AdminOverview /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><AdminContentPage resource="announcements" /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><AdminContentPage resource="events" /></ProtectedRoute>} />
              <Route path="/admin/facility-advisories" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><AdminContentPage resource="facilityAdvisories" /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><AdminContentPage resource="notifications" /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><AdminAudit /></ProtectedRoute>} />
              <Route path="/admin/qr-checkpoints" element={<ProtectedRoute requiredRoles={[APP_ROLES.SUPER_ADMIN]}><QRCheckpoints /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App
