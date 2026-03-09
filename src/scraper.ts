import axios from "axios";
import * as cheerio from "cheerio";

export interface PageStructure {
  url: string;
  title: string;
  buttons: string[];
  inputs: InputField[];
  links: LinkField[];
  headings: string[];
  forms: FormField[];
}

export interface InputField {
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
}

export interface LinkField {
  text: string;
  href: string;
}

export interface FormField {
  action: string;
  method: string;
  inputCount: number;
}

export async function scrapePage(url: string): Promise<PageStructure> {
  console.log(`🔍 Scraping: ${url}`);

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(data);

  const buttons: string[] = $("button, input[type='submit'], input[type='button']")
    .map((_, el) => $(el).text().trim() || $(el).attr("value") || "")
    .get()
    .filter(Boolean);

  const inputs: InputField[] = $("input, textarea, select")
    .map((_, el) => ({
      name: $(el).attr("name") || $(el).attr("id") || "",
      type: $(el).attr("type") || el.tagName.toLowerCase(),
      placeholder: $(el).attr("placeholder") || "",
      required: $(el).attr("required") !== undefined,
    }))
    .get()
    .filter((i) => i.name || i.placeholder);

  const links: LinkField[] = $("a[href]")
    .map((_, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr("href") || "",
    }))
    .get()
    .filter((l) => l.href && !l.href.startsWith("#"));

  const headings: string[] = $("h1, h2, h3")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  const forms: FormField[] = $("form")
    .map((_, el) => ({
      action: $(el).attr("action") || url,
      method: ($(el).attr("method") || "GET").toUpperCase(),
      inputCount: $(el).find("input, textarea, select").length,
    }))
    .get();

  const pageStructure: PageStructure = {
    url,
    title: $("title").text().trim() || "",
    buttons,
    inputs,
    links,
    headings,
    forms,
  };

  console.log(`✅ Scraped: ${headings.length} headings, ${inputs.length} inputs, ${buttons.length} buttons, ${forms.length} forms`);
  return pageStructure;
}