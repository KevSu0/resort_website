import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  Building,
  Image,
  Tag,
  MessageSquare,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Shield
} from 'lucide-react';
<<<<<<< HEAD:src/admin/components/AdminLayout.tsx
=======
import { useAuth } from '../../hooks/admin/useAuth';
import { ADMIN_CONFIG } from '../config/adminConfig';
import { SkipLinks } from './AccessibilityComponents';
import { ARIA_ROLES, useKeyboardNavigation } from '../utils/accessibility';
>>>>>>> 7a1d48b79540236df1d8f5bdfbb986d46d90119a:resort-website/src/admin/components/AdminLayout.tsx

interface AdminLayoutProps {
  children?: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
  {
    name: 'Content',
    href: '/admin/content',
    icon: <Building className="w-5 h-5" />,
    description: 'Properties, Rooms, Places'
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: <Image className="w-5 h-5" />,
    description: 'Images & Videos'
  },
  {
    name: 'Offers',
    href: '/admin/offers',
    icon: <Tag className="w-5 h-5" />,
    description: 'Discounts & Promotions'
  },
  {
    name: 'Enquiries',
    href: '/admin/enquiries',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Customer enquiries'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'Site configuration'
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

<<<<<<< HEAD:src/admin/components/AdminLayout.tsx
  // Mock user data - authentication disabled
  const user = {
    username: 'Admin',
    role: 'Administrator'
=======
  // Keyboard navigation for sidebar toggle
  const sidebarKeyboardNav = useKeyboardNavigation(
    () => setSidebarOpen(true),  // Enter
    () => setSidebarOpen(true),  // Space
    () => setSidebarOpen(false)  // Escape
  );

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    // Don't navigate to login when auth is disabled
    if (!ADMIN_CONFIG.DISABLE_AUTH) {
      navigate('/admin/login');
    }
>>>>>>> 7a1d48b79540236df1d8f5bdfbb986d46d90119a:resort-website/src/admin/components/AdminLayout.tsx
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLinks />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        role={ARIA_ROLES.navigation}
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link
              to="/admin"
              className="flex items-center gap-3"
              aria-label="Wayanad Nature Resorts Admin Panel"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              {...sidebarKeyboardNav}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Admin navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-700 ml-0'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:ml-1'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className={`mr-4 flex-shrink-0 ${
                  isActive(item.href) ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                }`} aria-hidden="true">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block font-medium">{item.name}</span>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* User section */}
<<<<<<< HEAD:src/admin/components/AdminLayout.tsx
          <div className="border-t p-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
=======
          <div className="border-t border-gray-200 p-6" role="region" aria-label="User information">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center" aria-hidden="true">
>>>>>>> 7a1d48b79540236df1d8f5bdfbb986d46d90119a:resort-website/src/admin/components/AdminLayout.tsx
                <span className="text-gray-600 font-medium text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
<<<<<<< HEAD:src/admin/components/AdminLayout.tsx
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <div className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md">
              Authentication Disabled
            </div>
=======
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              Logout
            </button>
>>>>>>> 7a1d48b79540236df1d8f5bdfbb986d46d90119a:resort-website/src/admin/components/AdminLayout.tsx
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                {...sidebarKeyboardNav}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
                aria-controls="sidebar-navigation"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0" id="page-title">
                {navigation.find(item => isActive(item.href))?.name || 'Admin'}
              </h1>

              {/* Development mode indicator */}
              {ADMIN_CONFIG.DISABLE_AUTH && ADMIN_CONFIG.SHOW_DEV_MODE && (
                <div className="ml-4 flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full" role="status" aria-live="polite">
                  <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
                  Development Mode
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search admin panel"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button
                className="p-1 text-gray-400 hover:text-gray-500 relative focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400" aria-hidden="true"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center" aria-hidden="true">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1"
          role={ARIA_ROLES.main}
          aria-labelledby="page-title"
          id="main-content"
          tabIndex={-1}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};
