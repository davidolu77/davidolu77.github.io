# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is David Olutunde's personal portfolio website (davidolutunde.com), hosted on GitHub Pages. It's a static HTML/CSS/JavaScript site showcasing:
- Personal bio and contact information
- Blog posts on productivity, fitness, and technology
- Arduino and electronics project documentation
- Electrical & Electronic Engineering student portfolio

The site uses a custom domain (davidolutunde.com) and is deployed automatically via GitHub Pages from the main branch.

## Site Architecture

The site follows a simple, clean structure with separate pages for different content types:

**Core Pages:**
- `index.html` - Homepage with personal introduction and about section
- `posts.html` - Blog post listing page organized by categories (Productivity, Christianity, Fitness & Health, Tech)
- `projects.html` - Project showcase page focusing on Arduino/electronics projects

**Content Organization:**
- `/posts/` - Individual blog post HTML files (screen-time-guide.html, social-media-detox.html)
- `/projects/` - Individual project documentation pages with detailed tutorials
- `/images/` - Site-wide images and photos

**Styling:**
- Each main page has its own CSS file: `index.css`, `posts.css`, `projects.css`
- Shared design patterns: Inter font family, consistent navigation, footer with social links
- Responsive design with flexbox layouts and mobile-friendly breakpoints

## Development Commands

Since this is a static HTML site with no build process, development is straightforward:

**Local Development:**
```powershell
# Serve the site locally (using Python's built-in server)
python -m http.server 8000

# Or using Node.js if available
npx http-server
```

**Live Reload (optional):**
```powershell
# Install live-server globally if desired
npm install -g live-server

# Serve with auto-reload
live-server
```

**Content Validation:**
```powershell
# Validate HTML (requires html5validator)
pip install html5validator
html5validator *.html posts/*.html projects/*.html

# Check links (requires linkchecker)
pip install linkchecker  
linkchecker http://localhost:8000
```

## Content Creation Patterns

**Adding New Blog Posts:**
1. Create new HTML file in `/posts/` directory
2. Follow naming convention: `post-title.html` (lowercase, hyphen-separated)
3. Use `../posts.css` for consistent styling
4. Include structured data: title, publication date, content sections
5. Add back navigation link: `<a href="../posts.html">← Back to Posts</a>`
6. Update `posts.html` with new post entry and link
7. Update `sitemap.xml` with new URL

**Adding New Projects:**
1. Create new HTML file in `/projects/` directory  
2. Use `../projects.css` for styling (includes code block styling)
3. Include project preview images in `/projects/` subdirectory
4. Follow template structure: title, preview images, parts list, assembly instructions, code section
5. Link to external GitHub repositories for code/downloads
6. Add back navigation and update `projects.html`
7. Update `sitemap.xml` with new URL

**Navigation Updates:**
All pages use identical navigation structure with active state management via JavaScript. The active page gets `nav-link active` class which removes underline and changes text color to grey.

## SEO and Performance Considerations

- Each page includes proper meta descriptions and canonical URLs
- Google Analytics implemented (gtag.js with ID: G-FBHPT4MSD0)
- Schema.org structured data on homepage for person/organization
- Comprehensive favicon and web app manifest setup
- Font optimization with preconnect to Google Fonts
- Image optimization recommended for `/images/` and `/projects/` directories

## Deployment

The site auto-deploys to GitHub Pages when changes are pushed to the main branch:
- Custom domain: davidolutunde.com (configured via CNAME file)
- SSL enabled via GitHub Pages
- No build process required - direct HTML serving

## Public Repo Security Guidance

This repository is public, so every committed file should be considered public forever unless history is rewritten and cached copies disappear.

Safe to keep here:
- HTML, CSS, images, favicons, sitemap, manifest, and normal content assets
- Google Analytics measurement IDs and other public-facing identifiers
- The `CNAME` file used by GitHub Pages

Do not keep here:
- API keys, tokens, passwords, `.env` files, private certificates, or recovery codes
- Personal documents, invoices, backups, database exports, or unpublished drafts you do not want indexed
- Source files that contain hidden notes, comments, or metadata you would not want a stranger to read

Operational note:
- If this file is only for local assistant/editor guidance and you do not want to expose your workflow notes publicly, it can be removed from the repository without affecting the website.

## Content Categories

The site is organized around these main content themes:
- **Productivity**: Guides on reducing screen time, social media detox
- **Arduino Projects**: Electronics tutorials with parts lists, wiring diagrams, and code
- **Personal Branding**: Professional portfolio showcasing engineering skills and interests

Each category maintains consistent styling and navigation patterns while allowing for specialized content presentation (e.g., code blocks and technical diagrams in project pages).
