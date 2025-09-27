import { AdminLayout } from '../../admin/components/AdminLayout';
import { MediaEditor } from '../../admin/components/editors/MediaEditor';
import { ADMIN_CONFIG } from '../../admin/config/adminConfig';

export const MediaPage: React.FC = () => {
  // Bypass authentication when disabled
  if (ADMIN_CONFIG.DISABLE_AUTH) {
    return (
      <AdminLayout>
        <MediaEditor />
      </AdminLayout>
    );
  }

  // Original authentication flow (for when auth is enabled)
  return (
    <AdminLayout>
      <MediaEditor />
    </AdminLayout>
  );
};