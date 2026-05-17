const configuredBaseUrl =
  process.env.ADV_DISCOVERY_BASE_URL ?? process.env.ADV_BASE_URL ?? "https://vote.go-nomads.com";
const configuredExpectedSiteUrl = process.env.ADV_DISCOVERY_EXPECTED_SITE_URL ?? configuredBaseUrl;

const baseUrl = new URL(configuredBaseUrl);
const expectedSiteUrl = new URL(configuredExpectedSiteUrl);
const siteRootUrl = new URL("/", expectedSiteUrl).toString();

function normalizeUrl(input) {
  const parsed = new URL(input);
  const pathname = parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/$/, "");
  return `${parsed.origin}${pathname}${parsed.search}`;
}

async function request(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  const body = init?.method === "HEAD" ? "" : await response.text();

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return { response, body };
}

async function requestHeaders(path) {
  try {
    const result = await request(path, { method: "HEAD" });
    return result.response.headers;
  } catch {
    const result = await request(path);
    return result.response.headers;
  }
}

function assertIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`${label} missing expected content: ${expected}`);
  }
}

function assertContentType(headers, expected, path) {
  const contentType = headers.get("content-type") ?? "";

  if (!contentType.includes(expected)) {
    throw new Error(`${path} returned unexpected content-type: ${contentType}`);
  }
}

function extractCanonical(html) {
  const match = html.match(/<link rel="canonical" href="([^"]+)"/i);

  if (!match) {
    throw new Error("homepage is missing canonical link");
  }

  return match[1];
}

const homepage = await request("/");
const robots = await request("/robots.txt");
const sitemap = await request("/sitemap.xml");
const manifest = await request("/manifest.webmanifest");
const llms = await request("/llms.txt");
const openGraphImageHeaders = await requestHeaders("/opengraph-image");
const twitterImageHeaders = await requestHeaders("/twitter-image");

const canonical = extractCanonical(homepage.body);

if (normalizeUrl(canonical) !== normalizeUrl(siteRootUrl)) {
  throw new Error(`homepage canonical mismatch: expected ${siteRootUrl} got ${canonical}`);
}

assertIncludes(homepage.body, "FAQPage", "homepage HTML");
assertIncludes(homepage.body, "acceptedAnswer", "homepage HTML");
assertIncludes(homepage.body, "搜索和 AI 最常问的几个问题", "homepage HTML");
assertIncludes(homepage.body, "Go Nomad ADV 这是什么页面？", "homepage HTML");
assertIncludes(homepage.body, "/opengraph-image", "homepage HTML");
assertIncludes(homepage.body, "/twitter-image", "homepage HTML");
assertIncludes(homepage.body, "/manifest.webmanifest", "homepage HTML");

assertIncludes(robots.body, `Sitemap: ${new URL("/sitemap.xml", expectedSiteUrl).toString()}`, "robots.txt");
assertIncludes(sitemap.body, `<loc>${siteRootUrl}</loc>`, "sitemap.xml");
assertIncludes(manifest.body, '"short_name":"Go Nomad ADV"', "manifest.webmanifest");
assertIncludes(llms.body, "## FAQ", "llms.txt");
assertIncludes(llms.body, "Q: Go Nomad ADV 这是什么页面？", "llms.txt");
assertIncludes(llms.body, "Open Graph Image:", "llms.txt");

assertContentType(openGraphImageHeaders, "image/png", "/opengraph-image");
assertContentType(twitterImageHeaders, "image/png", "/twitter-image");

console.log(`discovery check ok: fetch=${baseUrl.toString()} expected=${siteRootUrl}`);