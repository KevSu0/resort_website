import { AdminLayout } from '../../admin/components/AdminLayout';
import { MediaEditor } from '../../admin/components/editors/MediaEditor';

export const MediaPage: React.FC = () => {
  // Authentication disabled - direct access to admin panel
  return (
    <AdminLayout>
      <MediaEditor />
    </AdminLayout>
  );
};