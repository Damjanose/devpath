/**
 * Add new coding challenge lessons to the existing Next.js course.
 * Also fixes the existing challenge's test code to do real assertions.
 *
 * Usage:
 *   cd api && npx tsx prisma/seed-nextjs-challenges.ts
 */

import { PrismaClient, ContentType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Adding coding challenges to Next.js course...\n");

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
    console.error("❌ Next.js course not found. Run seed-nextjs.ts first.");
    process.exit(1);
  }

  console.log(`  Found course: ${course.title} (${course.id})`);

  // ── Idempotency: delete previously-seeded modules (keep Module 0) ──
  const seededTitles = ["Routing & Navigation", "Data Fetching & Server Actions"];
  for (const mod of course.modules) {
    if (seededTitles.includes(mod.title)) {
      await prisma.lessonProgress.deleteMany({ where: { lesson: { moduleId: mod.id } } });
      await prisma.lesson.deleteMany({ where: { moduleId: mod.id } });
      await prisma.module.delete({ where: { id: mod.id } });
      console.log(`  🗑️  Deleted existing module: ${mod.title}`);
    }
  }

  // ── Fix existing challenge test code ──
  const existingChallenge = await prisma.lesson.findFirst({
    where: {
      title: "Task: Convert CSR Page to SSR",
      module: { courseId: course.id },
    },
  });

  if (existingChallenge) {
    await prisma.lesson.update({
      where: { id: existingChallenge.id },
      data: {
        testCode: `
test("should not contain 'use client'", () => {
  expect(__userCodeString).not.toContain('"use client"');
});

test("should not use useEffect", () => {
  expect(__userCodeString).not.toContain("useEffect");
});

test("should not use useState", () => {
  expect(__userCodeString).not.toContain("useState");
});

test("should be an async function", () => {
  expect(__userCodeString).toContain("async");
});

test("should use cache: 'no-store' for SSR", () => {
  expect(__userCodeString).toContain("no-store");
});

test("should use fetch", () => {
  expect(__userCodeString).toContain("fetch");
});
`,
      },
    });
    console.log("  ✅ Updated existing challenge test code");
  }

  // ── Create Module 2 — Routing & Navigation ──
  const mod2 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Routing & Navigation",
      description:
        "Master App Router file conventions, dynamic routes, layouts, and programmatic navigation.",
      sortOrder: 1,
    },
  });
  console.log(`  📦 Created module: ${mod2.title}`);

  // Lesson 1 — Theory
  await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "App Router File Conventions",
      contentType: ContentType.text,
      estimatedMinutes: 10,
      pointsReward: 15,
      sortOrder: 0,
      content: `# App Router File Conventions

Next.js 13+ uses the **App Router** with file-system–based routing.

---

## Key Files

| File | Purpose |
|------|---------|
| \`page.tsx\` | Route entry point — renders the URL |
| \`layout.tsx\` | Shared wrapper — persists across navigations |
| \`loading.tsx\` | Instant loading UI (Suspense boundary) |
| \`error.tsx\` | Error boundary for the route |
| \`not-found.tsx\` | Custom 404 for the segment |

---

## Folder = Route Segment

\`\`\`
app/
  page.tsx          →  /
  about/
    page.tsx        →  /about
  blog/
    page.tsx        →  /blog
    [slug]/
      page.tsx      →  /blog/:slug
\`\`\`

> Every folder under \`app/\` becomes a URL segment automatically.

---

## Dynamic Routes

Use \`[param]\` folders for dynamic segments:

\`\`\`typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>
}
\`\`\`

---

## Route Groups

Use \`(groupName)\` to organize without affecting the URL:

\`\`\`
app/
  (marketing)/
    about/page.tsx    →  /about
    pricing/page.tsx  →  /pricing
  (app)/
    dashboard/page.tsx → /dashboard
\`\`\`

> Route groups are invisible in the URL.

---

## Layouts

Layouts wrap child routes and **persist state** across navigations:

\`\`\`typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>My App</nav>
        {children}
      </body>
    </html>
  )
}
\`\`\`

Nested layouts compose automatically — inner layouts wrap inner pages.
`,
    },
  });

  // Lesson 2 — Coding Challenge: Build a route structure
  await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "Challenge: Dynamic Route Handler",
      contentType: ContentType.coding_challenge,
      language: "javascript",
      estimatedMinutes: 15,
      pointsReward: 25,
      bonusPoints: 5,
      sortOrder: 1,
      content: `# Challenge: Dynamic Route Handler

Write a \`getPostBySlug\` function that:

1. Accepts a \`slug\` parameter (string)
2. Searches a \`posts\` array for a matching post
3. Returns the post object if found
4. Returns \`null\` if not found

The \`posts\` array is provided for you. Your job is to implement the lookup function.
`,
      starterCode: `const posts = [
  { slug: "hello-world", title: "Hello World", views: 100 },
  { slug: "nextjs-routing", title: "Next.js Routing", views: 250 },
  { slug: "react-hooks", title: "React Hooks Guide", views: 500 },
];

function getPostBySlug(slug) {
  // TODO: find and return the post matching the slug
  // Return null if no post matches
}
`,
      testCode: `
test("finds existing post by slug", () => {
  const result = getPostBySlug("hello-world");
  expect(result).toEqual({ slug: "hello-world", title: "Hello World", views: 100 });
});

test("finds another post", () => {
  const result = getPostBySlug("react-hooks");
  expect(result.title).toBe("React Hooks Guide");
});

test("returns null for non-existent slug", () => {
  const result = getPostBySlug("does-not-exist");
  expect(result).toBe(null);
});
`,
      solutionCode: `const posts = [
  { slug: "hello-world", title: "Hello World", views: 100 },
  { slug: "nextjs-routing", title: "Next.js Routing", views: 250 },
  { slug: "react-hooks", title: "React Hooks Guide", views: 500 },
];

function getPostBySlug(slug) {
  return posts.find(post => post.slug === slug) || null;
}
`,
      hints: [
        "Use Array.find() to search by slug",
        "find() returns undefined if not found — convert to null",
        "Compare post.slug === slug",
      ],
    },
  });

  // Lesson 3 — Quiz
  await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "Quiz: Routing Concepts",
      contentType: ContentType.quiz,
      estimatedMinutes: 5,
      pointsReward: 15,
      sortOrder: 2,
      content: JSON.stringify([
        {
          question: "Which file creates a route in the App Router?",
          options: ["index.tsx", "page.tsx", "route.tsx", "_app.tsx"],
          correctAnswer: 1,
          explanation: "page.tsx is the convention for route entry points in the App Router.",
        },
        {
          question: "How do you create a dynamic route segment?",
          options: [
            "Use :param in the filename",
            "Use [param] as the folder name",
            "Use {param} in page.tsx",
            "Use a query string",
          ],
          correctAnswer: 1,
          explanation: "Dynamic segments use [param] folder naming convention.",
        },
        {
          question: "What is a Route Group in Next.js?",
          options: [
            "A folder that creates a URL segment",
            "A folder wrapped in (parentheses) that does NOT affect the URL",
            "A special API route",
            "A middleware configuration",
          ],
          correctAnswer: 1,
          explanation: "Route groups use (name) and organize files without affecting the URL.",
        },
      ]),
    },
  });

  // ── Create Module 3 — Data Fetching & Server Actions ──
  const mod3 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Data Fetching & Server Actions",
      description:
        "Learn to fetch data in Server Components, use Server Actions for mutations, and handle loading/error states.",
      sortOrder: 2,
    },
  });
  console.log(`  📦 Created module: ${mod3.title}`);

  // Lesson 1 — Theory
  await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "Server Components & Data Fetching",
      contentType: ContentType.text,
      estimatedMinutes: 12,
      pointsReward: 15,
      sortOrder: 0,
      content: `# Server Components & Data Fetching

In Next.js App Router, **components are Server Components by default**. This means you can fetch data directly — no API layer needed.

---

## Direct Data Fetching

\`\`\`typescript
// This runs on the server only — never shipped to the browser
export default async function UsersPage() {
  const users = await fetch("https://api.example.com/users").then(r => r.json());

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
\`\`\`

> Server Components can use \`async/await\` directly. No useEffect. No loading state boilerplate.

---

## Caching Strategies

| Method | Behavior |
|--------|----------|
| Default \`fetch()\` | Cached (SSG behavior) |
| \`{ cache: "no-store" }\` | Never cached (SSR) |
| \`{ next: { revalidate: 60 } }\` | Cached, refreshed every 60s (ISR) |

---

## Server Actions

Server Actions let you run server code from client interactions:

\`\`\`typescript
"use server"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.post.create({ data: { title } });
}
\`\`\`

Called from a form:

\`\`\`tsx
<form action={createPost}>
  <input name="title" />
  <button type="submit">Create</button>
</form>
\`\`\`

> Server Actions eliminate the need for separate API routes for mutations.

---

## Error & Loading States

\`\`\`
app/
  posts/
    page.tsx       ← Main content
    loading.tsx    ← Shows while page loads
    error.tsx      ← Shows on error
\`\`\`

\`loading.tsx\` is powered by React Suspense — it shows instantly while the async component loads.
`,
    },
  });

  // Lesson 2 — Coding Challenge: Transform data
  await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "Challenge: Data Transformer",
      contentType: ContentType.coding_challenge,
      language: "javascript",
      estimatedMinutes: 15,
      pointsReward: 25,
      bonusPoints: 5,
      sortOrder: 1,
      content: `# Challenge: Data Transformer

You receive an array of raw user objects from an API. Write a \`transformUsers\` function that:

1. Filters out users where \`active\` is \`false\`
2. Maps each remaining user to an object with:
   - \`id\` — unchanged
   - \`displayName\` — \`firstName\` + space + \`lastName\`
   - \`email\` — lowercased
3. Sorts the result by \`displayName\` alphabetically

This simulates a common server component data transformation pattern.
`,
      starterCode: `function transformUsers(users) {
  // TODO: implement the transformation
  // 1. Filter: keep only active users
  // 2. Map: create { id, displayName, email }
  // 3. Sort: by displayName alphabetically
  return [];
}
`,
      testCode: `
const testUsers = [
  { id: 1, firstName: "Zara", lastName: "Ali", email: "ZARA@EXAMPLE.COM", active: true },
  { id: 2, firstName: "Bob", lastName: "Smith", email: "Bob@Test.com", active: false },
  { id: 3, firstName: "Alice", lastName: "Johnson", email: "ALICE@DEV.IO", active: true },
  { id: 4, firstName: "Charlie", lastName: "Brown", email: "Charlie@Mail.COM", active: true },
];

test("filters out inactive users", () => {
  const result = transformUsers(testUsers);
  expect(result.length).toBe(3);
});

test("creates displayName from first + last name", () => {
  const result = transformUsers(testUsers);
  const names = result.map(u => u.displayName);
  expect(names).toContain("Alice Johnson");
  expect(names).toContain("Zara Ali");
});

test("lowercases email", () => {
  const result = transformUsers(testUsers);
  const emails = result.map(u => u.email);
  expect(emails).toContain("alice@dev.io");
  expect(emails).toContain("zara@example.com");
});

test("sorts by displayName alphabetically", () => {
  const result = transformUsers(testUsers);
  expect(result[0].displayName).toBe("Alice Johnson");
  expect(result[1].displayName).toBe("Charlie Brown");
  expect(result[2].displayName).toBe("Zara Ali");
});

test("preserves id", () => {
  const result = transformUsers(testUsers);
  const alice = result.find(u => u.displayName === "Alice Johnson");
  expect(alice.id).toBe(3);
});
`,
      solutionCode: `function transformUsers(users) {
  return users
    .filter(user => user.active)
    .map(user => ({
      id: user.id,
      displayName: \`\${user.firstName} \${user.lastName}\`,
      email: user.email.toLowerCase(),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
`,
      hints: [
        "Use .filter() to keep only users where active === true",
        "Use .map() to reshape each object",
        "Template literals: `${user.firstName} ${user.lastName}`",
        "Use .sort() with localeCompare for alphabetical sort",
      ],
    },
  });

  // Lesson 3 — Coding Challenge: Build a simple cache
  await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "Challenge: Simple Memoize Function",
      contentType: ContentType.coding_challenge,
      language: "javascript",
      estimatedMinutes: 20,
      pointsReward: 30,
      bonusPoints: 10,
      sortOrder: 2,
      content: `# Challenge: Simple Memoize Function

Caching is at the heart of Next.js performance. Build a \`memoize\` function that:

1. Takes a function \`fn\` as its argument
2. Returns a **new function** with the same behavior
3. Caches results based on the **first argument** (string or number)
4. If called again with the same argument, returns the cached result instead of re-computing

This is similar to how React's \`cache()\` and Next.js's fetch caching work under the hood.
`,
      starterCode: `function memoize(fn) {
  // TODO: return a new function that caches results
  // based on the first argument
}

// Test helper — do NOT modify
let callCount = 0;
function expensiveSquare(n) {
  callCount++;
  return n * n;
}
`,
      testCode: `
test("returns correct result on first call", () => {
  callCount = 0;
  const cached = memoize(expensiveSquare);
  expect(cached(5)).toBe(25);
});

test("returns cached result on second call", () => {
  callCount = 0;
  const cached = memoize(expensiveSquare);
  cached(4);
  cached(4);
  expect(callCount).toBe(1);
});

test("caches different arguments separately", () => {
  callCount = 0;
  const cached = memoize(expensiveSquare);
  expect(cached(3)).toBe(9);
  expect(cached(7)).toBe(49);
  expect(cached(3)).toBe(9);
  expect(callCount).toBe(2);
});

test("works with string arguments", () => {
  const upper = memoize(s => s.toUpperCase());
  expect(upper("hello")).toBe("HELLO");
  expect(upper("hello")).toBe("HELLO");
});
`,
      solutionCode: `function memoize(fn) {
  const cache = new Map();
  return function(arg) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// Test helper — do NOT modify
let callCount = 0;
function expensiveSquare(n) {
  callCount++;
  return n * n;
}
`,
      hints: [
        "Create a Map or object to store cached results",
        "Check if the argument already exists in the cache",
        "If it does, return the cached value — don't call fn",
        "If it doesn't, call fn, store the result, then return it",
      ],
    },
  });

  // Lesson 4 — Quiz
  await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "Quiz: Data Fetching Patterns",
      contentType: ContentType.quiz,
      estimatedMinutes: 5,
      pointsReward: 15,
      sortOrder: 3,
      content: JSON.stringify([
        {
          question: "In App Router, which components can use async/await directly?",
          options: [
            "Client Components",
            "Server Components",
            "Both",
            "Neither — you must use useEffect",
          ],
          correctAnswer: 1,
          explanation: "Server Components support async/await natively. Client Components cannot be async.",
        },
        {
          question: "How do you make a fetch always return fresh data (SSR)?",
          options: [
            "fetch(url, { cache: 'force-cache' })",
            "fetch(url, { cache: 'no-store' })",
            "fetch(url, { revalidate: 0 })",
            "fetch(url, { ssr: true })",
          ],
          correctAnswer: 1,
          explanation: "cache: 'no-store' disables caching, so every request hits the server.",
        },
        {
          question: "What replaces API routes for mutations in App Router?",
          options: [
            "getServerSideProps",
            "Server Actions with 'use server'",
            "useEffect + fetch",
            "Route handlers only",
          ],
          correctAnswer: 1,
          explanation: "Server Actions marked with 'use server' can handle form submissions and mutations directly.",
        },
      ]),
    },
  });

  // ── Update course XP to reflect new lessons ──
  // Count all lessons
  const allLessons = await prisma.lesson.findMany({
    where: { module: { courseId: course.id } },
    select: { pointsReward: true },
  });
  const totalLessonXp = allLessons.reduce((sum, l) => sum + l.pointsReward, 0);
  await prisma.course.update({
    where: { id: course.id },
    data: { pointsReward: 250 }, // Keep course completion bonus at 250
  });

  console.log(`\n  📊 Total lessons: ${allLessons.length}`);
  console.log(`  📊 Total lesson XP: ${totalLessonXp}`);
  console.log(`  📊 Course completion bonus: 250`);
  console.log(`  📊 Grand total XP: ${totalLessonXp + 250}`);
  console.log("\n✅ Coding challenges added successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
