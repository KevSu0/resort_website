import { AdminLayout } from '../../admin/components/AdminLayout';
import { Dashboard } from '../../admin/components/Dashboard';
import { ADMIN_CONFIG } from '../../admin/config/adminConfig';

export const DashboardPage: React.FC = () => {
  // Bypass authentication when disabled
  if (ADMIN_CONFIG.DISABLE_AUTH) {
    return (
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    );
  }

  // Original authentication flow (for when auth is enabled)
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};