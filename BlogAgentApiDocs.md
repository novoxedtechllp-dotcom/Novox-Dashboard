# NOVOX PLATFORM — Backend API Reference

**Version 2.0** • June 2026

> **Authentication has been disabled in this version.** All endpoints can be called directly without any passcode headers or tokens.

## Authentication

> **Authentication is DISABLED.** No passcode, Bearer token, or `x-passcode` header is required for any endpoint. Call all endpoints directly.

The `/api/verify-passcode` endpoint is retained for backward compatibility only and will always return `{ "success": true }` regardless of any input.

## Site Identifiers (`x-site-id`)

Some endpoints require a site context via the `x-site-id` request header. Pass one of these values:

| `x-site-id` Value | Target Site |
| --- | --- |
| `novox_edtech` | Novox Edtech platform |
| `novox_core` | Novox Core platform |
| `novox_kalyan` | Kalyan Engineering |

---

## API Endpoints

### 1. Get Site Configuration Profiles

**GET** `/api/config`

✓ No Authentication Required
— No Site Header Required

Returns the complete site configuration profiles from `sites.config.json`. Used by the admin dashboard to load repository settings, available categories, and default values for each site.

**RESPONSE (200 OK)**

A JSON object containing all configured site profiles:

```json
{
  "novox_edtech": { ... },
  "novox_core": { ... },
  "novox_kalyan": { ... }
}
```

---

### 2. Generate Blog Post (AI)

**POST** `/api/generate`

✓ No Authentication Required
⚠ Requires `x-site-id` Header

Uses Gemini AI to draft an SEO-optimized HTML article body and metadata based on the provided topic and keywords. Optionally triggers Imagen to generate a 16:9 featured image.

**REQUEST BODY**

| Parameter | Type / Format | Description |
| --- | --- | --- |
| `topic` | string | Main subject of the blog post |
| `keywords` | string | Comma-separated list of SEO keywords |
| `category` | string | Post category (must match site config values) |
| `author` | string | Author display name |
| `primary_keyword` | string | Single primary SEO keyword to target |
| `landing_url` | string | Landing page URL used in CTA links |
| `generate_image` | boolean | Set true to generate a 16:9 hero image via Imagen |

**RESPONSE (200 OK)**

```json
{
  "title": "string",
  "description": "string",
  "content_html": "string",
  "image_base64": "string"  // Only present when generate_image is true
}
```

---

### 3. Generate Blog Image Only

**POST** `/api/generate-image-only`

✓ No Authentication Required
— No Site Header Required

Uses Imagen AI to generate a 16:9 featured image based on the blog post title. Returns the result as a WebP-encoded base64 string. Use this when you already have content but need to regenerate or replace the hero image.

**REQUEST BODY**

| Parameter | Type / Format | Description |
| --- | --- | --- |
| `title` | string | Blog post title used as the image generation prompt |

**RESPONSE (200 OK)**

```json
{
  "image_base64": "string"  // WebP image encoded as base64
}
```

---

### 4. Verify & Publish Post to GitHub

**POST** `/api/publish`

✓ No Authentication Required
⚠ Requires `x-site-id` Header

Validates, compiles, and publishes a blog post to the GitHub repository. Handles the full publishing pipeline across three files.

**REQUEST BODY**

| Parameter | Type / Format | Description |
| --- | --- | --- |
| `title` | string | Blog post title |
| `description` | string | Meta description for SEO |
| `category` | string | Post category |
| `author` | string | Author display name |
| `date` | string (YYYY-MM-DD) | Publication date |
| `slug` | string | URL-friendly slug, used as the HTML filename |
| `landing_url` | string | CTA landing page URL |
| `keyword` | string | Primary SEO keyword |
| `image` | string | Existing image path/URL or filename |
| `content_html` | string | Full HTML body content of the post |
| `image_base64` | string (optional) | New image to upload, base64 encoded (WebP) |
| `original_filename` | string (optional) | Existing filename when editing an existing post |

**PIPELINE — WHAT THIS ENDPOINT DOES**

- Validates the article against SEO policies: subheading usage, keyword presence/density, FAQ and Conclusion sections, service links, and CTA button
- Compiles the final HTML using the site-specific page template
- Commits the HTML file to the GitHub repository
- Updates the blog grid page (`blog.html` / `index.html`) to insert or replace the preview card, and commits it
- Updates `sitemap.xml` with the new post entry and commits it

**RESPONSE (200 OK)**

```json
{
  "success": true,
  "commit": { "sha": "string" },
  "path": "string",
  "imageUrl": "string"
}
```

---

### 5. Delete Blog Post

**POST** `/api/blogs/:filename/delete`

✓ No Authentication Required
⚠ Requires `x-site-id` Header

Removes a blog post and all references to it across the repository. Deletes the HTML file, removes the preview card from the blog grid index, and removes the sitemap entry.

**URL PARAMETER**

- `:filename` — The HTML filename of the post to delete (e.g. `post-slug.html`)

**RESPONSE (200 OK)**

```json
{ "success": true }
```

---

### 6. Proxy / Stream Blog Images

**GET** `/api/blogs-image`

✓ No Authentication Required
— No Site Header Required

Streams binary image data directly to the frontend browser. Automatically resolves access tokens for private GitHub repositories, detects and dereferences Git LFS pointers, and corrects folder-name casing mismatches (e.g. `images/` vs `Images/`).

**QUERY PARAMETERS**

| Parameter | Type / Format | Description |
| --- | --- | --- |
| `path` | string | Relative image path in the repository (e.g. `images/hero.webp`) |
| `siteId` | string | Site identifier (e.g. `novox_edtech`) |

**RESPONSE**

Returns a raw binary image stream. The `Content-Type` header is set automatically to match the image format.

---

### 7. List Existing Blog Posts

**GET** `/api/blogs`

✓ No Authentication Required
— No Site Header Required

Downloads the site's main blog grid file from GitHub, parses all existing post cards, and returns metadata for each post. Useful for populating the admin post list view.

**HEADERS / QUERY PARAMETERS**

- `siteId` — Required. Can be passed as either an `x-site-id` header or a `siteId` query parameter.

**RESPONSE (200 OK)**

```json
[
  {
    "filename": "string",
    "title": "string",
    "dateStr": "string"
  },
  ...
]
```

---

### 8. Fetch Details of a Single Post

**GET** `/api/blogs/:filename`

✓ No Authentication Required
⚠ Requires `x-site-id` Header

Downloads a single blog post HTML file from GitHub, strips layout chrome (headers, footers, wrappers), and extracts all editable fields. Use this to pre-populate the admin editor when editing an existing post.

**URL PARAMETER**

- `:filename` — The HTML filename to retrieve (e.g. `ai-in-healthcare.html`)

**RESPONSE (200 OK)**

```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "author": "string",
  "date": "string (YYYY-MM-DD)",
  "image": "string",
  "raw_image_url": "string",
  "content_html": "string",
  "slug": "string",
  "landing_url": "string",
  "keyword": "string"
}
```

---

### 9. Verify Passcode (Deprecated)

**POST** `/api/verify-passcode`

✓ No Authentication Required
— No Site Header Required

> **Deprecated.** This endpoint is retained only for backward compatibility with older frontend builds. It bypasses all passcode verification and always returns success.

**RESPONSE (200 OK)**

```json
{ "success": true }
```

---

## Quick Reference

| # | Method | Endpoint | Auth | `x-site-id` | `siteId` QP |
| --- | --- | --- | --- | --- | --- |
| 1 | GET | `/api/config` | None | — | — |
| 2 | POST | `/api/generate` | None | Required | — |
| 3 | POST | `/api/generate-image-only` | None | — | — |
| 4 | POST | `/api/publish` | None | Required | — |
| 5 | POST | `/api/blogs/:filename/delete` | None | Required | — |
| 6 | GET | `/api/blogs-image` | None | — | Required |
| 7 | GET | `/api/blogs` | None | Required | Either |
| 8 | GET | `/api/blogs/:filename` | None | — | — |
| 9 | POST | `/api/verify-passcode` (deprecated) | None | — | — |

**QP** = Query Parameter. **Either** = accepted as header or query parameter.
