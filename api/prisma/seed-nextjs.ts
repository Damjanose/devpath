/**
 * Standalone seed for the Next.js course (real content — Module 1)
 *
 * Usage:
 *   cd api && npx tsx prisma/seed-nextjs.ts
 *
 * This script will:
 *   1. Delete the existing placeholder Next.js course (if any)
 *   2. Seed the course with real, hand-written content
 */

import bcrypt from "bcryptjs";
import { seedCourse, prisma } from "./seed-helpers";
import { ContentType } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding Next.js course (real content)...\n");

  // ── Ensure admin user exists ──
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

  // ── Remove existing Next.js course (cascade via Prisma) ──
  const existing = await prisma.course.findFirst({
    where: { title: "Next.js" },
  });
  if (existing) {
    // Delete dependents in FK order
    await prisma.lessonProgress.deleteMany({
      where: { lesson: { module: { courseId: existing.id } } },
    });
    await prisma.lesson.deleteMany({
      where: { module: { courseId: existing.id } },
    });
    await prisma.module.deleteMany({ where: { courseId: existing.id } });
    await prisma.enrollment.deleteMany({ where: { courseId: existing.id } });
    await prisma.course.delete({ where: { id: existing.id } });
    console.log("  🗑️  Deleted existing placeholder Next.js course");
  }

  // ── Seed the course ──
  await seedCourse(
    admin.id,
    {
      title: "Next.js",
      description:
        "Full-stack React framework — SSR, SSG, API routes, and the App Router.",
      difficulty: "intermediate",
      pointsReward: 250,
    },
    [
      // ─────────────────────────────────────────────────────────
      // MODULE 1 — Getting Started & Rendering Deep Dive
      // ─────────────────────────────────────────────────────────
      {
        title: "Getting Started & Rendering Deep Dive",
        description:
          "Master web rendering strategies in Next.js with real-world explanations, production-grade code, quizzes, and a hands-on refactor challenge.",
        lessons: [

          // ─────────────────────────────────────────
          // LESSON 1 — THEORY
          // ─────────────────────────────────────────
          {
      title: "How Web Rendering Works — CSR, SSR, SSG, ISR",
      contentType: "text",
      estimatedMinutes: 12,
      pointsReward: 15,
      content: `
# Web Rendering in Modern Applications

Understanding rendering is fundamental to mastering Next.js performance and architecture.

Next.js supports four main rendering strategies:

---

## 1️⃣ CSR — Client-Side Rendering

CSR renders content in the browser using JavaScript.

### Flow:
Browser → receives minimal HTML → downloads JS → React renders → UI visible

### Pros:
- Highly interactive
- Works well for dashboards and admin panels

### Cons:
- Slow first load
- Poor SEO
- Heavy JavaScript bundle

Used when:
- App is user-authenticated
- SEO is not important

---

## 2️⃣ SSR — Server-Side Rendering

SSR generates HTML on every request.

### Flow:
Browser → request → server fetches data → server renders → sends full HTML

### Pros:
- Great SEO
- Faster first meaningful paint

### Cons:
- Higher server load
- Slower than static for repeat traffic

Used when:
- Content must always be fresh
- SEO matters

---

## 3️⃣ SSG — Static Site Generation

Pages are generated at build time.

### Pros:
- Extremely fast
- CDN-friendly
- Excellent SEO

### Cons:
- Requires rebuild for new content

Used for:
- Blogs
- Marketing pages
- Documentation

---

## 4️⃣ ISR — Incremental Static Regeneration

Static pages that revalidate after deployment.

Example:

export const revalidate = 60

This regenerates the page every 60 seconds.

Best for:
- Product listings
- Semi-dynamic content
- News feeds

---

## Quick Comparison

| Strategy | Generated | Best Use Case |
|----------|-----------|---------------|
| CSR | Browser | Dashboards |
| SSR | Per request | SEO pages |
| SSG | Build time | Blogs |
| ISR | Build + timed revalidate | Marketplaces |

Mastering these lets you optimize performance intentionally.
`,
    },

    // ─────────────────────────────────────────────
    // LESSON 2 — CODE EXAMPLES
    // ─────────────────────────────────────────────
    {
      title: "Rendering Strategies in Code",
      contentType: "code_example",
      language: "typescript",
      estimatedMinutes: 15,
      pointsReward: 15,
      content: `
# Rendering Strategies in Next.js (App Router)

---

## 1️⃣ CSR Example

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

---

## 2️⃣ SSR Example

export default async function SSRPage() {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    { cache: "no-store" }
  ).then(res => res.json())

  return <div>{posts.length} posts loaded (SSR)</div>
}

---

## 3️⃣ SSG Example

export default async function SSGPage() {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then(res => res.json())

  return <div>{posts.length} posts loaded (SSG)</div>
}

---

## 4️⃣ ISR Example

export const revalidate = 60

export default async function ISRPage() {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then(res => res.json())

  return <div>{posts.length} posts loaded (ISR)</div>
}

---

Key Differences:

CSR → useEffect
SSR → cache: "no-store"
SSG → default cache
ISR → revalidate property
`,
    },

    // ─────────────────────────────────────────────
    // QUIZ
    // ─────────────────────────────────────────────
    {
      title: "Quiz: Rendering Strategies",
      contentType: "quiz",
      estimatedMinutes: 8,
      pointsReward: 20,
      content: JSON.stringify([
        {
          question: "Which rendering strategy provides the best SEO by default?",
          options: [
            "CSR",
            "SSR and SSG",
            "Client-only React",
            "useEffect rendering"
          ],
          correctAnswer: 1,
          explanation:
            "SSR and SSG generate HTML on the server, making content readable by search engines."
        },
        {
          question: "What does 'cache: no-store' enforce?",
          options: [
            "Static generation",
            "Incremental regeneration",
            "Fresh server rendering on each request",
            "Client hydration"
          ],
          correctAnswer: 2,
          explanation:
            "'no-store' disables caching and forces SSR behavior."
        },
        {
          question: "What does 'export const revalidate = 60' enable?",
          options: [
            "CSR",
            "ISR",
            "Pure SSG only",
            "Edge rendering"
          ],
          correctAnswer: 1,
          explanation:
            "revalidate enables Incremental Static Regeneration."
        }
      ])
    },

    // ─────────────────────────────────────────────
    // CODING CHALLENGE
    // ─────────────────────────────────────────────
    {
      title: "Task: Convert CSR Page to SSR",
      contentType: "coding_challenge",
      language: "typescript",
      estimatedMinutes: 20,
      pointsReward: 30,
      bonusPoints: 10,
      content: `
# Challenge

You are given a CSR page using useEffect.

Your goal:
- Convert it into a Server Component
- Remove useEffect
- Remove "use client"
- Fetch data directly in the component
- Ensure fresh data per request

Expected outcome:
- Async component
- Uses fetch with cache: "no-store"
`,
      starterCode: `
"use client"

import { useEffect, useState } from "react"

export default function PostsPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then(res => res.json())
      .then(setPosts)
  }, [])

  return (
    <div>
      {posts.map((p: any) => (
        <p key={p.id}>{p.title}</p>
      ))}
    </div>
  )
}
`,
      solutionCode: `
export default async function PostsPage() {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    { cache: "no-store" }
  ).then(res => res.json())

  return (
    <div>
      {posts.map((p: any) => (
        <p key={p.id}>{p.title}</p>
      ))}
    </div>
  )
}
`,
      testCode: `
test("should not contain useEffect", () => {
  expect(true).toBe(true)
})
`,
      hints: [
        "Remove 'use client'",
        "Convert component to async function",
        "Move fetch outside useEffect"
      ]
    }

        ]
      }
    ]
  );

  console.log("\n✅ Next.js course seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());