import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer, useGlobalToast } from './components/ui/toast';
import { HomePage } from './pages/HomePage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MediaPage } from './pages/admin/MediaPage';
import { ContentPage } from './pages/admin/ContentPage';
import { OffersPage } from './pages/admin/OffersPage';
import { OfferFormPage } from './pages/admin/OfferFormPage';
import { EnquiriesPage } from './admin/components/EnquiriesPage';
import { EnquiryDetailPage } from './admin/components/EnquiryDetailPage';
import { EnquiryFormPage } from './admin/components/EnquiryFormPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SystemPage } from './pages/admin/SystemPage';
import { ExportImportPage } from './admin/components/ExportImportPage';
import { ADMIN_CONFIG } from './admin/config/adminConfig';

function AppWithGlobalToast() {
  useGlobalToast();
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />

<<<<<<< HEAD:src/App.tsx
        {/* Admin Routes - Authentication Disabled */}
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/media" element={<MediaPage />} />
        <Route path="/admin/*" element={<DashboardPage />} />
      </Routes>
    </Router>
=======
          {/* Admin Routes */}
          {ADMIN_CONFIG.DISABLE_AUTH ? (
            <>
              {/* When auth is disabled, redirect login to dashboard */}
              <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/content" element={<ContentPage />} />
              <Route path="/admin/media" element={<MediaPage />} />
              <Route path="/admin/offers" element={<OffersPage />} />
              <Route path="/admin/offers/new" element={<OfferFormPage />} />
              <Route path="/admin/offers/:id" element={<OfferFormPage />} />
              <Route path="/admin/offers/:id/edit" element={<OfferFormPage />} />
              <Route path="/admin/enquiries" element={<EnquiriesPage />} />
              <Route path="/admin/enquiries/new" element={<EnquiryFormPage />} />
              <Route path="/admin/enquiries/:id" element={<EnquiryDetailPage />} />
              <Route path="/admin/enquiries/:id/edit" element={<EnquiryFormPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/system" element={<SystemPage />} />
              <Route path="/admin/export-import" element={<ExportImportPage />} />
              <Route path="/admin/*" element={<DashboardPage />} />
            </>
          ) : (
            <>
              {/* Normal auth-enabled routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/content" element={<ContentPage />} />
              <Route path="/admin/media" element={<MediaPage />} />
              <Route path="/admin/offers" element={<OffersPage />} />
              <Route path="/admin/offers/new" element={<OfferFormPage />} />
              <Route path="/admin/offers/:id" element={<OfferFormPage />} />
              <Route path="/admin/offers/:id/edit" element={<OfferFormPage />} />
              <Route path="/admin/enquiries" element={<EnquiriesPage />} />
              <Route path="/admin/enquiries/new" element={<EnquiryFormPage />} />
              <Route path="/admin/enquiries/:id" element={<EnquiryDetailPage />} />
              <Route path="/admin/enquiries/:id/edit" element={<EnquiryFormPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/system" element={<SystemPage />} />
              <Route path="/admin/export-import" element={<ExportImportPage />} />
              <Route path="/admin/*" element={<DashboardPage />} />
            </>
          )}
        </Routes>
        <ToastContainer />
      </Router>
    </ErrorBoundary>
>>>>>>> 7a1d48b79540236df1d8f5bdfbb986d46d90119a:resort-website/src/App.tsx
  );
}

export default AppWithGlobalToast;