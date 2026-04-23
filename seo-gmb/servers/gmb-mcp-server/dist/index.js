import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";
import { GMB_CONSTANTS } from "./types.js";
const server = new McpServer({ name: "gmb-mcp-server", version: "1.0.0" });
async function fetchUrl(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GMB_CONSTANTS.REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GMB-Audit-Bot/1.0)", Accept: "text/html" },
        });
        return { html: await res.text(), status: res.status };
    }
    finally {
        clearTimeout(timeout);
    }
}
// ─── Tool 1: Audit GBP Profile ───
server.registerTool("gmb_audit_profile", {
    title: "Audit Google Business Profile",
    description: `Search for a business on Google Maps and extract profile data for auditing: name, address, phone, categories, rating, review count, hours, photos, posts, and attributes.

Args:
  - business_name (string): Business name to search for
  - city (string): City/location to narrow the search

Returns: Extracted profile data with completeness scoring.`,
    inputSchema: {
        business_name: z.string().min(2).describe("Business name"),
        city: z.string().min(2).describe("City or location"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ business_name, city }) => {
    try {
        const serpApiKey = process.env.SERP_API_KEY;
        if (serpApiKey) {
            const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(business_name + " " + city)}&engine=google_maps&api_key=${serpApiKey}`;
            const res = await fetch(apiUrl);
            const data = (await res.json());
            const local = (data.local_results || []);
            const result = local[0] || {};
            return {
                content: [{ type: "text", text: JSON.stringify({
                            source: "serpapi_google_maps",
                            business: result,
                            note: "Review the extracted data against the GBP audit checklist."
                        }, null, 2) }],
            };
        }
        // Fallback: Google search scraping
        const query = `${business_name} ${city} google business profile`;
        const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        const $ = cheerio.load(html);
        const title = $(".SPZz6b, .qBF1Pd").first().text().trim() || business_name;
        const rating = $(".Aq14fc, .yi40Hd").first().text().trim();
        const reviews = $(".hqzQac, .RDApEe").first().text().trim();
        const address = $(".LrzXr").first().text().trim();
        return {
            content: [{ type: "text", text: JSON.stringify({
                        source: "google_scrape",
                        name: title, rating, reviews, address,
                        note: "For comprehensive data, set SERP_API_KEY. Scrape results are limited."
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `GBP audit failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Tool 2: Analyze Local Pack ───
server.registerTool("gmb_analyze_local_pack", {
    title: "Analyze Local 3-Pack",
    description: `Check who appears in Google's local 3-pack for a keyword + location and analyze the competitive landscape.

Args:
  - keyword (string): Search keyword (e.g., "plumber")
  - city (string): Target city

Returns: Local pack results with business names, ratings, review counts, and features.`,
    inputSchema: {
        keyword: z.string().min(2).describe("Search keyword"),
        city: z.string().min(2).describe("Target city"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ keyword, city }) => {
    try {
        const serpApiKey = process.env.SERP_API_KEY;
        if (serpApiKey) {
            const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword + " " + city)}&api_key=${serpApiKey}`;
            const res = await fetch(apiUrl);
            const data = (await res.json());
            const localPack = (data.local_results || data.local_map || {});
            return {
                content: [{ type: "text", text: JSON.stringify({
                            keyword, city,
                            local_pack: localPack,
                            has_local_pack: Object.keys(localPack).length > 0,
                        }, null, 2) }],
            };
        }
        // Fallback
        const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(keyword + " near " + city)}`);
        const $ = cheerio.load(html);
        const results = [];
        $(".VkpGBb, .rllt__details").each((_, el) => {
            results.push({ name: $(el).find(".dbg0pd, .OSrXXb").text().trim(), info: $(el).text().trim().slice(0, 200) });
        });
        return {
            content: [{ type: "text", text: JSON.stringify({
                        keyword, city, source: "google_scrape",
                        local_results: results,
                        note: "For richer data, set SERP_API_KEY."
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `Local pack analysis failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Tool 3: Check Citations ───
server.registerTool("gmb_check_citations", {
    title: "Check NAP Citations Across Directories",
    description: `Search for a business across major directories and check NAP (Name, Address, Phone) consistency.

Args:
  - business_name (string): Canonical business name
  - phone (string): Canonical phone number
  - city (string): Business city

Returns: List of directory listings found with NAP match status.`,
    inputSchema: {
        business_name: z.string().min(2).describe("Business name"),
        phone: z.string().min(5).describe("Phone number"),
        city: z.string().min(2).describe("City"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
}, async ({ business_name, phone, city }) => {
    try {
        const allDirectories = [...GMB_CONSTANTS.TIER1_DIRECTORIES, ...GMB_CONSTANTS.TIER2_DIRECTORIES];
        const results = [];
        for (const dir of allDirectories) {
            try {
                const query = `site:${dir.domain} "${business_name}" "${city}"`;
                const { html } = await fetchUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}&num=3`);
                const $ = cheerio.load(html);
                const firstResult = $(".g a").first().attr("href") || "";
                const snippet = $(".g .VwiC3b").first().text().trim();
                const found = firstResult.includes(dir.domain);
                const tier = GMB_CONSTANTS.TIER1_DIRECTORIES.some((d) => d.domain === dir.domain) ? 1 : 2;
                const phoneFound = snippet.includes(phone.replace(/\D/g, "").slice(-10));
                results.push({
                    directory: dir.name,
                    tier,
                    found,
                    url: found ? firstResult : "",
                    matchDetails: found
                        ? `Phone ${phoneFound ? "matches" : "not found in snippet"}. Review listing for full NAP verification.`
                        : "Not found in this directory.",
                });
                await new Promise((r) => setTimeout(r, GMB_CONSTANTS.CRAWL_DELAY_MS));
            }
            catch {
                results.push({ directory: dir.name, tier: 1, found: false, url: "", matchDetails: "Search failed" });
            }
        }
        const found = results.filter((r) => r.found);
        return {
            content: [{ type: "text", text: JSON.stringify({
                        business_name, phone, city,
                        directories_checked: results.length,
                        listings_found: found.length,
                        not_found: results.length - found.length,
                        results,
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `Citation check failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Tool 4: Get Reviews ───
server.registerTool("gmb_get_reviews", {
    title: "Get Business Reviews",
    description: `Fetch recent reviews for a business from Google Maps via SERP API.

Args:
  - business_name (string): Business name
  - city (string): City/location

Returns: List of recent reviews with ratings, text, and response status.`,
    inputSchema: {
        business_name: z.string().min(2).describe("Business name"),
        city: z.string().min(2).describe("City"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ business_name, city }) => {
    try {
        const serpApiKey = process.env.SERP_API_KEY;
        if (serpApiKey) {
            // First find the place
            const mapsUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(business_name + " " + city)}&engine=google_maps&api_key=${serpApiKey}`;
            const mapsRes = await fetch(mapsUrl);
            const mapsData = (await mapsRes.json());
            const localResults = (mapsData.local_results || []);
            if (localResults.length > 0 && localResults[0].place_id) {
                // Fetch reviews for the place
                const reviewsUrl = `https://serpapi.com/search.json?engine=google_maps_reviews&place_id=${localResults[0].place_id}&api_key=${serpApiKey}`;
                const revRes = await fetch(reviewsUrl);
                const revData = (await revRes.json());
                return {
                    content: [{ type: "text", text: JSON.stringify({
                                business_name, city, source: "serpapi",
                                reviews: revData.reviews || [],
                                rating: revData.rating,
                                total_reviews: revData.total,
                            }, null, 2) }],
                };
            }
        }
        return {
            content: [{ type: "text", text: JSON.stringify({
                        business_name, city,
                        note: "SERP_API_KEY required for review data. Set it to fetch reviews from Google Maps.",
                    }, null, 2) }],
        };
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `Review fetch failed: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
// ─── Tool 5: Generate Local Schema ───
server.registerTool("gmb_generate_local_schema", {
    title: "Generate LocalBusiness Schema",
    description: `Generate JSON-LD LocalBusiness schema markup that matches the GBP listing data exactly.

Args:
  - name (string): Business name
  - address (string): Full address
  - city (string): City
  - state (string): State/province
  - zip (string): Zip/postal code
  - country (string): Country code (e.g., "IN", "US")
  - phone (string): Phone number
  - website (string): Website URL
  - business_type (string): Schema type (e.g., "LocalBusiness", "Restaurant", "Plumber")
  - description (string): Business description
  - hours (string): Business hours description

Returns: Valid JSON-LD schema ready to inject into website.`,
    inputSchema: {
        name: z.string().describe("Business name"),
        address: z.string().describe("Street address"),
        city: z.string().describe("City"),
        state: z.string().describe("State/province"),
        zip: z.string().describe("Zip/postal code"),
        country: z.string().default("IN").describe("Country code"),
        phone: z.string().describe("Phone number"),
        website: z.string().url().describe("Website URL"),
        business_type: z.string().default("LocalBusiness").describe("Schema.org business type"),
        description: z.string().default("").describe("Business description"),
        hours: z.string().default("").describe("Business hours"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ name, address, city, state, zip, country, phone, website, business_type, description, hours }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": business_type,
        name,
        description: description || undefined,
        url: website,
        telephone: phone,
        address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressLocality: city,
            addressRegion: state,
            postalCode: zip,
            addressCountry: country,
        },
        ...(hours ? {
            openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                description: hours,
            },
        } : {}),
    };
    return {
        content: [{ type: "text", text: JSON.stringify({
                    schema_json_ld: schema,
                    html_snippet: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
                    instructions: "Add this JSON-LD to your website's <head> section or via Webflow custom code. Ensure all data matches your GBP listing exactly.",
                }, null, 2) }],
    };
});
// ─── Start ───
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GMB MCP Server running on stdio");
}
main().catch((error) => { console.error("Server error:", error); process.exit(1); });
//# sourceMappingURL=index.js.map