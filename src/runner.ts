import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface TestResult {
  file: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  tests: IndividualResult[];
  rawOutput: string;
}

export interface IndividualResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

export async function runTests(testFilePath: string): Promise<TestResult> {
  console.log(`\n▶️  Running tests: ${testFilePath}`);

  const reportDir = path.join(process.cwd(), "output", "reports");
  const jsonReportPath = path.join(reportDir, "report.json");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const startTime = Date.now();
  let rawOutput = "";

  try {
    const options: ExecSyncOptionsWithStringEncoding = {
      encoding: "utf-8",
      cwd: process.cwd(),
    };

    const relativePath = path.relative(process.cwd(), testFilePath);
    console.log(`📋 Executing: npx playwright test "${relativePath}" --reporter=json`);

    rawOutput = execSync(
      `npx playwright test "${relativePath}" --reporter=json`,
      options
    );

    // Write the JSON output to file
    fs.writeFileSync(jsonReportPath, rawOutput, "utf-8");
  } catch (err: unknown) {
    const execError = err as any;
    if (execError.stdout) {
      rawOutput = execError.stdout;
      fs.writeFileSync(jsonReportPath, rawOutput, "utf-8");
    } else if (execError.stderr) {
      rawOutput = execError.stderr;
    } else {
      rawOutput = execError.message || "Unknown error";
    }
  }

  const duration = Date.now() - startTime;
  let tests: IndividualResult[] = [];
  let passed = 0, failed = 0, skipped = 0;

  if (fs.existsSync(jsonReportPath)) {
    try {
      const jsonContent = fs.readFileSync(jsonReportPath, "utf-8");
      const jsonReport = JSON.parse(jsonContent);

            // Parse stats from report
      if (jsonReport.stats) {
        // expected = passed tests, unexpected = failed tests
        passed = jsonReport.stats.expected;
        failed = jsonReport.stats.unexpected;
        skipped = jsonReport.stats.skipped;

        console.log(`📈 Stats - Expected: ${jsonReport.stats.expected}, Unexpected: ${jsonReport.stats.unexpected}, Skipped: ${jsonReport.stats.skipped}`);
      }
      // Parse individual test results
      if (jsonReport.suites && jsonReport.suites.length > 0) {
        for (const suite of jsonReport.suites) {
          processTestSuite(suite, tests);
        }
      }

      console.log(`📝 Parsed ${tests.length} individual test results`);

      // Log failed tests with details
      if (failed > 0) {
        console.log(`\n⚠️  Failed Tests:`);
        tests
          .filter((t) => t.status === "failed")
          .forEach((t) => {
            console.log(`   ❌ ${t.name}: ${t.error || "Unknown error"}`);
          });
      }

      // If there are compilation errors, report them
      if (jsonReport.errors && jsonReport.errors.length > 0) {
        console.error(`\n❌ Compilation/Syntax Errors (${jsonReport.errors.length}):`);
        for (const error of jsonReport.errors) {
          console.error(`   ${error.message.split("\n")[0]}`);
        }
      }
    } catch (e) {
      console.error(`Failed to parse JSON report: ${e}`);
    }
  }

  console.log(`\n📊 Results: ✅ ${passed} passed | ❌ ${failed} failed | ⏭️  ${skipped} skipped`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);

  return { file: testFilePath, passed, failed, skipped, duration, tests, rawOutput };
}

function processTestSuite(suite: any, tests: IndividualResult[]): void {
  if (suite.specs && suite.specs.length > 0) {
    for (const spec of suite.specs) {
      if (spec.tests && spec.tests.length > 0) {
        for (const test of spec.tests) {
          const result = test.results?.[0] || {};
          const status =
            result.status === "passed"
              ? "passed"
              : result.status === "skipped"
                ? "skipped"
                : "failed";

          tests.push({
            name: spec.title || test.title || "Unknown",
            status,
            duration: result.duration || 0,
            error: result.error?.message?.split("\n")[0],
          });
        }
      }
    }
  }

  // Process nested suites
  if (suite.suites && suite.suites.length > 0) {
    for (const nestedSuite of suite.suites) {
      processTestSuite(nestedSuite, tests);
    }
  }
}