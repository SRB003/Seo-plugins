---
name: schema-generator
description: Generate and inject structured data (JSON-LD schema markup) for websites. Use when the user asks about schema markup, structured data, rich snippets, JSON-LD, Google rich results, product schema, FAQ schema, article schema, organization schema, or breadcrumb schema. Also activates for "add schema", "fix structured data", or "rich snippet optimization".
---

# Schema Markup Generator

Auto-detect page types and generate valid JSON-LD structured data for rich snippet eligibility.

## Supported Schema Types

### 1. Organization / LocalBusiness
**Trigger**: Homepage or about page
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "",
  "url": "",
  "logo": "",
  "description": "",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "",
    "contactType": "customer service"
  }
}
```

### 2. Product (E-commerce)
**Trigger**: Product pages, Webflow CMS items in product collections
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "",
  "image": [],
  "description": "",
  "brand": { "@type": "Brand", "name": "" },
  "offers": {
    "@type": "Offer",
    "price": "",
    "priceCurrency": "",
    "availability": "https://schema.org/InStock",
    "url": ""
  }
}
```

### 3. Article / BlogPosting
**Trigger**: Blog posts, news articles, CMS blog collections
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "",
  "image": [],
  "author": { "@type": "Person", "name": "" },
  "publisher": {
    "@type": "Organization",
    "name": "",
    "logo": { "@type": "ImageObject", "url": "" }
  },
  "datePublished": "",
  "dateModified": "",
  "description": ""
}
```

### 4. FAQ Page
**Trigger**: FAQ pages, pages with Q&A content
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": ""
      }
    }
  ]
}
```

### 5. BreadcrumbList
**Trigger**: Any page with navigational hierarchy
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": ""
    }
  ]
}
```

### 6. WebSite (Sitelinks Search Box)
**Trigger**: Homepage
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "",
  "url": "",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 7. Service
**Trigger**: Service pages
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "",
  "description": "",
  "provider": { "@type": "Organization", "name": "" },
  "areaServed": "",
  "serviceType": ""
}
```

## Process

### Step 1: Page Type Detection
1. Crawl the site or accept specific URLs
2. For each page, determine type by analyzing:
   - URL patterns (`/blog/`, `/products/`, `/faq`, `/about`)
   - Webflow CMS collection type (if Webflow site)
   - Page content structure (headings, product elements, Q&A patterns)
3. Map each page to the appropriate schema type(s)
   - Pages can have multiple schemas (e.g., Article + BreadcrumbList)

### Step 2: Data Extraction
For each page, extract the required fields:
- Pull from Webflow CMS fields where possible (name, price, image, description)
- Scrape from page content if CMS data unavailable
- Flag any missing required fields

### Step 3: Schema Generation
1. Generate valid JSON-LD for each page
2. Validate against Google's structured data requirements
3. Use `seo_validate_schema` tool to check for errors

### Step 4: Injection
For Webflow sites:
- Inject via Webflow custom code (page-level `<head>` section)
- Use Webflow MCP to update the custom code field
- For CMS items, use Webflow API to set custom code per item

For non-Webflow sites:
- Output the JSON-LD blocks for manual insertion
- Provide clear instructions on where to place them

### Step 5: Validation
After injection:
- Use `seo_check_schema` to verify the schema is detectable
- Test with Google Rich Results Test URL pattern
- Log results in Supabase `seo_schema_log` table

## Bulk Generation for CMS Collections

For Webflow CMS collections (e.g., 100 product pages):
1. Pull the collection schema from Webflow MCP
2. Map CMS fields to schema properties
3. Generate a template that dynamically pulls from CMS fields
4. Apply template to Webflow's collection page custom code
5. This ensures ALL current and future CMS items get schema automatically

## Quality Checks

- All required properties present per schema.org spec
- No duplicate schema types on the same page
- Prices in correct format (number, not string with currency symbol)
- Dates in ISO 8601 format
- URLs are absolute, not relative
- Images are actual URLs, not Webflow asset references
