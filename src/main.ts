import { scrapePage } from "./scraper";
import { generateTestCases } from "./aiGenerator";
import { writeTestFile } from "./scriptWriter";
import { runTests } from "./runner";
import { generateHTMLReport } from "./reporter";

const TARGET_URL = process.argv[2] || "https://example.com";

async function main() {
  console.log("=".repeat(60));
  console.log("🚀 AI Test Generator — Powered by Claude + Playwright");
  console.log("=".repeat(60));
  console.log(`🌐 Target URL: ${TARGET_URL}\n`);

  console.log("📌 STEP 1: Scraping page structure...");
  const pageStructure = await scrapePage(TARGET_URL);

  console.log("\n📌 STEP 2: Generating test cases with Claude AI...");
  const testSuite = await generateTestCases(pageStructure);

  console.log("\n📋 Generated Test Cases:");
  testSuite.testCases.forEach((tc, i) => {
    console.log(`  ${i + 1}. [${tc.category.toUpperCase()}] ${tc.id}: ${tc.name}`);
  });

  console.log("\n📌 STEP 3: Writing Playwright test scripts...");
  const testFilePath = writeTestFile(testSuite);

  console.log("\n📌 STEP 4: Executing tests...");
  const testResults = await runTests(testFilePath);

  console.log("\n📌 STEP 5: Generating HTML report...");
  const reportPath = generateHTMLReport(testResults, testSuite);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DONE! Summary:");
  console.log("=".repeat(60));
  console.log(`📁 Test File   : ${testFilePath}`);
  console.log(`📄 HTML Report : ${reportPath}`);
  console.log(`✅ Passed      : ${testResults.passed}`);
  console.log(`❌ Failed      : ${testResults.failed}`);
  console.log(`⏭️  Skipped     : ${testResults.skipped}`);
  console.log(`⏱️  Duration    : ${(testResults.duration / 1000).toFixed(2)}s`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});