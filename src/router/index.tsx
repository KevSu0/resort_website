import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const PropertyPage = lazy(() => import('../pages/PropertyPage'));
const CityPage = lazy(() => import('../pages/CityPage'));
const StayTypePage = lazy(() => import('../pages/StayTypePage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Admin pages (protected routes)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('../pages/admin/Properties'));
const AdminCities = lazy(() => import('../pages/admin/Cities'));
const AdminEnquiries = lazy(() => import('../pages/admin/Enquiries'));
const AdminOffers = lazy(() => import('../pages/admin/Offers'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

// Route loaders for data fetching
import { propertyLoader, cityLoader, stayTypeLoader } from './loaders';

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        )
      },
      {
        path: 'search',
        element: (
          <SuspenseWrapper>
            <SearchPage />
          </SuspenseWrapper>
        )
      },
      {
        path: 'about',
        element: (
          <SuspenseWrapper>
            <AboutPage />
          </SuspenseWrapper>
        )
      },
      {
        path: 'contact',
        element: (
          <SuspenseWrapper>
            <ContactPage />
          </SuspenseWrapper>
        )
      },
      // Dynamic property routes
      {
        path: 'properties/:propertySlug',
        element: (
          <SuspenseWrapper>
            <PropertyPage />
          </SuspenseWrapper>
        ),
        loader: propertyLoader,
        errorElement: <NotFoundPage />
      },
      {
        path: 'properties/:propertySlug/:stayType',
        element: (
          <SuspenseWrapper>
            <StayTypePage />
          </SuspenseWrapper>
        ),
        loader: stayTypeLoader,
        errorElement: <NotFoundPage />
      },
      // Dynamic city routes
      {
        path: 'locations/:citySlug',
        element: (
          <SuspenseWrapper>
            <CityPage />
          </SuspenseWrapper>
        ),
        loader: cityLoader,
        errorElement: <NotFoundPage />
      },
      // Admin routes (protected)
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <AdminDashboard />
              </SuspenseWrapper>
            )
          },
          {
            path: 'properties',
            element: (
              <SuspenseWrapper>
                <AdminProperties />
              </SuspenseWrapper>
            )
          },
          {
            path: 'cities',
            element: (
              <SuspenseWrapper>
                <AdminCities />
              </SuspenseWrapper>
            )
          },
          {
            path: 'enquiries',
            element: (
              <SuspenseWrapper>
                <AdminEnquiries />
              </SuspenseWrapper>
            )
          },
          {
            path: 'offers',
            element: (
              <SuspenseWrapper>
                <AdminOffers />
              </SuspenseWrapper>
            )
          },
          {
            path: 'users',
            element: (
              <SuspenseWrapper>
                <AdminUsers />
              </SuspenseWrapper>
            )
          },
          {
            path: 'settings',
            element: (
              <SuspenseWrapper>
                <AdminSettings />
              </SuspenseWrapper>
            )
          }
        ]
      },
      // Catch-all route for 404
      {
        path: '*',
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        )
      }
    ]
  }
]);

// Router Provider Component
export default function AppRouter() {
  return <RouterProvider router={router} />;
}

// Export router for testing and other uses
export { router };