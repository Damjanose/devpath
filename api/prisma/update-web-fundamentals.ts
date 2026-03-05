import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
  // ===== How the Web Works =====
  "c5ff3ac1-b434-46d9-a0f3-bbe635496d5a": `# Coding Challenge: How Browsers Load a Web Page

Put your knowledge of the browser loading pipeline into practice!

## Your Task

Build a function that simulates the order in which a browser loads a web page. Given an array of resources (HTML, CSS, JavaScript, images), return them sorted by their correct loading priority.

> 💡 **Hint:** Browsers follow a specific order — HTML is parsed first, then render-blocking CSS, synchronous JS, and finally images and other assets.

## Requirements

- Parse the list of resources
- Sort them by loading priority (HTML → CSS → JS → Images → Fonts)
- Return the sorted array

## What You'll Practice

- Understanding the Critical Rendering Path
- Resource loading priorities
- How \`defer\` and \`async\` affect script loading
`,

  "e528b4e3-ec78-4b01-9ac9-b6bd60effd2c": `# Coding Challenge: HTTP Request/Response

Build a function that constructs and parses HTTP messages!

## Your Task

Create two functions:
1. **\`buildRequest\`** — Given a method, path, and headers object, produce a properly formatted HTTP request string
2. **\`parseResponse\`** — Given a raw HTTP response string, extract the status code, status text, headers, and body

> 💡 **Hint:** HTTP messages follow a strict format — request/status line, headers, blank line, body.

## Requirements

- Handle GET, POST, PUT, DELETE methods
- Parse headers into a key-value object
- Extract the body from the response correctly

## What You'll Practice

- HTTP message structure
- Request methods and status codes
- Header parsing and serialization
`,

  "699c4703-56e5-4ee2-85a0-c589cc6ec5ae": `# Coding Challenge: DNS & Hosting

Simulate the DNS resolution process!

## Your Task

Create a \`resolveDomain\` function that simulates DNS lookups. Given a domain name and a DNS records table, walk through the resolution chain (CNAME → A record) and return the final IP address.

> 💡 **Hint:** DNS resolution can involve multiple steps — a CNAME record points to another domain, which eventually resolves to an A record (IP address).

## Requirements

- Look up the domain in the records table
- Follow CNAME chains until you reach an A record
- Return the final IP address, or \`null\` if not found
- Handle circular references gracefully

## What You'll Practice

- DNS record types (A, CNAME, MX, TXT)
- Domain resolution chains
- How hosting maps domains to servers
`,

  // ===== HTML Foundations =====
  "cb488029-ad30-4c80-ba06-00f90f02f680": `# Coding Challenge: Semantic HTML

Create well-structured semantic HTML from unstructured content!

## Your Task

Write a function \`semanticize\` that takes a flat content object and returns properly structured semantic HTML. Convert generic \`<div>\` tags into the correct semantic elements.

> 💡 **Hint:** Semantic elements like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<aside>\`, and \`<footer>\` convey meaning to both browsers and screen readers.

## Requirements

- Replace \`div.header\` → \`<header>\`
- Replace \`div.navigation\` → \`<nav>\`
- Replace \`div.content\` → \`<main>\`
- Replace \`div.sidebar\` → \`<aside>\`
- Replace \`div.footer\` → \`<footer>\`

## What You'll Practice

- Semantic HTML5 elements
- Accessibility best practices
- Document structure and outline
`,

  "9c097f3d-ee45-4baa-b4b8-f7c28a813b29": `# Coding Challenge: Forms

Build a form validation engine!

## Your Task

Create a \`validateForm\` function that validates form field values against a set of rules. Return an object with field names as keys and arrays of error messages as values.

> 💡 **Hint:** Common validations include \`required\`, \`minLength\`, \`maxLength\`, \`pattern\` (regex), and \`email\`.

## Requirements

- Support validation rules: \`required\`, \`minLength\`, \`maxLength\`, \`pattern\`, \`email\`
- Return \`{}\` (empty object) when all fields are valid
- Return \`{ fieldName: ["error1", "error2"] }\` for invalid fields
- Handle multiple errors per field

## What You'll Practice

- HTML form attributes and validation
- Regular expressions for input validation
- User input sanitization concepts
`,

  // ===== CSS Fundamentals =====
  "19fa7e6e-25e0-4597-8ba6-541039f4ae26": `# Coding Challenge: CSS Selectors

Master CSS selector specificity!

## Your Task

Create a \`calculateSpecificity\` function that takes a CSS selector string and returns its specificity as an array \`[inline, ids, classes, elements]\`.

> 💡 **Hint:** Specificity is calculated as: inline styles (1,0,0,0), IDs (0,1,0,0), classes/attributes/pseudo-classes (0,0,1,0), elements/pseudo-elements (0,0,0,1).

## Requirements

- Parse CSS selectors correctly
- Count IDs (\`#id\`), classes (\`.class\`), attributes (\`[attr]\`), pseudo-classes (\`:hover\`)
- Count element names (\`div\`, \`p\`) and pseudo-elements (\`::before\`)
- Handle combinators (\`>\`, \`+\`, \`~\`, space)

## What You'll Practice

- CSS specificity rules
- Selector parsing
- How browsers resolve conflicting styles
`,

  "86c1872e-0600-46ef-8857-253548d6e16f": `# Coding Challenge: Flexbox

Flexbox layout calculator!

## Your Task

Create a \`calculateFlexLayout\` function that takes a container width, an array of flex items (with \`flexGrow\`, \`flexShrink\`, and \`flexBasis\`), and returns the computed width of each item.

> 💡 **Hint:** Flex items distribute remaining space proportionally based on their \`flex-grow\` values. If items overflow, \`flex-shrink\` determines how they _shrink_.

## Requirements

- Calculate available free space (\`containerWidth - sum of flexBasis\`)
- Distribute positive free space using \`flexGrow\` ratios
- Distribute negative space using \`flexShrink\` ratios
- Return an array of computed widths (no item narrower than 0)

## What You'll Practice

- The Flexbox algorithm
- flex-grow, flex-shrink, and flex-basis
- How browsers compute flexible layouts
`,

  // ===== Responsive Design =====
  "bc1888f8-94ab-4213-a0c1-1f822ffca57e": `# Coding Challenge: Responsive Design

Build a responsive breakpoint matcher!

## Your Task

Create a \`matchBreakpoint\` function that, given a viewport width and a set of media query breakpoints, returns which breakpoint is currently active and which CSS rules should apply.

> 💡 **Hint:** Media queries are evaluated from narrowest to widest. Use a mobile-first approach — start with the smallest breakpoint and override upward.

## Requirements

- Accept breakpoints: \`{ sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }\`
- Given a viewport width, return the active breakpoint name
- Merge CSS rules from all matching breakpoints (mobile-first cascade)
- Return the final computed styles object

## What You'll Practice

- Media query breakpoints
- Mobile-first responsive design
- CSS cascade in responsive contexts
`,

  // ===== Developer Tooling =====
  "ef4f2da5-c4b9-4d3a-a9ce-f38d9498f225": `# Coding Challenge: DevTools

Build a simple performance metrics analyzer!

## Your Task

Create an \`analyzePerformance\` function that takes an array of performance entries (similar to what you'd see in Chrome DevTools' Performance panel) and returns a summary report.

> 💡 **Hint:** Performance entries have \`name\`, \`entryType\`, \`startTime\`, and \`duration\`. Group them by type for analysis.

## Requirements

- Calculate total load time (max endTime across all entries)
- Group entries by \`entryType\` (resource, navigation, paint, etc.)
- Find the slowest resource
- Calculate the percentage of time spent on each category

## What You'll Practice

- Browser Performance API
- DevTools performance profiling concepts
- Analyzing page load waterfalls
`,
};

async function main() {
  console.log("Updating Web Fundamentals coding challenge content...");

  let updated = 0;
  for (const [id, content] of Object.entries(updates)) {
    await p.lesson.update({ where: { id }, data: { content } });
    updated++;
    console.log(`  ✓ ${updated}/9 updated`);
  }

  console.log(`\nDone! Updated ${updated} lessons.`);
  await p.$disconnect();
}

main().catch(console.error);
