import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
process.env.CHROME_PATH = CHROME_PATH;

function runLighthouse(url, isMobile, runNumber, label = 'run') {
  const outputFile = `./audit-${label}-${isMobile ? 'mobile' : 'desktop'}-${runNumber}.json`;
  const flags = isMobile
    ? '--form-factor=mobile --screenEmulation.mobile=true --throttling.cpuSlowdownMultiplier=4'
    : '--preset=desktop';

  const cmd = `npx lighthouse ${url} --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --output=json --output-path=${outputFile} ${flags}`;
  console.log(`Running [${isMobile ? 'MOBILE' : 'DESKTOP'} #${runNumber}]...`);
  try {
    execSync(cmd, { stdio: 'pipe', env: process.env, timeout: 90000 });
    const content = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    const perf = content.categories.performance;
    const a = content.audits;
    return {
      run: runNumber,
      score: Math.round(perf.score * 100),
      fcp: a['first-contentful-paint'].numericValue,
      fcpDisplay: a['first-contentful-paint'].displayValue,
      lcp: a['largest-contentful-paint'].numericValue,
      lcpDisplay: a['largest-contentful-paint'].displayValue,
      tbt: a['total-blocking-time'].numericValue,
      tbtDisplay: a['total-blocking-time'].displayValue,
      cls: a['cumulative-layout-shift'].numericValue,
      clsDisplay: a['cumulative-layout-shift'].displayValue,
      si: a['speed-index'].numericValue,
      siDisplay: a['speed-index'].displayValue,
    };
  } catch (err) {
    console.error(`Error in run ${runNumber}:`, err.message);
    return null;
  }
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function runSuite(url = 'http://localhost:3000', runsCount = 3, label = 'test') {
  console.log(`\n========================================`);
  console.log(`  STARTING AUDIT SUITE: ${label} (${runsCount} runs each)`);
  console.log(`  Target: ${url}`);
  console.log(`========================================\n`);

  const mobileResults = [];
  for (let i = 1; i <= runsCount; i++) {
    const res = runLighthouse(url, true, i, label);
    if (res) mobileResults.push(res);
  }

  const desktopResults = [];
  for (let i = 1; i <= runsCount; i++) {
    const res = runLighthouse(url, false, i, label);
    if (res) desktopResults.push(res);
  }

  const calcMedians = (results) => {
    return {
      score: Math.round(median(results.map(r => r.score))),
      fcp: median(results.map(r => r.fcp)),
      lcp: median(results.map(r => r.lcp)),
      tbt: Math.round(median(results.map(r => r.tbt))),
      cls: parseFloat(median(results.map(r => r.cls)).toFixed(3)),
      si: median(results.map(r => r.si)),
    };
  };

  const mobileMedian = calcMedians(mobileResults);
  const desktopMedian = calcMedians(desktopResults);

  console.log('\n--- MOBILE RUNS ---');
  console.table(mobileResults.map(r => ({
    Run: r.run,
    Score: r.score,
    FCP: r.fcpDisplay,
    LCP: r.lcpDisplay,
    TBT: r.tbtDisplay,
    CLS: r.clsDisplay,
    SI: r.siDisplay
  })));

  console.log('--- MOBILE MEDIANS ---');
  console.log(`Score: ${mobileMedian.score}/100`);
  console.log(`LCP: ${(mobileMedian.lcp / 1000).toFixed(2)} s`);
  console.log(`TBT: ${mobileMedian.tbt} ms`);
  console.log(`CLS: ${mobileMedian.cls}`);
  console.log(`FCP: ${(mobileMedian.fcp / 1000).toFixed(2)} s`);

  console.log('\n--- DESKTOP RUNS ---');
  console.table(desktopResults.map(r => ({
    Run: r.run,
    Score: r.score,
    FCP: r.fcpDisplay,
    LCP: r.lcpDisplay,
    TBT: r.tbtDisplay,
    CLS: r.clsDisplay,
    SI: r.siDisplay
  })));

  console.log('--- DESKTOP MEDIANS ---');
  console.log(`Score: ${desktopMedian.score}/100`);
  console.log(`LCP: ${(desktopMedian.lcp / 1000).toFixed(2)} s`);
  console.log(`TBT: ${desktopMedian.tbt} ms`);
  console.log(`CLS: ${desktopMedian.cls}`);
  console.log(`FCP: ${(desktopMedian.fcp / 1000).toFixed(2)} s`);

  const summary = {
    label,
    url,
    timestamp: new Date().toISOString(),
    mobile: { runs: mobileResults, median: mobileMedian },
    desktop: { runs: desktopResults, median: desktopMedian }
  };

  fs.writeFileSync(`./summary-${label}.json`, JSON.stringify(summary, null, 2));
  return summary;
}

if (process.argv[1]?.endsWith('benchmark.mjs')) {
  const label = process.argv[2] || 'baseline';
  const url = process.argv[3] || 'http://localhost:3000';
  const count = parseInt(process.argv[4] || '3', 10);
  runSuite(url, count, label);
}
