import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingProvider, RouteLoading } from './components/LoadingProvider';
import { LoadingAnnouncement } from './components/LoadingAnnouncement';
import { ToastContainer, useGlobalToast } from './components/ui/toast';
import { HomePage } from './pages/HomePage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';

function AppWithGlobalToast() {
  useGlobalToast();

  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <RouteLoading
                  isLoading={false}
                  text="Loading homepage..."
                >
                  <HomePage />
                </RouteLoading>
              }
            />
            <Route
              path="/properties/:slug"
              element={
                <RouteLoading
                  isLoading={false}
                  text="Loading property details..."
                >
                  <PropertyDetailPage />
                </RouteLoading>
              }
            />
          </Routes>
          <ToastContainer />
          <LoadingAnnouncement message="Application loaded" />
        </Router>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default AppWithGlobalToast;
