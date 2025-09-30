import { AdminLayout } from '../../admin/components/AdminLayout';
import { Dashboard } from '../../admin/components/Dashboard';

export const DashboardPage: React.FC = () => {
  // Authentication disabled - direct access to admin panel
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};