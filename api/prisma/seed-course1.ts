/**
 * Standalone seed for Course 1: Web Fundamentals
 *
 * Usage:
 *   npx ts-node prisma/seed-course1.ts
 *
 * NOTE: The main seed.ts already includes this course with full 3-step content.
 *       Use this script only when you want to seed Course 1 in isolation.
 */

import bcrypt from "bcryptjs";
import { seedCourse, prisma } from "./seed-helpers";
import { ContentType } from "@prisma/client";
import { ContentType } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding Course 1: Web Fundamentals...\n");

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

1. **DNS Lookup** — The browser asks a DNS server to translate the domain name into an IP address.
2. **TCP Connection** — A connection is established with the server.
3. **HTTP Request** — The browser sends an HTTP GET request for the page.
4. **Server Response** — The server sends back HTML.
5. **Parsing & Rendering** — The browser parses HTML into the DOM and renders the page.

## Key Concepts

- **DOM**: A tree representation of the HTML document.
- **CSSOM**: A tree representation of all CSS styles.
- **Render Tree**: Combines DOM + CSSOM to determine what's visible.
- **Layout → Paint → Composite**: The rendering pipeline.`,
          },
          {
            title: "How Browsers Load a Web Page — Code Example",
            contentType: "code_example" as const,
            language: "javascript",
            estimatedMinutes: 5,
            content: `# Code Example: Performance Timing API

\`\`\`javascript
const timing = performance.getEntriesByType("navigation")[0];
console.log(\`DNS Lookup: \${(timing.domainLookupEnd - timing.domainLookupStart).toFixed(2)}ms\`);
console.log(\`TTFB: \${(timing.responseStart - timing.requestStart).toFixed(2)}ms\`);
console.log(\`Total Load: \${(timing.loadEventEnd - timing.startTime).toFixed(2)}ms\`);
\`\`\``,
          },
          {
            title: "How Browsers Load a Web Page — Coding Challenge",
            contentType: "coding_challenge" as const,
            language: "javascript",
            estimatedMinutes: 10,
            bonusPoints: 20,
            content: "# Challenge: Parse a URL\n\nWrite a function that parses a URL string into its components.",
            starterCode: `function parseURL(url) {
  // TODO: return { protocol, hostname, port, pathname, search, hash }
}
module.exports = { parseURL };`,
            testCode: `const { parseURL } = require('./solution');
test('parses full URL', () => {
  const r = parseURL('https://api.dev:8080/courses?p=1#s');
  expect(r.protocol).toBe('https:');
  expect(r.hostname).toBe('api.dev');
  expect(r.port).toBe('8080');
  expect(r.pathname).toBe('/courses');
});`,
            solutionCode: `function parseURL(url) {
  const p = new URL(url);
  return { protocol: p.protocol, hostname: p.hostname, port: p.port, pathname: p.pathname, search: p.search, hash: p.hash };
}
module.exports = { parseURL };`,
            hints: [
              "JavaScript has a built-in URL class.",
              "Try: const parsed = new URL(url);",
            ],
          },
          {
            title: "The HTTP Request/Response Cycle",
            contentType: "text" as const,
            estimatedMinutes: 8,
            content: `# The HTTP Request/Response Cycle

HTTP is the foundation of data communication on the web.

## HTTP Methods
- **GET** — Retrieve data
- **POST** — Submit data
- **PUT** — Replace a resource
- **DELETE** — Remove a resource

## Status Codes
- 2xx: Success (200 OK, 201 Created)
- 4xx: Client error (400, 401, 404)
- 5xx: Server error (500)`,
          },
          {
            title: "HTTP Request/Response — Code Example",
            contentType: "code_example" as const,
            language: "javascript",
            estimatedMinutes: 5,
            content: `# Code Example: Fetch API

\`\`\`javascript
async function getCourses() {
  const res = await fetch('https://api.devpath.dev/courses');
  console.log('Status:', res.status);
  const courses = await res.json();
  console.log('Courses:', courses);
}
\`\`\``,
          },
          {
            title: "HTTP Request/Response — Coding Challenge",
            contentType: "coding_challenge" as const,
            language: "javascript",
            estimatedMinutes: 10,
            bonusPoints: 15,
            content: "# Challenge: HTTP Status Code Classifier\n\nClassify HTTP status codes by category and name.",
            starterCode: `function classifyStatus(code) {
  // TODO: return { category, message }
}
module.exports = { classifyStatus };`,
            testCode: `const { classifyStatus } = require('./solution');
test('200 is success', () => {
  expect(classifyStatus(200)).toEqual({ category: 'success', message: 'OK' });
});
test('404 is client_error', () => {
  expect(classifyStatus(404).category).toBe('client_error');
});`,
            solutionCode: `function classifyStatus(code) {
  const known = { 200: 'OK', 201: 'Created', 301: 'Moved Permanently', 404: 'Not Found', 500: 'Internal Server Error' };
  const ranges = [[100,199,'informational'],[200,299,'success'],[300,399,'redirect'],[400,499,'client_error'],[500,599,'server_error']];
  const r = ranges.find(([min,max]) => code >= min && code <= max);
  return { category: r ? r[2] : 'unknown', message: known[code] || 'Unknown' };
}
module.exports = { classifyStatus };`,
            hints: [
              "Status codes 100-199 informational, 200-299 success, 300-399 redirect, 400-499 client error, 500-599 server error.",
            ],
          },
        ],
      },
      {
        title: "HTML Foundations",
        description: "Build proper HTML documents with semantic elements.",
        lessons: [
          {
            title: "Document Structure & Semantic HTML",
            contentType: "text" as const,
            estimatedMinutes: 10,
            content: `# Semantic HTML

Use elements like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, and \`<footer>\` to build accessible, well-structured pages.`,
          },
          {
            title: "Semantic HTML — Code Example",
            contentType: "code_example" as const,
            language: "html",
            estimatedMinutes: 5,
            content: `# Code Example: Semantic Page Structure

\`\`\`html
<header><nav><a href="/">DevPath</a></nav></header>
<main>
  <section><h1>Welcome</h1></section>
  <article><h2>Blog Post</h2><p>Content...</p></article>
</main>
<footer>&copy; 2026 DevPath</footer>
\`\`\``,
          },
          {
            title: "Semantic HTML — Coding Challenge",
            contentType: "coding_challenge" as const,
            language: "html",
            estimatedMinutes: 10,
            bonusPoints: 20,
            content: "# Challenge: Fix Non-Semantic HTML\n\nConvert div-based markup to semantic elements.",
            starterCode: `<div class="top-bar"><div>DevPath</div></div>
<div class="content"><div class="title">Welcome</div></div>
<div class="bottom-bar">&copy; 2026</div>`,
            testCode: `const fs = require('fs');
const html = fs.readFileSync('./solution.html', 'utf8');
test('uses header', () => expect(html).toMatch(/<header/));
test('uses main', () => expect(html).toMatch(/<main/));
test('uses footer', () => expect(html).toMatch(/<footer/));`,
            solutionCode: `<header><a href="/">DevPath</a></header>
<main><h1>Welcome</h1></main>
<footer>&copy; 2026</footer>`,
            hints: [
              "Replace div.top-bar with <header>, div.content with <main>, div.bottom-bar with <footer>.",
            ],
          },
        ],
      },
      {
        title: "CSS Fundamentals",
        description: "Master selectors, the box model, and flexbox.",
        lessons: [
          {
            title: "Selectors & Specificity",
            contentType: "text" as const,
            estimatedMinutes: 10,
            content: "# CSS Selectors & Specificity\n\nElement (0-0-1), Class (0-1-0), ID (1-0-0). When specificity is equal, the last rule wins.",
          },
          {
            title: "CSS Selectors — Code Example",
            contentType: "code_example" as const,
            language: "css",
            estimatedMinutes: 5,
            content: "# Common Selector Patterns\n\n```css\n.card { border-radius: 0.75rem; }\n.card:first-child { border-left: 4px solid green; }\na:hover { text-decoration: underline; }\n```",
          },
          {
            title: "CSS Selectors — Coding Challenge",
            contentType: "coding_challenge" as const,
            language: "javascript",
            estimatedMinutes: 10,
            bonusPoints: 15,
            content: "# Challenge: CSS Specificity Calculator",
            starterCode: `function calculateSpecificity(selector) { /* TODO */ }
module.exports = { calculateSpecificity };`,
            testCode: `const { calculateSpecificity } = require('./solution');
test('single element', () => expect(calculateSpecificity('p')).toEqual([0,0,1]));
test('single class', () => expect(calculateSpecificity('.card')).toEqual([0,1,0]));
test('single id', () => expect(calculateSpecificity('#hero')).toEqual([1,0,0]));`,
            solutionCode: `function calculateSpecificity(s) {
  let ids=0,cls=0,els=0;
  s.replace(/[>+~]/g,' ').trim().split(/\\s+/).forEach(t=>{
    t.split(/(?=[#.:])/).filter(Boolean).forEach(p=>{
      if(p==='*')return;
      if(p[0]==='#')ids++;
      else if(p[0]==='.'||p[0]===':')cls++;
      else els++;
    });
  });
  return [ids,cls,els];
}
module.exports = { calculateSpecificity };`,
            hints: ["Split selector by spaces, then split each token by #, ., : prefixes."],
          },
        ],
      },
      {
        title: "Responsive Design & Developer Tools",
        description: "Build responsive sites and learn essential developer tools.",
        lessons: [
          {
            title: "Media Queries & Mobile-First",
            contentType: "text" as const,
            estimatedMinutes: 8,
            content: "# Responsive Design\n\nUse `@media (min-width: 768px)` for mobile-first design. Start with mobile styles, then enhance for larger screens.",
          },
          {
            title: "Responsive Design — Code Example",
            contentType: "code_example" as const,
            language: "css",
            estimatedMinutes: 5,
            content: "# Mobile-First Grid\n\n```css\n.grid { display: flex; flex-direction: column; }\n@media (min-width: 768px) { .grid { flex-direction: row; } }\n```",
          },
          {
            title: "Responsive Design — Coding Challenge",
            contentType: "coding_challenge" as const,
            language: "css",
            estimatedMinutes: 10,
            bonusPoints: 20,
            content: "# Challenge: Make a Layout Responsive",
            starterCode: `.layout { /* TODO: stack mobile, sidebar at 768px */ }`,
            testCode: `const fs = require('fs');
const css = fs.readFileSync('./solution.css', 'utf8');
test('has media query', () => expect(css).toMatch(/@media/));
test('uses flex', () => expect(css).toMatch(/display.*flex/));`,
            solutionCode: `.layout { display: flex; flex-direction: column; }
@media (min-width: 768px) { .layout { flex-direction: row; } .sidebar { width: 250px; } .content { flex: 1; } }`,
            hints: ["Start with flex-direction: column, switch to row at 768px."],
          },
        ],
      },
    ]
  );

  console.log("\n🎉 Course 1 seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
