import Anthropic from "@anthropic-ai/sdk";
import { PageStructure } from "./scraper";

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: "functional" | "navigation" | "form" | "ui" | "negative";
  steps: string[];
  expectedResult: string;
  selector?: string;
}

export interface GeneratedTestSuite {
  pageTitle: string;
  url: string;
  testCases: TestCase[];
  generatedAt: string;
}

const client = new Anthropic();

export async function generateTestCases(
  pageStructure: PageStructure
): Promise<GeneratedTestSuite> {
  console.log(`🤖 Sending page data to Claude for test generation...`);

  const prompt = `
You are a senior QA automation engineer with 10 years of experience.

Analyze this web page structure and generate comprehensive test cases for Playwright automation:

PAGE DETAILS:
- URL: ${pageStructure.url}
- Title: ${pageStructure.title}
- Headings: ${JSON.stringify(pageStructure.headings)}
- Buttons: ${JSON.stringify(pageStructure.buttons)}
- Input Fields: ${JSON.stringify(pageStructure.inputs)}
- Links: ${JSON.stringify(pageStructure.links.slice(0, 10))}
- Forms: ${JSON.stringify(pageStructure.forms)}

Generate 6-10 test cases covering:
1. Page load and title verification
2. Navigation (clicking links/buttons)
3. Form validation (if forms exist) — both valid and invalid inputs
4. UI element visibility checks
5. Negative scenarios (empty fields, wrong data)

Respond ONLY with a valid JSON array. No markdown, no explanation, just JSON.

Format:
[
  {
    "id": "TC001",
    "name": "short test name",
    "description": "what this test verifies",
    "category": "functional|navigation|form|ui|negative",
    "steps": ["step 1", "step 2", "step 3"],
    "expectedResult": "what should happen",
    "selector": "css selector if applicable (optional)"
  }
]
`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  const cleaned = responseText.replace(/```json|```/g, "").trim();
  const testCases: TestCase[] = JSON.parse(cleaned);

  console.log(`✅ Claude generated ${testCases.length} test cases`);

  return {
    pageTitle: pageStructure.title,
    url: pageStructure.url,
    testCases,
    generatedAt: new Date().toISOString(),
  };
}