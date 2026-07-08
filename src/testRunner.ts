import { runTestSuite } from './utils/testSuiteRunner.js';

console.log('\n================================================================');
console.log('            BUSHIDO-20z PROTOCOL AUTOMATED TEST SUITE           ');
console.log('================================================================\n');

try {
  const summary = runTestSuite();

  // Print results grouped by category
  const categories = {
    'launchpad': 'LaunchpadCoinFactory Deployment Process & Allocations',
    'trading': 'TradingTerminal Constant-Product AMM & Fee Splits',
    'edge-cases': 'Protocol Edge Cases, Guardrails & Boundary Conditions'
  };

  for (const [key, label] of Object.entries(categories)) {
    console.log(`\n--- ${label} ---`);
    const catResults = summary.results.filter(r => r.category === key);
    for (const r of catResults) {
      if (r.passed) {
        console.log(`  \x1b[32m${r.message}\x1b[0m`);
      } else {
        console.log(`  \x1b[31m${r.message}\x1b[0m`);
        if (r.expected !== undefined && r.actual !== undefined) {
          console.log(`     └─ Expected: ${r.expected}`);
          console.log(`     └─ Actual:   ${r.actual}`);
        }
      }
    }
  }

  console.log('\n================================================================');
  console.log('                         TESTING SUMMARY                        ');
  console.log('================================================================');
  console.log(`  Total Test Assertions:   ${summary.total}`);
  console.log(`  Passed Assertions:       \x1b[32m${summary.passed}\x1b[0m`);
  console.log(`  Failed Assertions:       ${summary.failed > 0 ? `\x1b[31m${summary.failed}\x1b[0m` : '\x1b[32m0\x1b[0m'}`);
  console.log('================================================================\n');

  if (summary.failed > 0) {
    console.error('\x1b[31mFAIL: Some test assertions failed. Guard the Bushido codebase!\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32mSUCCESS: All assertions verified perfectly! Codebase aligned with Bushido Virtues.\x1b[0m\n');
    process.exit(0);
  }
} catch (error) {
  console.error('\x1b[31mAn unexpected error occurred while executing the test suite:\x1b[0m', error);
  process.exit(1);
}
