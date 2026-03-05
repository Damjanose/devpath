import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

/* ───────────────────────────────  Module 1: Getting Started & Project Setup ─────────────────────────────── */
const mod1: Record<string, string> = {
  "9584dc1e-8310-4393-9e11-7d1adf3a948a": `# Course Overview & What You'll Build

Welcome to **The Ultimate Next.js Course**! Over the next 15 modules you'll go from zero to building a production-ready **DevOverflow** — a full-stack Q&A platform inspired by Stack Overflow.

## What Is DevOverflow?

DevOverflow is a community-driven developer Q&A platform where users can:

- **Ask & answer** technical questions with rich Markdown
- **Vote** on the best answers with real-time optimistic UI
- **Earn reputation** and unlock badges through participation
- **Search** across questions, answers, tags, and users
- **Get AI-generated answers** powered by OpenAI
- **Track profiles**, view stats, and save collections

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (OAuth + Credentials) |
| AI | OpenAI API |
| Deployment | Vercel |

## How Lessons Work

Each module follows a **Learn → See → Do** pattern:

1. **Text lessons** explain concepts with diagrams and examples
2. **Code examples** show annotated, production-quality code
3. **Quizzes** test your understanding
4. **Coding challenges** let you write real code and earn XP

> 💡 Complete every lesson to maximize your XP and unlock the next module!
`,

  "bb7366d8-7588-4596-a5ea-08e7b885d759": `# TypeScript Essentials for Next.js

Before diving into Next.js, let's master the TypeScript patterns you'll use throughout the project.

## Why TypeScript?

TypeScript adds **static types** to JavaScript, catching bugs at compile time instead of runtime. In Next.js, TypeScript is deeply integrated — from page props to server actions.

## Core Types for Next.js

### Basic Annotations

\`\`\`typescript
// Primitive types
const title: string = "DevOverflow";
const views: number = 42;
const isPublished: boolean = true;

// Arrays & Tuples
const tags: string[] = ["react", "nextjs"];
const pair: [string, number] = ["score", 100];
\`\`\`

### Interfaces vs Types

\`\`\`typescript
// Interface — great for objects, can be extended
interface Question {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: User;
  createdAt: Date;
}

// Type — great for unions, intersections, mapped types
type ContentType = "question" | "answer" | "comment";
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
\`\`\`

### Generics

\`\`\`typescript
// Generic function — works with any type
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

// Generic interface for API responses
interface ApiResponse<T> {
  data: T;
  totalCount: number;
  hasMore: boolean;
}
\`\`\`

### Utility Types

| Type | Purpose | Example |
|---|---|---|
| \`Partial<T>\` | All props optional | \`Partial<Question>\` for edit forms |
| \`Pick<T, K>\` | Select specific props | \`Pick<User, "name" \\| "avatar">\` |
| \`Omit<T, K>\` | Remove specific props | \`Omit<Question, "id">\` for creation |
| \`Record<K, V>\` | Key-value map | \`Record<string, number>\` for scores |

> 💡 You'll use these utility types extensively when building server actions and form schemas.
`,

  "8a375932-7372-4804-82b7-2c9c6c6cef4c": `# TypeScript in Practice — Annotated Examples

Let's see real TypeScript patterns from the DevOverflow codebase.

## Pattern 1: Discriminated Unions for Actions

\`\`\`typescript
// Each action type has a distinct 'type' field
type QuestionAction =
  | { type: "CREATE"; data: CreateQuestionInput }
  | { type: "UPDATE"; id: string; data: Partial<CreateQuestionInput> }
  | { type: "DELETE"; id: string }
  | { type: "VOTE"; id: string; userId: string; direction: "up" | "down" };

function handleAction(action: QuestionAction) {
  switch (action.type) {
    case "CREATE":
      // TypeScript knows action.data exists here
      return createQuestion(action.data);
    case "UPDATE":
      // TypeScript knows action.id AND action.data exist
      return updateQuestion(action.id, action.data);
    case "DELETE":
      return deleteQuestion(action.id);
    case "VOTE":
      return voteQuestion(action.id, action.userId, action.direction);
  }
}
\`\`\`

## Pattern 2: Zod Schema + TypeScript Integration

\`\`\`typescript
import { z } from "zod";

// Define schema once — get runtime validation + TypeScript type
const QuestionSchema = z.object({
  title: z.string().min(5).max(130),
  content: z.string().min(20),
  tags: z.array(z.string()).min(1).max(5),
});

// Infer the TypeScript type from the schema
type QuestionInput = z.infer<typeof QuestionSchema>;
// Result: { title: string; content: string; tags: string[] }
\`\`\`

## Pattern 3: Next.js Page Props Typing

\`\`\`typescript
// Dynamic route params in Next.js 14
interface QuestionPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function QuestionPage({
  params,
  searchParams,
}: QuestionPageProps) {
  const question = await getQuestionById(params.id);
  const sort = (searchParams.sort as string) ?? "newest";
  // ...
}
\`\`\`

> 💡 Notice how TypeScript gives us autocompletion and error checking for \`params.id\` and \`searchParams\` — no more runtime "undefined is not a function" errors.
`,

  "648d2ad9-0d50-4cac-a00a-3c50d0872b19": `# Task: Type the DevOverflow Data Models

Build the complete TypeScript type system for DevOverflow!

## Your Task

Create TypeScript interfaces/types for all the core data models of the DevOverflow application. Your types should be strict, reusable, and follow TypeScript best practices.

> 💡 **Hint:** Use \`interface\` for the base models and \`type\` for unions and utility types. Consider making an \`Id\` type alias for consistency.

## Requirements

- Define the \`User\` interface with name, email, avatar, bio, reputation, and joinedAt fields
- Define the \`Question\` interface with title, content, tags, author (reference to User), upvotes, downvotes, views, answers count, and timestamps
- Define the \`Answer\` interface referencing both Question and User
- Create a \`SortOrder\` union type with "newest", "oldest", "popular", "unanswered"
- Create a generic \`PaginatedResult<T>\` type with data array, totalCount, page, and pageSize

## What You'll Practice

- TypeScript interfaces and types
- Generic types
- Union types and type composition
`,

  "c9dfa9fb-eb59-4b56-95fe-b1d061ce25da": `# How a Next.js Project Is Structured

Understanding Next.js project structure is key to navigating and building applications efficiently.

## The App Directory

Next.js 14 uses the **App Router**, where the \`app/\` directory defines your entire application structure:

\`\`\`
app/
├── layout.tsx          # Root layout — wraps every page
├── page.tsx            # Home page (/)
├── globals.css         # Global styles
├── (root)/             # Route group (no URL segment)
│   ├── layout.tsx      # Shared layout for this group
│   ├── page.tsx        # Still maps to /
│   └── ask-question/
│       └── page.tsx    # /ask-question
├── (auth)/             # Auth route group
│   ├── sign-in/
│   │   └── page.tsx    # /sign-in
│   └── sign-up/
│       └── page.tsx    # /sign-up
├── question/
│   └── [id]/
│       └── page.tsx    # /question/:id (dynamic)
└── api/
    └── webhooks/
        └── route.ts    # API route handler
\`\`\`

## Key Files & Their Roles

| File | Purpose |
|---|---|
| \`layout.tsx\` | Persistent UI wrapper — stays mounted across navigations |
| \`page.tsx\` | The actual page content for a route |
| \`loading.tsx\` | Instant loading UI (uses React Suspense) |
| \`error.tsx\` | Error boundary for the route |
| \`not-found.tsx\` | Custom 404 page |
| \`route.ts\` | API route handler (no UI) |

## Important Config Files

\`\`\`
├── next.config.mjs     # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS settings
├── tsconfig.json       # TypeScript configuration
├── .env.local          # Environment variables (secrets!)
└── middleware.ts        # Edge middleware for auth, redirects
\`\`\`

> 💡 Route groups in parentheses like \`(root)\` and \`(auth)\` help organize code without affecting the URL structure.
`,

  "fa0c0cd8-ed57-4de8-8834-f75029c65a88": `# Project Setup in Code — Every File Explained

Let's walk through the essential files you'll create when setting up the DevOverflow project.

## 1. next.config.mjs

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
    mdxRs: true,
  },
};

export default nextConfig;
\`\`\`

## 2. Root Layout

\`\`\`tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spaceGrotesk",
});

export const metadata: Metadata = {
  title: "DevOverflow",
  description: "A community-driven Q&A platform for developers.",
  icons: { icon: "/assets/images/site-logo.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={\`\${inter.variable} \${spaceGrotesk.variable}\`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
\`\`\`

## 3. TypeScript Configuration

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "es2017"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]
    },
    "strict": true
  }
}
\`\`\`

> 💡 The \`@/*\` path alias lets you import from any directory without relative path gymnastics: \`import { Button } from "@/components/ui/button"\`.
`,

  "4fa4a4e5-26c9-4413-8801-99a55d19ad6c": `# Configuring Tailwind, ESLint & Path Aliases

Get your developer experience set up right from the start.

## Tailwind CSS Configuration

\`\`\`typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],  // Enable class-based dark mode
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#FF7000",  // DevOverflow orange
          100: "#FFF1E6",
        },
        dark: {
          100: "#000000",
          200: "#0F1117",
          300: "#151821",
          400: "#212734",
          500: "#3F4354",
        },
        light: {
          900: "#FFFFFF",
          800: "#F4F6F8",
          850: "#FDFDFD",
          700: "#DCE3F1",
          500: "#7B8EC8",
          400: "#858EAD",
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        spaceGrotesk: ["var(--font-spaceGrotesk)"],
      },
      boxShadow: {
        "light-100": "0px 12px 20px 0px rgba(184, 184, 184, 0.03)",
        "dark-100": "0px 2px 10px 0px rgba(46, 52, 56, 0.10)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
\`\`\`

## ESLint Configuration

\`\`\`javascript
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "prefer-const": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
\`\`\`

## Path Aliases in tsconfig

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/database/*": ["./database/*"],
      "@/constants/*": ["./constants/*"]
    }
  }
}
\`\`\`

> 💡 Path aliases make your imports clean and refactor-safe. \`@/lib/utils\` is always the same, no matter which directory you're importing from.
`,

  "853d4e2a-b3f1-45ad-b892-1573dd6fedc5": `# Task: Initialize the DevOverflow Project

Set up a Next.js project from scratch with all the essential configuration!

## Your Task

Create the foundational configuration for a Next.js 14 project. You'll wire up TypeScript, Tailwind CSS, and path aliases — the same setup used in production Next.js applications.

> 💡 **Hint:** Focus on the configuration objects — the structure matters more than memorizing every option.

## Requirements

- Create a \`createNextConfig\` function that returns a Next.js config with image domains and experimental features
- Create a \`createTailwindConfig\` function that returns a Tailwind config with custom colors (primary, dark, light palettes) and dark mode enabled
- Create a \`resolveAlias\` function that given an import path starting with \`@/\`, returns the resolved file path

## What You'll Practice

- Next.js and Tailwind configuration structure
- Path resolution and aliases
- Project scaffolding patterns
`,
};

/* ───────────────────────────────  Module 2: Routing Deep Dive ─────────────────────────────── */
const mod2: Record<string, string> = {
  "8650f70b-4ffe-4fd4-a4ef-470b318b9d5e": `# How File-System Routing Works

Next.js uses the **file system** as the router — no configuration needed. Every file becomes a route.

## The Core Concept

\`\`\`
app/
├── page.tsx           →  /
├── about/
│   └── page.tsx       →  /about
├── question/
│   ├── page.tsx       →  /question
│   └── [id]/
│       └── page.tsx   →  /question/:id
└── tags/
    ├── page.tsx       →  /tags
    └── [name]/
        └── page.tsx   →  /tags/:name
\`\`\`

## How It Works

1. **Folders** define the route segments (\`/question\`, \`/tags\`)
2. **\`page.tsx\`** makes a route publicly accessible
3. **\`layout.tsx\`** wraps pages with shared UI
4. Other files (\`loading.tsx\`, \`error.tsx\`) add special behavior

## Special File Convention

| File | Purpose | When It Activates |
|---|---|---|
| \`page.tsx\` | Route UI | When the URL matches |
| \`layout.tsx\` | Shared wrapper | Wraps the page and all children |
| \`template.tsx\` | Like layout, but re-mounts | On every navigation |
| \`loading.tsx\` | Loading skeletal UI | While the page is loading |
| \`error.tsx\` | Error boundary | When the page throws an error |
| \`not-found.tsx\` | 404 UI | When \`notFound()\` is called |

## Layouts vs Templates

\`\`\`
layout.tsx  → Persists state across page navigations (mounted once)
template.tsx → Re-renders on every navigation (mounted each time)
\`\`\`

> 💡 Use layouts for navbars and sidebars. Use templates for animations or pages that need a fresh state each visit.
`,

  "138af89c-a7e6-4a67-9af5-a5c4e0862240": `# Static Routes — page.tsx & layout.tsx in Code

Let's build the core pages of DevOverflow using static file-system routing.

## Home Page

\`\`\`tsx
// app/(root)/page.tsx
import QuestionCard from "@/components/cards/QuestionCard";
import { getQuestions } from "@/lib/actions/question.action";

export default async function Home() {
  const { questions } = await getQuestions({});

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="primary-gradient rounded-lg px-4 py-3 text-light-900">
          Ask a Question
        </Link>
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.map((question) => (
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>
    </>
  );
}
\`\`\`

## Root Layout with Sidebar

\`\`\`tsx
// app/(root)/layout.tsx
import Navbar from "@/components/shared/navbar/Navbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
        <RightSidebar />
      </div>
    </main>
  );
}
\`\`\`

> 💡 The layout persists across page navigations. When you navigate from \`/\` to \`/tags\`, the Navbar and Sidebars don't re-mount — only the \`{children}\` content swaps.
`,

  "2b77389c-ea23-495b-9070-562f61e253f1": `# How Dynamic Routes Work

Dynamic routes let you create pages for content that doesn't exist at build time — like individual questions, user profiles, or tag pages.

## Three Dynamic Route Patterns

### 1. Single Dynamic Segment

\`\`\`
app/question/[id]/page.tsx  →  /question/abc123
\`\`\`

The \`[id]\` folder captures one URL segment. Access it via \`params.id\`.

### 2. Catch-All Segments

\`\`\`
app/docs/[...slug]/page.tsx  →  /docs/a/b/c
\`\`\`

The \`[...slug]\` captures **all** remaining segments as an array: \`["a", "b", "c"]\`.

### 3. Optional Catch-All

\`\`\`
app/docs/[[...slug]]/page.tsx  →  /docs  AND  /docs/a/b/c
\`\`\`

Double brackets make it optional — it also matches the parent route.

## How Params Work

\`\`\`tsx
// app/question/[id]/page.tsx
interface PageProps {
  params: { id: string };
}

export default async function QuestionPage({ params }: PageProps) {
  const question = await getQuestionById(params.id);

  if (!question) notFound();  // Shows not-found.tsx

  return <QuestionDetail question={question} />;
}
\`\`\`

## Generating Static Params

For dynamic routes you want to pre-render at build time:

\`\`\`tsx
export async function generateStaticParams() {
  const questions = await getTopQuestions();
  return questions.map((q) => ({ id: q._id }));
}
\`\`\`

> 💡 \`generateStaticParams\` is like \`getStaticPaths\` from Pages Router — it tells Next.js which dynamic pages to pre-render as static HTML.
`,

  "36e176bc-e503-465c-8bab-14b38181da6b": `# Dynamic Routes in Code — 3 Patterns

See all three dynamic route patterns implemented for DevOverflow.

## Pattern 1: Question Detail Page

\`\`\`tsx
// app/question/[id]/page.tsx
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function QuestionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const question = await getQuestionById(params.id);

  if (!question) notFound();

  const user = session?.user?.id
    ? await getUserById(session.user.id)
    : null;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <UserInfo author={question.author} />
          <Votes
            type="question"
            itemId={question._id}
            userId={user?._id}
            upvotes={question.upvotes.length}
            downvotes={question.downvotes.length}
            hasUpvoted={question.upvotes.includes(user?._id)}
            hasDownvoted={question.downvotes.includes(user?._id)}
          />
        </div>
        <h2 className="h2-semibold mt-3.5">{question.title}</h2>
      </div>

      <ParseHTML data={question.content} />
      <AllAnswers questionId={question._id} />
      <AnswerForm questionId={question._id} />
    </>
  );
}
\`\`\`

## Pattern 2: Tag Page with Search Params

\`\`\`tsx
// app/tags/[name]/page.tsx
export default async function TagPage({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: { page?: string; q?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { questions, totalPages } = await getQuestionsByTag({
    tagName: params.name,
    searchQuery: searchParams.q,
    page,
  });

  return (
    <>
      <h1 className="h1-bold">{decodeURIComponent(params.name)}</h1>
      <QuestionList questions={questions} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </>
  );
}
\`\`\`

> 💡 Notice the \`searchParams\` prop — Next.js automatically parses URL query strings (\`?page=2&q=react\`) and passes them to your page component.
`,

  "1f298706-bdc0-43ec-955e-4ab0d1970087": `# Task: Build the DevOverflow Route Tree

Design and implement the complete routing structure for DevOverflow!

## Your Task

Create a function that models the Next.js App Router file-system routing. Given a file path, your function should determine the route URL, whether it's dynamic, and what parameters it expects.

> 💡 **Hint:** Parse the path segments, looking for \`[param]\`, \`[...param]\`, and \`[[...param]]\` patterns.

## Requirements

- Implement \`parseRoute(filePath)\` that converts a file path to a route definition
- Handle static routes: \`app/about/page.tsx\` → \`/about\`
- Handle dynamic routes: \`app/question/[id]/page.tsx\` → \`/question/:id\`
- Handle catch-all: \`app/docs/[...slug]/page.tsx\` → \`/docs/*\`
- Handle route groups: \`app/(auth)/sign-in/page.tsx\` → \`/sign-in\`
- Return an object with \`{ path, isDynamic, params, isRouteGroup }\`

## What You'll Practice

- Next.js App Router file conventions
- URL segment parsing
- Dynamic route pattern matching
`,

  "0ed9f566-b79b-4197-948a-886cdb4e59b0": `# How Route Groups & Parallel Routes Work

Route groups and parallel routes are advanced patterns for organizing your application without affecting URLs.

## Route Groups with \`(folder)\`

Parenthesized folders create **logical groups** without adding URL segments:

\`\`\`
app/
├── (root)/          # Group for main pages
│   ├── layout.tsx   # Sidebar + Navbar layout
│   ├── page.tsx     # / (home)
│   └── ask-question/
│       └── page.tsx # /ask-question
├── (auth)/          # Group for auth pages
│   ├── layout.tsx   # Centered, no sidebar
│   ├── sign-in/
│   │   └── page.tsx # /sign-in
│   └── sign-up/
│       └── page.tsx # /sign-up
\`\`\`

### Why Use Route Groups?

- **Different layouts** for different sections (auth gets centered layout, main gets sidebar)
- **Code organization** without URL impact
- **Shared loading states** per group

## Parallel Routes with \`@folder\`

Parallel routes render **multiple pages simultaneously** in the same layout:

\`\`\`
app/
├── layout.tsx
├── page.tsx
├── @feed/
│   └── page.tsx      # Renders in the "feed" slot
├── @sidebar/
│   └── page.tsx      # Renders in the "sidebar" slot
\`\`\`

\`\`\`tsx
// app/layout.tsx
export default function Layout({
  children,
  feed,
  sidebar,
}: {
  children: React.ReactNode;
  feed: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="flex-1">{feed}</div>
      <aside>{sidebar}</aside>
    </div>
  );
}
\`\`\`

> 💡 Parallel routes are perfect for dashboards where multiple independent sections load and error independently.
`,

  "61930d5d-d7dc-4dc9-abd6-db4f783ae06b": `# Route Groups & Parallel Routes in Code

Let's implement the DevOverflow layout strategy using route groups.

## Auth Layout (Minimal)

\`\`\`tsx
// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-md p-6">
        {children}
      </div>
    </main>
  );
}
\`\`\`

## Root Layout (Full App Shell)

\`\`\`tsx
// app/(root)/layout.tsx
import Navbar from "@/components/shared/navbar/Navbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
        <RightSidebar />
      </div>
      <Toaster />
    </main>
  );
}
\`\`\`

## Route Group Organization

\`\`\`
app/
├── (auth)/                    # Centered, clean layout
│   ├── layout.tsx
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (root)/                    # Full app with sidebar
│   ├── layout.tsx
│   ├── page.tsx               # Home feed
│   ├── ask-question/page.tsx
│   ├── community/page.tsx
│   ├── collection/page.tsx
│   ├── tags/page.tsx
│   ├── profile/[id]/page.tsx
│   └── question/[id]/page.tsx
\`\`\`

> 💡 Auth pages get a clean, centered layout. App pages get the full navigation shell. Same domain, same project, different layouts — all thanks to route groups.
`,

  "3e257551-8566-40eb-b4d2-f53fac66ff84": `# How Navigation Works in Next.js

Next.js provides several ways to navigate between pages, each suited for different scenarios.

## Client-Side Navigation

### The \`<Link>\` Component

\`\`\`tsx
import Link from "next/link";

// Basic navigation
<Link href="/question/abc123">View Question</Link>

// With dynamic params
<Link href={\`/question/\${question._id}\`}>
  {question.title}
</Link>

// Prefetching (automatic for visible links)
<Link href="/tags" prefetch={false}>
  Tags
</Link>
\`\`\`

### The \`useRouter\` Hook (Client Components)

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";

function SearchBar() {
  const router = useRouter();

  function handleSearch(query: string) {
    router.push(\`/search?q=\${encodeURIComponent(query)}\`);
  }

  // Other methods
  router.back();      // Go back
  router.forward();   // Go forward
  router.refresh();   // Re-fetch server components
  router.prefetch("/tags");  // Prefetch a route
}
\`\`\`

### Server-Side Redirects

\`\`\`tsx
// In Server Components or Server Actions
import { redirect } from "next/navigation";

export async function createQuestion(data: QuestionInput) {
  const question = await db.create(data);
  redirect(\`/question/\${question._id}\`);
  // Code after redirect never runs
}
\`\`\`

## When to Use Each

| Method | Context | Use Case |
|---|---|---|
| \`<Link>\` | Any component | Clickable navigation |
| \`useRouter\` | Client components | Programmatic navigation |
| \`redirect()\` | Server components/actions | After mutations |
| \`permanentRedirect()\` | Server components | URL migrations, 308 |

> 💡 \`<Link>\` automatically prefetches routes that are visible in the viewport, making navigations feel instant.
`,

  "da9ce471-2e7e-404d-8cad-0ecc20cfcab0": `# Navigation in Code — Link, useRouter, redirect

See navigation patterns used throughout DevOverflow.

## Sidebar Navigation with Active States

\`\`\`tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sidebarLinks } from "@/constants";

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {sidebarLinks.map((item) => {
        const isActive =
          (pathname.includes(item.route) && item.route.length > 1) ||
          pathname === item.route;

        return (
          <Link
            key={item.route}
            href={item.route}
            className={\`flex items-center gap-4 rounded-lg p-4 \${
              isActive
                ? "primary-gradient text-light-900"
                : "text-dark300_light900"
            }\`}
          >
            <item.icon className="size-5" />
            <span className={\`\${isActive ? "font-bold" : "font-medium"}\`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
\`\`\`

## Programmatic Navigation After Form Submit

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";

export default function AskQuestionForm() {
  const router = useRouter();

  async function onSubmit(values: QuestionInput) {
    try {
      await createQuestion(values);
      router.push("/");
    } catch (error) {
      toast({ title: "Error creating question", variant: "destructive" });
    }
  }
  // ...
}
\`\`\`

## Redirect in Server Action

\`\`\`tsx
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteQuestion(questionId: string) {
  await Question.findByIdAndDelete(questionId);
  revalidatePath("/");  // Refresh the home page feed
  redirect("/");        // Send user back to home
}
\`\`\`

> 💡 Notice the \`usePathname\` hook for determining the active sidebar link — it re-renders automatically when the URL changes.
`,

  "2a2daac4-617c-400b-8508-f6195865a841": `# Task: Build the Sidebar Navigation

Create a navigation system that matches routes and highlights the active page!

## Your Task

Build a route matching engine for DevOverflow's sidebar navigation. Given the current URL path and a list of navigation items, determine which item is active and generate the navigation state.

> 💡 **Hint:** A route is "active" if the current pathname starts with it — but \`/\` should only match exactly.

## Requirements

- Implement \`matchRoute(currentPath, routes)\` that returns the active route
- Handle exact matches: \`/\` only matches \`/\`, not \`/tags\`
- Handle prefix matches: \`/question/abc\` should match route \`/question\`
- Handle nested routes: \`/tags/react\` should match \`/tags\`
- Return a navigation array with \`{ route, label, isActive }\` for each item

## What You'll Practice

- URL path matching algorithms
- Navigation state management
- Route hierarchy concepts
`,

  "e19aa2c0-c38a-4647-a63b-d1cd3a38dd1a": `# How Error Boundaries & Loading States Work

Next.js uses special files to handle loading and error states at the route level — no manual state management required.

## Loading States with \`loading.tsx\`

When a page component is loading (e.g., fetching data), Next.js automatically shows the nearest \`loading.tsx\`:

\`\`\`tsx
// app/(root)/loading.tsx
export default function Loading() {
  return (
    <div className="flex-center w-full flex-col gap-4 p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      <p className="text-dark200_light800">Loading...</p>
    </div>
  );
}
\`\`\`

Under the hood, Next.js wraps your page in a **React Suspense** boundary:

\`\`\`tsx
// What Next.js does internally
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
\`\`\`

## Error Boundaries with \`error.tsx\`

\`\`\`tsx
"use client"; // Error boundaries MUST be client components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-center flex-col gap-4 p-10">
      <h2 className="h2-bold text-dark100_light900">Something went wrong!</h2>
      <p className="text-dark500_light700">{error.message}</p>
      <button onClick={reset} className="primary-gradient rounded-lg px-6 py-3 text-light-900">
        Try Again
      </button>
    </div>
  );
}
\`\`\`

## Not Found Pages

\`\`\`tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-center min-h-screen flex-col gap-4">
      <h1 className="h1-bold">404</h1>
      <p className="body-regular">Page not found</p>
      <Link href="/" className="primary-gradient rounded-lg px-6 py-3 text-light-900">
        Go Home
      </Link>
    </div>
  );
}
\`\`\`

> 💡 Error boundaries catch errors in the component tree below them. Place \`error.tsx\` at different levels for granular error handling.
`,

  "14691ecc-13f2-4cf7-af3c-8b3cba6d09a1": `# Loading, Error & Not Found in Code

Production-ready loading, error, and 404 states for DevOverflow.

## Skeleton Loading Component

\`\`\`tsx
// app/(root)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section>
      {/* Header skeleton */}
      <div className="flex-between w-full">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="mt-11 flex gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* Question cards skeleton */}
      <div className="mt-10 flex flex-col gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
\`\`\`

## Route-Level Error Boundary

\`\`\`tsx
// app/(root)/question/[id]/error.tsx
"use client";
import { useEffect } from "react";

export default function QuestionError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("Question page error:", error);
  }, [error]);

  return (
    <div className="flex-center flex-col gap-6 p-10">
      <div className="text-6xl">😵</div>
      <h2 className="h2-bold">Failed to load question</h2>
      <p className="body-regular text-dark500_light700">
        {error.message || "Something went wrong"}
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="btn primary-gradient text-light-900">
          Try Again
        </button>
        <Link href="/" className="btn bg-dark-400 text-light-900">
          Go Home
        </Link>
      </div>
    </div>
  );
}
\`\`\`

> 💡 Use skeleton components that match the actual page layout — users perceive the page as loading faster when skeletons mirror the final content structure.
`,

  "5985271c-a65f-4acc-9a45-5aa68c6d08a5": `# Task: Add Loading & Error States

Build a state machine for handling async UI states!

## Your Task

Create a state management utility for handling loading, error, and success states in a type-safe way — the same pattern used for page-level states in Next.js.

> 💡 **Hint:** Use discriminated unions so TypeScript can narrow the type based on the \`status\` field.

## Requirements

- Create an \`AsyncState<T>\` type with three states: \`idle\`, \`loading\`, \`success\`, \`error\`
- Implement \`createAsyncState<T>()\` that starts in \`idle\`
- Implement \`transition\` function that moves between valid states
- \`success\` state includes \`data: T\`, \`error\` state includes \`message: string\`
- Prevent invalid transitions (e.g., \`idle\` → \`success\` without going through \`loading\`)

## What You'll Practice

- TypeScript discriminated unions
- State machines and valid transitions
- Error handling patterns
`,
};

async function main() {
  console.log("Updating Ultimate Next.js — Modules 1-2...");
  let count = 0;

  for (const [id, content] of [...Object.entries(mod1), ...Object.entries(mod2)]) {
    await p.lesson.update({ where: { id }, data: { content } });
    count++;
    if (count % 5 === 0) console.log("  " + count + " lessons updated...");
  }

  console.log("Done! Updated " + count + " lessons.");
  await p.$disconnect();
}

main().catch(console.error);
