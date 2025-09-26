import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileArchive,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { exportImportService } from '../services/exportImportService';
import { type ExportOptions, type ImportResult, type ImportDiff } from '../types/admin';

export const ExportImportPage: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeSnapshots: true,
    includeMedia: false,
    snapshotId: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportImportService.exportData(exportOptions);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resort-website-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const result = await exportImportService.importData(file, dryRun);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      handleImport(file);
    }
  };

  const applyImport = async () => {
    if (!importResult || !fileInputRef.current?.files?.[0]) return;

    setImporting(true);
    try {
      const result = await exportImportService.importData(fileInputRef.current.files[0], false);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export & Import</h1>
        <p className="text-gray-600 mt-2">
          Backup your website data or restore from a previous export
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Export Data</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Create a backup of all your website content, settings, and media files.
          </p>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeSnapshots}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeSnapshots: e.target.checked
                  })}
                  className="rounded text-primary-600"
                />
                <span className="text-sm">Include all snapshots</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMedia}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeMedia: e.target.checked
                  })}
                  className="rounded text-primary-600"
                />
                <span className="text-sm">Include media files (warning: larger file size)</span>
              </label>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              <FileArchive className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Import Data</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Restore your website from a previously exported backup file.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Important</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Import will overwrite your current data. Always create a backup before importing.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="rounded text-primary-600"
                />
                <span className="text-sm">Preview changes first (recommended)</span>
              </label>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileArchive className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drop a .zip file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Only files exported from this website are supported
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h2 className="text-xl font-semibold">
              {dryRun ? 'Import Preview' : 'Import Results'}
            </h2>
            {dryRun && (
              <Button
                variant="outline"
                size="sm"
                onClick={applyImport}
                disabled={importing}
                className="ml-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
            )}
          </div>

          {importResult.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  {dryRun
                    ? 'Preview completed successfully. Review changes below.'
                    : 'Import completed successfully!'}
                </p>
              </div>

              {importResult.diff && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {importResult.diff.added}
                      </div>
                      <div className="text-sm text-gray-600">Added</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {importResult.diff.modified}
                      </div>
                      <div className="text-sm text-gray-600">Modified</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {importResult.diff.removed}
                      </div>
                      <div className="text-sm text-gray-600">Removed</div>
                    </div>
                  </div>

                  {importResult.diff.details.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Detailed Changes</h3>
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {importResult.diff.details.map((detail, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50">
                            {detail.type === 'added' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {detail.type === 'modified' && (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            )}
                            {detail.type === 'removed' && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{detail.entity}:</span>
                            <span>{detail.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{importResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Export Format Info */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h3 className="font-medium mb-3">Export Format</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Export files are ZIP archives containing:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code className="bg-gray-200 px-1 rounded">manifest.json</code> - Export metadata</li>
            <li><code className="bg-gray-200 px-1 rounded">content/</code> - All content (draft, published, settings)</li>
            <li><code className="bg-gray-200 px-1 rounded">snapshots/</code> - Content snapshots (if included)</li>
            <li><code className="bg-gray-200 px-1 rounded">media/</code> - Media files (if included)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};