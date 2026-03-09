import * as fs from "fs";
import * as path from "path";
import { TestResult } from "./runner";
import { GeneratedTestSuite } from "./aiGenerator";

const REPORTS_DIR = path.join(process.cwd(), "output", "reports");

export function generateHTMLReport(result: TestResult, suite: GeneratedTestSuite): string {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const total = result.passed + result.failed + result.skipped;
  const passRate = total > 0 ? Math.round((result.passed / total) * 100) : 0;
  const statusColor = result.failed === 0 ? "#22c55e" : result.passed === 0 ? "#ef4444" : "#f59e0b";

  const testRows = suite.testCases.map((tc, index) => {
    const runResult = result.tests[index];
    const status = runResult?.status || "skipped";
    const statusIcon = status === "passed" ? "✅" : status === "failed" ? "❌" : "⏭️";
    const duration = runResult?.duration ? `${runResult.duration}ms` : "—";
    const error = runResult?.error
      ? `<div class="error-msg">⚠️ ${runResult.error.substring(0, 150)}...</div>`
      : "";

    return `
    <tr class="test-row ${status}">
      <td class="tc-id">${tc.id}</td>
      <td>
        <div class="tc-name">${tc.name}</div>
        <div class="tc-desc">${tc.description}</div>
        ${error}
      </td>
      <td><span class="badge badge-${tc.category}">${tc.category}</span></td>
      <td class="tc-steps">${tc.steps.length} steps</td>
      <td>${duration}</td>
      <td class="status-cell">${statusIcon} ${status}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Test Report — ${suite.pageTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 40px; border-bottom: 1px solid #334155; }
    .header h1 { font-size: 28px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; }
    .header .subtitle { color: #94a3b8; font-size: 14px; }
    .header .url { color: #38bdf8; font-size: 13px; margin-top: 4px; }
    .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; padding: 30px 40px; background: #1e293b; border-bottom: 1px solid #334155; }
    .stat-card { background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #334155; }
    .stat-number { font-size: 36px; font-weight: 800; }
    .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; }
    .stat-pass .stat-number { color: #22c55e; }
    .stat-fail .stat-number { color: #ef4444; }
    .stat-skip .stat-number { color: #f59e0b; }
    .stat-total .stat-number { color: #38bdf8; }
    .stat-rate .stat-number { color: ${statusColor}; }
    .section { padding: 30px 40px; }
    .section h2 { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #f1f5f9; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    thead { background: #334155; }
    th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    td { padding: 14px 16px; font-size: 14px; border-top: 1px solid #1e293b; vertical-align: top; }
    tr:hover td { background: #263347; }
    .tc-id { font-family: monospace; color: #38bdf8; font-weight: 600; }
    .tc-name { font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
    .tc-desc { color: #94a3b8; font-size: 12px; }
    .error-msg { color: #fca5a5; font-size: 11px; margin-top: 6px; font-family: monospace; background: rgba(239,68,68,0.1); padding: 6px; border-radius: 4px; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-functional { background: #1d4ed8; color: #bfdbfe; }
    .badge-navigation { background: #7c3aed; color: #ddd6fe; }
    .badge-form { background: #059669; color: #a7f3d0; }
    .badge-ui { background: #d97706; color: #fde68a; }
    .badge-negative { background: #dc2626; color: #fecaca; }
    .passed .status-cell { color: #22c55e; font-weight: 600; }
    .failed .status-cell { color: #ef4444; font-weight: 600; }
    .skipped .status-cell { color: #f59e0b; font-weight: 600; }
    .progress-bar { height: 8px; background: #334155; border-radius: 4px; overflow: hidden; margin-top: 10px; }
    .progress-fill { height: 100%; background: ${statusColor}; border-radius: 4px; width: ${passRate}%; }
    .footer { padding: 20px 40px; text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI Test Report</h1>
    <div class="subtitle">${suite.pageTitle}</div>
    <div class="url">🔗 ${suite.url}</div>
    <div class="subtitle">Generated: ${new Date(suite.generatedAt).toLocaleString()}</div>
    <div class="progress-bar"><div class="progress-fill"></div></div>
  </div>
  <div class="stats">
    <div class="stat-card stat-total"><div class="stat-number">${total}</div><div class="stat-label">Total</div></div>
    <div class="stat-card stat-pass"><div class="stat-number">${result.passed}</div><div class="stat-label">Passed</div></div>
    <div class="stat-card stat-fail"><div class="stat-number">${result.failed}</div><div class="stat-label">Failed</div></div>
    <div class="stat-card stat-skip"><div class="stat-number">${result.skipped}</div><div class="stat-label">Skipped</div></div>
    <div class="stat-card stat-rate"><div class="stat-number">${passRate}%</div><div class="stat-label">Pass Rate</div></div>
  </div>
  <div class="section">
    <h2>📋 Test Cases</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Test Name</th><th>Category</th><th>Steps</th><th>Duration</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${testRows}</tbody>
    </table>
  </div>
  <div class="footer">
    Generated by AI Test Generator • Powered by Claude + Playwright • Duration: ${(result.duration / 1000).toFixed(2)}s
  </div>
</body>
</html>`;

  const reportPath = path.join(REPORTS_DIR, `report-${Date.now()}.html`);
  fs.writeFileSync(reportPath, html, "utf-8");
  console.log(`\n📄 HTML Report saved: ${reportPath}`);
  return reportPath;
}