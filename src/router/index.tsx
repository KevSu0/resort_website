import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import Layout from '../components/Layout';
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
const AdminPropertyForm = lazy(() => import('../pages/admin/PropertyForm'));
const LoginPage = lazy(() => import('../pages/LoginPage'));

// Route loaders for data fetching
import { propertyLoader, cityLoader, stayTypeLoader, searchLoader, adminLoader, propertyAdminLoader } from './loaders';

const BookingPage = lazy(() => import('../pages/BookingPage'));

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    errorElement: <ErrorBoundary><div>Something went wrong</div></ErrorBoundary>,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'search',
        element: <SearchPage />,
        loader: searchLoader
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'contact',
        element: <ContactPage />
      },
      // Dynamic property routes
      {
        path: 'properties/:propertySlug',
        element: <PropertyPage />,
        loader: propertyLoader,
        errorElement: <NotFoundPage />
      },
      {
        path: 'properties/:propertySlug/book',
        element: <BookingPage />,
        loader: propertyLoader,
        errorElement: <NotFoundPage />
      },
      {
        path: 'properties/:propertySlug/:stayType',
        element: <StayTypePage />,
        loader: stayTypeLoader,
        errorElement: <NotFoundPage />
      },
      // Dynamic city routes
      {
        path: 'locations/:citySlug',
        element: <CityPage />,
        loader: cityLoader,
        errorElement: <NotFoundPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      // Admin routes (protected)
      {
        path: 'admin',
        loader: adminLoader,
        children: [
          {
            index: true,
            element: <AdminDashboard />
          },
          {
            path: 'properties',
            element: <AdminProperties />
          },
          {
            path: 'properties/new',
            element: <AdminPropertyForm />
          },
          {
            path: 'properties/:propertyId/edit',
            element: <AdminPropertyForm />,
            loader: propertyAdminLoader
          },
          {
            path: 'cities',
            element: <AdminCities />
          },
          {
            path: 'enquiries',
            element: <AdminEnquiries />
          },
          {
            path: 'offers',
            element: <AdminOffers />
          },
          {
            path: 'users',
            element: <AdminUsers />
          },
          {
            path: 'settings',
            element: <AdminSettings />
          }
        ]
      },
      // Catch-all route for 404
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

// Export router for testing and other uses
export { router };