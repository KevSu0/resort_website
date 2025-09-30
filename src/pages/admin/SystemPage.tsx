import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick,
  Activity,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../admin/components/ui/card/Card';
import { Button } from '../../admin/components/ui/button/Button';
import { useAuthContext } from '../../admin/components/auth';
import { useToast } from '../../admin/components/ui/toast';

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  cpu: number;
  memory: number;
  disk: number;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connections: number;
    maxConnections: number;
  };
  server: {
    status: 'running' | 'stopped' | 'error';
    responseTime: number;
    load: number;
  };
}

const mockSystemStatus: SystemStatus = {
  status: 'healthy',
  uptime: '15 days, 4 hours, 32 minutes',
  cpu: 45.2,
  memory: 67.8,
  disk: 82.3,
  database: {
    status: 'connected',
    connections: 12,
    maxConnections: 100
  },
  server: {
    status: 'running',
    responseTime: 245,
    load: 2.34
  }
};

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:45Z',
    level: 'info',
    message: 'User login successful: admin@example.com',
    source: 'auth-service'
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:28:23Z',
    level: 'warning',
    message: 'High memory usage detected: 85%',
    source: 'system-monitor'
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:25:12Z',
    level: 'error',
    message: 'Failed to connect to payment gateway',
    source: 'payment-service'
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:20:45Z',
    level: 'info',
    message: 'Database backup completed successfully',
    source: 'backup-service'
  }
];

export const SystemPage: React.FC = () => {
  const { can } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [systemStatus] = useState<SystemStatus>(mockSystemStatus);
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!can('manage_system')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access system management.
          </p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('System Refreshed', 'System status has been updated.');
    } catch (error) {
      showError('Error', 'Failed to refresh system status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'running':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
      case 'disconnected':
      case 'stopped':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'running':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
      case 'disconnected':
      case 'stopped':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'debug':
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const filteredLogs = logs.filter(log =>
    selectedLogLevel === 'all' || log.level === selectedLogLevel
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground">
            Monitor system health, performance, and logs.
          </p>
        </div>
        <Button onClick={handleRefresh} loading={isRefreshing}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Status</span>
                <span className={`flex items-center ${getStatusColor(systemStatus.status)}`}>
                  {getStatusIcon(systemStatus.status)}
                  <span className="ml-1 capitalize">{systemStatus.status}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Uptime: {systemStatus.uptime}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm">{systemStatus.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${systemStatus.cpu}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm">{systemStatus.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${systemStatus.memory}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm">{systemStatus.disk.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    systemStatus.disk > 90 ? 'bg-red-500' :
                    systemStatus.disk > 80 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${systemStatus.disk}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className={`flex items-center ${getStatusColor(systemStatus.database.status)}`}>
                {getStatusIcon(systemStatus.database.status)}
                <span className="ml-1 capitalize">{systemStatus.database.status}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm">
                {systemStatus.database.connections} / {systemStatus.database.maxConnections}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Pool</span>
              <span className="text-sm">
                {((systemStatus.database.connections / systemStatus.database.maxConnections) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Web Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className={`flex items-center ${getStatusColor(systemStatus.server.status)}`}>
                {getStatusIcon(systemStatus.server.status)}
                <span className="ml-1 capitalize">{systemStatus.server.status}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <span className="text-sm">{systemStatus.server.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Server Load</span>
              <span className="text-sm">{systemStatus.server.load.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MemoryStick className="h-5 w-5 mr-2" />
              System Logs
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={selectedLogLevel}
                onChange={(e) => setSelectedLogLevel(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
              <Button variant="outline" size="sm">
                Export Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.source}</span>
                </div>
                <p className="text-sm">{log.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <RefreshCw className="h-6 w-6 mb-2" />
              <span>Restart Services</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <HardDrive className="h-6 w-6 mb-2" />
              <span>Clear Cache</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Wifi className="h-6 w-6 mb-2" />
              <span>Test Connectivity</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};