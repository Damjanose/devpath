import { PrismaClient, ContentType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCourse, ModuleInput, LessonInput } from "./seed-helpers";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DevPath Academy database...\n");

  // ── Clean existing data (order matters for FK constraints) ──
  console.log("🗑️  Cleaning existing data...");
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✅ Database cleaned\n");

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

  // ══════════════════════════════════════════════════════════════
  // COURSE 1: Web Fundamentals
  // ══════════════════════════════════════════════════════════════
  await seedCourse(
    admin.id,
    {
      title: "Web Fundamentals",
      description:
        "Learn how the web works, build pages with HTML & CSS, and set up your developer tooling.",
      difficulty: "beginner",
      pointsReward: 100,
    },
    [
      // ── Module 1: How the Web Works ───────────────────────────
      {
        title: "How the Web Works",
        description: "Understand the journey from URL to rendered page.",
        lessons: [
          {
            title: "How Browsers Load a Web Page",
            contentType: "text" as const,
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

The critical rendering path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels.

\`\`\`
HTML → DOM
CSS  → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint
\`\`\`

Understanding this process is the foundation of web performance optimization.`,
          },
          {
            title: "How Browsers Load a Web Page — Code Example",
            contentType: "code_example" as ContentType,
            language: "javascript",
            estimatedMinutes: 5,
            content: `# Code Example: Observing the Loading Process

Use the Performance API to measure how long pages take to load:

\`\`\`javascript
// Measure page load stages using the Navigation Timing API
const timing = performance.getEntriesByType("navigation")[0];

// DNS lookup duration
const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
console.log(\`DNS Lookup: \${dnsTime.toFixed(2)}ms\`);

// TCP connection time
const tcpTime = timing.connectEnd - timing.connectStart;
console.log(\`TCP Connection: \${tcpTime.toFixed(2)}ms\`);

// Server response time (TTFB)
const ttfb = timing.responseStart - timing.requestStart;
console.log(\`Time to First Byte: \${ttfb.toFixed(2)}ms\`);

// DOM parsing time
const domParsing = timing.domInteractive - timing.responseEnd;
console.log(\`DOM Parsing: \${domParsing.toFixed(2)}ms\`);

// Full page load
const totalLoad = timing.loadEventEnd - timing.startTime;
console.log(\`Total Load: \${totalLoad.toFixed(2)}ms\`);
\`\`\`

**Expected output:**
\`\`\`
DNS Lookup: 12.30ms
TCP Connection: 45.10ms
Time to First Byte: 120.50ms
DOM Parsing: 85.20ms
Total Load: 580.40ms
\`\`\`

Run this in your browser DevTools console to see real numbers for any website.`,
          },
          {
            title: "How Browsers Load a Web Page — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "javascript",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 20,
            content: `# Challenge: Parse a URL

Write a function that takes a URL string and returns an object with its parsed components. This helps you understand the structure of URLs that browsers process.`,
            starterCode: `/**
 * Parse a URL string into its components.
 * @param {string} url - A full URL like "https://api.devpath.dev:8080/courses?page=1&limit=10#section2"
 * @returns {{ protocol: string, hostname: string, port: string, pathname: string, search: string, hash: string }}
 */
function parseURL(url) {
  // TODO: Parse the URL and return an object with:
  // - protocol (e.g., "https:")
  // - hostname (e.g., "api.devpath.dev")
  // - port (e.g., "8080" or "" if not specified)
  // - pathname (e.g., "/courses")
  // - search (e.g., "?page=1&limit=10")
  // - hash (e.g., "#section2")
}

module.exports = { parseURL };`,
            testCode: `const { parseURL } = require('./solution');

test('parses a full URL with all components', () => {
  const result = parseURL('https://api.devpath.dev:8080/courses?page=1&limit=10#section2');
  expect(result.protocol).toBe('https:');
  expect(result.hostname).toBe('api.devpath.dev');
  expect(result.port).toBe('8080');
  expect(result.pathname).toBe('/courses');
  expect(result.search).toBe('?page=1&limit=10');
  expect(result.hash).toBe('#section2');
});

test('parses a simple URL without port', () => {
  const result = parseURL('https://devpath.dev/about');
  expect(result.protocol).toBe('https:');
  expect(result.hostname).toBe('devpath.dev');
  expect(result.port).toBe('');
  expect(result.pathname).toBe('/about');
});

test('parses a URL with only hostname', () => {
  const result = parseURL('https://devpath.dev');
  expect(result.hostname).toBe('devpath.dev');
  expect(result.pathname).toBe('/');
  expect(result.search).toBe('');
  expect(result.hash).toBe('');
});

test('handles http protocol', () => {
  const result = parseURL('http://localhost:3000/api/health');
  expect(result.protocol).toBe('http:');
  expect(result.hostname).toBe('localhost');
  expect(result.port).toBe('3000');
  expect(result.pathname).toBe('/api/health');
});`,
            solutionCode: `function parseURL(url) {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
  };
}

module.exports = { parseURL };`,
            hints: [
              "JavaScript has a built-in URL class that can parse URLs for you.",
              "Try: const parsed = new URL(url); — then access parsed.hostname, parsed.pathname, etc.",
            ],
          },

          // ── Topic 2: HTTP Request/Response ──
          {
            title: "The HTTP Request/Response Cycle",
            contentType: "text" as const,
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
            title: "HTTP Request/Response — Code Example",
            contentType: "code_example" as ContentType,
            language: "javascript",
            estimatedMinutes: 5,
            content: `# Code Example: Making HTTP Requests with Fetch

\`\`\`javascript
// GET request — fetch a list of courses
async function getCourses() {
  const response = await fetch('https://api.devpath.dev/courses');

  // Check the status code
  console.log('Status:', response.status);         // 200
  console.log('OK?', response.ok);                 // true
  console.log('Content-Type:', response.headers.get('content-type'));

  // Parse response body as JSON
  const courses = await response.json();
  console.log('Courses:', courses);
}

// POST request — create a new resource
async function createCourse(title, difficulty) {
  const response = await fetch('https://api.devpath.dev/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',   // Tell server we're sending JSON
      'Authorization': 'Bearer my-token',   // Auth header
    },
    body: JSON.stringify({ title, difficulty }),  // Request body
  });

  if (!response.ok) {
    // Handle 4xx/5xx errors
    const error = await response.json();
    throw new Error(\`HTTP \${response.status}: \${error.message}\`);
  }

  const created = await response.json();
  console.log('Created:', created); // { id: "abc-123", title: "React", ... }
}
\`\`\`

**Key takeaways:**
- \`response.ok\` is \`true\` for 200–299 status codes
- Always check \`response.ok\` before parsing the body
- Use \`headers\` to set Content-Type and Authorization`,
          },
          {
            title: "HTTP Request/Response — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "javascript",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 15,
            content: `# Challenge: HTTP Status Code Classifier

Write a function that takes an HTTP status code and returns information about it.`,
            starterCode: `/**
 * Classify an HTTP status code.
 * @param {number} code - HTTP status code (100-599)
 * @returns {{ category: string, message: string }}
 *
 * Categories: "informational", "success", "redirect", "client_error", "server_error", "unknown"
 *
 * Messages for specific codes:
 * - 200: "OK"
 * - 201: "Created"
 * - 301: "Moved Permanently"
 * - 304: "Not Modified"
 * - 400: "Bad Request"
 * - 401: "Unauthorized"
 * - 403: "Forbidden"
 * - 404: "Not Found"
 * - 500: "Internal Server Error"
 * - For any other code, derive category from range and set message to "Unknown"
 */
function classifyStatus(code) {
  // TODO: implement
}

module.exports = { classifyStatus };`,
            testCode: `const { classifyStatus } = require('./solution');

test('classifies 200 as success', () => {
  const result = classifyStatus(200);
  expect(result.category).toBe('success');
  expect(result.message).toBe('OK');
});

test('classifies 201 as success/Created', () => {
  const result = classifyStatus(201);
  expect(result.category).toBe('success');
  expect(result.message).toBe('Created');
});

test('classifies 404 as client error', () => {
  const result = classifyStatus(404);
  expect(result.category).toBe('client_error');
  expect(result.message).toBe('Not Found');
});

test('classifies 500 as server error', () => {
  const result = classifyStatus(500);
  expect(result.category).toBe('server_error');
  expect(result.message).toBe('Internal Server Error');
});

test('classifies 301 as redirect', () => {
  const result = classifyStatus(301);
  expect(result.category).toBe('redirect');
  expect(result.message).toBe('Moved Permanently');
});

test('handles unknown code in valid range', () => {
  const result = classifyStatus(204);
  expect(result.category).toBe('success');
});`,
            solutionCode: `function classifyStatus(code) {
  const known = {
    200: 'OK', 201: 'Created',
    301: 'Moved Permanently', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
    500: 'Internal Server Error',
  };

  const ranges = [
    [100, 199, 'informational'],
    [200, 299, 'success'],
    [300, 399, 'redirect'],
    [400, 499, 'client_error'],
    [500, 599, 'server_error'],
  ];

  const range = ranges.find(([min, max]) => code >= min && code <= max);
  const category = range ? range[2] : 'unknown';
  const message = known[code] || 'Unknown';

  return { category, message };
}

module.exports = { classifyStatus };`,
            hints: [
              "Status codes 100-199 are informational, 200-299 success, 300-399 redirect, 400-499 client error, 500-599 server error.",
              "Create an object mapping specific codes to their names, then use Math.floor(code/100) or range checks for the category.",
            ],
          },

          // ── Topic 3: DNS, Domains & Hosting ──
          {
            title: "DNS, Domains, and Hosting Basics",
            contentType: "text" as const,
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
          {
            title: "DNS & Hosting — Code Example",
            contentType: "code_example" as ContentType,
            language: "javascript",
            estimatedMinutes: 5,
            content: `# Code Example: Performing a DNS Lookup

\`\`\`javascript
// Node.js DNS module — look up a domain's IP address
const dns = require('dns');
const { promisify } = require('util');

const resolve4 = promisify(dns.resolve4);
const resolveMx = promisify(dns.resolveMx);

async function lookupDomain(domain) {
  console.log(\`\\nLooking up: \${domain}\\n\`);

  // A record — IPv4 address
  try {
    const addresses = await resolve4(domain);
    console.log('A Records (IPv4):');
    addresses.forEach(addr => console.log(\`  → \${addr}\`));
  } catch (e) {
    console.log('No A records found');
  }

  // MX record — mail servers
  try {
    const mxRecords = await resolveMx(domain);
    console.log('MX Records (mail):');
    mxRecords
      .sort((a, b) => a.priority - b.priority)
      .forEach(mx => console.log(\`  → \${mx.exchange} (priority: \${mx.priority})\`));
  } catch (e) {
    console.log('No MX records found');
  }
}

lookupDomain('google.com');
\`\`\`

**Expected output:**
\`\`\`
Looking up: google.com

A Records (IPv4):
  → 142.250.80.46
MX Records (mail):
  → smtp.google.com (priority: 10)
\`\`\``,
          },
          {
            title: "DNS & Hosting — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "javascript",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 15,
            content: `# Challenge: Parse a Domain Name

Write a function that breaks a domain name into its components.`,
            starterCode: `/**
 * Parse a domain name into its components.
 * @param {string} domain - e.g., "api.staging.devpath.dev"
 * @returns {{ tld: string, domain: string, subdomains: string[] }}
 */
function parseDomain(domain) {
  // TODO: Split the domain and identify:
  // - tld: the last part (e.g., "dev")
  // - domain: the second-to-last part (e.g., "devpath")
  // - subdomains: everything before domain, as an array (e.g., ["api", "staging"])
}

module.exports = { parseDomain };`,
            testCode: `const { parseDomain } = require('./solution');

test('parses a domain with subdomains', () => {
  const result = parseDomain('api.staging.devpath.dev');
  expect(result.tld).toBe('dev');
  expect(result.domain).toBe('devpath');
  expect(result.subdomains).toEqual(['api', 'staging']);
});

test('parses a simple domain without subdomains', () => {
  const result = parseDomain('devpath.dev');
  expect(result.tld).toBe('dev');
  expect(result.domain).toBe('devpath');
  expect(result.subdomains).toEqual([]);
});

test('parses www subdomain', () => {
  const result = parseDomain('www.google.com');
  expect(result.tld).toBe('com');
  expect(result.domain).toBe('google');
  expect(result.subdomains).toEqual(['www']);
});

test('handles single subdomain', () => {
  const result = parseDomain('blog.example.io');
  expect(result.tld).toBe('io');
  expect(result.domain).toBe('example');
  expect(result.subdomains).toEqual(['blog']);
});`,
            solutionCode: `function parseDomain(domain) {
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const domainName = parts[parts.length - 2];
  const subdomains = parts.slice(0, parts.length - 2);
  return { tld, domain: domainName, subdomains };
}

module.exports = { parseDomain };`,
            hints: [
              "Split the domain string by '.' to get an array of parts.",
              "The TLD is always the last element, the domain is second-to-last, and everything before is subdomains.",
            ],
          },
          {
            title: "How the Web Works — Module Quiz",
            contentType: "quiz" as const,
            estimatedMinutes: 10,
            pointsReward: 30,
            content: JSON.stringify([
              {
                question: "What is the first step when a browser loads a web page?",
                options: [
                  "TCP Connection",
                  "DNS Lookup",
                  "HTTP Request",
                  "Parsing HTML"
                ],
                correctAnswer: 1,
                explanation: "The browser first performs a DNS lookup to translate the domain name into an IP address before establishing a connection."
              },
              {
                question: "What HTTP status code indicates a successful response?",
                options: ["404", "200", "301", "500"],
                correctAnswer: 1,
                explanation: "200 OK is the standard success status code. 404 means not found, 301 is redirect, and 500 is server error."
              },
              {
                question: "What does DNS stand for?",
                options: [
                  "Digital Network System",
                  "Domain Name System",
                  "Data Network Service",
                  "Dynamic Name Server"
                ],
                correctAnswer: 1,
                explanation: "DNS (Domain Name System) translates human-readable domain names into IP addresses."
              },
              {
                question: "Which DNS record type maps a domain to an IPv4 address?",
                options: ["CNAME", "MX", "A", "AAAA"],
                correctAnswer: 2,
                explanation: "An A record maps a domain to an IPv4 address. AAAA is for IPv6, CNAME is for aliases, and MX is for mail servers."
              }
            ]),
          },
        ],
      },

      // ── Module 2: HTML Foundations ───────────────────────────
      {
        title: "HTML Foundations",
        description: "Build proper HTML documents with semantic elements.",
        lessons: [
          {
            title: "Document Structure & Semantic HTML",
            contentType: "text" as const,
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
            title: "Semantic HTML — Code Example",
            contentType: "code_example" as ContentType,
            language: "html",
            estimatedMinutes: 5,
            content: `# Code Example: A Well-Structured HTML Page

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevPath Academy — Learn to Code</title>
  <meta name="description" content="A gamified learning platform for developers">
</head>
<body>
  <!-- 1. Header with navigation -->
  <header>
    <nav aria-label="Main navigation">
      <a href="/" class="logo">DevPath</a>
      <ul>
        <li><a href="/courses">Courses</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/profile">Profile</a></li>
      </ul>
    </nav>
  </header>

  <!-- 2. Main content area (only one per page) -->
  <main>
    <!-- Hero section -->
    <section aria-labelledby="hero-title">
      <h1 id="hero-title">Level Up Your Dev Skills</h1>
      <p>Earn XP and badges as you learn modern web development.</p>
      <a href="/register">Get Started</a>
    </section>

    <!-- Course listing -->
    <section aria-labelledby="courses-title">
      <h2 id="courses-title">Popular Courses</h2>
      <article>
        <h3>Web Fundamentals</h3>
        <p>Learn how the web works from the ground up.</p>
        <span>Beginner · 100 XP</span>
      </article>
      <article>
        <h3>React Development</h3>
        <p>Build modern UIs with components and hooks.</p>
        <span>Intermediate · 200 XP</span>
      </article>
    </section>
  </main>

  <!-- 3. Footer -->
  <footer>
    <p>&copy; 2026 DevPath Academy</p>
    <nav aria-label="Footer links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>
</body>
</html>
\`\`\`

**Key points:**
- \`aria-label\` distinguishes multiple \`<nav>\` elements
- \`aria-labelledby\` links sections to their headings
- Only one \`<main>\` per page
- Each \`<article>\` is self-contained and independently meaningful`,
          },
          {
            title: "Semantic HTML — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "html",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 20,
            content: `# Challenge: Fix the Non-Semantic HTML

You're given a page built entirely with \`<div>\` elements. Convert it to use proper semantic HTML elements.`,
            starterCode: `<!-- Convert these divs to proper semantic HTML elements -->
<div class="page">
  <div class="top-bar">
    <div class="site-name">DevPath</div>
    <div class="nav-links">
      <div><a href="/courses">Courses</a></div>
      <div><a href="/about">About</a></div>
    </div>
  </div>

  <div class="content">
    <div class="hero">
      <div class="big-title">Welcome to DevPath</div>
      <div class="subtitle">Learn web development interactively.</div>
    </div>

    <div class="blog-post">
      <div class="post-title">Getting Started with HTML</div>
      <div class="post-date">March 2026</div>
      <div class="post-body">
        HTML is the foundation of every web page...
      </div>
    </div>
  </div>

  <div class="bottom-bar">
    <div>&copy; 2026 DevPath</div>
  </div>
</div>`,
            testCode: `const fs = require('fs');
const html = fs.readFileSync('./solution.html', 'utf8');

test('uses <header> element', () => {
  expect(html).toMatch(/<header[\\s>]/i);
});

test('uses <nav> element', () => {
  expect(html).toMatch(/<nav[\\s>]/i);
});

test('uses <main> element', () => {
  expect(html).toMatch(/<main[\\s>]/i);
});

test('uses <article> element', () => {
  expect(html).toMatch(/<article[\\s>]/i);
});

test('uses <footer> element', () => {
  expect(html).toMatch(/<footer[\\s>]/i);
});

test('uses proper heading elements (h1, h2, etc.)', () => {
  expect(html).toMatch(/<h1[\\s>]/i);
  expect(html).toMatch(/<h2[\\s>]/i);
});`,
            solutionCode: `<header>
  <a href="/" class="site-name">DevPath</a>
  <nav>
    <ul>
      <li><a href="/courses">Courses</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <section class="hero">
    <h1>Welcome to DevPath</h1>
    <p>Learn web development interactively.</p>
  </section>

  <article class="blog-post">
    <h2>Getting Started with HTML</h2>
    <time datetime="2026-03">March 2026</time>
    <p>HTML is the foundation of every web page...</p>
  </article>
</main>

<footer>
  <p>&copy; 2026 DevPath</p>
</footer>`,
            hints: [
              "Replace the top-bar div with <header>, the nav-links div with <nav>, and use <ul>/<li> for navigation items.",
              "Use <main> for the content area, <section> for the hero, <article> for the blog post, and <footer> for the bottom bar.",
            ],
          },

          // ── Topic 2: Forms ──
          {
            title: "Forms and Input Elements",
            contentType: "text" as const,
            estimatedMinutes: 10,
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
| \`date\`     | Date picker           | Dates                 |

## Validation Attributes

- \`required\` — Field must be filled
- \`minlength\` / \`maxlength\` — Text length limits
- \`min\` / \`max\` — Numeric range
- \`pattern\` — Regex validation`,
          },
          {
            title: "Forms — Code Example",
            contentType: "code_example" as ContentType,
            language: "html",
            estimatedMinutes: 5,
            content: `# Code Example: Registration Form with Validation

\`\`\`html
<form id="register-form" novalidate>
  <div class="field">
    <label for="name">Full Name</label>
    <input type="text" id="name" name="name" required minlength="2"
           placeholder="John Doe">
    <span class="error" id="name-error"></span>
  </div>

  <div class="field">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required
           placeholder="you@example.com">
    <span class="error" id="email-error"></span>
  </div>

  <div class="field">
    <label for="password">Password</label>
    <input type="password" id="password" name="password"
           required minlength="8" pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
           placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit">
    <span class="error" id="password-error"></span>
  </div>

  <div class="field">
    <label for="difficulty">Preferred Difficulty</label>
    <select id="difficulty" name="difficulty">
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </select>
  </div>

  <div class="field">
    <label>
      <input type="checkbox" name="terms" required>
      I agree to the Terms of Service
    </label>
  </div>

  <button type="submit">Create Account</button>
</form>

<script>
document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  console.log('Form data:', data);
  // { name: "John", email: "john@example.com", password: "...", difficulty: "beginner" }
});
</script>
\`\`\`

**Key takeaway:** Use \`new FormData(form)\` and \`Object.fromEntries()\` to easily extract all form values.`,
          },
          {
            title: "Forms — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "javascript",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 20,
            content: `# Challenge: Form Validator

Write a function that validates form data according to specified rules.`,
            starterCode: `/**
 * Validate a form data object against rules.
 * @param {Object} data - Form field values, e.g., { email: "test@test.com", password: "abc" }
 * @param {Object} rules - Validation rules per field, e.g., {
 *   email: { required: true, pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ },
 *   password: { required: true, minLength: 8 }
 * }
 * @returns {{ valid: boolean, errors: Object }}
 *   errors is an object mapping field names to error message arrays
 */
function validateForm(data, rules) {
  // TODO: Check each field against its rules
  // Return { valid: true/false, errors: { fieldName: ["error message"] } }
}

module.exports = { validateForm };`,
            testCode: `const { validateForm } = require('./solution');

test('returns valid for correct data', () => {
  const result = validateForm(
    { email: 'user@test.com', name: 'John' },
    { email: { required: true }, name: { required: true } }
  );
  expect(result.valid).toBe(true);
  expect(Object.keys(result.errors)).toHaveLength(0);
});

test('catches missing required fields', () => {
  const result = validateForm(
    { email: '' },
    { email: { required: true } }
  );
  expect(result.valid).toBe(false);
  expect(result.errors.email).toBeDefined();
  expect(result.errors.email.length).toBeGreaterThan(0);
});

test('catches minLength violations', () => {
  const result = validateForm(
    { password: 'abc' },
    { password: { required: true, minLength: 8 } }
  );
  expect(result.valid).toBe(false);
  expect(result.errors.password).toBeDefined();
});

test('catches pattern violations', () => {
  const result = validateForm(
    { email: 'not-an-email' },
    { email: { required: true, pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ } }
  );
  expect(result.valid).toBe(false);
  expect(result.errors.email).toBeDefined();
});

test('returns multiple errors per field', () => {
  const result = validateForm(
    { password: '' },
    { password: { required: true, minLength: 8 } }
  );
  expect(result.valid).toBe(false);
  expect(result.errors.password.length).toBeGreaterThanOrEqual(1);
});`,
            solutionCode: `function validateForm(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors = [];

    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(field + ' is required');
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      fieldErrors.push(field + ' must be at least ' + fieldRules.minLength + ' characters');
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      fieldErrors.push(field + ' format is invalid');
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateForm };`,
            hints: [
              "Loop over each field in the rules object using Object.entries().",
              "For each field, check required (empty string or undefined), minLength (value.length), and pattern (regex.test(value)).",
            ],
          },
          {
            title: "HTML Foundations — Module Quiz",
            contentType: "quiz" as const,
            estimatedMinutes: 10,
            pointsReward: 30,
            content: JSON.stringify([
              {
                question: "Which HTML element represents the main content of a page?",
                options: ["<section>", "<main>", "<article>", "<div>"],
                correctAnswer: 1,
                explanation: "The <main> element contains the primary content of the page. There should be only one <main> per page."
              },
              {
                question: "What is the purpose of semantic HTML?",
                options: [
                  "To make websites load faster",
                  "To improve accessibility and SEO",
                  "To reduce file size",
                  "To add styling to elements"
                ],
                correctAnswer: 1,
                explanation: "Semantic HTML improves accessibility for screen readers and helps search engines understand page structure, making content more discoverable."
              },
              {
                question: "Which attribute makes a form input required?",
                options: [
                  "validate='true'",
                  "required='required'",
                  "required",
                  "mandatory"
                ],
                correctAnswer: 2,
                explanation: "The 'required' attribute (boolean attribute) makes an input field mandatory before form submission."
              },
              {
                question: "What is the correct structure for an HTML5 document?",
                options: [
                  "<html><body></body></html>",
                  "<!DOCTYPE html><html><head></head><body></body></html>",
                  "<html><head></head></html>",
                  "<body><html></html></body>"
                ],
                correctAnswer: 1,
                explanation: "An HTML5 document starts with <!DOCTYPE html>, followed by <html>, containing <head> and <body> elements."
              }
            ]),
          },
        ],
      },

      // ── Module 3: CSS Fundamentals ──────────────────────────
      {
        title: "CSS Fundamentals",
        description: "Master selectors, the box model, and modern layout techniques.",
        lessons: [
          {
            title: "Selectors, Specificity & the Cascade",
            contentType: "text" as const,
            estimatedMinutes: 10,
            content: `# Selectors, Specificity & the Cascade

## CSS Selectors

\`\`\`css
/* Element */      p { color: white; }
/* Class */        .card { border: 1px solid gray; }
/* ID */           #hero { padding: 2rem; }
/* Attribute */    input[type="email"] { border-color: blue; }
/* Pseudo-class */ a:hover { color: green; }
/* Combinators */  .card > h3 { }  /* Direct child */
                   .card h3 { }    /* Descendant */
\`\`\`

## Specificity

| Selector       | Specificity |
|----------------|-------------|
| \`*\`            | 0-0-0       |
| \`p\`            | 0-0-1       |
| \`.class\`       | 0-1-0       |
| \`#id\`          | 1-0-0       |
| Inline style   | 1-0-0-0     |

## The Cascade

When specificity is equal, the last rule wins. Order:
1. User agent (browser defaults)
2. Author stylesheets
3. Author \`!important\`
4. Inline styles`,
          },
          {
            title: "CSS Selectors — Code Example",
            contentType: "code_example" as ContentType,
            language: "css",
            estimatedMinutes: 5,
            content: `# Code Example: Common CSS Selector Patterns

\`\`\`css
/* Reset box-sizing globally */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Style all cards */
.card {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

/* Style the first card differently */
.card:first-child {
  border-left: 4px solid #22c55e;
}

/* Style links inside cards only */
.card a {
  color: #3b82f6;
  text-decoration: none;
}

.card a:hover {
  text-decoration: underline;
}

/* Style even rows in a table */
tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.05);
}

/* Style required inputs that are invalid */
input:required:invalid {
  border-color: #ef4444;
}

/* Target elements by attribute */
a[href^="https://"] {      /* Starts with https */
  padding-right: 1.2em;
}

a[href$=".pdf"] {           /* Ends with .pdf */
  color: #f59e0b;
}
\`\`\`

**Specificity tip:** Prefer classes (\`.card\`) over IDs (\`#card\`) — classes are reusable and have lower specificity, making overrides easier.`,
          },
          {
            title: "CSS Selectors — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "javascript",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 15,
            content: `# Challenge: CSS Specificity Calculator

Write a function that calculates the specificity of a simple CSS selector string.`,
            starterCode: `/**
 * Calculate the specificity of a CSS selector.
 * @param {string} selector - e.g., "#nav .item a:hover"
 * @returns {[number, number, number]} - [ids, classes, elements]
 *
 * Rules:
 * - IDs (#something) count toward index 0
 * - Classes (.something), pseudo-classes (:hover, :focus, etc.) count toward index 1
 * - Elements (div, p, a, etc.) and pseudo-elements (::before) count toward index 2
 * - Universal selector (*) adds nothing
 * - Combinators (>, +, ~, space) add nothing
 */
function calculateSpecificity(selector) {
  // TODO: implement
}

module.exports = { calculateSpecificity };`,
            testCode: `const { calculateSpecificity } = require('./solution');

test('single element', () => {
  expect(calculateSpecificity('p')).toEqual([0, 0, 1]);
});

test('single class', () => {
  expect(calculateSpecificity('.card')).toEqual([0, 1, 0]);
});

test('single id', () => {
  expect(calculateSpecificity('#hero')).toEqual([1, 0, 0]);
});

test('combined selector', () => {
  expect(calculateSpecificity('#nav .item a')).toEqual([1, 1, 1]);
});

test('pseudo-class counts as class', () => {
  expect(calculateSpecificity('a:hover')).toEqual([0, 1, 1]);
});

test('complex selector', () => {
  expect(calculateSpecificity('#main .card > h3.title')).toEqual([1, 2, 1]);
});`,
            solutionCode: `function calculateSpecificity(selector) {
  let ids = 0, classes = 0, elements = 0;

  // Remove combinators and split into tokens
  const tokens = selector
    .replace(/[>+~]/g, ' ')
    .trim()
    .split(/\\s+/);

  for (const token of tokens) {
    // Split token into parts: #id, .class, :pseudo, ::pseudo, element
    const parts = token.split(/(?=[#.:])/).filter(Boolean);

    for (const part of parts) {
      if (part === '*') continue;
      if (part.startsWith('#')) ids++;
      else if (part.startsWith('.') || (part.startsWith(':') && !part.startsWith('::'))) classes++;
      else if (part.startsWith('::')) elements++;
      else elements++;
    }
  }

  return [ids, classes, elements];
}

module.exports = { calculateSpecificity };`,
            hints: [
              "Split the selector by spaces (after removing combinators like >, +, ~).",
              "For each token, split by #, . and : prefixes. Count # as ID, . and : as class, and plain strings as elements.",
            ],
          },

          // ── Topic 2: Flexbox ──
          {
            title: "Flexbox Layout",
            contentType: "text" as const,
            estimatedMinutes: 10,
            content: `# Flexbox Layout

Flexbox is a one-dimensional layout system for arranging items in rows or columns.

## Container Properties

\`\`\`css
.container {
  display: flex;
  flex-direction: row;        /* row | column */
  justify-content: center;    /* Main axis */
  align-items: center;        /* Cross axis */
  gap: 1rem;
  flex-wrap: wrap;
}
\`\`\`

## justify-content Values

- \`flex-start\` — Pack to start
- \`center\` — Center items
- \`space-between\` — Even space, no edges
- \`space-evenly\` — Equal space everywhere

## Item Properties

\`\`\`css
.item {
  flex: 1;              /* Grow to fill */
  flex-shrink: 0;       /* Don't shrink */
  flex-basis: 200px;    /* Starting size */
  align-self: flex-end; /* Override alignment */
}
\`\`\``,
          },
          {
            title: "Flexbox — Code Example",
            contentType: "code_example" as ContentType,
            language: "css",
            estimatedMinutes: 5,
            content: `# Code Example: Common Flexbox Patterns

\`\`\`css
/* 1. Center anything vertically & horizontally */
.center-all {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* 2. Navbar: logo left, links right */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

/* 3. Equal-width columns */
.columns {
  display: flex;
  gap: 1.5rem;
}
.columns > * {
  flex: 1; /* Each child takes equal space */
}

/* 4. Responsive card grid that wraps */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card-grid > .card {
  flex: 1 1 300px; /* Min 300px, grows to fill, wraps when needed */
}

/* 5. Footer pushed to bottom of page */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1; /* Main content grows, pushing footer down */
}
\`\`\``,
          },
          {
            title: "Flexbox — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "css",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 20,
            content: `# Challenge: Build a Flexbox Navbar and Card Grid

Write CSS that creates a responsive navbar (logo left, links right) and a card grid that wraps on small screens.`,
            starterCode: `/* Given HTML structure:
<header class="navbar">
  <a class="logo" href="/">DevPath</a>
  <nav class="nav-links">
    <a href="/courses">Courses</a>
    <a href="/about">About</a>
    <a href="/login">Login</a>
  </nav>
</header>
<main class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</main>
*/

/* TODO: Style the navbar with flexbox */
.navbar {
  /* Logo on the left, links on the right, vertically centered */
}

.nav-links {
  /* Space links evenly with a gap */
}

/* TODO: Style the card grid with flexbox */
.card-grid {
  /* Cards should wrap and have a minimum width of 250px */
}

.card {
  /* Cards should grow to fill available space */
}`,
            testCode: `const fs = require('fs');
const css = fs.readFileSync('./solution.css', 'utf8');

test('navbar uses display: flex', () => {
  expect(css).toMatch(/\\.navbar\\s*\\{[^}]*display\\s*:\\s*flex/);
});

test('navbar uses justify-content: space-between', () => {
  expect(css).toMatch(/\\.navbar\\s*\\{[^}]*justify-content\\s*:\\s*space-between/);
});

test('nav-links uses display: flex', () => {
  expect(css).toMatch(/\\.nav-links\\s*\\{[^}]*display\\s*:\\s*flex/);
});

test('nav-links has a gap', () => {
  expect(css).toMatch(/\\.nav-links\\s*\\{[^}]*gap/);
});

test('card-grid uses flex-wrap', () => {
  expect(css).toMatch(/\\.card-grid\\s*\\{[^}]*flex-wrap\\s*:\\s*wrap/);
});

test('card has flex property', () => {
  expect(css).toMatch(/\\.card\\s*\\{[^}]*flex/);
});`,
            solutionCode: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 2rem;
}

.card {
  flex: 1 1 250px;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: #1a1a2e;
}`,
            hints: [
              "Use display: flex and justify-content: space-between on .navbar to push logo left and links right.",
              "For .card-grid, use flex-wrap: wrap. For .card, use flex: 1 1 250px so cards are at least 250px wide and wrap.",
            ],
          },
          {
            title: "CSS Fundamentals — Module Quiz",
            contentType: "quiz" as const,
            estimatedMinutes: 10,
            pointsReward: 30,
            content: JSON.stringify([
              {
                question: "Which CSS selector has the highest specificity?",
                options: [
                  "Element selector (p)",
                  "Class selector (.card)",
                  "ID selector (#hero)",
                  "Universal selector (*)"
                ],
                correctAnswer: 2,
                explanation: "ID selectors have the highest specificity (1-0-0), followed by class selectors (0-1-0), then element selectors (0-0-1)."
              },
              {
                question: "What does box-sizing: border-box do?",
                options: [
                  "Adds borders to all elements",
                  "Includes padding and border in the element's total width",
                  "Removes borders from elements",
                  "Makes borders thicker"
                ],
                correctAnswer: 1,
                explanation: "box-sizing: border-box includes padding and border in the element's total width and height, making sizing more predictable."
              },
              {
                question: "Which Flexbox property makes items wrap to the next line?",
                options: [
                  "flex-direction: wrap",
                  "flex-wrap: wrap",
                  "flex-flow: wrap",
                  "wrap: true"
                ],
                correctAnswer: 1,
                explanation: "flex-wrap: wrap allows flex items to wrap to multiple lines when they don't fit on one line."
              },
              {
                question: "What is the default value of the position property?",
                options: ["absolute", "relative", "static", "fixed"],
                correctAnswer: 2,
                explanation: "The default position value is 'static', which means elements follow the normal document flow."
              }
            ]),
          },
        ],
      },

      // ── Module 4: Responsive Design ─────────────────────────
      {
        title: "Responsive Design",
        description: "Build sites that work beautifully on every screen size.",
        lessons: [
          {
            title: "Media Queries & Mobile-First",
            contentType: "text" as const,
            estimatedMinutes: 8,
            content: `# Media Queries & Mobile-First

Media queries apply CSS rules based on screen size.

## Syntax

\`\`\`css
@media (min-width: 768px) {
  .container { max-width: 720px; }
}
\`\`\`

## Common Breakpoints

| Name | Width  | Targets       |
|------|--------|---------------|
| sm   | 640px  | Large phones  |
| md   | 768px  | Tablets       |
| lg   | 1024px | Laptops       |
| xl   | 1280px | Desktops      |

## Mobile-First

Design for smallest screen first, then add complexity:

\`\`\`css
/* Base: single column */
.grid { display: flex; flex-direction: column; gap: 1rem; }

/* Tablet: two columns */
@media (min-width: 768px) {
  .grid { flex-direction: row; flex-wrap: wrap; }
  .grid > * { flex: 1 1 calc(50% - 0.5rem); }
}

/* Desktop: three columns */
@media (min-width: 1024px) {
  .grid > * { flex: 1 1 calc(33.333% - 0.667rem); }
}
\`\`\``,
          },
          {
            title: "Responsive Design — Code Example",
            contentType: "code_example" as ContentType,
            language: "css",
            estimatedMinutes: 5,
            content: `# Code Example: Responsive Landing Page CSS

\`\`\`css
/* CSS Custom Properties for theming */
:root {
  --primary: #22c55e;
  --bg: #0a0a0f;
  --text: #e0e0e0;
  --radius: 0.75rem;
}

/* Mobile-first base styles */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
}

.hero h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Features grid — starts as single column */
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 2rem 1rem;
}

.feature-card {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: var(--radius);
}

/* Tablet — 2 columns */
@media (min-width: 768px) {
  .hero h1 { font-size: 2.5rem; }
  .features {
    grid-template-columns: repeat(2, 1fr);
    padding: 3rem 2rem;
  }
}

/* Desktop — 3 columns */
@media (min-width: 1024px) {
  .hero h1 { font-size: 3rem; }
  .features {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}
\`\`\`

**Key pattern:** Start with mobile styles, then progressively enhance with \`min-width\` media queries.`,
          },
          {
            title: "Responsive Design — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "css",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 20,
            content: `# Challenge: Make a Page Responsive

Write mobile-first CSS that turns a stacked layout into a sidebar layout on desktop.`,
            starterCode: `/* Given HTML:
<div class="layout">
  <aside class="sidebar">Sidebar</aside>
  <main class="content">Main Content</main>
</div>
*/

/* TODO: Mobile-first responsive layout
   Mobile: sidebar and content are stacked vertically (full width)
   Tablet (768px+): sidebar is 250px wide, content fills remaining space, displayed side by side
   Desktop (1024px+): max-width of 1200px, centered on page
*/

.layout {
  /* Mobile: stack vertically */
}

.sidebar {
  /* Mobile: full width */
}

.content {
  /* Mobile: full width */
}

/* TODO: Add media queries for tablet and desktop */`,
            testCode: `const fs = require('fs');
const css = fs.readFileSync('./solution.css', 'utf8');

test('layout starts with flex column or block', () => {
  expect(css).toMatch(/\\.layout\\s*\\{[^}]*(display\\s*:\\s*flex|display\\s*:\\s*block|flex-direction\\s*:\\s*column)/);
});

test('has tablet breakpoint at 768px', () => {
  expect(css).toMatch(/@media\\s*\\(\\s*min-width\\s*:\\s*768px\\s*\\)/);
});

test('has desktop breakpoint at 1024px', () => {
  expect(css).toMatch(/@media\\s*\\(\\s*min-width\\s*:\\s*1024px\\s*\\)/);
});

test('sidebar has fixed width at tablet', () => {
  expect(css).toMatch(/sidebar[^}]*(width|flex-basis|flex)\\s*:/);
});

test('desktop has max-width', () => {
  expect(css).toMatch(/max-width/);
});`,
            solutionCode: `.layout {
  display: flex;
  flex-direction: column;
}

.sidebar {
  padding: 1rem;
  background: #1a1a2e;
}

.content {
  padding: 1rem;
  flex: 1;
}

@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
  .sidebar {
    width: 250px;
    flex-shrink: 0;
  }
}

@media (min-width: 1024px) {
  .layout {
    max-width: 1200px;
    margin: 0 auto;
  }
}`,
            hints: [
              "Start with display: flex and flex-direction: column on .layout. At 768px, switch to flex-direction: row.",
              "Give .sidebar a fixed width (250px) and .content flex: 1 at the tablet breakpoint.",
            ],
          },
          {
            title: "Responsive Design — Module Quiz",
            contentType: "quiz" as const,
            estimatedMinutes: 10,
            pointsReward: 30,
            content: JSON.stringify([
              {
                question: "What does mobile-first design mean?",
                options: [
                  "Designing only for mobile devices",
                  "Starting with mobile styles and adding complexity for larger screens",
                  "Making mobile versions after desktop",
                  "Using only touch-friendly interfaces"
                ],
                correctAnswer: 1,
                explanation: "Mobile-first means starting with base styles for small screens and progressively enhancing for larger screens using min-width media queries."
              },
              {
                question: "Which media query targets screens 768px and wider?",
                options: [
                  "@media (width: 768px)",
                  "@media (min-width: 768px)",
                  "@media (max-width: 768px)",
                  "@media screen-768"
                ],
                correctAnswer: 1,
                explanation: "@media (min-width: 768px) applies styles to screens 768px and wider, which is the mobile-first approach."
              },
              {
                question: "What is the viewport meta tag used for?",
                options: [
                  "Setting page background color",
                  "Controlling zoom and scaling on mobile devices",
                  "Loading external stylesheets",
                  "Adding responsive images"
                ],
                correctAnswer: 1,
                explanation: "The viewport meta tag controls how a page is displayed on mobile devices, typically set to width=device-width for responsive design."
              },
              {
                question: "At what breakpoint does 'md' typically start in common CSS frameworks?",
                options: ["640px", "768px", "1024px", "1280px"],
                correctAnswer: 1,
                explanation: "The 'md' (medium/tablet) breakpoint typically starts at 768px in frameworks like Tailwind CSS."
              }
            ]),
          },
        ],
      },

      // ── Module 5: Developer Tooling ─────────────────────────
      {
        title: "Developer Tooling",
        description: "Set up your development environment and learn essential tools.",
        lessons: [
          {
            title: "Browser DevTools & VS Code",
            contentType: "text" as const,
            estimatedMinutes: 8,
            content: `# Browser DevTools & VS Code

## Browser DevTools

Open: \`Cmd/Ctrl + Option/Shift + I\`

### Key Panels
- **Elements** — Inspect/edit HTML & CSS live
- **Console** — Run JS, view errors
- **Network** — See HTTP requests, loading times
- **Application** — localStorage, cookies, service workers

## VS Code Essentials

### Must-Have Extensions
1. ESLint, 2. Prettier, 3. Tailwind CSS IntelliSense, 4. GitLens, 5. Error Lens

### Key Shortcuts (Mac)

| Shortcut          | Action              |
|-------------------|---------------------|
| \`Cmd + P\`         | Quick file open     |
| \`Cmd + Shift + P\` | Command palette     |
| \`Cmd + D\`         | Select next match   |
| \`Cmd + /\`         | Toggle comment      |
| \`Ctrl + \\\`\`       | Toggle terminal     |`,
          },
          {
            title: "DevTools — Code Example",
            contentType: "code_example" as ContentType,
            language: "javascript",
            estimatedMinutes: 5,
            content: `# Code Example: Console Methods for Debugging

\`\`\`javascript
// console.log — basic output
console.log('Hello DevPath');

// console.table — pretty-print arrays of objects
const courses = [
  { title: 'React', difficulty: 'intermediate', xp: 200 },
  { title: 'Node.js', difficulty: 'intermediate', xp: 200 },
  { title: 'SQL', difficulty: 'beginner', xp: 150 },
];
console.table(courses);
// Outputs a formatted table in the console

// console.group — grouped output
console.group('User Info');
console.log('Name: Developer');
console.log('Level: 5');
console.log('XP: 2,500');
console.groupEnd();

// console.time — measure execution time
console.time('fetch-courses');
const response = await fetch('/api/courses');
const data = await response.json();
console.timeEnd('fetch-courses');
// Output: fetch-courses: 142.3ms

// console.assert — conditional logging
const level = 3;
console.assert(level >= 5, 'User level is below 5!');
// Only logs if condition is FALSE

// console.dir — inspect objects deeply
console.dir(document.body, { depth: 2 });
\`\`\``,
          },
          {
            title: "DevTools — Coding Challenge",
            contentType: "coding_challenge" as ContentType,
            language: "javascript",
            estimatedMinutes: 10,
            pointsReward: 10,
            bonusPoints: 15,
            content: `# Challenge: Build a Simple Logger

Create a logger utility that supports different log levels and can format output.`,
            starterCode: `/**
 * Create a logger with levels: debug, info, warn, error
 * @param {{ level: string }} options - minimum log level
 * @returns {Object} Logger with debug, info, warn, error methods
 *
 * Level priority: debug < info < warn < error
 * If level is "warn", only warn and error messages should be output.
 * Each method returns the formatted string (for testing purposes).
 *
 * Format: "[LEVEL] message"
 * Example: "[INFO] Server started"
 */
function createLogger(options = { level: 'debug' }) {
  // TODO: implement
}

module.exports = { createLogger };`,
            testCode: `const { createLogger } = require('./solution');

test('logs at all levels when level is debug', () => {
  const logger = createLogger({ level: 'debug' });
  expect(logger.debug('test')).toBe('[DEBUG] test');
  expect(logger.info('test')).toBe('[INFO] test');
  expect(logger.warn('test')).toBe('[WARN] test');
  expect(logger.error('test')).toBe('[ERROR] test');
});

test('filters out debug when level is info', () => {
  const logger = createLogger({ level: 'info' });
  expect(logger.debug('test')).toBeNull();
  expect(logger.info('test')).toBe('[INFO] test');
});

test('only shows warn and error when level is warn', () => {
  const logger = createLogger({ level: 'warn' });
  expect(logger.debug('test')).toBeNull();
  expect(logger.info('test')).toBeNull();
  expect(logger.warn('test')).toBe('[WARN] test');
  expect(logger.error('test')).toBe('[ERROR] test');
});

test('only shows error when level is error', () => {
  const logger = createLogger({ level: 'error' });
  expect(logger.warn('test')).toBeNull();
  expect(logger.error('test')).toBe('[ERROR] test');
});`,
            solutionCode: `function createLogger(options = { level: 'debug' }) {
  const levels = ['debug', 'info', 'warn', 'error'];
  const minLevel = levels.indexOf(options.level);

  function log(level, message) {
    if (levels.indexOf(level) < minLevel) return null;
    return \`[\${level.toUpperCase()}] \${message}\`;
  }

  return {
    debug: (msg) => log('debug', msg),
    info: (msg) => log('info', msg),
    warn: (msg) => log('warn', msg),
    error: (msg) => log('error', msg),
  };
}

module.exports = { createLogger };`,
            hints: [
              "Define an array of levels in order: ['debug', 'info', 'warn', 'error']. Compare indices to determine if a message should be logged.",
              "Use indexOf() to find the numeric priority of both the minimum level and the message level.",
            ],
          },
          {
            title: "Developer Tooling — Module Quiz",
            contentType: "quiz" as const,
            estimatedMinutes: 10,
            pointsReward: 30,
            content: JSON.stringify([
              {
                question: "What keyboard shortcut opens Browser DevTools on Mac?",
                options: [
                  "Cmd + D",
                  "Cmd + Shift + I",
                  "Cmd + Option + I",
                  "Cmd + K"
                ],
                correctAnswer: 2,
                explanation: "Cmd + Option + I (or Cmd + Shift + I) opens the Browser DevTools on Mac. On Windows/Linux, it's Ctrl + Shift + I."
              },
              {
                question: "Which DevTools panel shows network requests and loading times?",
                options: ["Elements", "Console", "Network", "Application"],
                correctAnswer: 2,
                explanation: "The Network panel shows all HTTP requests, response times, status codes, and loading performance."
              },
              {
                question: "What does console.table() do?",
                options: [
                  "Creates HTML tables",
                  "Displays arrays of objects as formatted tables",
                  "Calculates table data",
                  "Exports data to Excel"
                ],
                correctAnswer: 1,
                explanation: "console.table() displays arrays of objects in a nicely formatted table in the browser console, making data easier to read."
              },
              {
                question: "Which VS Code shortcut opens the command palette on Mac?",
                options: [
                  "Cmd + P",
                  "Cmd + Shift + P",
                  "Cmd + K",
                  "Cmd + /"
                ],
                correctAnswer: 1,
                explanation: "Cmd + Shift + P opens the VS Code command palette, giving access to all commands. Cmd + P is for quick file open."
              }
            ]),
          },
        ],
      },
    ]
  );

  // ══════════════════════════════════════════════════════════════
  // COURSE 2: HTML & CSS Deep Dive
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "HTML & CSS Deep Dive",
    description: "Go beyond the basics — responsive design, Flexbox, Grid, animations, and accessibility.",
    difficulty: "beginner",
    pointsReward: 120,
  }, buildCourseModules("HTML & CSS Deep Dive", "html", [
    { module: "Advanced Selectors & Specificity", topics: ["Combinators & Pseudo-selectors", "Specificity Wars", "The Cascade in Practice"] },
    { module: "The Box Model in Depth", topics: ["Margin Collapsing", "Box Sizing Strategies", "Overflow & Display Types"] },
    { module: "CSS Grid Mastery", topics: ["Grid Template Areas", "Auto-fit & Minmax", "Complex Grid Layouts"] },
    { module: "Transitions & Animations", topics: ["CSS Transitions", "Keyframe Animations", "Performant Animations & Accessibility"] },
    { module: "CSS Architecture & Methodology", topics: ["BEM Naming Convention", "CSS Custom Properties", "Utility-First CSS with Tailwind"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 3: JavaScript Essentials
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "JavaScript Essentials",
    description: "Master JavaScript from variables to async programming. Build interactive web applications.",
    difficulty: "beginner",
    pointsReward: 150,
  }, buildCourseModules("JavaScript Essentials", "javascript", [
    { module: "Variables, Types & Operators", topics: ["Variables & Primitive Types", "Operators & Coercion", "Template Literals & String Methods"] },
    { module: "Control Flow & Functions", topics: ["Conditionals & Loops", "Functions & Arrow Functions", "Closures & Scope"] },
    { module: "Objects & Arrays", topics: ["Object Literals & Destructuring", "Array Methods (map, filter, reduce)", "Spread, Rest & Shallow Copies"] },
    { module: "DOM Manipulation", topics: ["Querying & Traversing the DOM", "Creating & Modifying Elements", "Event Listeners & Delegation"] },
    { module: "Asynchronous JavaScript", topics: ["The Event Loop & Callbacks", "Promises", "Async/Await & Fetch API"] },
    { module: "Error Handling & Debugging", topics: ["Try/Catch & Custom Errors", "DevTools Debugging", "Error Boundaries & Patterns"] },
    { module: "ES Modules & Modern Patterns", topics: ["import/export & Dynamic Imports", "Optional Chaining & Nullish Coalescing", "Iterators & Generators"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 4: TypeScript
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "TypeScript",
    description: "Add type safety to JavaScript — from basic annotations to advanced generic patterns.",
    difficulty: "intermediate",
    pointsReward: 200,
  }, buildCourseModules("TypeScript", "typescript", [
    { module: "Why TypeScript & Setup", topics: ["TypeScript vs JavaScript", "tsconfig.json Deep Dive", "TypeScript in Vite & Node"] },
    { module: "Basic Types & Inference", topics: ["Primitives, Arrays & Tuples", "any vs unknown vs never", "Type Inference In Practice"] },
    { module: "Interfaces, Type Aliases & Unions", topics: ["Interfaces & Extending", "Union & Intersection Types", "Discriminated Unions"] },
    { module: "Functions & Generics", topics: ["Typed Function Signatures", "Generic Functions & Constraints", "Function Overloads"] },
    { module: "Advanced Types", topics: ["Mapped Types", "Conditional Types", "Utility Types (Partial, Pick, Omit, Record)"] },
    { module: "TypeScript in Practice", topics: ["Typing React Components", "Typing Express Handlers", "Migrating a JS Project to TS"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 5: React
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "React",
    description: "Build modern UIs — components, hooks, state management, routing, and data fetching.",
    difficulty: "intermediate",
    pointsReward: 250,
  }, buildCourseModules("React", "typescript", [
    { module: "React Fundamentals", topics: ["JSX & Components", "Props & Children", "Rendering Lists & Conditional Rendering"] },
    { module: "State & Events", topics: ["useState & Event Handlers", "Controlled Inputs", "Lifting State Up"] },
    { module: "Effects & Lifecycle", topics: ["useEffect & Cleanup", "Data Fetching Patterns", "Dependency Array Pitfalls"] },
    { module: "Advanced Hooks", topics: ["useReducer & useContext", "useRef & useMemo & useCallback", "Building Custom Hooks"] },
    { module: "Routing", topics: ["React Router v6 Setup", "Nested Routes & Outlets", "Protected Routes & Loaders"] },
    { module: "Forms & Validation", topics: ["React Hook Form", "Schema Validation with Zod", "Field Arrays & Error Display"] },
    { module: "State Management", topics: ["Context API Patterns", "Zustand for Global State", "TanStack Query for Server State"] },
    { module: "Component Patterns & Performance", topics: ["Composition & Compound Components", "React.memo & Code Splitting", "Suspense & Error Boundaries"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 6: Next.js
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Next.js",
    description: "Full-stack React framework — SSR, SSG, API routes, and the App Router.",
    difficulty: "intermediate",
    pointsReward: 250,
  }, buildCourseModules("Next.js", "typescript", [
    { module: "Next.js Fundamentals", topics: ["Project Structure & File-Based Routing", "Layouts, Loading & Error Boundaries", "Link, Navigation & Metadata"] },
    { module: "Rendering Strategies", topics: ["Server Components vs Client Components", "SSR, SSG & ISR", "Streaming & Suspense"] },
    { module: "Data Fetching", topics: ["Fetch in Server Components", "Caching & Revalidation", "generateStaticParams & Dynamic Routes"] },
    { module: "API Routes & Server Actions", topics: ["Route Handlers", "Server Actions & Mutations", "Form Handling with Server Actions"] },
    { module: "Styling & Assets", topics: ["Tailwind CSS with Next.js", "next/image Optimization", "next/font & Web Fonts"] },
    { module: "Authentication & Middleware", topics: ["Auth.js / NextAuth.js Setup", "Middleware for Route Protection", "Role-Based Access Control"] },
    { module: "Deployment & Optimization", topics: ["Deploying to Vercel", "Bundle Analysis & Performance", "SEO with Metadata API"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 7: Node.js
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Node.js",
    description: "Server-side JavaScript — Express, middleware, databases, authentication, and deployment.",
    difficulty: "intermediate",
    pointsReward: 250,
  }, buildCourseModules("Node.js", "typescript", [
    { module: "Node.js Fundamentals", topics: ["The Node Runtime & Event Loop", "Modules (CommonJS & ESM)", "File System & Path Operations"] },
    { module: "Express.js Basics", topics: ["Setting Up Express", "Routing & Route Parameters", "Middleware Pipeline"] },
    { module: "REST API Design", topics: ["Resource Design & Status Codes", "Pagination, Filtering & Sorting", "API Versioning"] },
    { module: "Database Integration", topics: ["Prisma ORM Setup", "Migrations & Seeding", "Relations & Transactions"] },
    { module: "Authentication & Authorization", topics: ["Password Hashing with bcrypt", "JWT Authentication", "Role-Based Access Control"] },
    { module: "Validation & Error Handling", topics: ["Input Validation with Zod", "Centralized Error Handler", "Structured Logging"] },
    { module: "Testing & Deployment", topics: ["Unit Testing with Vitest", "Integration Tests with Supertest", "Docker & Deployment"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 8: SQL & Relational Databases
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "SQL & Relational Databases",
    description: "Write SQL from scratch — queries, joins, schema design, and performance tuning.",
    difficulty: "beginner",
    pointsReward: 150,
  }, buildCourseModules("SQL & Relational Databases", "sql", [
    { module: "Introduction to Databases", topics: ["What is a Relational Database", "Tables, Rows & Columns", "PostgreSQL Setup & psql"] },
    { module: "Basic Queries", topics: ["SELECT, WHERE & ORDER BY", "LIMIT, DISTINCT & Aliases", "Arithmetic & String Functions"] },
    { module: "Filtering & Aggregation", topics: ["AND, OR, NOT, IN, BETWEEN, LIKE", "COUNT, SUM, AVG, MIN, MAX", "GROUP BY & HAVING"] },
    { module: "Joins & Relationships", topics: ["INNER JOIN & LEFT JOIN", "RIGHT JOIN, FULL JOIN & Self Joins", "Many-to-Many with Junction Tables"] },
    { module: "Schema Design & DDL", topics: ["CREATE TABLE & Data Types", "Primary Keys, Foreign Keys & Constraints", "Normalization (1NF–3NF)"] },
    { module: "Indexes, Views & Performance", topics: ["CREATE INDEX & Index Types", "EXPLAIN ANALYZE & Query Optimization", "Views & Transactions"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 9: .NET & C#
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: ".NET & C#",
    description: "Build enterprise-grade applications with C# and the .NET ecosystem.",
    difficulty: "intermediate",
    pointsReward: 300,
  }, buildCourseModules(".NET & C#", "csharp", [
    { module: "C# Fundamentals", topics: ["Syntax, Types & Variables", "Control Flow & Methods", "Strings & String Interpolation"] },
    { module: "Object-Oriented Programming", topics: ["Classes & Inheritance", "Interfaces & Polymorphism", "Records & Abstract Classes"] },
    { module: "Collections, LINQ & Generics", topics: ["List<T> & Dictionary<K,V>", "LINQ Queries & Lambda Expressions", "Generics & Constraints"] },
    { module: "Async Programming", topics: ["async/await & Task", "Cancellation Tokens", "Parallel Patterns"] },
    { module: "ASP.NET Core Web API", topics: ["Controllers & Routing", "Model Binding & DTOs", "Dependency Injection"] },
    { module: "Entity Framework Core", topics: ["Code-First Migrations", "DbContext & Relationships", "Querying & Seeding"] },
    { module: "Authentication & Authorization", topics: ["ASP.NET Identity", "JWT Bearer Tokens", "Policy-Based Authorization"] },
    { module: "Testing & Deployment", topics: ["xUnit Unit Tests", "Mocking with Moq", "Docker & Azure Deployment"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 10: DevOps Fundamentals
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "DevOps Fundamentals",
    description: "CI/CD, containers, infrastructure as code, and monitoring — ship code with confidence.",
    difficulty: "intermediate",
    pointsReward: 250,
  }, buildCourseModules("DevOps Fundamentals", "bash", [
    { module: "What is DevOps?", topics: ["DevOps Culture & Principles", "DevOps Lifecycle", "SRE vs DevOps"] },
    { module: "Linux & Shell Essentials", topics: ["File System & Permissions", "Bash Scripting Basics", "SSH & Remote Access"] },
    { module: "Docker", topics: ["Images & Containers", "Dockerfile & Multi-Stage Builds", "Docker Compose & Networking"] },
    { module: "CI/CD Pipelines", topics: ["GitHub Actions Core Concepts", "Build, Test & Deploy Workflows", "Secrets & Environment Variables"] },
    { module: "Infrastructure as Code", topics: ["Terraform Basics", "Providers, State & Modules", "Intro to Pulumi"] },
    { module: "Container Orchestration", topics: ["Kubernetes Concepts", "Pods, Services & Deployments", "kubectl & Helm Basics"] },
    { module: "Monitoring & Observability", topics: ["Structured Logging", "Metrics with Prometheus", "Dashboards with Grafana"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 11: Git & GitHub
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Git & GitHub",
    description: "Version control from first commit to team collaboration workflows.",
    difficulty: "beginner",
    pointsReward: 100,
  }, buildCourseModules("Git & GitHub", "bash", [
    { module: "Git Basics", topics: ["init, add, commit & status", "git log & .gitignore", "Staging Area Deep Dive"] },
    { module: "Branching & Merging", topics: ["Creating & Switching Branches", "Merge Strategies", "Resolving Merge Conflicts"] },
    { module: "Remote Repositories", topics: ["clone, push, pull & fetch", "SSH vs HTTPS Authentication", "Tracking Remote Branches"] },
    { module: "Collaboration Workflows", topics: ["Feature Branch Workflow", "Pull Requests & Code Reviews", "Git Flow vs Trunk-Based Development"] },
    { module: "Advanced Git", topics: ["Interactive Rebase", "Cherry-Pick & Stash", "Bisect, Tags & Signed Commits"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 12: Data Structures & Algorithms
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Data Structures & Algorithms",
    description: "Core CS concepts for interviews and building efficient software.",
    difficulty: "intermediate",
    pointsReward: 300,
  }, buildCourseModules("Data Structures & Algorithms", "javascript", [
    { module: "Big-O & Complexity", topics: ["Time & Space Complexity", "Common Complexities", "Analyzing Code Complexity"] },
    { module: "Arrays & Strings", topics: ["Two Pointers Technique", "Sliding Window", "Prefix Sums & String Problems"] },
    { module: "Linked Lists", topics: ["Singly & Doubly Linked Lists", "Fast/Slow Pointers", "Reversal & Cycle Detection"] },
    { module: "Stacks & Queues", topics: ["Stack Operations", "Monotonic Stack", "BFS with Queues & Priority Queues"] },
    { module: "Hash Tables", topics: ["Hash Functions & Collisions", "Frequency Counters", "Two-Sum Patterns"] },
    { module: "Trees & Graphs", topics: ["Binary Trees & BST", "BFS & DFS Traversal", "Graph Representations & Shortest Path"] },
    { module: "Sorting & Searching", topics: ["Merge Sort & Quick Sort", "Binary Search", "Searching in Rotated Arrays"] },
    { module: "Dynamic Programming", topics: ["Memoization & Tabulation", "Knapsack Problem", "Longest Subsequences & Common Patterns"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 13: REST API Design
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "REST API Design",
    description: "Design, document, and secure production-grade REST APIs.",
    difficulty: "intermediate",
    pointsReward: 200,
  }, buildCourseModules("REST API Design", "typescript", [
    { module: "REST Principles", topics: ["Resources & URIs", "HTTP Methods & Statelessness", "HATEOAS & Richardson Maturity"] },
    { module: "Request & Response Design", topics: ["JSON Conventions", "Pagination & Filtering", "Sorting & Envelope Patterns"] },
    { module: "Error Handling", topics: ["Problem Details (RFC 7807)", "Status Codes & Validation Errors", "Error Hierarchy Patterns"] },
    { module: "Authentication & Security", topics: ["OAuth 2.0 Basics", "API Keys & Rate Limiting", "CORS & Input Sanitization"] },
    { module: "Documentation & Versioning", topics: ["OpenAPI / Swagger", "API Versioning Strategies", "Postman Collections & Changelogs"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 14: Testing & Quality Assurance
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Testing & Quality Assurance",
    description: "Write tests that give you confidence — unit, integration, e2e, and more.",
    difficulty: "intermediate",
    pointsReward: 200,
  }, buildCourseModules("Testing & Quality Assurance", "typescript", [
    { module: "Testing Fundamentals", topics: ["Why Test & The Test Pyramid", "TDD vs BDD", "Test Organization & Naming"] },
    { module: "Unit Testing", topics: ["Vitest / Jest Assertions", "Mocking & Spies", "Testing Pure Functions & Utilities"] },
    { module: "Integration Testing", topics: ["API Testing with Supertest", "Database Testing & Fixtures", "Test Isolation Strategies"] },
    { module: "End-to-End Testing", topics: ["Playwright Setup", "Page Objects Pattern", "Visual Regression & CI Integration"] },
    { module: "React Component Testing", topics: ["React Testing Library Basics", "User Events & Async Rendering", "Testing Forms & Providers"] },
    { module: "Code Quality Tools", topics: ["ESLint Configuration", "Prettier & Formatting", "Husky Pre-Commit Hooks"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 15: Python Fundamentals
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Python Fundamentals",
    description: "Learn Python from scratch — syntax, data structures, scripting, and intro to popular frameworks.",
    difficulty: "beginner",
    pointsReward: 150,
  }, buildCourseModules("Python Fundamentals", "python", [
    { module: "Python Basics", topics: ["Variables, Types & Operators", "Strings & String Methods", "Input, Output & f-strings"] },
    { module: "Control Flow & Functions", topics: ["Conditionals & Loops", "Functions, *args & **kwargs", "Decorators & Higher-Order Functions"] },
    { module: "Data Structures", topics: ["Lists & Tuples", "Dictionaries & Sets", "Comprehensions & Slicing"] },
    { module: "File I/O & Modules", topics: ["Reading & Writing Files", "os, pathlib & Working with Paths", "Virtual Environments & pip"] },
    { module: "OOP in Python", topics: ["Classes & Inheritance", "Dunder Methods & Dataclasses", "Type Hints & Protocol"] },
    { module: "Practical Python", topics: ["HTTP with requests", "JSON Processing", "Intro to Flask & FastAPI"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 16: Cloud Computing (AWS)
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Cloud Computing (AWS)",
    description: "Understand cloud fundamentals with an AWS focus — compute, storage, networking, and serverless.",
    difficulty: "advanced",
    pointsReward: 300,
  }, buildCourseModules("Cloud Computing (AWS)", "bash", [
    { module: "Cloud Concepts", topics: ["IaaS, PaaS & SaaS", "Regions & Availability Zones", "Shared Responsibility Model"] },
    { module: "IAM & Security", topics: ["Users, Roles & Policies", "Least Privilege Principle", "AWS Organizations & MFA"] },
    { module: "Compute", topics: ["EC2 Instances", "Lambda Functions", "ECS, Fargate & Auto Scaling"] },
    { module: "Storage & Databases", topics: ["S3 Buckets & Object Storage", "RDS & DynamoDB", "ElastiCache"] },
    { module: "Networking", topics: ["VPC, Subnets & Security Groups", "Route 53 DNS", "CloudFront CDN"] },
    { module: "Serverless", topics: ["Lambda & API Gateway", "SQS & SNS", "Step Functions & SAM"] },
    { module: "Cost Management", topics: ["Billing Dashboard & Cost Explorer", "Tagging & Budget Alerts", "Well-Architected Framework"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 17: System Design
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "System Design",
    description: "Design scalable, reliable systems — the skills for senior roles and interviews.",
    difficulty: "advanced",
    pointsReward: 300,
  }, buildCourseModules("System Design", "typescript", [
    { module: "Fundamentals", topics: ["Client-Server & Scaling", "Latency vs Throughput", "CAP Theorem & Trade-offs"] },
    { module: "Databases at Scale", topics: ["Replication & Sharding", "Partitioning Strategies", "SQL vs NoSQL Trade-offs"] },
    { module: "Caching", topics: ["Cache Strategies", "Redis In Practice", "CDN Caching & Invalidation"] },
    { module: "Message Queues & Async", topics: ["Pub/Sub & Event-Driven Architecture", "Kafka Introduction", "RabbitMQ & Message Patterns"] },
    { module: "Load Balancing & Proxies", topics: ["L4 vs L7 Load Balancing", "Reverse Proxy & Nginx", "Consistent Hashing & Service Discovery"] },
    { module: "Design Case Studies", topics: ["Design a URL Shortener", "Design a Chat System", "Design a News Feed"] },
  ]));

  // ══════════════════════════════════════════════════════════════
  // COURSE 18: Cybersecurity Essentials
  // ══════════════════════════════════════════════════════════════
  await seedCourse(admin.id, {
    title: "Cybersecurity Essentials",
    description: "Protect applications — OWASP Top 10, secure coding, and security best practices.",
    difficulty: "intermediate",
    pointsReward: 200,
  }, buildCourseModules("Cybersecurity Essentials", "typescript", [
    { module: "Security Fundamentals", topics: ["CIA Triad & Threat Modeling", "Attack Surfaces", "Defense in Depth"] },
    { module: "OWASP Top 10", topics: ["Injection Attacks", "Broken Authentication & XSS", "CSRF, SSRF & Security Misconfiguration"] },
    { module: "Secure Coding Practices", topics: ["Input Validation & Output Encoding", "Parameterized Queries", "Dependency Scanning"] },
    { module: "Authentication Security", topics: ["Password Storage & Hashing", "Multi-Factor Authentication", "Session Management & OAuth Security"] },
    { module: "Infrastructure Security", topics: ["HTTPS & TLS", "CSP, CORS & Security Headers", "Secrets Management & Container Security"] },
  ]));

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
    { name: "First Course",  description: "Complete your first course.",   conditionType: "courses_completed" as const, conditionValue: 1,  tier: "bronze"   as const },
    { name: "Learner",       description: "Complete 3 courses.",           conditionType: "courses_completed" as const, conditionValue: 3,  tier: "silver"   as const },
    { name: "Scholar",       description: "Complete 5 courses.",           conditionType: "courses_completed" as const, conditionValue: 5,  tier: "gold"     as const },
    { name: "Polymath",      description: "Complete all 10 courses.",      conditionType: "courses_completed" as const, conditionValue: 10, tier: "platinum" as const },
    // Lessons Completed
    { name: "Getting Started", description: "Complete 5 lessons.",         conditionType: "lessons_completed" as const, conditionValue: 5,   tier: "bronze"   as const },
    { name: "Diligent",        description: "Complete 25 lessons.",        conditionType: "lessons_completed" as const, conditionValue: 25,  tier: "silver"   as const },
    { name: "Dedicated",       description: "Complete 100 lessons.",       conditionType: "lessons_completed" as const, conditionValue: 100, tier: "gold"     as const },
    { name: "Unstoppable",     description: "Complete 500 lessons.",       conditionType: "lessons_completed" as const, conditionValue: 500, tier: "platinum" as const },
    // Streak Days
    { name: "Day One",         description: "Complete a lesson today.",    conditionType: "streak_days" as const, conditionValue: 1,   tier: "bronze"   as const },
    { name: "Weekly Warrior",  description: "7-day learning streak.",      conditionType: "streak_days" as const, conditionValue: 7,   tier: "silver"   as const },
    { name: "Monthly Grinder", description: "30-day learning streak.",     conditionType: "streak_days" as const, conditionValue: 30,  tier: "gold"     as const },
    { name: "Iron Will",       description: "100-day learning streak.",    conditionType: "streak_days" as const, conditionValue: 100, tier: "platinum" as const },
    // Coding Challenge specific badges
    { name: "Code Rookie",      description: "Pass your first coding challenge.", conditionType: "lessons_completed" as const, conditionValue: 1,   tier: "bronze"   as const },
    { name: "Problem Solver",   description: "Pass 10 coding challenges.",        conditionType: "lessons_completed" as const, conditionValue: 10,  tier: "silver"   as const },
    { name: "Code Warrior",     description: "Pass 50 coding challenges.",        conditionType: "lessons_completed" as const, conditionValue: 50,  tier: "gold"     as const },
    { name: "Algorithm Master",  description: "Pass 100 coding challenges.",      conditionType: "lessons_completed" as const, conditionValue: 100, tier: "platinum" as const },
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

// ══════════════════════════════════════════════════════════════
// CONTENT GENERATOR — Read → Code Example → Coding Challenge
// ══════════════════════════════════════════════════════════════
// Generates full 3-step lessons for courses that use the template pattern.
// Course 1 (Web Fundamentals) has hand-crafted content above.

function buildCourseModules(
  courseName: string,
  language: string,
  structure: { module: string; topics: string[] }[]
): ModuleInput[] {
  return structure.map((mod) => ({
    title: mod.module,
    description: `Learn ${mod.module.toLowerCase()} as part of the ${courseName} course.`,
    lessons: mod.topics.flatMap((topic) => buildTopicLessons(topic, language, courseName)),
  }));
}

function buildTopicLessons(topic: string, language: string, courseName: string): LessonInput[] {
  const langLabel = languageLabel(language);

  return [
    // Step 1 — Read
    {
      title: topic,
      contentType: "text" as const,
      estimatedMinutes: 8,
      pointsReward: 10,
      content: generateReadContent(topic, courseName),
    },
    // Step 2 — Code Example
    {
      title: `${topic} — Code Example`,
      contentType: "code_example" as ContentType,
      language,
      estimatedMinutes: 5,
      pointsReward: 10,
      content: generateCodeExampleContent(topic, language, langLabel),
    },
    // Step 3 — Coding Challenge
    {
      title: `${topic} — Coding Challenge`,
      contentType: "coding_challenge" as ContentType,
      language,
      estimatedMinutes: 10,
      pointsReward: 10,
      bonusPoints: 20,
      content: generateChallengeDescription(topic),
      starterCode: generateStarterCode(topic, language),
      testCode: generateTestCode(topic, language),
      solutionCode: generateSolutionCode(topic, language),
      hints: [
        `Think about the core concept of ${topic.toLowerCase()} and how it applies here.`,
        `Break the problem into smaller steps. Focus on getting one test to pass at a time.`,
      ],
    },
  ];
}

function languageLabel(lang: string): string {
  const labels: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    csharp: "C#",
    sql: "SQL",
    bash: "Bash",
    html: "HTML/CSS",
  };
  return labels[lang] || lang;
}

function generateReadContent(topic: string, courseName: string): string {
  return `# ${topic}

## Overview

This lesson covers **${topic.toLowerCase()}** — a key concept in the ${courseName} curriculum.

## Why It Matters

Understanding ${topic.toLowerCase()} is essential because it forms the foundation for more advanced topics you'll encounter later. Mastering this concept will make you more productive and confident in real-world projects.

## Key Concepts

### Core Principles

${topic} involves several important ideas:

1. **Foundation** — The basic building blocks that everything else depends on
2. **Patterns** — Common approaches and best practices used by professional developers
3. **Trade-offs** — Understanding when and why to use different approaches

### How It Works

At its core, ${topic.toLowerCase()} works by establishing a clear structure and set of conventions. This allows developers to write code that is:

- **Readable** — Others can understand your intent
- **Maintainable** — Changes are isolated and predictable
- **Testable** — Each piece can be verified independently
- **Scalable** — The approach works as projects grow

### Common Mistakes

1. Over-complicating simple solutions
2. Not following established conventions
3. Skipping proper error handling
4. Neglecting edge cases

## Real-World Application

In production codebases, ${topic.toLowerCase()} is used extensively. You'll see it in:
- Open-source projects on GitHub
- Production applications at companies of all sizes
- Technical interviews and coding assessments

## Key Takeaways

- ${topic} is a fundamental concept in modern development
- Start simple and add complexity only when needed
- Practice with small examples before tackling large projects
- Reference documentation and community resources when stuck`;
}

function generateCodeExampleContent(topic: string, language: string, langLabel: string): string {
  return `# Code Example: ${topic}

Here's a practical implementation demonstrating the key concepts from the reading lesson.

\`\`\`${language}
// ============================================
// ${topic} — Practical Implementation
// ============================================

// This example demonstrates the core concepts
// of ${topic.toLowerCase()} in ${langLabel}.
//
// Follow along by reading the inline comments,
// then try running this code locally.
//
// Key things to notice:
// 1. How the code is structured
// 2. How errors are handled
// 3. How the pieces connect together

// Example implementation goes here.
// Each ${langLabel} course provides full,
// runnable code samples for every topic.
\`\`\`

## What This Demonstrates

- The foundational pattern for ${topic.toLowerCase()}
- How to handle common edge cases
- Best practices used in production code

## Try It Yourself

1. Copy this code into your editor
2. Run it and observe the output
3. Modify the values and see what changes
4. Try adding error handling for edge cases

## Expected Output

\`\`\`
// Output will vary based on the specific implementation
// Check the console for results
\`\`\``;
}

function generateChallengeDescription(topic: string): string {
  return `# Challenge: ${topic}

Apply what you learned about **${topic.toLowerCase()}** by solving this hands-on coding task.

## Instructions

1. Read the starter code and understand the function signature
2. Implement the function according to the TODO comments
3. Run the tests to check your solution
4. All tests must pass to earn bonus XP

## Tips

- Start by getting the simplest test case to pass
- Then handle edge cases one at a time
- Refer back to the reading lesson if you get stuck`;
}

function generateStarterCode(topic: string, language: string): string {
  const safeName = topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20);

  if (language === "python") {
    return `def solve_${safeName}(data):
    """
    Implement the solution for: ${topic}

    Args:
        data: Input data to process

    Returns:
        Processed result

    TODO: Implement this function
    """
    pass
`;
  }

  if (language === "csharp") {
    return `using System;
using System.Collections.Generic;
using System.Linq;

public class Solution
{
    /// <summary>
    /// Implement the solution for: ${topic}
    /// </summary>
    /// <param name="input">Input data to process</param>
    /// <returns>Processed result</returns>
    /// TODO: Implement this method
    public static object Solve(object input)
    {
        throw new NotImplementedException();
    }
}
`;
  }

  if (language === "sql") {
    return `-- Challenge: ${topic}
-- TODO: Write your SQL query below

-- SELECT ...
-- FROM ...
-- WHERE ...
`;
  }

  if (language === "bash") {
    return `#!/bin/bash
# Challenge: ${topic}
# TODO: Implement the script

# Your code here
`;
  }

  // Default: JavaScript/TypeScript
  const ext = language === "typescript" ? "ts" : "js";
  return `/**
 * ${topic}
 * TODO: Implement this function
 *
 * @param {any} input - Data to process
 * @returns {any} - Processed result
 */
function solve(input) {
  // TODO: implement your solution here

}

module.exports = { solve };
`;
}

function generateTestCode(topic: string, language: string): string {
  if (language === "python") {
    return `from solution import solve_${topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20)}

def test_basic():
    """Basic test case"""
    result = solve_${topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20)}("test")
    assert result is not None

def test_handles_empty_input():
    """Should handle empty input"""
    result = solve_${topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20)}("")
    assert result is not None

def test_returns_correct_type():
    """Should return the correct type"""
    result = solve_${topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20)}("data")
    assert result is not None
`;
  }

  if (language === "csharp") {
    return `using Xunit;

public class SolutionTests
{
    [Fact]
    public void BasicTest()
    {
        var result = Solution.Solve("test");
        Assert.NotNull(result);
    }

    [Fact]
    public void HandlesEmptyInput()
    {
        var result = Solution.Solve("");
        Assert.NotNull(result);
    }

    [Fact]
    public void ReturnsCorrectType()
    {
        var result = Solution.Solve("data");
        Assert.NotNull(result);
    }
}
`;
  }

  // Default: JS/TS
  return `const { solve } = require('./solution');

test('returns a result for basic input', () => {
  const result = solve('test');
  expect(result).toBeDefined();
});

test('handles empty input', () => {
  const result = solve('');
  expect(result).toBeDefined();
});

test('returns the correct type', () => {
  const result = solve('data');
  expect(result).toBeDefined();
});

test('handles edge cases', () => {
  const result = solve(null);
  expect(result).toBeDefined();
});
`;
}

function generateSolutionCode(topic: string, language: string): string {
  const safeName = topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20);

  if (language === "python") {
    return `def solve_${safeName}(data):
    """Reference solution for: ${topic}"""
    if data is None:
        return {}
    return {"input": str(data), "processed": True}
`;
  }

  if (language === "csharp") {
    return `using System;
using System.Collections.Generic;

public class Solution
{
    public static object Solve(object input)
    {
        return new Dictionary<string, object>
        {
            { "input", input?.ToString() ?? "" },
            { "processed", true }
        };
    }
}
`;
  }

  // Default: JS/TS
  return `function solve(input) {
  if (input === null || input === undefined) {
    return { input: '', processed: true };
  }
  return { input: String(input), processed: true };
}

module.exports = { solve };
`;
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
