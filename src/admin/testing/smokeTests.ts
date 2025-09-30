/**
 * Gate A: Smoke Test Suite
 * Automated verification of critical admin functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminLayout } from '../components/AdminLayout';
import { Dashboard } from '../components/Dashboard';
import { authService } from '../services/authService';
import { storageService } from '../../services/storage';
import { useToast } from '../hooks/useToast';

// Test configuration
const SMOKE_TEST_CONFIG = {
  timeout: 10000, // 10 seconds per test
  retries: 3,
  criticalPath: [
    'authentication',
    'dashboard',
    'navigation',
    'storage',
    'api-connectivity',
  ],
};

// Test results interface
interface SmokeTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  timestamp: string;
}

export class SmokeTestSuite {
  private results: SmokeTestResult[] = [];

  async runAllTests(): Promise<SmokeTestResult[]> {
    this.results = [];
    console.log('🚀 Starting smoke tests...');

    for (const testName of SMOKE_TEST_CONFIG.criticalPath) {
      const result = await this.runTest(testName);
      this.results.push(result);
    }

    console.log('✅ Smoke tests completed');
    return this.results;
  }

  private async runTest(testName: string): Promise<SmokeTestResult> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < SMOKE_TEST_CONFIG.retries) {
      try {
        switch (testName) {
          case 'authentication':
            await this.testAuthentication();
            break;
          case 'dashboard':
            await this.testDashboard();
            break;
          case 'navigation':
            await this.testNavigation();
            break;
          case 'storage':
            await this.testStorage();
            break;
          case 'api-connectivity':
            await this.testApiConnectivity();
            break;
          default:
            throw new Error(`Unknown test: ${testName}`);
        }

        const duration = Date.now() - startTime;
        return {
          name: testName,
          passed: true,
          duration,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        attempt++;
        if (attempt === SMOKE_TEST_CONFIG.retries) {
          const duration = Date.now() - startTime;
          return {
            name: testName,
            passed: false,
            duration,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          };
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Unexpected error in test execution');
  }

  private async testAuthentication(): Promise<void> {
    // Test authentication service availability
    const isLoggedIn = authService.isAuthenticated();
    console.log('Auth service status:', isLoggedIn ? 'Logged in' : 'Not authenticated');

    // Test token validation
    if (isLoggedIn) {
      const isValid = await authService.validateToken();
      if (!isValid) {
        throw new Error('Invalid authentication token');
      }
    }
  }

  private async testDashboard(): Promise<void> {
    // Test dashboard component rendering
    const { container } = render(<Dashboard />);

    // Check for critical elements
    const statsCards = container.querySelectorAll('.stat-card');
    if (statsCards.length === 0) {
      throw new Error('Dashboard stats cards not found');
    }

    // Check charts
    const charts = container.querySelectorAll('[role="img"]');
    if (charts.length === 0) {
      throw new Error('Dashboard charts not rendered');
    }
  }

  private async testNavigation(): Promise<void> {
    // Test AdminLayout navigation
    const { container } = render(<AdminLayout />);

    // Check navigation links
    const navLinks = container.querySelectorAll('nav a');
    if (navLinks.length === 0) {
      throw new Error('Navigation links not found');
    }

    // Test mobile menu toggle
    const menuButton = container.querySelector('button[aria-label="Open sidebar"]');
    if (!menuButton) {
      throw new Error('Mobile menu button not found');
    }

    // Simulate click
    fireEvent.click(menuButton);

    // Check if sidebar opens
    const sidebar = container.querySelector('[role="navigation"]');
    if (!sidebar || !sidebar.classList.contains('translate-x-0')) {
      throw new Error('Sidebar not opening on mobile');
    }
  }

  private async testStorage(): Promise<void> {
    // Test storage service
    const testKey = 'smoke_test_key';
    const testData = { timestamp: Date.now() };

    // Test set and get
    storageService.set(testKey, testData);
    const retrieved = storageService.get(testKey);

    if (!retrieved || retrieved.timestamp !== testData.timestamp) {
      throw new Error('Storage service not working correctly');
    }

    // Cleanup
    storageService.remove(testKey);
  }

  private async testApiConnectivity(): Promise<void> {
    // Test API endpoints
    const endpoints = [
      '/api/health',
      '/api/admin/stats',
      '/api/admin/enquiries',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API ${endpoint} returned ${response.status}`);
        }
      } catch (error) {
        throw new Error(`API ${endpoint} failed: ${error}`);
      }
    }
  }

  getResults(): SmokeTestResult[] {
    return this.results;
  }

  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = (passed / total) * 100;
    const totalDuration = this.results.reduce((acc, r) => acc + r.duration, 0);

    return {
      passed,
      total,
      passRate,
      totalDuration,
      criticalIssues: this.results.filter(r => !r.passed).map(r => r.name),
    };
  }
}

// Health check component for dashboard
export const HealthCheckDashboard = () => {
  const [results, setResults] = React.useState<SmokeTestResult[]>([]);
  const [running, setRunning] = React.useState(false);

  const runTests = async () => {
    setRunning(true);
    const suite = new SmokeTestSuite();
    const testResults = await suite.runAllTests();
    setResults(testResults);
    setRunning(false);
  };

  React.useEffect(() => {
    runTests();
  }, []);

  const summary = React.useMemo(() => {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    return { passed, total, passRate: total > 0 ? (passed / total) * 100 : 0 };
  }, [results]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">System Health Check</h2>
        <button
          onClick={runTests}
          disabled={running}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {running ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Overall Status</h3>
          <div className={`text-3xl font-bold ${summary.passRate === 100 ? 'text-green-600' : summary.passRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {summary.passRate.toFixed(0)}%
          </div>
          <p className="text-sm text-gray-600">{summary.passed}/{summary.total} tests passing</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Test Coverage</h3>
          <div className="text-3xl font-bold text-blue-600">{SMOKE_TEST_CONFIG.criticalPath.length}</div>
          <p className="text-sm text-gray-600">Critical paths tested</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Last Run</h3>
          <div className="text-lg font-semibold">
            {results.length > 0 ? new Date(results[0].timestamp).toLocaleString() : 'Never'}
          </div>
          <p className="text-sm text-gray-600">
            {results.length > 0 ? `${Math.round(results.reduce((acc, r) => acc + r.duration, 0) / 1000)}s total` : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Test Results</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.name}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  result.passed ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${result.passed ? 'bg-green-600' : 'bg-red-600'}`} />
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-600">
                      {result.duration}ms • {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className={result.passed ? 'text-green-600' : 'text-red-600'}>
                  {result.passed ? '✓ Passed' : '✗ Failed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};