import fs from 'fs';
import path from 'path';

const coverageFile = path.resolve(process.cwd(), 'coverage/coverage-final.json');
const trackingFile = path.resolve(process.cwd(), 'ADMIN_TRACKING.json');

function calculateCoverage(metrics) {
  if (!metrics) return 100; // Handle cases where a file has no metrics of a certain type
  const total = metrics.total;
  const covered = metrics.covered;
  return total > 0 ? (covered / total) * 100 : 100;
}

function getFileMetrics(fileCoverage) {
  const statements = calculateCoverage(fileCoverage.s);
  const branches = calculateCoverage(fileCoverage.b);
  const functions = calculateCoverage(fileCoverage.f);
  const lines = calculateCoverage(fileCoverage.l);
  const overall = (statements + branches + functions + lines) / 4;
  return { statements, branches, functions, lines, overall };
}

function main() {
  if (!fs.existsSync(coverageFile)) {
    console.error('Error: Coverage report not found.');
    console.error('Please run "npm test -- --coverage" first.');
    process.exit(1);
  }

  const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
  const fileCoverages = Object.entries(coverageData).map(([file, data]) => {
    const relativePath = path.relative(process.cwd(), file);
    return {
      file: relativePath,
      metrics: getFileMetrics(data),
    };
  });

  const underCoveredFiles = fileCoverages
    .filter(f => f.metrics.overall < 100)
    .sort((a, b) => a.metrics.overall - b.metrics.overall)
    .slice(0, 20);

  console.log('Top 20 Under-Covered Files:');
  console.table(
    underCoveredFiles.map(f => ({
      File: f.file,
      'Overall %': f.metrics.overall.toFixed(2),
      'Statements %': f.metrics.statements.toFixed(2),
      'Branches %': f.metrics.branches.toFixed(2),
      'Functions %': f.metrics.functions.toFixed(2),
      'Lines %': f.metrics.lines.toFixed(2),
    }))
  );

  const totalMetrics = {
    statements: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    lines: { total: 0, covered: 0 },
  };

  Object.values(coverageData).forEach(data => {
    if (data.s) {
      totalMetrics.statements.total += data.s.total;
      totalMetrics.statements.covered += data.s.covered;
    }
    if (data.b) {
      totalMetrics.branches.total += data.b.total;
      totalMetrics.branches.covered += data.b.covered;
    }
    if (data.f) {
      totalMetrics.functions.total += data.f.total;
      totalMetrics.functions.covered += data.f.covered;
    }
    if (data.l) {
      totalMetrics.lines.total += data.l.total;
      totalMetrics.lines.covered += data.l.covered;
    }
  });

  const baseline = {
    statements: calculateCoverage(totalMetrics.statements).toFixed(2),
    branches: calculateCoverage(totalMetrics.branches).toFixed(2),
    functions: calculateCoverage(totalMetrics.functions).toFixed(2),
    lines: calculateCoverage(totalMetrics.lines).toFixed(2),
    timestamp: new Date().toISOString(),
  };

  console.log('\nOverall Coverage Baseline:');
  console.table(baseline);

  if (process.argv.includes('--save-baseline')) {
    const trackingData = fs.existsSync(trackingFile)
      ? JSON.parse(fs.readFileSync(trackingFile, 'utf-8'))
      : {};

    trackingData.coverageBaseline = baseline;

    fs.writeFileSync(trackingFile, JSON.stringify(trackingData, null, 2));
    console.log(`\nBaseline saved to ${trackingFile}`);
  }
}

main();