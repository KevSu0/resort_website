import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  BarChart3,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../admin/components/ui/card/Card';
import { Button } from '../../admin/components/ui/button/Button';
import { Input } from '../../admin/components/ui/input/Input';
import { Modal } from '../../admin/components/ui/modal/Modal';
import { useAuthContext } from '../../admin/components/auth';
import { useToast } from '../../admin/components/ui/toast';

interface Report {
  id: string;
  name: string;
  type: 'booking' | 'revenue' | 'occupancy' | 'guest' | 'activity';
  description: string;
  generatedAt: string;
  size: string;
  format: 'pdf' | 'xlsx' | 'csv';
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Revenue Report - January 2024',
    type: 'revenue',
    description: 'Comprehensive revenue analysis for January 2024',
    generatedAt: '2024-01-31T10:30:00Z',
    size: '2.4 MB',
    format: 'pdf'
  },
  {
    id: '2',
    name: 'Occupancy Analysis - Q4 2023',
    type: 'occupancy',
    description: 'Quarterly occupancy rates and trends analysis',
    generatedAt: '2024-01-15T14:45:00Z',
    size: '1.8 MB',
    format: 'xlsx'
  },
  {
    id: '3',
    name: 'Guest Demographics Report',
    type: 'guest',
    description: 'Analysis of guest demographics and preferences',
    generatedAt: '2024-01-10T09:15:00Z',
    size: '3.1 MB',
    format: 'pdf'
  },
  {
    id: '4',
    name: 'Booking Summary - December 2023',
    type: 'booking',
    description: 'Monthly booking statistics and trends',
    generatedAt: '2024-01-05T16:20:00Z',
    size: '856 KB',
    format: 'csv'
  },
];

const reportTypes = [
  { id: 'booking', label: 'Booking Reports', icon: FileText, color: 'blue' },
  { id: 'revenue', label: 'Revenue Reports', icon: DollarSign, color: 'green' },
  { id: 'occupancy', label: 'Occupancy Reports', icon: BarChart3, color: 'purple' },
  { id: 'guest', label: 'Guest Reports', icon: Users, color: 'orange' },
  { id: 'activity', label: 'Activity Reports', icon: Activity, color: 'red' },
];

export const ReportsPage: React.FC = () => {
  const { can } = useAuthContext();
  const { showSuccess } = useToast();
  const [reports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');

  if (!can('view_reports')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view reports.
          </p>
        </div>
      </div>
    );
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDownload = (report: Report) => {
    showSuccess('Download Started', `Downloading ${report.name}`);
    // In a real app, this would trigger an actual download
  };

  const handleGenerateReport = () => {
    setShowGenerateModal(false);
    showSuccess('Report Generation Started', 'Your report is being generated. You will receive an email when it\'s ready.');
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download various reports for your resort.
          </p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const count = reports.filter(r => r.type === type.id).length;
          const Icon = type.icon;
          return (
            <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedType(type.id === selectedType ? 'all' : type.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {type.label}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Icon className={`h-8 w-8 text-${type.color}-500`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Types</option>
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-2">
        {filteredReports.map((report) => {
          const reportType = reportTypes.find(t => t.id === report.type);
          const Icon = reportType?.icon || FileText;
          return (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(report.generatedAt)}</span>
                        <span>•</span>
                        <span>{formatFileSize(report.size)}</span>
                        <span>•</span>
                        <span className="uppercase">{report.format}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => setShowGenerateModal(true)}>
              Generate New Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate New Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="">Select report type...</option>
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Date Range</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input type="date" placeholder="Start date" />
              <Input type="date" placeholder="End date" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Format</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md">
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};