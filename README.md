**AI Test Generator** 

Automatically generate Playwright tests using Claude AI. Scrape any website and create comprehensive test suites in seconds.

Generate and execute automated test scripts using Claude and Playwright
<img width="2940" height="1674" alt="image" src="https://github.com/user-attachments/assets/e535b095-74ca-44e6-8302-358202af3a09" />

**Quick Start**

npm install
npm start https://example.com

**Features**

- AI-powered test case generation with Claude
- Automatic web scraping and element detection
- Playwright test script generation
- Output reports (HTML, JSON)
- End-to-end automation from URL to test execution

**How It Works**

1. **Scrape** - Extract page structure
2. **Generate** - Claude AI creates test cases
3. **Write** - Generate Playwright test file
4. **Execute** - Run tests
5. **Report** - Create reports in multiple formats

**Project Structure**

src/
├── main.ts          # Entry point
├── scraper.ts       # Web scraping
├── aiGenerator.ts   # AI test generation
├── scriptWriter.ts  # Test file generation
├── runner.ts        # Test execution
└── reporter.ts      # Report generation

output/
├── tests/           # Generated test files
└── reports/         # HTML/JSON/CSV/XML reports

**Tech Stack**

- Claude AI (Test generation)
- Playwright (Browser automation)
- TypeScript 
- Node.js 18+
