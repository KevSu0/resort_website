import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Eye,
  GitBranch,
  Save,
  Upload,
  History,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
// import { publishService } from '../services/publishService';
// import { fileStorageService } from '../services/fileStorage';

export const PublishControls: React.FC = () => {
  // Mock user data - authentication disabled
  const user = { id: 'admin', username: 'Admin' };
  const [status, setStatus] = useState<{
    hasUnpublishedChanges: boolean;
    lastPublished?: string;
    draftModified?: string;
  }>({ hasUnpublishedChanges: false });
  const [isPublishing, setIsPublishing] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [changes, setChanges] = useState<any[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    // const status = await publishService.getDraftStatus();
    const status = {
      hasUnpublishedChanges: false,
      lastPublished: undefined,
      draftModified: undefined
    };
    setStatus(status);

    if (status.hasUnpublishedChanges) {
      // const draft = await fileStorageService.loadDraft();
      // const comparison = draft ? await publishService.compareWithPublished(draft) : null;
      // setChanges(comparison?.changes || []);
    }
  };

  const handlePublish = async () => {
    if (!user) return;

    setIsPublishing(true);
    try {
      const label = prompt('Enter a label for this publication (e.g., "Homepage update"):');
      if (!label) return;

      // await publishService.publish(
      //   {
      //     label,
      //     createSnapshot: true,
      //   },
      //   user.id
      // );

      await loadStatus();
      alert('Published successfully!');
    } catch (error) {
      alert(`Failed to publish: ${error}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    // This would be called by individual editors
    // For now, just show a message
    alert('Draft saved automatically');
  };

  const handlePreview = () => {
    // Open preview in new tab with draft mode
    window.open('/?preview=draft', '_blank');
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {status.hasUnpublishedChanges ? (
              <div className="flex items-center space-x-2 text-yellow-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Unpublished changes</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Published</span>
              </div>
            )}
          </div>

          {status.lastPublished && (
            <div className="text-sm text-gray-500">
              Last published: {new Date(status.lastPublished).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Draft</span>
          </Button>

          {status.hasUnpublishedChanges && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center space-x-2"
            >
              {isPublishing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </Button>
          )}
        </div>
      </div>

      {status.hasUnpublishedChanges && changes.length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowChanges(!showChanges)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <GitBranch className="w-4 h-4" />
            <span>{changes.length} changes</span>
            <History className="w-4 h-4 ml-2" />
          </button>

          {showChanges && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {changes.map((change, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    change.action === 'added'
                      ? 'bg-green-50 text-green-700'
                      : change.action === 'modified'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {change.action === 'added' && <CheckCircle className="w-4 h-4" />}
                    {change.action === 'modified' && <AlertCircle className="w-4 h-4" />}
                    {change.action === 'removed' && <div className="w-4 h-4 rounded-full bg-red-500"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{change.name}</p>
                    <p className="text-xs opacity-75">
                      {change.entity} • {change.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <p>
          <Save className="inline w-3 h-3 mr-1" />
          Drafts are saved automatically
        </p>
      </div>
    </div>
  );
};