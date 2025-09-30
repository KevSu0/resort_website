#!/usr/bin/env node

/**
 * Script to identify legacy code patterns in the codebase
 * Usage: node find-legacy-code.js
 */

const fs = require('fs');
const path = require('path');

// Legacy code patterns to search for
const PATTERNS = {
  consoleStatements: {
    pattern: /console\.(log|warn|error|debug|info)\(/g,
    message: 'Console statement found',
    severity: 'medium'
  },
  anyTypes: {
    pattern: /:\s*any\b/g,
    message: 'TypeScript any type found',
    severity: 'high'
  },
  todoComments: {
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)/gi,
    message: 'TODO/FIXME comment found',
    severity: 'low'
  },
  deprecatedImports: {
    pattern: /@deprecated/g,
    message: 'Deprecated import found',
    severity: 'high'
  },
  varDeclarations: {
    pattern: /\bvar\s+/g,
    message: 'var declaration found (use let/const)',
    severity: 'low'
  },
  evalUsage: {
    pattern: /\beval\(/g,
    message: 'eval() usage detected (security risk)',
    severity: 'critical'
  },
  innerHTML: {
    pattern: /\.innerHTML\s*=/g,
    message: 'innerHTML usage detected (XSS risk)',
    severity: 'high'
  }
};

// File extensions to analyze
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to analyze
const DIRECTORIES = [
  'resort-website/src/admin',
  'resort-website/src/components',
  'resort-website/src/services',
  'resort-website/src/utils'
];

function findLegacyCode() {
  console.log('🔍 Scanning for legacy code patterns...\n');

  const results = {};

  for (const patternName in PATTERNS) {
    const pattern = PATTERNS[patternName];
    results[patternName] = [];

    for (const dir of DIRECTORIES) {
      // Simple directory walking
      const files = [];

      function walkDir(currentPath) {
        const items = fs.readdirSync(currentPath);

        for (const item of items) {
          const fullPath = path.join(currentPath, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith('.')) {
            walkDir(fullPath);
          } else if (EXTENSIONS.includes(path.extname(item))) {
            files.push(fullPath);
          }
        }
      }

      if (fs.existsSync(dir)) {
        walkDir(dir);
      }

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const matches = content.match(pattern.pattern);

          if (matches) {
            results[patternName].push({
              file,
              count: matches.length,
              severity: pattern.severity
            });
          }
        } catch (error) {
          console.error(`Error reading ${file}:`, error.message);
        }
      }
    }
  }

  // Print results
  console.log('📊 Legacy Code Analysis Results\n');
  console.log('================================\n');

  for (const [patternName, findings] of Object.entries(results)) {
    if (findings.length > 0) {
      const pattern = PATTERNS[patternName];
      const total = findings.reduce((sum, f) => sum + f.count, 0);

      console.log(`${patternName.toUpperCase()} (${pattern.severity} severity)`);
      console.log(`${pattern.message}: ${total} occurrence(s) in ${findings.length} file(s)\n`);

      findings.forEach(finding => {
        console.log(`  - ${finding.file}: ${finding.count} occurrence(s)`);
      });

      console.log('--------------------------------\n');
    }
  }

  // Summary
  const totalIssues = Object.values(results).flat().length;
  console.log(`📈 Summary: Found ${totalIssues} files with legacy code patterns\n`);

  // Recommendations
  console.log('💡 Recommendations:\n');
  console.log('1. Critical issues should be fixed immediately');
  console.log('2. High severity issues should be addressed in next sprint');
  console.log('3. Medium severity issues should be scheduled soon');
  console.log('4. Low severity issues can be addressed during refactoring\n');

  console.log('Run: npm run lint && npm run typecheck for additional issues');
}

findLegacyCode();