/**
 * Update all Next.js course lesson content with properly formatted Markdown.
 * Replaces placeholder content with full, production-quality content.
 *
 * Usage:  cd api && npx tsx prisma/update-nextjs-content.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📝 Updating Next.js lesson content...\n");

  const course = await prisma.course.findFirst({
    where: { title: "Next.js" },
    include: {
      modules: {
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!course) {
    console.error("❌ Next.js course not found.");
    process.exit(1);
  }

  // ───────────────────────────────────────────────────────────
  // MODULE 1 — Getting Started & Rendering Deep Dive
  // ───────────────────────────────────────────────────────────

  // Lesson 1 — Theory
  await updateLesson("How Web Rendering Works — CSR, SSR, SSG, ISR", `
# Web Rendering in Modern Applications

Understanding rendering is fundamental to mastering Next.js performance and architecture.

Next.js supports **four main rendering strategies**. Each one controls *where* and *when* your HTML is generated.

---

## 1️⃣ CSR — Client-Side Rendering

CSR renders content **in the browser** using JavaScript.

> The server sends a nearly-empty HTML shell, then JavaScript takes over and builds the UI.

### How it works

\`\`\`
Browser → receives minimal HTML → downloads JS bundle → React renders → UI visible
\`\`\`

### Pros
- Highly interactive
- Works well for dashboards and admin panels
- Fast subsequent navigations

### Cons
- Slow initial load (blank screen while JS downloads)
- Poor SEO — crawlers see empty HTML
- Heavy JavaScript bundle sent to client

### When to use
- User-authenticated apps (no SEO needed)
- Complex interactive UIs (editors, dashboards)

---

## 2️⃣ SSR — Server-Side Rendering

SSR generates **fresh HTML on every request**.

> The server fetches data, renders the component tree to HTML, and sends the complete page.

### How it works

\`\`\`
Browser → request → server fetches data → server renders HTML → sends complete page
\`\`\`

### Pros
- Great SEO — crawlers get full HTML
- Faster first meaningful paint
- Always up-to-date content

### Cons
- Higher server load per request
- Slower than static for repeat visitors

### When to use
- SEO-critical pages with dynamic data
- Pages that must always show fresh content

---

## 3️⃣ SSG — Static Site Generation

Pages are generated **at build time** and served as static files.

> HTML is pre-rendered once during \`next build\` and cached on a CDN.

### Pros
- Extremely fast — served from CDN edge
- Zero server compute at runtime
- Excellent SEO

### Cons
- Requires a rebuild for content changes
- Not suitable for frequently-changing data

### When to use
- Blogs, marketing pages, documentation
- Any content that doesn't change often

---

## 4️⃣ ISR — Incremental Static Regeneration

Static pages that **revalidate automatically** after deployment.

> Combines the speed of SSG with the freshness of SSR.

\`\`\`typescript
// This tells Next.js to regenerate the page every 60 seconds
export const revalidate = 60;
\`\`\`

### Pros
- Fast like SSG
- Content updates without rebuilds
- Scales well with CDN caching

### When to use
- Product listings, news feeds
- Semi-dynamic content that can be 30-60s stale

---

## Quick Comparison

| Strategy | Where Generated | When Generated | Best Use Case |
|----------|----------------|----------------|---------------|
| **CSR** | Browser | On page load | Dashboards |
| **SSR** | Server | Every request | SEO + dynamic data |
| **SSG** | Server | Build time | Blogs, docs |
| **ISR** | Server | Build + timed revalidate | E-commerce |

> Mastering these strategies lets you optimize performance **intentionally** — choosing the right approach for each page.
`);

  // Lesson 2 — Code Examples
  await updateLesson("Rendering Strategies in Code", `
# Rendering Strategies in Next.js (App Router)

Each rendering strategy below shows the **same page** — a list of posts — implemented differently. Notice how the code structure changes.

---

## 1️⃣ CSR — Client-Side Rendering

Uses \`"use client"\`, \`useState\`, and \`useEffect\` to fetch data in the browser.

\`\`\`tsx
"use client"

import { useEffect, useState } from "react"

export default function CSRPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(setPosts)
  }, [])

  return <div>{posts.length} posts loaded (CSR)</div>
}
\`\`\`

> ⚠️ The page is blank until JavaScript loads and the fetch completes.

---

## 2️⃣ SSR — Server-Side Rendering

A **Server Component** with \`cache: "no-store"\` to force fresh data every request.

\`\`\`tsx
// No "use client" needed — this is a Server Component
export default async function SSRPage() {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    { cache: "no-store" }  // ← Forces SSR
  ).then(res => res.json())

  return <div>{posts.length} posts loaded (SSR)</div>
}
\`\`\`

> The server fetches data and returns complete HTML. No client-side JavaScript needed.

---

## 3️⃣ SSG — Static Site Generation

Default \`fetch()\` behavior — cached at build time.

\`\`\`tsx
export default async function SSGPage() {
  // Default cache behavior = static generation
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then(res => res.json())

  return <div>{posts.length} posts loaded (SSG)</div>
}
\`\`\`

> This page is generated once during \`next build\` and served as a static HTML file.

---

## 4️⃣ ISR — Incremental Static Regeneration

Add \`revalidate\` to get static speed with automatic refresh.

\`\`\`tsx
// Revalidate every 60 seconds
export const revalidate = 60

export default async function ISRPage() {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then(res => res.json())

  return <div>{posts.length} posts loaded (ISR)</div>
}
\`\`\`

> The page is served statically but regenerates in the background every 60 seconds.

---

## Key Differences at a Glance

| Strategy | Key Code Signal | Result |
|----------|----------------|--------|
| **CSR** | \`"use client"\` + \`useEffect\` | Renders in browser |
| **SSR** | \`cache: "no-store"\` | Fresh HTML per request |
| **SSG** | Default \`fetch()\` | Built once, static |
| **ISR** | \`export const revalidate = N\` | Static + auto-refresh |
`);

  // ───────────────────────────────────────────────────────────
  // MODULE 2 — Routing & Navigation
  // ───────────────────────────────────────────────────────────

  await updateLesson("App Router File Conventions", `
# App Router File Conventions

Next.js 13+ uses the **App Router** with file-system–based routing. Your folder structure *is* your URL structure.

---

## Key Files

Every route segment can have these special files:

| File | Purpose |
|------|---------|
| \`page.tsx\` | The route's UI — this makes the folder a route |
| \`layout.tsx\` | Shared wrapper — persists across child navigations |
| \`loading.tsx\` | Instant loading UI (React Suspense boundary) |
| \`error.tsx\` | Error boundary for the route segment |
| \`not-found.tsx\` | Custom 404 page for the segment |

---

## Folder = Route Segment

\`\`\`
app/
├── page.tsx              →  /
├── about/
│   └── page.tsx          →  /about
├── blog/
│   ├── page.tsx          →  /blog
│   └── [slug]/
│       └── page.tsx      →  /blog/:slug
└── dashboard/
    ├── layout.tsx        →  Wraps all dashboard pages
    ├── page.tsx          →  /dashboard
    └── settings/
        └── page.tsx      →  /dashboard/settings
\`\`\`

> Every folder under \`app/\` with a \`page.tsx\` becomes a URL segment automatically.

---

## Dynamic Routes

Use **\`[param]\`** folders for dynamic segments:

\`\`\`typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({
  params
}: {
  params: { slug: string }
}) {
  return <h1>Post: {params.slug}</h1>
}
\`\`\`

| Pattern | Example URL | \`params\` |
|---------|-------------|----------|
| \`[slug]\` | \`/blog/hello\` | \`{ slug: "hello" }\` |
| \`[...slug]\` | \`/blog/a/b/c\` | \`{ slug: ["a","b","c"] }\` |
| \`[[...slug]]\` | \`/blog\` or \`/blog/a\` | Optional catch-all |

---

## Route Groups

Use **\`(groupName)\`** to organize files without affecting the URL:

\`\`\`
app/
├── (marketing)/
│   ├── about/page.tsx      →  /about
│   └── pricing/page.tsx    →  /pricing
└── (app)/
    ├── dashboard/page.tsx  →  /dashboard
    └── settings/page.tsx   →  /settings
\`\`\`

> Route groups are **invisible** in the URL — they're purely organizational.

---

## Layouts

Layouts wrap child routes and **persist state** across navigations:

\`\`\`tsx
// app/layout.tsx — Root layout (required)
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <nav>My App Navigation</nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
\`\`\`

> Nested layouts compose automatically — each layout wraps the layouts and pages inside it.
`);

  // ───────────────────────────────────────────────────────────
  // MODULE 3 — Data Fetching & Server Actions
  // ───────────────────────────────────────────────────────────

  await updateLesson("Server Components & Data Fetching", `
# Server Components & Data Fetching

In the App Router, **components are Server Components by default**. This means you can fetch data directly in your component — no API layer needed.

---

## Direct Data Fetching

\`\`\`tsx
// This runs on the server ONLY — never shipped to the browser
export default async function UsersPage() {
  const users = await fetch(
    "https://api.example.com/users"
  ).then(r => r.json())

  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

> Server Components can use \`async/await\` directly. No \`useEffect\`. No loading state boilerplate. No API routes.

---

## Caching Strategies

Control how and when data is cached using fetch options:

| Option | Behavior | Strategy |
|--------|----------|----------|
| Default \`fetch(url)\` | Cached forever | SSG |
| \`{ cache: "no-store" }\` | Never cached | SSR |
| \`{ next: { revalidate: 60 } }\` | Cached, refreshed every 60s | ISR |

\`\`\`typescript
// SSR — always fresh
const data = await fetch(url, { cache: "no-store" })

// ISR — revalidate every 5 minutes
const data = await fetch(url, {
  next: { revalidate: 300 }
})
\`\`\`

---

## Server Actions

Server Actions let you run **server-side code from client interactions** — no API route needed:

\`\`\`typescript
// actions.ts
"use server"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  await db.post.create({ data: { title } })
}
\`\`\`

Called from a form component:

\`\`\`tsx
import { createPost } from "./actions"

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" />
      <button type="submit">Create Post</button>
    </form>
  )
}
\`\`\`

> Server Actions replace traditional API routes for mutations. They run on the server, but you call them like regular functions.

---

## Loading & Error States

Next.js provides **file-based** loading and error boundaries:

\`\`\`
app/
└── posts/
    ├── page.tsx         ← Main content (async)
    ├── loading.tsx      ← Shows instantly while page loads
    └── error.tsx        ← Shows if page throws an error
\`\`\`

\`\`\`tsx
// app/posts/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )
}
\`\`\`

> \`loading.tsx\` is powered by React Suspense — it shows instantly while the async Server Component loads data.
`);

  console.log("\n✅ All lesson content updated with formatted Markdown!");
}

async function updateLesson(title: string, content: string) {
  const result = await prisma.lesson.updateMany({
    where: { title },
    data: { content: content.trim() },
  });
  if (result.count > 0) {
    console.log(`  ✅ Updated: ${title}`);
  } else {
    console.log(`  ⚠️  Not found: ${title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
