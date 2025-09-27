/**
 * Gate A: Migration Verification Tool
 * Ensures database migrations are properly applied and data integrity is maintained
 */

import { storageService } from '../../services/storage';
import { migrationService } from '../services/migrationService';

interface MigrationCheck {
  name: string;
  passed: boolean;
  details: string;
  timestamp: string;
  error?: string;
}

interface DataIntegrityCheck {
  table: string;
  recordCount: number;
  schemaValid: boolean;
  foreignKeysValid: boolean;
  timestamp: string;
}

export class MigrationVerifier {
  private checks: MigrationCheck[] = [];
  private integrityChecks: DataIntegrityCheck[] = [];

  async verifyMigrations(): Promise<{
    migrationChecks: MigrationCheck[];
    integrityChecks: DataIntegrityCheck[];
    summary: {
      totalMigrations: number;
      successfulMigrations: number;
      dataIntegrity: boolean;
      rollbackTested: boolean;
    };
  }> {
    console.log('🔍 Starting migration verification...');

    // Get all migrations
    const migrations = await migrationService.getMigrationHistory();

    // Verify each migration
    for (const migration of migrations) {
      await this.verifyMigration(migration);
    }

    // Check data integrity
    await this.checkDataIntegrity();

    // Test rollback capability
    const rollbackTested = await this.testRollback();

    const summary = {
      totalMigrations: migrations.length,
      successfulMigrations: this.checks.filter(c => c.passed).length,
      dataIntegrity: this.integrityChecks.every(c => c.schemaValid && c.foreignKeysValid),
      rollbackTested,
    };

    console.log('✅ Migration verification completed');
    return {
      migrationChecks: this.checks,
      integrityChecks: this.integrityChecks,
      summary,
    };
  }

  private async verifyMigration(migration: any): Promise<void> {
    const check: MigrationCheck = {
      name: migration.name,
      passed: false,
      details: '',
      timestamp: new Date().toISOString(),
    };

    try {
      // Check if migration table exists
      const tableExists = await migrationService.checkTableExists('migrations');
      if (!tableExists) {
        check.details = 'Migrations table does not exist';
        this.checks.push(check);
        return;
      }

      // Verify migration was applied
      const applied = await migrationService.isMigrationApplied(migration.name);
      if (!applied) {
        check.details = 'Migration not applied';
        this.checks.push(check);
        return;
      }

      // Check migration checksum
      const checksumValid = await migrationService.verifyMigrationChecksum(migration);
      if (!checksumValid) {
        check.details = 'Migration checksum mismatch';
        this.checks.push(check);
        return;
      }

      // Validate migration didn't break schema
      const schemaValid = await this.validateMigrationSchema(migration);
      if (!schemaValid) {
        check.details = 'Migration schema validation failed';
        this.checks.push(check);
        return;
      }

      check.passed = true;
      check.details = 'Migration successfully verified';
    } catch (error) {
      check.error = error instanceof Error ? error.message : String(error);
      check.details = `Migration verification failed: ${check.error}`;
    }

    this.checks.push(check);
  }

  private async validateMigrationSchema(migration: any): Promise<boolean> {
    // Get expected schema changes from migration file
    const expectedChanges = await migrationService.getMigrationChanges(migration.name);

    // Verify each change was applied
    for (const change of expectedChanges) {
      switch (change.type) {
        case 'create_table':
          const tableExists = await migrationService.checkTableExists(change.table);
          if (!tableExists) return false;
          break;
        case 'add_column':
          const columnExists = await migrationService.checkColumnExists(change.table, change.column);
          if (!columnExists) return false;
          break;
        case 'add_index':
          const indexExists = await migrationService.checkIndexExists(change.table, change.index);
          if (!indexExists) return false;
          break;
        case 'add_foreign_key':
          const fkExists = await migrationService.checkForeignKeyExists(change.table, change.constraint);
          if (!fkExists) return false;
          break;
      }
    }

    return true;
  }

  private async checkDataIntegrity(): Promise<void> {
    const tables = await migrationService.getTables();

    for (const table of tables) {
      const check: DataIntegrityCheck = {
        table,
        recordCount: 0,
        schemaValid: false,
        foreignKeysValid: false,
        timestamp: new Date().toISOString(),
      };

      try {
        // Get record count
        check.recordCount = await migrationService.getRecordCount(table);

        // Validate schema
        check.schemaValid = await migrationService.validateTableSchema(table);

        // Check foreign keys
        check.foreignKeysValid = await migrationService.validateForeignKeys(table);
      } catch (error) {
        console.error(`Error checking table ${table}:`, error);
      }

      this.integrityChecks.push(check);
    }
  }

  private async testRollback(): Promise<boolean> {
    try {
      // Create a test table
      const testTable = `migration_test_${Date.now()}`;
      await migrationService.executeMigration({
        name: 'test_rollback',
        up: `CREATE TABLE ${testTable} (id INTEGER PRIMARY KEY);`,
        down: `DROP TABLE ${testTable};`,
      });

      // Verify table exists
      const exists = await migrationService.checkTableExists(testTable);
      if (!exists) return false;

      // Rollback migration
      await migrationService.rollbackMigration('test_rollback');

      // Verify table is gone
      const stillExists = await migrationService.checkTableExists(testTable);
      return !stillExists;
    } catch (error) {
      console.error('Rollback test failed:', error);
      return false;
    }
  }
}

// Migration dashboard component
export const MigrationDashboard = () => {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const runVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const verifier = new MigrationVerifier();
      const verificationResults = await verifier.verifyMigrations();
      setResults(verificationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration verification failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runVerification();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Migration Verification Failed</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={runVerification}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!results && loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const { migrationChecks, integrityChecks, summary } = results;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Migration Verification</h2>
        <button
          onClick={runVerification}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Re-run Verification'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Migrations</h3>
          <div className="text-3xl font-bold text-blue-600">{summary.totalMigrations}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Successful</h3>
          <div className={`text-3xl font-bold ${summary.successfulMigrations === summary.totalMigrations ? 'text-green-600' : 'text-yellow-600'}`}>
            {summary.successfulMigrations}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Data Integrity</h3>
          <div className={`text-3xl font-bold ${summary.dataIntegrity ? 'text-green-600' : 'text-red-600'}`}>
            {summary.dataIntegrity ? '✓' : '✗'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Rollback Tested</h3>
          <div className={`text-3xl font-bold ${summary.rollbackTested ? 'text-green-600' : 'text-yellow-600'}`}>
            {summary.rollbackTested ? '✓' : '✗'}
          </div>
        </div>
      </div>

      {/* Migration Checks */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Migration Checks</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {migrationChecks.map((check: any) => (
              <div
                key={check.name}
                className={`p-4 rounded-lg border ${
                  check.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{check.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{check.details}</p>
                    {check.error && (
                      <p className="text-sm text-red-600 mt-1">{check.error}</p>
                    )}
                  </div>
                  <div className={`text-lg ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {check.passed ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Integrity Checks */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Data Integrity Checks</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foreign Keys
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {integrityChecks.map((check: any) => (
                  <tr key={check.table}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {check.table}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {check.recordCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        check.schemaValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {check.schemaValid ? 'Valid' : 'Invalid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        check.foreignKeysValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {check.foreignKeysValid ? 'Valid' : 'Invalid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};