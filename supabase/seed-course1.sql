-- ============================================================
-- DevPath Academy — Seed: Course 1 (Web Fundamentals)
-- 1 course · 5 modules · 19 lessons · Full markdown content
-- Run this in Supabase SQL Editor or any PostgreSQL client
-- ============================================================

BEGIN;

-- ── Course ───────────────────────────────────────────────────
INSERT INTO public.courses (id, title, description, difficulty, points_reward, is_published, created_at)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'Web Fundamentals',
  'Learn how the web works, build pages with HTML & CSS, and set up your developer tooling.',
  'beginner',
  100,
  true,
  now()
);

-- ══════════════════════════════════════════════════════════════
-- Module 1: How the Web Works (3 lessons)
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (id, course_id, title, description, sort_order)
VALUES (
  'm1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'How the Web Works',
  'Understand the journey from URL to rendered page.',
  0
);

-- Lesson 1.1
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000001',
  'm1000000-0000-0000-0000-000000000001',
  'How Browsers Load a Web Page',
  '# How Browsers Load a Web Page

When you type a URL and press Enter, a fascinating chain of events begins:

## The Journey

1. **DNS Lookup** — The browser asks a DNS server to translate the domain name (e.g., `example.com`) into an IP address.
2. **TCP Connection** — A connection is established with the server using a TCP three-way handshake.
3. **HTTP Request** — The browser sends an HTTP GET request for the page.
4. **Server Response** — The server sends back HTML, along with status codes (200 OK, 404 Not Found, etc.).
5. **Parsing & Rendering** — The browser parses HTML into the DOM, CSS into the CSSOM, and combines them into the render tree.

## Key Concepts

- **DOM** (Document Object Model): A tree representation of the HTML document.
- **CSSOM** (CSS Object Model): A tree representation of all CSS styles.
- **Render Tree**: Combines DOM + CSSOM to determine what''s visible and how it''s styled.
- **Layout**: Calculates the position and size of each element.
- **Paint**: Draws pixels to the screen.

## Critical Rendering Path

The critical rendering path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels. Optimizing this path improves load performance.

```
HTML → DOM
CSS  → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint
```

Understanding this process is the foundation of web performance optimization.',
  'text', 10, 0, 8
);

-- Lesson 1.2
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000002',
  'm1000000-0000-0000-0000-000000000001',
  'The HTTP Request/Response Cycle',
  '# The HTTP Request/Response Cycle

HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web.

## HTTP Methods

| Method   | Purpose                  | Example                      |
|----------|--------------------------|------------------------------|
| `GET`    | Retrieve data             | Fetch a web page             |
| `POST`   | Submit data               | Submit a form                |
| `PUT`    | Update/replace resource   | Update user profile          |
| `PATCH`  | Partial update            | Change just the email        |
| `DELETE` | Remove resource           | Delete an account            |

## Status Codes

- **2xx Success**: `200 OK`, `201 Created`, `204 No Content`
- **3xx Redirect**: `301 Moved Permanently`, `304 Not Modified`
- **4xx Client Error**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`
- **5xx Server Error**: `500 Internal Server Error`, `503 Service Unavailable`

## Anatomy of a Request

```http
GET /api/courses HTTP/1.1
Host: devpath.dev
Accept: application/json
Authorization: Bearer <token>
```

## Anatomy of a Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{ "courses": [...] }
```

## Headers

Headers carry metadata: content type, caching directives, authentication tokens, CORS policies, and more.',
  'text', 10, 1, 8
);

-- Lesson 1.3
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000003',
  'm1000000-0000-0000-0000-000000000001',
  'DNS, Domains, and Hosting Basics',
  '# DNS, Domains, and Hosting Basics

## What is DNS?

DNS (Domain Name System) translates human-readable domain names into IP addresses that computers use to identify each other.

```
devpath.dev  →  DNS Lookup  →  93.184.216.34
```

## Domain Name Structure

```
subdomain.domain.tld
   www   . devpath . dev
```

- **TLD** (Top-Level Domain): `.com`, `.dev`, `.io`
- **Domain**: Your chosen name
- **Subdomain**: Optional prefix (e.g., `api.`, `www.`)

## DNS Record Types

| Record | Purpose                  | Example                    |
|--------|--------------------------|----------------------------|
| `A`     | Maps domain to IPv4     | `devpath.dev → 93.184.216.34` |
| `AAAA`  | Maps domain to IPv6     | IPv6 address               |
| `CNAME` | Alias to another domain | `www → devpath.dev`         |
| `MX`    | Mail server             | Email routing              |

## Hosting Options

1. **Shared Hosting** — Multiple sites on one server. Cheap but limited.
2. **VPS** — Virtual private server. More control.
3. **Cloud** — AWS, GCP, Azure. Scalable, pay-per-use.
4. **Platform-as-a-Service** — Vercel, Railway, Fly.io. Deploy without managing servers.',
  'text', 10, 2, 5
);

-- ══════════════════════════════════════════════════════════════
-- Module 2: HTML Foundations (4 lessons)
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (id, course_id, title, description, sort_order)
VALUES (
  'm1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000001',
  'HTML Foundations',
  'Build proper HTML documents with semantic elements.',
  1
);

-- Lesson 2.1
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000004',
  'm1000000-0000-0000-0000-000000000002',
  'Document Structure & Semantic HTML',
  '# Document Structure & Semantic HTML

Every HTML document follows a standard structure:

```html
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
```

## Semantic Elements

Semantic HTML uses elements that describe their meaning:

- `<header>` — Introductory content or navigation
- `<nav>` — Navigation links
- `<main>` — Primary content (one per page)
- `<article>` — Self-contained content
- `<section>` — Thematic grouping
- `<aside>` — Tangentially related content
- `<footer>` — Footer information

## Why Semantic HTML Matters

1. **Accessibility** — Screen readers understand page structure
2. **SEO** — Search engines index content more accurately
3. **Maintainability** — Code is self-documenting',
  'text', 10, 0, 10
);

-- Lesson 2.2
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000005',
  'm1000000-0000-0000-0000-000000000002',
  'Text, Links, and Media',
  '# Text, Links, and Media

## Headings

HTML provides six heading levels. Use them to create a logical document outline:

```html
<h1>Main Title</h1>       <!-- One per page -->
<h2>Section Title</h2>
<h3>Subsection</h3>
```

## Text Elements

```html
<p>Paragraph text</p>
<strong>Bold / important</strong>
<em>Italic / emphasis</em>
<code>Inline code</code>
<blockquote>A quotation</blockquote>
```

## Links

```html
<a href="https://devpath.dev">Visit DevPath</a>
<a href="/courses">Internal link</a>
<a href="#section-id">Anchor link</a>
<a href="mailto:hello@devpath.dev">Email link</a>
```

## Images

```html
<img src="photo.jpg" alt="Description of the image" width="600" height="400">
```

Always include `alt` text for accessibility.

## Lists

```html
<ul>  <!-- Unordered -->
  <li>Item one</li>
  <li>Item two</li>
</ul>

<ol>  <!-- Ordered -->
  <li>First step</li>
  <li>Second step</li>
</ol>
```',
  'text', 10, 1, 10
);

-- Lesson 2.3
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000006',
  'm1000000-0000-0000-0000-000000000002',
  'Forms and Input Elements',
  '# Forms and Input Elements

Forms collect user input and submit it to a server.

## Basic Form

```html
<form action="/api/register" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>

  <label for="password">Password:</label>
  <input type="password" id="password" name="password" minlength="6" required>

  <button type="submit">Register</button>
</form>
```

## Input Types

| Type       | Renders               | Use Case              |
|------------|-----------------------|-----------------------|
| `text`     | Text field            | Names, general text   |
| `email`    | Email field           | Email validation      |
| `password` | Hidden text           | Passwords             |
| `number`   | Numeric spinner       | Quantities            |
| `checkbox` | Checkboxes            | Multiple selections   |
| `radio`    | Radio buttons         | Single selection      |
| `file`     | File picker           | Uploads               |
| `date`     | Date picker           | Dates                 |

## Other Form Elements

```html
<select name="difficulty">
  <option value="beginner">Beginner</option>
  <option value="intermediate">Intermediate</option>
  <option value="advanced">Advanced</option>
</select>

<textarea name="bio" rows="4" placeholder="Tell us about yourself"></textarea>
```

## Validation Attributes

- `required` — Field must be filled
- `minlength` / `maxlength` — Text length limits
- `min` / `max` — Numeric range
- `pattern` — Regex validation',
  'text', 10, 2, 12
);

-- Lesson 2.4
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000007',
  'm1000000-0000-0000-0000-000000000002',
  'HTML Accessibility Fundamentals',
  '# HTML Accessibility Fundamentals

Web accessibility ensures everyone can use your website, including people with disabilities.

## Key Principles (POUR)

1. **Perceivable** — Information must be presentable in ways users can perceive
2. **Operable** — UI must be navigable and operable
3. **Understandable** — Content must be readable and predictable
4. **Robust** — Content must work with assistive technologies

## Essential Practices

### Image Alt Text
```html
<!-- Good -->
<img src="chart.png" alt="Bar chart showing 50% growth in Q3">

<!-- Bad -->
<img src="chart.png" alt="image">

<!-- Decorative (skip) -->
<img src="divider.png" alt="" role="presentation">
```

### Heading Hierarchy
Use headings in order (`h1` → `h2` → `h3`). Don''t skip levels.

### ARIA Roles
```html
<nav aria-label="Main navigation">
<button aria-expanded="false" aria-controls="menu">Menu</button>
<div role="alert">Error: Invalid email</div>
```

### Keyboard Navigation
- All interactive elements should be focusable
- Use `tabindex="0"` for custom interactive elements
- Provide visible focus indicators

### Color Contrast
Ensure text has at least 4.5:1 contrast ratio against its background.',
  'text', 10, 3, 8
);

-- ══════════════════════════════════════════════════════════════
-- Module 3: CSS Fundamentals (4 lessons)
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (id, course_id, title, description, sort_order)
VALUES (
  'm1000000-0000-0000-0000-000000000003',
  'c1000000-0000-0000-0000-000000000001',
  'CSS Fundamentals',
  'Master selectors, the box model, and modern layout techniques.',
  2
);

-- Lesson 3.1
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000008',
  'm1000000-0000-0000-0000-000000000003',
  'Selectors, Specificity & the Cascade',
  '# Selectors, Specificity & the Cascade

## CSS Selectors

```css
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
```

## Specificity

Specificity determines which rule wins when multiple rules target the same element:

| Selector            | Specificity |
|---------------------|-------------|
| `*`                 | 0-0-0       |
| `p`                 | 0-0-1       |
| `.class`            | 0-1-0       |
| `#id`               | 1-0-0       |
| Inline style        | 1-0-0-0     |
| `!important`        | Overrides all|

## The Cascade

When specificity is equal, the last rule defined wins. Styles are applied in this order:
1. User agent (browser defaults)
2. Author stylesheets
3. Author `!important`
4. Inline styles',
  'text', 10, 0, 10
);

-- Lesson 3.2
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000009',
  'm1000000-0000-0000-0000-000000000003',
  'The Box Model & Layout',
  '# The Box Model & Layout

Every HTML element is a rectangular box with four areas:

```
┌─────────────── Margin ──────────────┐
│  ┌─────────── Border ──────────┐    │
│  │  ┌─────── Padding ──────┐   │    │
│  │  │                      │   │    │
│  │  │      Content         │   │    │
│  │  │                      │   │    │
│  │  └──────────────────────┘   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Box Sizing

```css
/* Default: width = content only */
box-sizing: content-box;

/* Better: width = content + padding + border */
box-sizing: border-box;

/* Apply globally */
*, *::before, *::after {
  box-sizing: border-box;
}
```

## Display Modes

| Display        | Behavior                              |
|----------------|---------------------------------------|
| `block`        | Full width, new line                  |
| `inline`       | Flows with text, no width/height      |
| `inline-block` | Inline but respects width/height      |
| `none`         | Hidden, removed from layout           |
| `flex`         | Flexbox container                     |
| `grid`         | Grid container                        |

## Margin Collapse

Vertical margins between adjacent block elements collapse — only the larger margin is used.',
  'text', 10, 1, 12
);

-- Lesson 3.3
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000010',
  'm1000000-0000-0000-0000-000000000003',
  'Flexbox Layout',
  '# Flexbox Layout

Flexbox is a one-dimensional layout system for arranging items in rows or columns.

## Container Properties

```css
.container {
  display: flex;
  flex-direction: row;          /* row | column */
  justify-content: center;      /* Main axis alignment */
  align-items: center;          /* Cross axis alignment */
  gap: 1rem;                    /* Space between items */
  flex-wrap: wrap;              /* Allow wrapping */
}
```

## justify-content Values

- `flex-start` — Pack items to the start
- `flex-end` — Pack items to the end
- `center` — Center items
- `space-between` — Even space, no edge space
- `space-around` — Even space, half edge space
- `space-evenly` — Equal space everywhere

## Item Properties

```css
.item {
  flex: 1;                /* Grow to fill space */
  flex-shrink: 0;         /* Don''t shrink */
  flex-basis: 200px;      /* Starting size */
  align-self: flex-end;   /* Override alignment */
  order: -1;              /* Reorder */
}
```

## Common Patterns

```css
/* Center everything */
.center { display: flex; justify-content: center; align-items: center; }

/* Navbar: logo left, links right */
.navbar { display: flex; justify-content: space-between; align-items: center; }

/* Equal-width columns */
.columns { display: flex; gap: 1rem; }
.columns > * { flex: 1; }
```',
  'text', 10, 2, 15
);

-- Lesson 3.4
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000011',
  'm1000000-0000-0000-0000-000000000003',
  'CSS Grid Layout',
  '# CSS Grid Layout

CSS Grid is a two-dimensional layout system for creating complex page layouts.

## Basic Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 equal columns */
  grid-template-rows: auto;
  gap: 1rem;
}
```

## Template Columns

```css
grid-template-columns: 200px 1fr 200px;         /* Fixed-fluid-fixed */
grid-template-columns: repeat(3, 1fr);           /* 3 equal */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive */
```

## Grid Areas

```css
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
```

## Item Placement

```css
.item {
  grid-column: 1 / 3;     /* Span columns 1-2 */
  grid-row: 1 / 2;        /* First row */
}
```

## When to Use Grid vs Flexbox

- **Grid**: Two-dimensional layouts (rows AND columns)
- **Flexbox**: One-dimensional layouts (row OR column)
- They work great together — use Grid for page layout, Flexbox for components.',
  'text', 10, 3, 15
);

-- ══════════════════════════════════════════════════════════════
-- Module 4: Responsive Design (4 lessons)
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (id, course_id, title, description, sort_order)
VALUES (
  'm1000000-0000-0000-0000-000000000004',
  'c1000000-0000-0000-0000-000000000001',
  'Responsive Design',
  'Build sites that work beautifully on every screen size.',
  3
);

-- Lesson 4.1
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000012',
  'm1000000-0000-0000-0000-000000000004',
  'Media Queries',
  '# Media Queries

Media queries let you apply CSS rules based on screen size, orientation, and other device characteristics.

## Syntax

```css
@media (min-width: 768px) {
  .container { max-width: 720px; }
}

@media (min-width: 1024px) {
  .container { max-width: 960px; }
}
```

## Common Breakpoints

| Name   | Width    | Targets              |
|--------|----------|----------------------|
| sm     | 640px    | Large phones         |
| md     | 768px    | Tablets              |
| lg     | 1024px   | Laptops              |
| xl     | 1280px   | Desktops             |
| 2xl    | 1536px   | Large screens        |

## min-width vs max-width

- `min-width`: Styles apply **above** this size (mobile-first)
- `max-width`: Styles apply **below** this size (desktop-first)

## Combining Conditions

```css
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet only */
}

@media (orientation: landscape) {
  /* Landscape mode */
}
```',
  'text', 10, 0, 8
);

-- Lesson 4.2
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000013',
  'm1000000-0000-0000-0000-000000000004',
  'Mobile-First Design Approach',
  '# Mobile-First Design Approach

Mobile-first means designing for the smallest screen first, then progressively enhancing for larger screens.

## Why Mobile-First?

1. **Performance** — Mobile users get only the CSS they need
2. **Prioritization** — Forces you to focus on essential content
3. **Progressive Enhancement** — Add complexity as screen grows

## Example

```css
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
```

## Responsive Images

```css
img {
  max-width: 100%;
  height: auto;
}
```

## Viewport Meta Tag

Always include this in your HTML `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```',
  'text', 10, 1, 8
);

-- Lesson 4.3
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000014',
  'm1000000-0000-0000-0000-000000000004',
  'CSS Custom Properties (Variables)',
  '# CSS Custom Properties (Variables)

CSS custom properties let you define reusable values that can be updated dynamically.

## Defining Variables

```css
:root {
  --primary: hsl(142, 72%, 50%);
  --background: hsl(220, 20%, 4%);
  --foreground: hsl(180, 10%, 92%);
  --radius: 0.75rem;
  --spacing: 1rem;
}
```

## Using Variables

```css
.button {
  background: var(--primary);
  color: var(--background);
  border-radius: var(--radius);
  padding: var(--spacing);
}
```

## Fallback Values

```css
color: var(--accent, #7c3aed);  /* Uses #7c3aed if --accent is undefined */
```

## Dark Mode Theming

```css
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
```

## Dynamic Updates with JavaScript

```js
document.documentElement.style.setProperty(''--primary'', ''#ff6347'');
```',
  'text', 10, 2, 8
);

-- Lesson 4.4
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000015',
  'm1000000-0000-0000-0000-000000000004',
  'Building a Responsive Landing Page',
  '# Building a Responsive Landing Page

Let''s combine everything into a complete responsive landing page.

## The Plan

We''ll build a page with:
1. A responsive navigation bar
2. A hero section with CTA buttons
3. A features grid (1 → 2 → 3 columns)
4. A footer

## HTML Structure

```html
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
```

## CSS (Mobile-First)

```css
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
```

Congratulations! You''ve built your first responsive website from scratch.',
  'text', 15, 3, 10
);

-- ══════════════════════════════════════════════════════════════
-- Module 5: Developer Tooling (4 lessons)
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (id, course_id, title, description, sort_order)
VALUES (
  'm1000000-0000-0000-0000-000000000005',
  'c1000000-0000-0000-0000-000000000001',
  'Developer Tooling',
  'Set up your development environment and learn Git.',
  4
);

-- Lesson 5.1
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000016',
  'm1000000-0000-0000-0000-000000000005',
  'Browser DevTools Essentials',
  '# Browser DevTools Essentials

Every modern browser includes powerful developer tools. Learn to use them effectively.

## Opening DevTools

- **Mac**: `Cmd + Option + I`
- **Windows/Linux**: `F12` or `Ctrl + Shift + I`

## Key Panels

### Elements Panel
- Inspect and edit HTML/CSS live
- See computed styles and box model
- Toggle element states (:hover, :focus)

### Console Panel
- Run JavaScript expressions
- View errors and warnings
- Use `console.log()`, `console.table()`, `console.dir()`

### Network Panel
- See all HTTP requests and responses
- Check loading times and file sizes
- Filter by type (XHR, JS, CSS, Images)

### Application Panel
- Inspect localStorage and sessionStorage
- View cookies
- Check service workers

## Pro Tips

```javascript
// Pretty-print objects
console.table([{ name: "React", type: "library" }, { name: "Next.js", type: "framework" }]);

// Measure execution time
console.time("fetch");
await fetch("/api/courses");
console.timeEnd("fetch"); // fetch: 142ms
```',
  'text', 10, 0, 8
);

-- Lesson 5.2
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000017',
  'm1000000-0000-0000-0000-000000000005',
  'VS Code Setup & Productivity',
  '# VS Code Setup & Productivity

VS Code is the most popular code editor for web developers. Here''s how to set it up for maximum productivity.

## Essential Extensions

1. **ESLint** — Lint JavaScript/TypeScript
2. **Prettier** — Auto-format code
3. **Tailwind CSS IntelliSense** — Tailwind autocomplete
4. **GitLens** — Enhanced Git blame and history
5. **Error Lens** — Inline error display

## Key Shortcuts (Mac)

| Shortcut              | Action                    |
|-----------------------|---------------------------|
| `Cmd + P`             | Quick file open           |
| `Cmd + Shift + P`     | Command palette           |
| `Cmd + D`             | Select next occurrence    |
| `Option + Up/Down`    | Move line up/down         |
| `Cmd + Shift + K`     | Delete line               |
| `Cmd + /`             | Toggle comment            |
| `Cmd + B`             | Toggle sidebar            |

## Workspace Settings

Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.wordWrap": "on"
}
```

## Emmet Shortcuts

Type abbreviations and press Tab:
- `div.card>h3+p` → generates nested HTML
- `ul>li*5` → 5 list items',
  'text', 10, 1, 8
);

-- Lesson 5.3
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000018',
  'm1000000-0000-0000-0000-000000000005',
  'Git Basics — Init, Commit, Push',
  '# Git Basics — Init, Commit, Push

Git is a version control system that tracks changes to your code.

## Core Concepts

- **Repository (repo)**: A project tracked by Git
- **Commit**: A snapshot of your code at a point in time
- **Branch**: A parallel version of your code
- **Remote**: A copy of the repo on a server (e.g., GitHub)

## Getting Started

```bash
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
```

## Writing Good Commit Messages

```
feat: add user registration form
fix: resolve login redirect loop
docs: update README with setup instructions
refactor: extract auth middleware
```

## .gitignore

Create a `.gitignore` file to exclude files from tracking:

```
node_modules/
dist/
.env
.DS_Store
```',
  'text', 10, 2, 10
);

-- Lesson 5.4
INSERT INTO public.lessons (id, module_id, title, content, content_type, points_reward, sort_order, estimated_minutes)
VALUES (
  'l1000000-0000-0000-0000-000000000019',
  'm1000000-0000-0000-0000-000000000005',
  'Git Branching & Collaboration',
  '# Git Branching & Collaboration

Branches let you work on features in isolation without affecting the main codebase.

## Branch Commands

```bash
# Create and switch to a new branch
git checkout -b feature/user-profile

# List branches
git branch

# Switch branches
git checkout main

# Delete a branch
git branch -d feature/user-profile
```

## Merge Workflow

```bash
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
```

## Pull Requests (PRs)

1. Push your feature branch to GitHub
2. Open a Pull Request on GitHub
3. Team reviews your code
4. Merge when approved

## Resolving Merge Conflicts

When Git can''t auto-merge, it marks conflicts:

```
<<<<<<< HEAD
const color = "blue";
=======
const color = "green";
>>>>>>> feature/theme
```

Choose the correct version, remove the markers, and commit.',
  'text', 10, 3, 10
);

COMMIT;

-- ============================================================
-- Summary:
--   Course: Web Fundamentals (beginner, 100 XP, published)
--   Module 1: How the Web Works — 3 lessons
--   Module 2: HTML Foundations — 4 lessons
--   Module 3: CSS Fundamentals — 4 lessons
--   Module 4: Responsive Design — 4 lessons
--   Module 5: Developer Tooling — 4 lessons
--   Total: 5 modules, 19 lessons
-- ============================================================
