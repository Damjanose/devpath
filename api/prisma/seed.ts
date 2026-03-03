import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DevPath Academy database...\n");

  // ── Admin user ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@devpath.dev" },
    update: {},
    create: {
      email: "admin@devpath.dev",
      passwordHash,
      profile: { create: { displayName: "Admin", totalPoints: 0, level: 1 } },
      roles: { create: { role: "admin" } },
    },
  });
  console.log("✅ Admin user: admin@devpath.dev / admin123");

  // ── Helper ─────────────────────────────────────────────────
  async function seedCourse(
    course: {
      title: string;
      description: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      pointsReward: number;
    },
    modules: {
      title: string;
      description: string;
      lessons: {
        title: string;
        content: string;
        pointsReward?: number;
        estimatedMinutes?: number;
      }[];
    }[]
  ) {
    const created = await prisma.course.create({
      data: {
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        pointsReward: course.pointsReward,
        isPublished: true,
        createdBy: admin.id,
      },
    });

    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      const createdMod = await prisma.module.create({
        data: {
          courseId: created.id,
          title: mod.title,
          description: mod.description,
          sortOrder: mi,
        },
      });

      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li];
        await prisma.lesson.create({
          data: {
            moduleId: createdMod.id,
            title: lesson.title,
            content: lesson.content,
            contentType: "text",
            pointsReward: lesson.pointsReward ?? 10,
            estimatedMinutes: lesson.estimatedMinutes ?? 8,
            sortOrder: li,
          },
        });
      }
    }

    console.log(`  📘 ${course.title} — ${modules.length} modules, ${modules.reduce((a, m) => a + m.lessons.length, 0)} lessons`);
    return created;
  }

  // ══════════════════════════════════════════════════════════════
  // COURSE 1: Web Fundamentals
  // ══════════════════════════════════════════════════════════════
  await seedCourse(
    {
      title: "Web Fundamentals",
      description: "Learn how the web works, build pages with HTML & CSS, and set up your developer tooling.",
      difficulty: "beginner",
      pointsReward: 100,
    },
    [
      {
        title: "How the Web Works",
        description: "Understand the journey from URL to rendered page.",
        lessons: [
          {
            title: "How Browsers Load a Web Page",
            estimatedMinutes: 8,
            content: `# How Browsers Load a Web Page

When you type a URL and press Enter, a fascinating chain of events begins:

## The Journey

1. **DNS Lookup** — The browser asks a DNS server to translate the domain name (e.g., \`example.com\`) into an IP address.
2. **TCP Connection** — A connection is established with the server using a TCP three-way handshake.
3. **HTTP Request** — The browser sends an HTTP GET request for the page.
4. **Server Response** — The server sends back HTML, along with status codes (200 OK, 404 Not Found, etc.).
5. **Parsing & Rendering** — The browser parses HTML into the DOM, CSS into the CSSOM, and combines them into the render tree.

## Key Concepts

- **DOM** (Document Object Model): A tree representation of the HTML document.
- **CSSOM** (CSS Object Model): A tree representation of all CSS styles.
- **Render Tree**: Combines DOM + CSSOM to determine what's visible and how it's styled.
- **Layout**: Calculates the position and size of each element.
- **Paint**: Draws pixels to the screen.

## Critical Rendering Path

The critical rendering path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels. Optimizing this path improves load performance.

\`\`\`
HTML → DOM
CSS  → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint
\`\`\`

Understanding this process is the foundation of web performance optimization.`,
          },
          {
            title: "The HTTP Request/Response Cycle",
            estimatedMinutes: 8,
            content: `# The HTTP Request/Response Cycle

HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web.

## HTTP Methods

| Method   | Purpose                  | Example                      |
|----------|--------------------------|------------------------------|
| \`GET\`    | Retrieve data             | Fetch a web page             |
| \`POST\`   | Submit data               | Submit a form                |
| \`PUT\`    | Update/replace resource   | Update user profile          |
| \`PATCH\`  | Partial update            | Change just the email        |
| \`DELETE\` | Remove resource           | Delete an account            |

## Status Codes

- **2xx Success**: \`200 OK\`, \`201 Created\`, \`204 No Content\`
- **3xx Redirect**: \`301 Moved Permanently\`, \`304 Not Modified\`
- **4xx Client Error**: \`400 Bad Request\`, \`401 Unauthorized\`, \`404 Not Found\`
- **5xx Server Error**: \`500 Internal Server Error\`, \`503 Service Unavailable\`

## Anatomy of a Request

\`\`\`http
GET /api/courses HTTP/1.1
Host: devpath.dev
Accept: application/json
Authorization: Bearer <token>
\`\`\`

## Anatomy of a Response

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json

{ "courses": [...] }
\`\`\`

## Headers

Headers carry metadata: content type, caching directives, authentication tokens, CORS policies, and more.`,
          },
          {
            title: "DNS, Domains, and Hosting Basics",
            estimatedMinutes: 5,
            content: `# DNS, Domains, and Hosting Basics

## What is DNS?

DNS (Domain Name System) translates human-readable domain names into IP addresses that computers use to identify each other.

\`\`\`
devpath.dev  →  DNS Lookup  →  93.184.216.34
\`\`\`

## Domain Name Structure

\`\`\`
subdomain.domain.tld
   www   . devpath . dev
\`\`\`

- **TLD** (Top-Level Domain): \`.com\`, \`.dev\`, \`.io\`
- **Domain**: Your chosen name
- **Subdomain**: Optional prefix (e.g., \`api.\`, \`www.\`)

## DNS Record Types

| Record | Purpose                  | Example                    |
|--------|--------------------------|----------------------------|
| \`A\`     | Maps domain to IPv4     | \`devpath.dev → 93.184.216.34\` |
| \`AAAA\`  | Maps domain to IPv6     | IPv6 address               |
| \`CNAME\` | Alias to another domain | \`www → devpath.dev\`         |
| \`MX\`    | Mail server             | Email routing              |

## Hosting Options

1. **Shared Hosting** — Multiple sites on one server. Cheap but limited.
2. **VPS** — Virtual private server. More control.
3. **Cloud** — AWS, GCP, Azure. Scalable, pay-per-use.
4. **Platform-as-a-Service** — Vercel, Railway, Fly.io. Deploy without managing servers.`,
          },
        ],
      },
      {
        title: "HTML Foundations",
        description: "Build proper HTML documents with semantic elements.",
        lessons: [
          {
            title: "Document Structure & Semantic HTML",
            estimatedMinutes: 10,
            content: `# Document Structure & Semantic HTML

Every HTML document follows a standard structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <header>
    <nav><!-- Navigation --></nav>
  </header>
  <main>
    <article>
      <h1>Main Content</h1>
      <p>Page content goes here.</p>
    </article>
  </main>
  <footer>
    <p>&copy; 2026 DevPath Academy</p>
  </footer>
</body>
</html>
\`\`\`

## Semantic Elements

Semantic HTML uses elements that describe their meaning:

- \`<header>\` — Introductory content or navigation
- \`<nav>\` — Navigation links
- \`<main>\` — Primary content (one per page)
- \`<article>\` — Self-contained content
- \`<section>\` — Thematic grouping
- \`<aside>\` — Tangentially related content
- \`<footer>\` — Footer information

## Why Semantic HTML Matters

1. **Accessibility** — Screen readers understand page structure
2. **SEO** — Search engines index content more accurately
3. **Maintainability** — Code is self-documenting`,
          },
          {
            title: "Text, Links, and Media",
            estimatedMinutes: 10,
            content: `# Text, Links, and Media

## Headings

HTML provides six heading levels. Use them to create a logical document outline:

\`\`\`html
<h1>Main Title</h1>       <!-- One per page -->
<h2>Section Title</h2>
<h3>Subsection</h3>
\`\`\`

## Text Elements

\`\`\`html
<p>Paragraph text</p>
<strong>Bold / important</strong>
<em>Italic / emphasis</em>
<code>Inline code</code>
<blockquote>A quotation</blockquote>
\`\`\`

## Links

\`\`\`html
<a href="https://devpath.dev">Visit DevPath</a>
<a href="/courses">Internal link</a>
<a href="#section-id">Anchor link</a>
<a href="mailto:hello@devpath.dev">Email link</a>
\`\`\`

## Images

\`\`\`html
<img src="photo.jpg" alt="Description of the image" width="600" height="400">
\`\`\`

Always include \`alt\` text for accessibility.

## Lists

\`\`\`html
<ul>  <!-- Unordered -->
  <li>Item one</li>
  <li>Item two</li>
</ul>

<ol>  <!-- Ordered -->
  <li>First step</li>
  <li>Second step</li>
</ol>
\`\`\``,
          },
          {
            title: "Forms and Input Elements",
            estimatedMinutes: 12,
            content: `# Forms and Input Elements

Forms collect user input and submit it to a server.

## Basic Form

\`\`\`html
<form action="/api/register" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>

  <label for="password">Password:</label>
  <input type="password" id="password" name="password" minlength="6" required>

  <button type="submit">Register</button>
</form>
\`\`\`

## Input Types

| Type       | Renders               | Use Case              |
|------------|-----------------------|-----------------------|
| \`text\`     | Text field            | Names, general text   |
| \`email\`    | Email field           | Email validation      |
| \`password\` | Hidden text           | Passwords             |
| \`number\`   | Numeric spinner       | Quantities            |
| \`checkbox\` | Checkboxes            | Multiple selections   |
| \`radio\`    | Radio buttons         | Single selection      |
| \`file\`     | File picker           | Uploads               |
| \`date\`     | Date picker           | Dates                 |

## Other Form Elements

\`\`\`html
<select name="difficulty">
  <option value="beginner">Beginner</option>
  <option value="intermediate">Intermediate</option>
  <option value="advanced">Advanced</option>
</select>

<textarea name="bio" rows="4" placeholder="Tell us about yourself"></textarea>
\`\`\`

## Validation Attributes

- \`required\` — Field must be filled
- \`minlength\` / \`maxlength\` — Text length limits
- \`min\` / \`max\` — Numeric range
- \`pattern\` — Regex validation`,
          },
          {
            title: "HTML Accessibility Fundamentals",
            estimatedMinutes: 8,
            content: `# HTML Accessibility Fundamentals

Web accessibility ensures everyone can use your website, including people with disabilities.

## Key Principles (POUR)

1. **Perceivable** — Information must be presentable in ways users can perceive
2. **Operable** — UI must be navigable and operable
3. **Understandable** — Content must be readable and predictable
4. **Robust** — Content must work with assistive technologies

## Essential Practices

### Image Alt Text
\`\`\`html
<!-- Good -->
<img src="chart.png" alt="Bar chart showing 50% growth in Q3">

<!-- Bad -->
<img src="chart.png" alt="image">

<!-- Decorative (skip) -->
<img src="divider.png" alt="" role="presentation">
\`\`\`

### Heading Hierarchy
Use headings in order (\`h1\` → \`h2\` → \`h3\`). Don't skip levels.

### ARIA Roles
\`\`\`html
<nav aria-label="Main navigation">
<button aria-expanded="false" aria-controls="menu">Menu</button>
<div role="alert">Error: Invalid email</div>
\`\`\`

### Keyboard Navigation
- All interactive elements should be focusable
- Use \`tabindex="0"\` for custom interactive elements
- Provide visible focus indicators

### Color Contrast
Ensure text has at least 4.5:1 contrast ratio against its background.`,
          },
        ],
      },
      {
        title: "CSS Fundamentals",
        description: "Master selectors, the box model, and modern layout techniques.",
        lessons: [
          {
            title: "Selectors, Specificity & the Cascade",
            estimatedMinutes: 10,
            content: `# Selectors, Specificity & the Cascade

## CSS Selectors

\`\`\`css
/* Element */
p { color: white; }

/* Class */
.card { border: 1px solid gray; }

/* ID */
#hero { padding: 2rem; }

/* Attribute */
input[type="email"] { border-color: blue; }

/* Pseudo-class */
a:hover { color: green; }
li:first-child { font-weight: bold; }

/* Combinators */
.card > h3 { }       /* Direct child */
.card h3 { }         /* Descendant */
h2 + p { }           /* Adjacent sibling */
h2 ~ p { }           /* General sibling */
\`\`\`

## Specificity

Specificity determines which rule wins when multiple rules target the same element:

| Selector            | Specificity |
|---------------------|-------------|
| \`*\`                 | 0-0-0       |
| \`p\`                 | 0-0-1       |
| \`.class\`            | 0-1-0       |
| \`#id\`               | 1-0-0       |
| Inline style        | 1-0-0-0     |
| \`!important\`        | Overrides all|

## The Cascade

When specificity is equal, the last rule defined wins. Styles are applied in this order:
1. User agent (browser defaults)
2. Author stylesheets
3. Author \`!important\`
4. Inline styles`,
          },
          {
            title: "The Box Model & Layout",
            estimatedMinutes: 12,
            content: `# The Box Model & Layout

Every HTML element is a rectangular box with four areas:

\`\`\`
┌─────────────── Margin ──────────────┐
│  ┌─────────── Border ──────────┐    │
│  │  ┌─────── Padding ──────┐   │    │
│  │  │                      │   │    │
│  │  │      Content         │   │    │
│  │  │                      │   │    │
│  │  └──────────────────────┘   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
\`\`\`

## Box Sizing

\`\`\`css
/* Default: width = content only */
box-sizing: content-box;

/* Better: width = content + padding + border */
box-sizing: border-box;

/* Apply globally */
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

## Display Modes

| Display        | Behavior                              |
|----------------|---------------------------------------|
| \`block\`        | Full width, new line                  |
| \`inline\`       | Flows with text, no width/height      |
| \`inline-block\` | Inline but respects width/height      |
| \`none\`         | Hidden, removed from layout           |
| \`flex\`         | Flexbox container                     |
| \`grid\`         | Grid container                        |

## Margin Collapse

Vertical margins between adjacent block elements collapses — only the larger margin is used.`,
          },
          {
            title: "Flexbox Layout",
            estimatedMinutes: 15,
            content: `# Flexbox Layout

Flexbox is a one-dimensional layout system for arranging items in rows or columns.

## Container Properties

\`\`\`css
.container {
  display: flex;
  flex-direction: row;          /* row | column */
  justify-content: center;      /* Main axis alignment */
  align-items: center;          /* Cross axis alignment */
  gap: 1rem;                    /* Space between items */
  flex-wrap: wrap;              /* Allow wrapping */
}
\`\`\`

## justify-content Values

- \`flex-start\` — Pack items to the start
- \`flex-end\` — Pack items to the end
- \`center\` — Center items
- \`space-between\` — Even space, no edge space
- \`space-around\` — Even space, half edge space
- \`space-evenly\` — Equal space everywhere

## Item Properties

\`\`\`css
.item {
  flex: 1;                /* Grow to fill space */
  flex-shrink: 0;         /* Don't shrink */
  flex-basis: 200px;      /* Starting size */
  align-self: flex-end;   /* Override alignment */
  order: -1;              /* Reorder */
}
\`\`\`

## Common Patterns

\`\`\`css
/* Center everything */
.center { display: flex; justify-content: center; align-items: center; }

/* Navbar: logo left, links right */
.navbar { display: flex; justify-content: space-between; align-items: center; }

/* Equal-width columns */
.columns { display: flex; gap: 1rem; }
.columns > * { flex: 1; }
\`\`\``,
          },
          {
            title: "CSS Grid Layout",
            estimatedMinutes: 15,
            content: `# CSS Grid Layout

CSS Grid is a two-dimensional layout system for creating complex page layouts.

## Basic Grid

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 equal columns */
  grid-template-rows: auto;
  gap: 1rem;
}
\`\`\`

## Template Columns

\`\`\`css
grid-template-columns: 200px 1fr 200px;         /* Fixed-fluid-fixed */
grid-template-columns: repeat(3, 1fr);           /* 3 equal */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive */
\`\`\`

## Grid Areas

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 250px 1fr 1fr;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
\`\`\`

## Item Placement

\`\`\`css
.item {
  grid-column: 1 / 3;     /* Span columns 1-2 */
  grid-row: 1 / 2;        /* First row */
}
\`\`\`

## When to Use Grid vs Flexbox

- **Grid**: Two-dimensional layouts (rows AND columns)
- **Flexbox**: One-dimensional layouts (row OR column)
- They work great together — use Grid for page layout, Flexbox for components.`,
          },
        ],
      },
      {
        title: "Responsive Design",
        description: "Build sites that work beautifully on every screen size.",
        lessons: [
          {
            title: "Media Queries",
            estimatedMinutes: 8,
            content: `# Media Queries

Media queries let you apply CSS rules based on screen size, orientation, and other device characteristics.

## Syntax

\`\`\`css
@media (min-width: 768px) {
  .container { max-width: 720px; }
}

@media (min-width: 1024px) {
  .container { max-width: 960px; }
}
\`\`\`

## Common Breakpoints

| Name   | Width    | Targets              |
|--------|----------|----------------------|
| sm     | 640px    | Large phones         |
| md     | 768px    | Tablets              |
| lg     | 1024px   | Laptops              |
| xl     | 1280px   | Desktops             |
| 2xl    | 1536px   | Large screens        |

## min-width vs max-width

- \`min-width\`: Styles apply **above** this size (mobile-first ✅)
- \`max-width\`: Styles apply **below** this size (desktop-first)

## Combining Conditions

\`\`\`css
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet only */
}

@media (orientation: landscape) {
  /* Landscape mode */
}
\`\`\``,
          },
          {
            title: "Mobile-First Design Approach",
            estimatedMinutes: 8,
            content: `# Mobile-First Design Approach

Mobile-first means designing for the smallest screen first, then progressively enhancing for larger screens.

## Why Mobile-First?

1. **Performance** — Mobile users get only the CSS they need
2. **Prioritization** — Forces you to focus on essential content
3. **Progressive Enhancement** — Add complexity as screen grows

## Example

\`\`\`css
/* Base: Mobile (no media query needed) */
.grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .grid {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .grid > * {
    flex: 1 1 calc(50% - 0.5rem);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .grid > * {
    flex: 1 1 calc(33.333% - 0.667rem);
  }
}
\`\`\`

## Responsive Images

\`\`\`css
img {
  max-width: 100%;
  height: auto;
}
\`\`\`

## Viewport Meta Tag

Always include this in your HTML \`<head>\`:

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\``,
          },
          {
            title: "CSS Custom Properties (Variables)",
            estimatedMinutes: 8,
            content: `# CSS Custom Properties (Variables)

CSS custom properties let you define reusable values that can be updated dynamically.

## Defining Variables

\`\`\`css
:root {
  --primary: hsl(142, 72%, 50%);
  --background: hsl(220, 20%, 4%);
  --foreground: hsl(180, 10%, 92%);
  --radius: 0.75rem;
  --spacing: 1rem;
}
\`\`\`

## Using Variables

\`\`\`css
.button {
  background: var(--primary);
  color: var(--background);
  border-radius: var(--radius);
  padding: var(--spacing);
}
\`\`\`

## Fallback Values

\`\`\`css
color: var(--accent, #7c3aed);  /* Uses #7c3aed if --accent is undefined */
\`\`\`

## Dark Mode Theming

\`\`\`css
:root {
  --bg: #ffffff;
  --text: #111111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a0a0f;
    --text: #e0e0e0;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
\`\`\`

## Dynamic Updates with JavaScript

\`\`\`js
document.documentElement.style.setProperty('--primary', '#ff6347');
\`\`\``,
          },
          {
            title: "Building a Responsive Landing Page",
            estimatedMinutes: 10,
            pointsReward: 15,
            content: `# Building a Responsive Landing Page

Let's combine everything into a complete responsive landing page.

## The Plan

We'll build a page with:
1. A responsive navigation bar
2. A hero section with CTA buttons
3. A features grid (1 → 2 → 3 columns)
4. A footer

## HTML Structure

\`\`\`html
<header class="navbar">
  <a href="/" class="logo">DevPath</a>
  <nav class="nav-links">
    <a href="#features">Features</a>
    <a href="#about">About</a>
    <a href="/register" class="btn">Get Started</a>
  </nav>
</header>

<main>
  <section class="hero">
    <h1>Level Up Your Dev Skills</h1>
    <p>A gamified learning platform for developers.</p>
    <a href="/register" class="btn btn-primary">Start Learning</a>
  </section>

  <section id="features" class="features">
    <div class="feature-card">...</div>
    <div class="feature-card">...</div>
    <div class="feature-card">...</div>
  </section>
</main>

<footer>© 2026 DevPath Academy</footer>
\`\`\`

## CSS (Mobile-First)

\`\`\`css
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
    padding: 3rem 2rem;
  }
}

@media (min-width: 1024px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

Congratulations! You've built your first responsive website from scratch.`,
          },
        ],
      },
      {
        title: "Developer Tooling",
        description: "Set up your development environment and learn Git.",
        lessons: [
          {
            title: "Browser DevTools Essentials",
            estimatedMinutes: 8,
            content: `# Browser DevTools Essentials

Every modern browser includes powerful developer tools. Learn to use them effectively.

## Opening DevTools

- **Mac**: \`Cmd + Option + I\`
- **Windows/Linux**: \`F12\` or \`Ctrl + Shift + I\`

## Key Panels

### Elements Panel
- Inspect and edit HTML/CSS live
- See computed styles and box model
- Toggle element states (:hover, :focus)

### Console Panel
- Run JavaScript expressions
- View errors and warnings
- Use \`console.log()\`, \`console.table()\`, \`console.dir()\`

### Network Panel
- See all HTTP requests and responses
- Check loading times and file sizes
- Filter by type (XHR, JS, CSS, Images)

### Application Panel
- Inspect localStorage and sessionStorage
- View cookies
- Check service workers

## Pro Tips

\`\`\`javascript
// Pretty-print objects
console.table([{ name: "React", type: "library" }, { name: "Next.js", type: "framework" }]);

// Measure execution time
console.time("fetch");
await fetch("/api/courses");
console.timeEnd("fetch"); // fetch: 142ms
\`\`\``,
          },
          {
            title: "VS Code Setup & Productivity",
            estimatedMinutes: 8,
            content: `# VS Code Setup & Productivity

VS Code is the most popular code editor for web developers. Here's how to set it up for maximum productivity.

## Essential Extensions

1. **ESLint** — Lint JavaScript/TypeScript
2. **Prettier** — Auto-format code
3. **Tailwind CSS IntelliSense** — Tailwind autocomplete
4. **GitLens** — Enhanced Git blame and history
5. **Error Lens** — Inline error display

## Key Shortcuts (Mac)

| Shortcut              | Action                    |
|-----------------------|---------------------------|
| \`Cmd + P\`             | Quick file open           |
| \`Cmd + Shift + P\`     | Command palette           |
| \`Cmd + D\`             | Select next occurrence    |
| \`Option + Up/Down\`    | Move line up/down         |
| \`Cmd + Shift + K\`     | Delete line               |
| \`Cmd + /\`             | Toggle comment            |
| \`Cmd + B\`             | Toggle sidebar            |
| \`Ctrl + \`\`            | Toggle terminal           |

## Workspace Settings

Create \`.vscode/settings.json\` in your project:

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.wordWrap": "on"
}
\`\`\`

## Emmet Shortcuts

Type abbreviations and press Tab:
- \`div.card>h3+p\` → generates nested HTML
- \`ul>li*5\` → 5 list items`,
          },
          {
            title: "Git Basics — Init, Commit, Push",
            estimatedMinutes: 10,
            content: `# Git Basics — Init, Commit, Push

Git is a version control system that tracks changes to your code.

## Core Concepts

- **Repository (repo)**: A project tracked by Git
- **Commit**: A snapshot of your code at a point in time
- **Branch**: A parallel version of your code
- **Remote**: A copy of the repo on a server (e.g., GitHub)

## Getting Started

\`\`\`bash
# Initialize a new repository
git init

# Check status
git status

# Stage files for commit
git add .                    # Stage all changes
git add src/index.ts         # Stage specific file

# Commit staged changes
git commit -m "Initial commit: add project structure"

# Connect to GitHub
git remote add origin https://github.com/user/repo.git

# Push to remote
git push -u origin main
\`\`\`

## Writing Good Commit Messages

\`\`\`
feat: add user registration form
fix: resolve login redirect loop
docs: update README with setup instructions
refactor: extract auth middleware
\`\`\`

## .gitignore

Create a \`.gitignore\` file to exclude files from tracking:

\`\`\`
node_modules/
dist/
.env
.DS_Store
\`\`\``,
          },
          {
            title: "Git Branching & Collaboration",
            estimatedMinutes: 10,
            content: `# Git Branching & Collaboration

Branches let you work on features in isolation without affecting the main codebase.

## Branch Commands

\`\`\`bash
# Create and switch to a new branch
git checkout -b feature/user-profile

# List branches
git branch

# Switch branches
git checkout main

# Delete a branch
git branch -d feature/user-profile
\`\`\`

## Merge Workflow

\`\`\`bash
# 1. Work on your feature branch
git checkout -b feature/badges
# ... make changes, commit ...

# 2. Switch back to main
git checkout main

# 3. Pull latest changes
git pull origin main

# 4. Merge your feature
git merge feature/badges

# 5. Push
git push origin main
\`\`\`

## Pull Requests (PRs)

1. Push your feature branch to GitHub
2. Open a Pull Request on GitHub
3. Team reviews your code
4. Merge when approved

## Resolving Merge Conflicts

When Git can't auto-merge, it marks conflicts:

\`\`\`
<<<<<<< HEAD
const color = "blue";
=======
const color = "green";
>>>>>>> feature/theme
\`\`\`

Choose the correct version, remove the markers, and commit.`,
          },
        ],
      },
    ]
  );

  // ══════════════════════════════════════════════════════════════
  // COURSE 2: JavaScript Essentials
  // ══════════════════════════════════════════════════════════════
  await seedCourse(
    {
      title: "JavaScript Essentials",
      description: "Master JavaScript from variables to async programming. Build interactive web applications with confidence.",
      difficulty: "beginner",
      pointsReward: 150,
    },
    [
      {
        title: "Language Basics",
        description: "Variables, types, control flow, and functions.",
        lessons: [
          { title: "Variables, Types & Operators", estimatedMinutes: 10, content: "# Variables, Types & Operators\n\nJavaScript has three ways to declare variables:\n\n```js\nconst name = 'DevPath';  // Cannot be reassigned\nlet count = 0;           // Can be reassigned\nvar old = 'avoid this';  // Function-scoped (legacy)\n```\n\n## Primitive Types\n\n| Type        | Example           |\n|-------------|-------------------|\n| `string`    | `'hello'`         |\n| `number`    | `42`, `3.14`      |\n| `boolean`   | `true`, `false`   |\n| `null`      | `null`            |\n| `undefined` | `undefined`       |\n| `symbol`    | `Symbol('id')`    |\n| `bigint`    | `9007199254740991n`|\n\n## Operators\n\n```js\n// Comparison\n5 === 5      // true (strict equality)\n5 == '5'     // true (loose — avoid!)\n5 !== '5'    // true\n\n// Logical\ntrue && false  // false\ntrue || false  // true\n!true          // false\n```\n\n## typeof\n\n```js\ntypeof 'hello'     // 'string'\ntypeof 42          // 'number'\ntypeof true        // 'boolean'\ntypeof undefined   // 'undefined'\ntypeof null        // 'object' (historical bug)\n```" },
          { title: "Control Flow — Conditionals", estimatedMinutes: 8, content: "# Control Flow — Conditionals\n\n## if / else\n\n```js\nconst score = 85;\n\nif (score >= 90) {\n  console.log('A');\n} else if (score >= 80) {\n  console.log('B');\n} else {\n  console.log('C');\n}\n```\n\n## Ternary Operator\n\n```js\nconst status = score >= 60 ? 'pass' : 'fail';\n```\n\n## Switch\n\n```js\nswitch (difficulty) {\n  case 'beginner':\n    xp = 10;\n    break;\n  case 'intermediate':\n    xp = 20;\n    break;\n  case 'advanced':\n    xp = 30;\n    break;\n  default:\n    xp = 0;\n}\n```\n\n## Truthy & Falsy\n\nFalsy values: `false`, `0`, `''`, `null`, `undefined`, `NaN`\n\nEverything else is truthy:\n\n```js\nif ('hello') { /* runs */ }\nif (0) { /* skipped */ }\n```" },
          { title: "Loops and Iteration", estimatedMinutes: 8, content: "# Loops and Iteration\n\n## for Loop\n\n```js\nfor (let i = 0; i < 5; i++) {\n  console.log(i); // 0, 1, 2, 3, 4\n}\n```\n\n## while / do...while\n\n```js\nlet count = 0;\nwhile (count < 3) {\n  console.log(count++);\n}\n\ndo {\n  console.log('runs at least once');\n} while (false);\n```\n\n## for...of (Arrays, Strings)\n\n```js\nconst langs = ['JS', 'TS', 'Python'];\nfor (const lang of langs) {\n  console.log(lang);\n}\n```\n\n## for...in (Objects)\n\n```js\nconst user = { name: 'Dev', level: 5 };\nfor (const key in user) {\n  console.log(`${key}: ${user[key]}`);\n}\n```\n\n## break & continue\n\n```js\nfor (let i = 0; i < 10; i++) {\n  if (i === 5) break;     // Stop loop\n  if (i % 2 === 0) continue; // Skip even\n  console.log(i); // 1, 3\n}\n```" },
          { title: "Functions and Scope", estimatedMinutes: 12, content: "# Functions and Scope\n\n## Function Declaration\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\n## Function Expression\n\n```js\nconst greet = function(name) {\n  return `Hello, ${name}!`;\n};\n```\n\n## Arrow Function\n\n```js\nconst greet = (name) => `Hello, ${name}!`;\n\nconst add = (a, b) => a + b;\n\nconst processUser = (user) => {\n  const points = user.xp * 2;\n  return { ...user, points };\n};\n```\n\n## Default Parameters\n\n```js\nfunction createUser(name, role = 'user') {\n  return { name, role };\n}\n```\n\n## Scope\n\n```js\nconst global = 'I\\'m global';\n\nfunction outer() {\n  const outerVar = 'I\\'m in outer';\n\n  function inner() {\n    const innerVar = 'I\\'m in inner';\n    console.log(global);    // ✅\n    console.log(outerVar);  // ✅ (closure)\n    console.log(innerVar);  // ✅\n  }\n\n  inner();\n  // console.log(innerVar); // ❌ ReferenceError\n}\n```\n\n## Closures\n\nA closure is a function that remembers its outer scope:\n\n```js\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\n\nconst inc = counter();\ninc(); // 1\ninc(); // 2\n```" },
        ],
      },
      {
        title: "Data Structures",
        description: "Arrays, objects, and modern data manipulation.",
        lessons: [
          { title: "Arrays and Iteration Methods", estimatedMinutes: 12, content: "# Arrays and Iteration Methods\n\n## Creating Arrays\n\n```js\nconst courses = ['React', 'TypeScript', 'Node.js'];\nconst empty = [];\nconst filled = new Array(5).fill(0); // [0, 0, 0, 0, 0]\n```\n\n## Key Methods\n\n```js\nconst numbers = [1, 2, 3, 4, 5];\n\n// map — transform each element\nnumbers.map(n => n * 2); // [2, 4, 6, 8, 10]\n\n// filter — keep elements that pass test\nnumbers.filter(n => n > 3); // [4, 5]\n\n// reduce — accumulate into single value\nnumbers.reduce((sum, n) => sum + n, 0); // 15\n\n// find — first match\nnumbers.find(n => n > 3); // 4\n\n// some / every\nnumbers.some(n => n > 4); // true\nnumbers.every(n => n > 0); // true\n\n// forEach — side effects\nnumbers.forEach(n => console.log(n));\n```\n\n## Chaining\n\n```js\nconst result = users\n  .filter(u => u.level > 3)\n  .map(u => u.name)\n  .sort();\n```" },
          { title: "Objects and Destructuring", estimatedMinutes: 10, content: "# Objects and Destructuring\n\n## Object Literals\n\n```js\nconst user = {\n  name: 'Dev',\n  level: 5,\n  courses: ['React', 'Node'],\n  greet() {\n    return `Hi, I'm ${this.name}`;\n  },\n};\n```\n\n## Destructuring\n\n```js\nconst { name, level } = user;\nconsole.log(name); // 'Dev'\n\n// Renaming\nconst { name: userName } = user;\n\n// Default values\nconst { bio = 'No bio' } = user;\n\n// Nested\nconst { address: { city } } = { address: { city: 'NYC' } };\n```\n\n## Computed Property Names\n\n```js\nconst key = 'role';\nconst obj = { [key]: 'admin' }; // { role: 'admin' }\n```\n\n## Object Methods\n\n```js\nObject.keys(user);    // ['name', 'level', 'courses', 'greet']\nObject.values(user);  // ['Dev', 5, [...], fn]\nObject.entries(user); // [['name','Dev'], ...]\n```\n\n## Optional Chaining\n\n```js\nuser?.address?.city; // undefined (no error)\n```" },
          { title: "Spread, Rest & Shallow Copies", estimatedMinutes: 8, content: "# Spread, Rest & Shallow Copies\n\n## Spread Operator\n\n```js\n// Arrays\nconst a = [1, 2, 3];\nconst b = [...a, 4, 5]; // [1, 2, 3, 4, 5]\n\n// Objects\nconst user = { name: 'Dev', level: 1 };\nconst updated = { ...user, level: 2 }; // { name: 'Dev', level: 2 }\n```\n\n## Rest Parameters\n\n```js\nfunction sum(...numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}\nsum(1, 2, 3); // 6\n\n// Destructuring rest\nconst [first, ...rest] = [1, 2, 3, 4];\n// first = 1, rest = [2, 3, 4]\n```\n\n## Shallow vs Deep Copy\n\n```js\n// Shallow copy — nested objects still shared!\nconst copy = { ...user };\n\n// Deep copy\nconst deep = structuredClone(user);\n```" },
          { title: "Maps, Sets & WeakRefs", estimatedMinutes: 8, content: "# Maps, Sets & WeakRefs\n\n## Map\n\nKey-value pairs where keys can be any type:\n\n```js\nconst map = new Map();\nmap.set('name', 'DevPath');\nmap.set(42, 'answer');\nmap.get('name'); // 'DevPath'\nmap.has(42);     // true\nmap.size;        // 2\n\nfor (const [key, value] of map) {\n  console.log(key, value);\n}\n```\n\n## Set\n\nA collection of unique values:\n\n```js\nconst set = new Set([1, 2, 2, 3, 3]);\n// Set { 1, 2, 3 }\n\nset.add(4);\nset.has(2);  // true\nset.size;    // 4\n\n// Remove duplicates from array\nconst unique = [...new Set(array)];\n```\n\n## WeakMap & WeakSet\n\n- Keys must be objects\n- Keys are weakly held (garbage-collectable)\n- Not iterable\n- Use case: storing metadata about objects without preventing GC" },
        ],
      },
      {
        title: "Async JavaScript",
        description: "Master callbacks, promises, and async/await.",
        lessons: [
          { title: "The Event Loop & Callback Pattern", estimatedMinutes: 12, content: "# The Event Loop & Callback Pattern\n\n## How JavaScript Handles Async\n\nJavaScript is single-threaded but non-blocking, thanks to the event loop.\n\n```\n┌──────────────────┐\n│   Call Stack     │  ← Executes synchronous code\n└────────┬─────────┘\n         │\n┌────────▼─────────┐\n│  Web APIs /      │  ← setTimeout, fetch, DOM events\n│  Node APIs       │\n└────────┬─────────┘\n         │\n┌────────▼─────────┐\n│  Callback Queue  │  ← Queued callbacks\n└────────┬─────────┘\n         │\n   Event Loop checks if call stack is empty,\n   then moves callbacks to the stack.\n```\n\n## setTimeout Example\n\n```js\nconsole.log('1');\nsetTimeout(() => console.log('2'), 0);\nconsole.log('3');\n// Output: 1, 3, 2\n```\n\n## Callback Pattern\n\n```js\nfunction fetchData(callback) {\n  setTimeout(() => {\n    callback(null, { courses: ['React'] });\n  }, 1000);\n}\n\nfetchData((error, data) => {\n  if (error) return console.error(error);\n  console.log(data);\n});\n```\n\n## Callback Hell\n\nNested callbacks become unreadable — this is why Promises were invented." },
          { title: "Promises", estimatedMinutes: 12, content: "# Promises\n\nA Promise represents a value that will be available in the future.\n\n## Creating a Promise\n\n```js\nconst promise = new Promise((resolve, reject) => {\n  setTimeout(() => {\n    resolve({ name: 'DevPath' });\n    // or: reject(new Error('Failed'));\n  }, 1000);\n});\n```\n\n## Consuming Promises\n\n```js\npromise\n  .then(data => console.log(data))\n  .catch(err => console.error(err))\n  .finally(() => console.log('Done'));\n```\n\n## Chaining\n\n```js\nfetch('/api/courses')\n  .then(res => res.json())\n  .then(data => data.filter(c => c.published))\n  .then(courses => console.log(courses))\n  .catch(err => console.error(err));\n```\n\n## Promise Combinators\n\n```js\n// Wait for ALL to resolve\nconst [users, courses] = await Promise.all([\n  fetch('/api/users').then(r => r.json()),\n  fetch('/api/courses').then(r => r.json()),\n]);\n\n// First to resolve wins\nconst fastest = await Promise.race([fetch(url1), fetch(url2)]);\n\n// All settled (no rejection)\nconst results = await Promise.allSettled([p1, p2, p3]);\n```" },
          { title: "Async/Await", estimatedMinutes: 12, content: "# Async/Await\n\nAsync/await is syntactic sugar over Promises, making async code look synchronous.\n\n## Basic Usage\n\n```js\nasync function loadCourses() {\n  try {\n    const response = await fetch('/api/courses');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to load courses:', error);\n    throw error;\n  }\n}\n```\n\n## Arrow Function\n\n```js\nconst loadCourses = async () => {\n  const res = await fetch('/api/courses');\n  return res.json();\n};\n```\n\n## Parallel Execution\n\n```js\n// ❌ Sequential — slow\nconst users = await fetchUsers();\nconst courses = await fetchCourses();\n\n// ✅ Parallel — fast\nconst [users, courses] = await Promise.all([\n  fetchUsers(),\n  fetchCourses(),\n]);\n```\n\n## Error Handling\n\n```js\ntry {\n  const data = await riskyOperation();\n} catch (error) {\n  if (error instanceof TypeError) {\n    // Handle specific error\n  }\n  console.error(error.message);\n}\n```\n\n## Top-Level Await\n\nIn ES modules, you can use await at the top level:\n\n```js\nconst config = await loadConfig();\n```" },
          { title: "Fetch API and HTTP Requests", estimatedMinutes: 10, content: "# Fetch API and HTTP Requests\n\n## GET Request\n\n```js\nconst response = await fetch('/api/courses');\nconst courses = await response.json();\n```\n\n## POST Request\n\n```js\nconst response = await fetch('/api/courses', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    title: 'React Development',\n    difficulty: 'intermediate',\n  }),\n});\n\nif (!response.ok) {\n  throw new Error(`HTTP ${response.status}`);\n}\n\nconst newCourse = await response.json();\n```\n\n## Response Checking\n\n```js\nasync function fetchJSON(url) {\n  const res = await fetch(url);\n  if (!res.ok) {\n    throw new Error(`${res.status}: ${res.statusText}`);\n  }\n  return res.json();\n}\n```\n\n## With Loading State\n\n```js\nlet loading = true;\nlet error = null;\nlet data = null;\n\ntry {\n  loading = true;\n  data = await fetchJSON('/api/courses');\n} catch (e) {\n  error = e.message;\n} finally {\n  loading = false;\n}\n```" },
        ],
      },
      {
        title: "DOM & Events",
        description: "Manipulate the DOM and handle user interactions.",
        lessons: [
          { title: "Querying and Traversing the DOM", estimatedMinutes: 10, content: "# Querying and Traversing the DOM\n\n## Selecting Elements\n\n```js\n// By CSS selector (most common)\nconst card = document.querySelector('.card');\nconst cards = document.querySelectorAll('.card');\n\n// By ID\nconst hero = document.getElementById('hero');\n\n// By class name\nconst items = document.getElementsByClassName('item');\n```\n\n## Traversal\n\n```js\nconst el = document.querySelector('.card');\n\nel.parentElement;            // Parent\nel.children;                 // Direct children\nel.firstElementChild;        // First child element\nel.lastElementChild;         // Last child element\nel.nextElementSibling;       // Next sibling\nel.previousElementSibling;   // Previous sibling\nel.closest('.container');     // Nearest ancestor matching selector\n```\n\n## Checking Elements\n\n```js\nel.matches('.active');       // Does it match this selector?\nel.contains(childEl);        // Is childEl inside el?\n```" },
          { title: "Manipulating Elements", estimatedMinutes: 10, content: "# Manipulating Elements\n\n## Creating Elements\n\n```js\nconst div = document.createElement('div');\ndiv.className = 'card';\ndiv.textContent = 'New Card';\ndiv.innerHTML = '<h3>Title</h3><p>Content</p>';\n```\n\n## Adding/Removing\n\n```js\nparent.appendChild(div);\nparent.prepend(div);         // Add to beginning\nparent.insertBefore(div, referenceEl);\nel.remove();                 // Remove from DOM\n```\n\n## Modifying\n\n```js\n// Text\nel.textContent = 'New text';\nel.innerHTML = '<strong>Bold</strong>';\n\n// Attributes\nel.setAttribute('data-id', '123');\nel.getAttribute('data-id');\nel.removeAttribute('data-id');\n\n// Styles\nel.style.color = 'green';\nel.style.backgroundColor = '#0a0a0f';\n\n// Classes\nel.classList.add('active');\nel.classList.remove('hidden');\nel.classList.toggle('expanded');\nel.classList.contains('active'); // true/false\n```" },
          { title: "Event Listeners & Delegation", estimatedMinutes: 12, content: "# Event Listeners & Delegation\n\n## Adding Events\n\n```js\nconst btn = document.querySelector('.btn');\n\nbtn.addEventListener('click', (event) => {\n  console.log('Clicked!', event.target);\n});\n```\n\n## Common Events\n\n| Event       | Triggers when...              |\n|-------------|-------------------------------|\n| `click`     | Element is clicked            |\n| `input`     | Input value changes           |\n| `submit`    | Form is submitted             |\n| `keydown`   | Key is pressed                |\n| `mouseover` | Mouse enters element          |\n| `focus`     | Element gains focus           |\n| `scroll`    | Page or element is scrolled   |\n\n## Event Delegation\n\nInstead of adding listeners to many elements, add one to a parent:\n\n```js\ndocument.querySelector('.todo-list').addEventListener('click', (e) => {\n  if (e.target.matches('.delete-btn')) {\n    const item = e.target.closest('.todo-item');\n    item.remove();\n  }\n});\n```\n\n## Preventing Defaults\n\n```js\nform.addEventListener('submit', (e) => {\n  e.preventDefault(); // Stop form from reloading page\n  // Handle submission with JS\n});\n```" },
          { title: "Mini-Project: Interactive Todo List", estimatedMinutes: 15, pointsReward: 15, content: "# Mini-Project: Interactive Todo List\n\nLet's build a complete todo application using vanilla JavaScript.\n\n## HTML\n\n```html\n<div id=\"app\">\n  <h1>Todo List</h1>\n  <form id=\"todo-form\">\n    <input type=\"text\" id=\"todo-input\" placeholder=\"Add a task...\" required>\n    <button type=\"submit\">Add</button>\n  </form>\n  <ul id=\"todo-list\"></ul>\n</div>\n```\n\n## JavaScript\n\n```js\nconst form = document.getElementById('todo-form');\nconst input = document.getElementById('todo-input');\nconst list = document.getElementById('todo-list');\n\n// Load from localStorage\nlet todos = JSON.parse(localStorage.getItem('todos') || '[]');\n\nfunction saveTodos() {\n  localStorage.setItem('todos', JSON.stringify(todos));\n}\n\nfunction renderTodos() {\n  list.innerHTML = '';\n  todos.forEach((todo, index) => {\n    const li = document.createElement('li');\n    li.className = todo.done ? 'done' : '';\n    li.innerHTML = `\n      <span>${todo.text}</span>\n      <button data-action=\"toggle\" data-index=\"${index}\">✓</button>\n      <button data-action=\"delete\" data-index=\"${index}\">✕</button>\n    `;\n    list.appendChild(li);\n  });\n}\n\nform.addEventListener('submit', (e) => {\n  e.preventDefault();\n  todos.push({ text: input.value, done: false });\n  input.value = '';\n  saveTodos();\n  renderTodos();\n});\n\nlist.addEventListener('click', (e) => {\n  const btn = e.target.closest('button');\n  if (!btn) return;\n  const index = parseInt(btn.dataset.index);\n  if (btn.dataset.action === 'toggle') {\n    todos[index].done = !todos[index].done;\n  } else if (btn.dataset.action === 'delete') {\n    todos.splice(index, 1);\n  }\n  saveTodos();\n  renderTodos();\n});\n\nrenderTodos();\n```\n\nCongratulations! You've built a full CRUD app with vanilla JS, DOM manipulation, events, and localStorage." },
        ],
      },
      {
        title: "Modern JavaScript (ES6+)",
        description: "ES modules, template literals, and modern syntax.",
        lessons: [
          { title: "ES Modules — import/export", estimatedMinutes: 8, content: "# ES Modules — import/export\n\n## Named Exports\n\n```js\n// math.js\nexport function add(a, b) { return a + b; }\nexport function subtract(a, b) { return a - b; }\nexport const PI = 3.14159;\n```\n\n```js\n// main.js\nimport { add, subtract, PI } from './math.js';\n```\n\n## Default Export\n\n```js\n// User.js\nexport default class User {\n  constructor(name) { this.name = name; }\n}\n```\n\n```js\nimport User from './User.js';\n```\n\n## Re-exporting\n\n```js\n// index.js (barrel file)\nexport { add, subtract } from './math.js';\nexport { default as User } from './User.js';\n```\n\n## Dynamic Imports\n\n```js\nconst module = await import('./heavy-module.js');\nmodule.doSomething();\n```" },
          { title: "Template Literals & Tagged Templates", estimatedMinutes: 5, content: "# Template Literals & Tagged Templates\n\n## Template Literals\n\n```js\nconst name = 'Developer';\nconst greeting = `Hello, ${name}!`;\n\n// Multi-line\nconst html = `\n  <div class=\"card\">\n    <h3>${title}</h3>\n    <p>${description}</p>\n  </div>\n`;\n\n// Expressions\nconst msg = `You have ${points} XP (Level ${Math.floor(points / 500) + 1})`;\n```\n\n## Tagged Templates\n\n```js\nfunction highlight(strings, ...values) {\n  return strings.reduce((result, str, i) => {\n    return result + str + (values[i] ? `<mark>${values[i]}</mark>` : '');\n  }, '');\n}\n\nconst output = highlight`Welcome ${name}, you have ${xp} XP!`;\n// 'Welcome <mark>Dev</mark>, you have <mark>500</mark> XP!'\n```" },
          { title: "Optional Chaining & Nullish Coalescing", estimatedMinutes: 5, content: "# Optional Chaining & Nullish Coalescing\n\n## Optional Chaining (?.)\n\nSafely access deeply nested properties:\n\n```js\nconst user = { profile: { address: { city: 'NYC' } } };\n\n// Without optional chaining\nconst city = user && user.profile && user.profile.address && user.profile.address.city;\n\n// With optional chaining\nconst city = user?.profile?.address?.city; // 'NYC'\nconst zip = user?.profile?.address?.zip;   // undefined (no error)\n```\n\n## With Methods\n\n```js\nuser?.greet?.();           // Call only if method exists\narray?.[0];                // Access array element safely\n```\n\n## Nullish Coalescing (??)\n\nProvide fallback for `null` or `undefined` only:\n\n```js\nconst name = user.name ?? 'Anonymous';\nconst count = data.count ?? 0;\n\n// Different from ||\nconst value = 0 || 'fallback';   // 'fallback' (0 is falsy)\nconst value = 0 ?? 'fallback';   // 0 (0 is not null/undefined)\n```\n\n## Combining Both\n\n```js\nconst displayName = user?.profile?.displayName ?? 'Unknown User';\n```" },
        ],
      },
    ]
  );

  // ══════════════════════════════════════════════════════════════
  // COURSES 3–8: Shorter seed content (structure + first lesson)
  // ══════════════════════════════════════════════════════════════
  const shortContent = (title: string) =>
    `# ${title}\n\nThis lesson covers the key concepts of ${title.toLowerCase()}. Content is being expanded — check back soon for the full lesson.\n\n## Learning Objectives\n\n- Understand the core concepts\n- Apply the techniques in practice\n- Build confidence through hands-on examples\n\n## Key Takeaways\n\nThis topic is essential for modern software development. Take your time to absorb the material, and don't hesitate to revisit it as you progress through the course.`;

  // Course 3: TypeScript Mastery
  await seedCourse(
    { title: "TypeScript Mastery", description: "Add type safety to your JavaScript. Learn TypeScript from basic annotations to advanced generics and utility types.", difficulty: "intermediate", pointsReward: 200 },
    [
      { title: "TypeScript Foundations", description: "Why TypeScript, annotations, interfaces, and config.", lessons: [
        { title: "Why TypeScript?", estimatedMinutes: 5, content: "# Why TypeScript?\n\nTypeScript adds static types to JavaScript, catching bugs before your code runs.\n\n## Benefits\n\n1. **Catch bugs early** — Type errors surface at compile time, not runtime\n2. **Better editor support** — Autocomplete, refactoring, inline docs\n3. **Self-documenting** — Types serve as living documentation\n4. **Safer refactoring** — The compiler catches breaking changes\n\n## TypeScript vs JavaScript\n\n```typescript\n// JavaScript — no error until runtime\nfunction add(a, b) {\n  return a + b;\n}\nadd('5', 3); // '53' — silent bug!\n\n// TypeScript — caught at compile time\nfunction add(a: number, b: number): number {\n  return a + b;\n}\nadd('5', 3); // ❌ Error: Argument of type 'string' is not assignable\n```\n\n## How It Works\n\n```\n.ts files → TypeScript Compiler (tsc) → .js files\n```\n\nTypeScript is a superset of JavaScript — all valid JS is valid TS." },
        { title: "Type Annotations & Inference", estimatedMinutes: 10, content: shortContent("Type Annotations & Inference") },
        { title: "Interfaces vs Type Aliases", estimatedMinutes: 10, content: shortContent("Interfaces vs Type Aliases") },
        { title: "Configuring tsconfig.json", estimatedMinutes: 8, content: shortContent("Configuring tsconfig.json") },
      ]},
      { title: "Types In Depth", description: "Unions, intersections, type guards, and literal types.", lessons: [
        { title: "Union & Intersection Types", estimatedMinutes: 10, content: shortContent("Union & Intersection Types") },
        { title: "Type Guards & Narrowing", estimatedMinutes: 12, content: shortContent("Type Guards & Narrowing") },
        { title: "Literal & Template Literal Types", estimatedMinutes: 10, content: shortContent("Literal & Template Literal Types") },
        { title: "Enums, Tuples & Readonly", estimatedMinutes: 10, content: shortContent("Enums, Tuples & Readonly") },
      ]},
      { title: "Generics & Utility Types", description: "Write reusable, type-safe code with generics.", lessons: [
        { title: "Generic Functions & Interfaces", estimatedMinutes: 12, content: shortContent("Generic Functions & Interfaces") },
        { title: "Generic Constraints & Defaults", estimatedMinutes: 12, content: shortContent("Generic Constraints & Defaults") },
        { title: "Built-in Utility Types", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Built-in Utility Types") },
        { title: "Conditional Types & Mapped Types", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Conditional Types & Mapped Types") },
      ]},
      { title: "Real-World TypeScript", description: "Typing React, APIs, and third-party libraries.", lessons: [
        { title: "Typing React Components", estimatedMinutes: 12, content: shortContent("Typing React Components") },
        { title: "Typing API Responses & Fetch", estimatedMinutes: 10, content: shortContent("Typing API Responses & Fetch") },
        { title: "Declaration Files & Third-Party Types", estimatedMinutes: 8, content: shortContent("Declaration Files & Third-Party Types") },
        { title: "TypeScript Patterns & Anti-Patterns", estimatedMinutes: 10, content: shortContent("TypeScript Patterns & Anti-Patterns") },
      ]},
    ]
  );

  // Course 4: React Development
  await seedCourse(
    { title: "React Development", description: "Build modern, interactive UIs with React. From fundamentals through hooks, routing, forms, and performance.", difficulty: "intermediate", pointsReward: 200 },
    [
      { title: "React Fundamentals", description: "JSX, components, props, and state.", lessons: [
        { title: "JSX & the Component Model", estimatedMinutes: 10, content: shortContent("JSX & the Component Model") },
        { title: "Props, Children & Composition", estimatedMinutes: 10, content: shortContent("Props, Children & Composition") },
        { title: "State with useState", estimatedMinutes: 12, content: shortContent("State with useState") },
        { title: "Conditional Rendering & Lists", estimatedMinutes: 8, content: shortContent("Conditional Rendering & Lists") },
      ]},
      { title: "Hooks Deep Dive", description: "useEffect, useRef, useMemo, and custom hooks.", lessons: [
        { title: "useEffect & Side Effects", estimatedMinutes: 12, content: shortContent("useEffect & Side Effects") },
        { title: "useRef for DOM Access & Persistence", estimatedMinutes: 8, content: shortContent("useRef for DOM Access") },
        { title: "useCallback & useMemo", estimatedMinutes: 10, content: shortContent("useCallback & useMemo") },
        { title: "Building Custom Hooks", estimatedMinutes: 12, pointsReward: 15, content: shortContent("Building Custom Hooks") },
      ]},
      { title: "State Management", description: "Context API, useReducer, and React Query.", lessons: [
        { title: "Context API & useReducer", estimatedMinutes: 12, content: shortContent("Context API & useReducer") },
        { title: "When to Use Global State", estimatedMinutes: 8, content: shortContent("When to Use Global State") },
        { title: "Introduction to React Query", estimatedMinutes: 12, content: shortContent("Introduction to React Query") },
      ]},
      { title: "Routing & Navigation", description: "React Router, dynamic routes, and auth guards.", lessons: [
        { title: "React Router Setup & Configuration", estimatedMinutes: 10, content: shortContent("React Router Setup") },
        { title: "Dynamic Routes & Parameters", estimatedMinutes: 10, content: shortContent("Dynamic Routes & Parameters") },
        { title: "Protected Routes & Auth Guards", estimatedMinutes: 10, content: shortContent("Protected Routes & Auth Guards") },
        { title: "Layouts, Outlets & Nested Routes", estimatedMinutes: 8, content: shortContent("Layouts, Outlets & Nested Routes") },
      ]},
      { title: "Forms & Validation", description: "Controlled inputs, React Hook Form, and Zod.", lessons: [
        { title: "Controlled vs Uncontrolled Inputs", estimatedMinutes: 8, content: shortContent("Controlled vs Uncontrolled Inputs") },
        { title: "React Hook Form", estimatedMinutes: 12, content: shortContent("React Hook Form") },
        { title: "Schema Validation with Zod", estimatedMinutes: 10, content: shortContent("Schema Validation with Zod") },
      ]},
      { title: "Performance & Patterns", description: "Optimization, code splitting, and advanced patterns.", lessons: [
        { title: "React.memo & Preventing Re-Renders", estimatedMinutes: 10, content: shortContent("React.memo & Preventing Re-Renders") },
        { title: "Code Splitting & Lazy Loading", estimatedMinutes: 8, content: shortContent("Code Splitting & Lazy Loading") },
        { title: "Error Boundaries", estimatedMinutes: 8, content: shortContent("Error Boundaries") },
        { title: "Compound Components & Render Props", estimatedMinutes: 12, pointsReward: 15, content: shortContent("Compound Components & Render Props") },
      ]},
    ]
  );

  // Course 5: Node.js & Express
  await seedCourse(
    { title: "Node.js & Express", description: "Build production-ready backend APIs with Node.js and Express. Cover authentication, architecture, and testing.", difficulty: "intermediate", pointsReward: 200 },
    [
      { title: "Node.js Fundamentals", description: "The Node runtime, modules, and configuration.", lessons: [
        { title: "The Node.js Runtime", estimatedMinutes: 8, content: shortContent("The Node.js Runtime") },
        { title: "Modules — CommonJS & ES Modules", estimatedMinutes: 8, content: shortContent("Modules — CommonJS & ES Modules") },
        { title: "File System & Path Operations", estimatedMinutes: 10, content: shortContent("File System & Path Operations") },
        { title: "Environment Variables & Configuration", estimatedMinutes: 8, content: shortContent("Environment Variables & Configuration") },
      ]},
      { title: "Express API Basics", description: "Setting up Express, routing, and middleware.", lessons: [
        { title: "Setting Up an Express Server", estimatedMinutes: 10, content: shortContent("Setting Up an Express Server") },
        { title: "Routing & Route Parameters", estimatedMinutes: 10, content: shortContent("Routing & Route Parameters") },
        { title: "Middleware — The Express Pipeline", estimatedMinutes: 12, content: shortContent("Middleware — The Express Pipeline") },
        { title: "Request Parsing & Response Methods", estimatedMinutes: 8, content: shortContent("Request Parsing & Response Methods") },
      ]},
      { title: "Authentication & Security", description: "bcrypt, JWT, cookies, and security headers.", lessons: [
        { title: "Password Hashing with bcrypt", estimatedMinutes: 10, content: shortContent("Password Hashing with bcrypt") },
        { title: "JWT Authentication", estimatedMinutes: 12, content: shortContent("JWT Authentication") },
        { title: "httpOnly Cookies for Token Storage", estimatedMinutes: 10, content: shortContent("httpOnly Cookies for Token Storage") },
        { title: "CORS, Helmet & Rate Limiting", estimatedMinutes: 10, content: shortContent("CORS, Helmet & Rate Limiting") },
      ]},
      { title: "API Architecture Patterns", description: "Layered architecture, error handling, and docs.", lessons: [
        { title: "Layered Architecture — Controller/Service/Repository", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Layered Architecture") },
        { title: "Centralized Error Handling", estimatedMinutes: 10, content: shortContent("Centralized Error Handling") },
        { title: "Input Validation with Zod", estimatedMinutes: 10, content: shortContent("Input Validation with Zod") },
        { title: "API Documentation with Swagger", estimatedMinutes: 10, content: shortContent("API Documentation with Swagger") },
      ]},
      { title: "Testing APIs", description: "Unit tests, integration tests, and mocking.", lessons: [
        { title: "Unit Testing with Vitest", estimatedMinutes: 10, content: shortContent("Unit Testing with Vitest") },
        { title: "Integration Testing with Supertest", estimatedMinutes: 12, pointsReward: 15, content: shortContent("Integration Testing with Supertest") },
        { title: "Mocking & Test Database Strategies", estimatedMinutes: 10, content: shortContent("Mocking & Test Database Strategies") },
      ]},
    ]
  );

  // Course 6: Database Engineering
  await seedCourse(
    { title: "Database Engineering", description: "Design, query, and optimize relational databases. Master SQL, PostgreSQL, Prisma ORM, and database design.", difficulty: "intermediate", pointsReward: 200 },
    [
      { title: "SQL Fundamentals", description: "SELECT, DML, JOINs, and aggregations.", lessons: [
        { title: "SELECT — Querying Data", estimatedMinutes: 10, content: shortContent("SELECT — Querying Data") },
        { title: "INSERT, UPDATE, DELETE", estimatedMinutes: 8, content: shortContent("INSERT, UPDATE, DELETE") },
        { title: "JOINs & Relationships", estimatedMinutes: 12, content: shortContent("JOINs & Relationships") },
        { title: "Aggregations & GROUP BY", estimatedMinutes: 12, content: shortContent("Aggregations & GROUP BY") },
      ]},
      { title: "PostgreSQL Deep Dive", description: "Types, indexes, transactions, and functions.", lessons: [
        { title: "Data Types & Constraints", estimatedMinutes: 10, content: shortContent("Data Types & Constraints") },
        { title: "Indexes & Query Performance", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Indexes & Query Performance") },
        { title: "Transactions & ACID Properties", estimatedMinutes: 12, content: shortContent("Transactions & ACID Properties") },
        { title: "Views, Functions & Triggers", estimatedMinutes: 12, content: shortContent("Views, Functions & Triggers") },
      ]},
      { title: "ORM with Prisma", description: "Schema modeling, migrations, and queries.", lessons: [
        { title: "Schema Modeling in Prisma", estimatedMinutes: 12, content: shortContent("Schema Modeling in Prisma") },
        { title: "Migrations & Seeding", estimatedMinutes: 10, content: shortContent("Migrations & Seeding") },
        { title: "CRUD Queries with Prisma Client", estimatedMinutes: 12, content: shortContent("CRUD Queries with Prisma Client") },
        { title: "Relations, Transactions & Raw Queries", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Relations, Transactions & Raw Queries") },
      ]},
      { title: "Database Design", description: "Normalization, many-to-many, and RLS.", lessons: [
        { title: "Normalization — 1NF, 2NF, 3NF", estimatedMinutes: 12, content: shortContent("Normalization — 1NF, 2NF, 3NF") },
        { title: "Many-to-Many & Junction Tables", estimatedMinutes: 10, content: shortContent("Many-to-Many & Junction Tables") },
        { title: "Row-Level Security (RLS)", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Row-Level Security (RLS)") },
        { title: "Schema Design Case Study: DevPath", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Schema Design Case Study: DevPath") },
      ]},
    ]
  );

  // Course 7: DevOps Fundamentals
  await seedCourse(
    { title: "DevOps Fundamentals", description: "Ship your code to production. Learn Docker, CI/CD pipelines, cloud deployment, and monitoring.", difficulty: "intermediate", pointsReward: 200 },
    [
      { title: "Containers & Docker", description: "Containers, Dockerfiles, Compose, and networking.", lessons: [
        { title: "What Are Containers?", estimatedMinutes: 8, content: shortContent("What Are Containers?") },
        { title: "Dockerfile — Building Images", estimatedMinutes: 12, content: shortContent("Dockerfile — Building Images") },
        { title: "Docker Compose for Local Dev", estimatedMinutes: 12, content: shortContent("Docker Compose for Local Dev") },
        { title: "Docker Networking & Volumes", estimatedMinutes: 10, content: shortContent("Docker Networking & Volumes") },
      ]},
      { title: "CI/CD Pipelines", description: "GitHub Actions for build, test, and deploy.", lessons: [
        { title: "GitHub Actions — Core Concepts", estimatedMinutes: 10, content: shortContent("GitHub Actions — Core Concepts") },
        { title: "Build & Test Workflows", estimatedMinutes: 10, content: shortContent("Build & Test Workflows") },
        { title: "Deploy Workflows", estimatedMinutes: 10, content: shortContent("Deploy Workflows") },
        { title: "Advanced CI — Matrix Builds & Caching", estimatedMinutes: 8, content: shortContent("Advanced CI — Matrix Builds & Caching") },
      ]},
      { title: "Deployment", description: "Deploy frontends, backends, and databases.", lessons: [
        { title: "Deploying Frontends to Vercel", estimatedMinutes: 8, content: shortContent("Deploying Frontends to Vercel") },
        { title: "Deploying Backends to Railway/Fly.io", estimatedMinutes: 10, content: shortContent("Deploying Backends to Railway/Fly.io") },
        { title: "Database Hosting & Backups", estimatedMinutes: 10, content: shortContent("Database Hosting & Backups") },
        { title: "Custom Domains & SSL", estimatedMinutes: 8, content: shortContent("Custom Domains & SSL") },
      ]},
      { title: "Monitoring & Observability", description: "Logging, error tracking, and health checks.", lessons: [
        { title: "Structured Logging", estimatedMinutes: 8, content: shortContent("Structured Logging") },
        { title: "Error Tracking with Sentry", estimatedMinutes: 10, content: shortContent("Error Tracking with Sentry") },
        { title: "Health Checks & Uptime Monitoring", estimatedMinutes: 8, content: shortContent("Health Checks & Uptime Monitoring") },
      ]},
    ]
  );

  // Course 8: System Design & Architecture
  await seedCourse(
    { title: "System Design & Architecture", description: "Think like an architect. Design scalable systems, make technology tradeoffs, and solve real-world design challenges.", difficulty: "advanced", pointsReward: 300 },
    [
      { title: "Architecture Patterns", description: "Monolith, microservices, and event-driven patterns.", lessons: [
        { title: "Monolith vs Microservices", estimatedMinutes: 12, content: shortContent("Monolith vs Microservices") },
        { title: "Layered & Clean Architecture", estimatedMinutes: 12, content: shortContent("Layered & Clean Architecture") },
        { title: "Event-Driven Architecture", estimatedMinutes: 12, content: shortContent("Event-Driven Architecture") },
      ]},
      { title: "API Design", description: "REST best practices, versioning, and documentation.", lessons: [
        { title: "REST Best Practices", estimatedMinutes: 12, content: shortContent("REST Best Practices") },
        { title: "API Versioning & Pagination", estimatedMinutes: 10, content: shortContent("API Versioning & Pagination") },
        { title: "OpenAPI & API Documentation", estimatedMinutes: 10, content: shortContent("OpenAPI & API Documentation") },
      ]},
      { title: "Scalability", description: "Caching, load balancing, and database scaling.", lessons: [
        { title: "Caching Strategies with Redis", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Caching Strategies with Redis") },
        { title: "Load Balancing & Horizontal Scaling", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Load Balancing & Horizontal Scaling") },
        { title: "Database Scaling — Sharding & Replicas", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Database Scaling — Sharding & Replicas") },
      ]},
      { title: "Security & Reliability", description: "OWASP, DDoS protection, and disaster recovery.", lessons: [
        { title: "OWASP Top 10 for Developers", estimatedMinutes: 12, content: shortContent("OWASP Top 10 for Developers") },
        { title: "Rate Limiting & DDoS Protection", estimatedMinutes: 10, content: shortContent("Rate Limiting & DDoS Protection") },
        { title: "Backup & Disaster Recovery", estimatedMinutes: 12, content: shortContent("Backup & Disaster Recovery") },
      ]},
      { title: "Real-World Case Studies", description: "Design interviews and system design exercises.", lessons: [
        { title: "Design a URL Shortener", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Design a URL Shortener") },
        { title: "Design a Notification System", estimatedMinutes: 15, pointsReward: 15, content: shortContent("Design a Notification System") },
        { title: "Design a Leaderboard System", estimatedMinutes: 20, pointsReward: 15, content: shortContent("Design a Leaderboard System") },
      ]},
    ]
  );

  // ══════════════════════════════════════════════════════════════
  // BADGES (24 badges)
  // ══════════════════════════════════════════════════════════════
  console.log("\n🏅 Seeding badges...");

  const badges = [
    // Points Total
    { name: "First Steps",   description: "Earn your first 100 XP.",       conditionType: "points_total" as const, conditionValue: 100,  tier: "bronze"   as const },
    { name: "Rising Star",   description: "Earn 500 XP.",                  conditionType: "points_total" as const, conditionValue: 500,  tier: "silver"   as const },
    { name: "XP Master",     description: "Earn 2,000 XP.",               conditionType: "points_total" as const, conditionValue: 2000, tier: "gold"     as const },
    { name: "Legend",         description: "Earn 5,000 XP.",               conditionType: "points_total" as const, conditionValue: 5000, tier: "platinum" as const },
    // Courses Completed
    { name: "First Course",  description: "Complete your first course.",   conditionType: "courses_completed" as const, conditionValue: 1, tier: "bronze"   as const },
    { name: "Learner",       description: "Complete 3 courses.",           conditionType: "courses_completed" as const, conditionValue: 3, tier: "silver"   as const },
    { name: "Scholar",       description: "Complete 5 courses.",           conditionType: "courses_completed" as const, conditionValue: 5, tier: "gold"     as const },
    { name: "Polymath",      description: "Complete all 8 courses.",       conditionType: "courses_completed" as const, conditionValue: 8, tier: "platinum" as const },
    // Lessons Completed
    { name: "Getting Started", description: "Complete 5 lessons.",         conditionType: "lessons_completed" as const, conditionValue: 5,   tier: "bronze"   as const },
    { name: "Diligent",        description: "Complete 25 lessons.",        conditionType: "lessons_completed" as const, conditionValue: 25,  tier: "silver"   as const },
    { name: "Dedicated",       description: "Complete 75 lessons.",        conditionType: "lessons_completed" as const, conditionValue: 75,  tier: "gold"     as const },
    { name: "Unstoppable",     description: "Complete every lesson.",      conditionType: "lessons_completed" as const, conditionValue: 141, tier: "platinum" as const },
    // Streak Days
    { name: "Day One",         description: "Complete a lesson today.",    conditionType: "streak_days" as const, conditionValue: 1,   tier: "bronze"   as const },
    { name: "Weekly Warrior",  description: "7-day learning streak.",      conditionType: "streak_days" as const, conditionValue: 7,   tier: "silver"   as const },
    { name: "Monthly Grinder", description: "30-day learning streak.",     conditionType: "streak_days" as const, conditionValue: 30,  tier: "gold"     as const },
    { name: "Iron Will",       description: "100-day learning streak.",    conditionType: "streak_days" as const, conditionValue: 100, tier: "platinum" as const },
  ];

  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }
  console.log(`  ✅ ${badges.length} badges created`);

  // ── Summary ─────────────────────────────────────────────────
  const courseCount = await prisma.course.count();
  const moduleCount = await prisma.module.count();
  const lessonCount = await prisma.lesson.count();
  const badgeCount = await prisma.badge.count();

  console.log(`\n🎉 Seed complete!`);
  console.log(`   📘 Courses: ${courseCount}`);
  console.log(`   📦 Modules: ${moduleCount}`);
  console.log(`   📝 Lessons: ${lessonCount}`);
  console.log(`   🏅 Badges:  ${badgeCount}`);
  console.log(`   👤 Admin:   admin@devpath.dev / admin123\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
