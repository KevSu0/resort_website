import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  MousePointer,
  Calendar,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../admin/components/ui/card/Card';
import { Button } from '../../admin/components/ui/button/Button';
import { useAuthContext } from '../../admin/components/auth';

interface AnalyticsData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
}

const mockData: AnalyticsData = {
  visitors: 1243,
  pageViews: 3421,
  bounceRate: 42.3,
  avgSessionDuration: '3m 24s',
  topPages: [
    { path: '/', views: 1243, percentage: 36.3 },
    { path: '/rooms', views: 856, percentage: 25.0 },
    { path: '/activities', views: 642, percentage: 18.8 },
    { path: '/dining', views: 423, percentage: 12.4 },
    { path: '/contact', views: 257, percentage: 7.5 },
  ],
  trafficSources: [
    { source: 'Organic Search', visitors: 523, percentage: 42.1 },
    { source: 'Direct', visitors: 312, percentage: 25.1 },
    { source: 'Social Media', visitors: 210, percentage: 16.9 },
    { source: 'Referral', visitors: 198, percentage: 15.9 },
  ],
  dailyStats: [
    { date: '2024-01-01', visitors: 145, pageViews: 412 },
    { date: '2024-01-02', visitors: 189, pageViews: 523 },
    { date: '2024-01-03', visitors: 234, pageViews: 645 },
    { date: '2024-01-04', visitors: 198, pageViews: 543 },
    { date: '2024-01-05', visitors: 267, pageViews: 712 },
    { date: '2024-01-06', visitors: 210, pageViews: 589 },
    { date: '2024-01-07', visitors: 156, pageViews: 423 },
  ],
};

export const AnalyticsPage: React.FC = () => {
  const { can } = useAuthContext();
  const [dateRange, setDateRange] = useState('7d');
  const [data] = useState<AnalyticsData>(mockData);

  if (!can('view_analytics')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your website performance and visitor insights.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Visitors
                </p>
                <p className="text-2xl font-bold">{data.visitors.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Page Views
                </p>
                <p className="text-2xl font-bold">{data.pageViews.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8.3%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bounce Rate
                </p>
                <p className="text-2xl font-bold">{data.bounceRate}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                  <span className="text-sm text-red-500">-2.1%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Session
                </p>
                <p className="text-2xl font-bold">{data.avgSessionDuration}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+15s</span>
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{page.path}</p>
                      <p className="text-sm text-muted-foreground">
                        {page.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{page.percentage}%</p>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.visitors.toLocaleString()} visitors
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{source.percentage}%</p>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.dailyStats.map((stat) => (
              <div key={stat.date} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <p className="font-medium w-32">{new Date(stat.date).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="text-muted-foreground">Visitors: {stat.visitors}</span>
                    <span className="text-muted-foreground">Views: {stat.pageViews}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(stat.visitors / 300) * 100}%` }}
                    />
                  </div>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(stat.pageViews / 800) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};