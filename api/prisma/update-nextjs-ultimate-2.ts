import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 3: Server Components & Client Components ──
"f6dfd279-5d2b-4ae6-8d0e-e7ca7306ec9e": `# What Are Server Components?

Server Components are the **default** in Next.js 14's App Router. They run exclusively on the server and send zero JavaScript to the browser.

## Why Server Components Matter

| Feature | Server Component | Client Component |
|---|---|---|
| Data fetching | Direct DB/API access | Must call an API |
| JavaScript sent | 0 bytes | Full component code |
| Access to | fs, DB, env secrets | window, hooks, events |
| Performance | Faster initial load | More interactive |

## How They Work

\`\`\`tsx
// This is a Server Component by default — no "use client"
import { db } from "@/lib/database";

export default async function QuestionList() {
  // Direct database access — no API layer needed!
  const questions = await db.question.find().limit(10);

  return (
    <ul>
      {questions.map((q) => (
        <li key={q._id}>{q.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

## What You Cannot Do in Server Components

- Use React hooks (\`useState\`, \`useEffect\`, etc.)
- Attach event handlers (\`onClick\`, \`onChange\`, etc.)
- Access browser APIs (\`window\`, \`document\`, \`localStorage\`)
- Use context providers

> 💡 Think of Server Components as "fancy templates" — they produce HTML on the server and stream it to the client. No interactivity needed.
`,

"9d132474-47ac-45c6-9c84-811646d93d9f": `# Server Component in Code — Direct Data Fetching

See how Server Components eliminate the need for \`useEffect\` + \`useState\` data fetching.

## Before (Client Component Pattern)

\`\`\`tsx
"use client";
import { useState, useEffect } from "react";

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton />;
  return <ul>{/* render questions */}</ul>;
}
\`\`\`

## After (Server Component — Default)

\`\`\`tsx
// No "use client" — this is a Server Component
import { getQuestions } from "@/lib/actions/question.action";

export default async function QuestionList() {
  const { questions } = await getQuestions({
    page: 1,
    pageSize: 10,
    sortBy: "newest",
  });

  return (
    <ul className="flex flex-col gap-6">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} />
      ))}
    </ul>
  );
}
\`\`\`

### The Difference

- **No loading state** — the page streams when data is ready
- **No API route** — direct database access
- **No JavaScript** — zero client-side code shipped
- **SEO friendly** — content is in the initial HTML

> 💡 The \`async\` keyword on the component function is the hallmark of Server Components — Client Components cannot be async.
`,

"a33620f8-24f2-4422-bad1-2772aea9d831": `# Server Component — Headers, Cookies & searchParams

Server Components can access request-specific data that Client Components cannot.

## Reading Headers

\`\`\`tsx
import { headers } from "next/headers";

export default async function GeoPage() {
  const headersList = headers();
  const country = headersList.get("x-vercel-ip-country") ?? "US";
  const userAgent = headersList.get("user-agent") ?? "";

  const isMobile = /Mobile|Android/i.test(userAgent);

  return (
    <div>
      <p>Country: {country}</p>
      <p>Device: {isMobile ? "Mobile" : "Desktop"}</p>
    </div>
  );
}
\`\`\`

## Reading Cookies

\`\`\`tsx
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";
  const session = cookieStore.get("session_token");

  if (!session) redirect("/sign-in");

  return <DashboardLayout theme={theme} />;
}
\`\`\`

## Using searchParams

\`\`\`tsx
export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; filter?: string };
}) {
  const query = searchParams.q ?? "";
  const page = Number(searchParams.page) || 1;
  const filter = searchParams.filter ?? "newest";

  const results = await searchQuestions({ query, page, filter });

  return <QuestionFeed results={results} />;
}
\`\`\`

> 💡 \`headers()\` and \`cookies()\` cause the route to be dynamically rendered on every request — they opt out of static generation.
`,

"cb09210b-a7e0-4bba-81aa-94f7f4b07c31": `# What Are Client Components?

Client Components run in the browser. Use them when you need interactivity, hooks, or browser APIs.

## Opting Into Client Components

Add \`"use client"\` at the **top of the file**:

\`\`\`tsx
"use client";

import { useState } from "react";

export default function VoteButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      👍 {count}
    </button>
  );
}
\`\`\`

## When to Use Client Components

| Need | Example |
|---|---|
| Event handlers | onClick, onChange, onSubmit |
| React hooks | useState, useEffect, useRef |
| Browser APIs | window, localStorage, IntersectionObserver |
| Third-party libs | Charts, rich text editors, date pickers |

## The "use client" Boundary

\`\`\`
"use client" doesn't mean "runs ONLY on the client"

It means: "This is the CLIENT BOUNDARY"
- The component is pre-rendered on the server (SSR)
- Then it hydrates on the client
- All imports below this boundary become Client Components too
\`\`\`

### Important: "use client" Is Infectious Downward

\`\`\`
ServerComponent.tsx ──── renders ──→ ClientComponent.tsx ("use client")
                                      └── ChildA.tsx (ALSO client now!)
                                      └── ChildB.tsx (ALSO client now!)
\`\`\`

> 💡 Keep the \`"use client"\` boundary as low in the component tree as possible. Make leaves interactive, not the whole tree.
`,

"90f96f37-df2f-4367-ab3a-c10096bc68d5": `# Client Component in Code — Interactive UI

Real interactive components from DevOverflow.

## Vote Buttons with Optimistic UI

\`\`\`tsx
"use client";
import { useState, useOptimistic } from "react";
import { voteQuestion } from "@/lib/actions/question.action";

interface VotesProps {
  type: "question" | "answer";
  itemId: string;
  userId: string;
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

export default function Votes({
  type, itemId, userId,
  upvotes, downvotes,
  hasUpvoted, hasDownvoted,
}: VotesProps) {
  const [optimisticVotes, addOptimisticVote] = useOptimistic(
    { upvotes, downvotes, hasUpvoted, hasDownvoted },
    (state, direction: "up" | "down") => ({
      ...state,
      upvotes: direction === "up"
        ? state.hasUpvoted ? state.upvotes - 1 : state.upvotes + 1
        : state.upvotes,
      downvotes: direction === "down"
        ? state.hasDownvoted ? state.downvotes - 1 : state.downvotes + 1
        : state.downvotes,
      hasUpvoted: direction === "up" ? !state.hasUpvoted : false,
      hasDownvoted: direction === "down" ? !state.hasDownvoted : false,
    })
  );

  async function handleVote(direction: "up" | "down") {
    addOptimisticVote(direction);
    await voteQuestion({ type, itemId, userId, direction });
  }

  return (
    <div className="flex items-center gap-4">
      <button onClick={() => handleVote("up")}
        className={optimisticVotes.hasUpvoted ? "text-primary-500" : ""}>
        👍 {optimisticVotes.upvotes}
      </button>
      <button onClick={() => handleVote("down")}
        className={optimisticVotes.hasDownvoted ? "text-red-500" : ""}>
        👎 {optimisticVotes.downvotes}
      </button>
    </div>
  );
}
\`\`\`

> 💡 \`useOptimistic\` is a React 19 hook that immediately updates the UI before the server responds — making the app feel instant.
`,

"09c47180-bbbf-468d-9189-75fa6753b7a0": `# Client Component — Hooks in Action

More interactive patterns using React hooks in Next.js.

## Theme Toggle with Context

\`\`\`tsx
"use client";
import { useTheme } from "@/context/ThemeProvider";

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newMode);
  };

  return (
    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-light-800 dark:hover:bg-dark-300">
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}
\`\`\`

## Debounced Search Input

\`\`\`tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push("?" + params.toString(), { scroll: false });
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [query, router, searchParams]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
      className="w-full rounded-lg border bg-light-800 px-4 py-3 dark:bg-dark-300"
    />
  );
}
\`\`\`

> 💡 The debounced search updates the URL query params, which causes the Server Component to re-fetch with the new search term — a clean client/server collaboration.
`,

"acd9458a-1cd7-42fb-89bf-e9afa88d91dc": `# How Server & Client Components Compose

The real power of Next.js is **composing** Server and Client Components together. Understanding the boundary is key.

## The Composition Rule

\`\`\`
✅ Server Component → renders → Client Component (passes data as props)
❌ Client Component → imports → Server Component (breaks!)
✅ Client Component → renders → Server Component (via children prop)
\`\`\`

## Pattern: Server Data → Client Interactivity

\`\`\`tsx
// Server Component (parent) - fetches data
export default async function QuestionPage({ params }: { params: { id: string } }) {
  const question = await getQuestionById(params.id);

  return (
    <article>
      <h1>{question.title}</h1>
      <ParseHTML data={question.content} />

      {/* Pass server data down to client component */}
      <Votes
        upvotes={question.upvotes.length}
        downvotes={question.downvotes.length}
        hasUpvoted={question.upvotes.includes(userId)}
      />
    </article>
  );
}
\`\`\`

## Pattern: Children Prop (Server inside Client)

\`\`\`tsx
// Client Component — provides interactivity wrapper
"use client";
export function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{title}</button>
      {isOpen && children}  {/* Server Component renders here! */}
    </div>
  );
}

// Server Component — uses the Client wrapper
export default async function FAQPage() {
  const faqs = await getFAQs();
  return faqs.map((faq) => (
    <Accordion key={faq.id} title={faq.question}>
      <ServerRenderedAnswer answerId={faq.answerId} />
    </Accordion>
  ));
}
\`\`\`

> 💡 The children prop pattern is the most important composition strategy. Client Components don't need to know their children are Server Components.
`,

"e995fd74-9e56-4ea0-aebe-7eaec96a24e6": `# Composition Pattern in Code — Server Inside Client

Real composition patterns from DevOverflow.

## Pattern: Provider Wrapper

\`\`\`tsx
// context/ThemeProvider.tsx — Client Component
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ mode: "light", setMode: (m: string) => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "light";
    setMode(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}  {/* Server Components pass through here */}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
\`\`\`

## Pattern: Interactive Card Wrapper

\`\`\`tsx
// Server Component fetches, Client Component adds interaction
async function QuestionFeed() {
  const questions = await getQuestions();

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q) => (
        // SaveButton is "use client" — only the button is interactive
        <div key={q._id} className="card">
          <h3>{q.title}</h3>  {/* Static HTML from server */}
          <TagList tags={q.tags} />  {/* Also server-rendered */}
          <SaveButton questionId={q._id} isSaved={q.isSaved} />  {/* Client interactive part */}
        </div>
      ))}
    </div>
  );
}
\`\`\`

> 💡 Keep interactive "islands" small. The card content is server-rendered; only the save button needs React on the client.
`,

"92d0afb3-0dd8-4f8a-9f2d-1d8b1de808a6": `# Task: Refactor Client-Heavy Page to Server Components

Move data fetching from client to server for better performance!

## Your Task

Refactor a Client Component that fetches data with useEffect into a Server Component pattern. Identify which parts need interactivity and which can be server-rendered.

> 💡 **Hint:** Only the interactive parts (buttons, inputs, state) need \`"use client"\`. Data display can stay on the server.

## Requirements

- Implement \`separateComponents(componentCode)\` that analyzes a React component and identifies server-renderable vs client-interactive parts
- Given a component with mixed data fetching and interactivity, split it into a server parent and client children
- Return an object with \`{ serverParts: string[], clientParts: string[], proposedStructure: string }\`

## What You'll Practice

- Server vs Client Component analysis
- Component composition patterns
- Performance optimization through component splitting
`,

"b3514756-9247-4acc-81a8-73b208069aae": `# How Data Fetching Patterns Work

Next.js offers multiple data fetching strategies. Choosing the right one affects performance and user experience.

## Strategy 1: Server Component Direct Fetch

\`\`\`tsx
// Simplest pattern — fetch in the component
export default async function QuestionsPage() {
  const questions = await db.question.find().sort({ createdAt: -1 });
  return <QuestionList questions={questions} />;
}
\`\`\`

## Strategy 2: Parallel Data Fetching

\`\`\`tsx
export default async function DashboardPage() {
  // Fetch in parallel — don't await sequentially!
  const [questions, users, tags] = await Promise.all([
    getQuestions(),
    getTopUsers(),
    getPopularTags(),
  ]);

  return (
    <>
      <QuestionFeed questions={questions} />
      <TopContributors users={users} />
      <TrendingTags tags={tags} />
    </>
  );
}
\`\`\`

## Strategy 3: Streaming with Suspense

\`\`\`tsx
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      {/* Renders immediately */}
      <Suspense fallback={<QuestionsSkeleton />}>
        <QuestionFeed />  {/* Streams when data is ready */}
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <RightSidebar />  {/* Streams independently */}
      </Suspense>
    </>
  );
}
\`\`\`

## Strategy Comparison

| Strategy | When to Use | Trade-off |
|---|---|---|
| Direct fetch | Simple pages | Blocks entire page |
| Promise.all | Multiple independent fetches | Waits for slowest |
| Suspense streaming | Complex pages | More granular loading |
| Client fetch | User-triggered actions | Needs loading states |

> 💡 Streaming with Suspense gives the best user experience — parts of the page appear as their data arrives, without blocking the rest.
`,

"aeb6d648-8b4d-4beb-9da9-c331165cf6bc": `# Data Fetching Patterns in Code

Production data fetching patterns for DevOverflow.

## Sequential vs Parallel Fetching

\`\`\`tsx
// ❌ BAD: Sequential — each fetch waits for the previous one
async function SlowDashboard() {
  const questions = await getQuestions();    // 200ms
  const users = await getTopUsers();         // 150ms
  const tags = await getPopularTags();       // 100ms
  // Total: 450ms (sequential)

  return <Dashboard questions={questions} users={users} tags={tags} />;
}

// ✅ GOOD: Parallel — all fetches start at once
async function FastDashboard() {
  const [questions, users, tags] = await Promise.all([
    getQuestions(),    // 200ms ─┐
    getTopUsers(),     // 150ms ─┤ run simultaneously
    getPopularTags(),  // 100ms ─┘
  ]);
  // Total: 200ms (parallel, limited by slowest)

  return <Dashboard questions={questions} users={users} tags={tags} />;
}
\`\`\`

## Streaming with Per-Section Loading

\`\`\`tsx
// app/(root)/page.tsx — Home page with streaming
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; page?: string };
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex-between">
        <h1 className="h1-bold">All Questions</h1>
        <Link href="/ask-question" className="primary-gradient btn">
          Ask a Question
        </Link>
      </div>

      <SearchInput route="/" />
      <FilterTabs />

      <Suspense
        key={JSON.stringify(searchParams)}
        fallback={<QuestionCardSkeleton count={5} />}
      >
        <QuestionFeed searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <PaginationBar searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
\`\`\`

> 💡 Using \`key={JSON.stringify(searchParams)}\` on the Suspense boundary forces a new loading state when filters change.
`,

"aabec88e-4302-4086-b7c9-42b52e865406": `# Task: Add Streaming to the Home Page

Implement a streaming data loading system!

## Your Task

Build a data streaming coordinator that manages multiple async data sources, emitting results as they arrive rather than waiting for all to complete.

> 💡 **Hint:** This mirrors how React Suspense streaming works — each data source resolves independently.

## Requirements

- Implement \`createStream(fetchers)\` that accepts an array of named async fetchers
- Each fetcher resolves independently and emits its result via a callback
- Return results in arrival order, not definition order
- Track status per source: \`loading\`, \`success\`, \`error\`
- Implement a \`getSnapshot()\` method that returns current state of all sources

## What You'll Practice

- Async coordination patterns
- Streaming vs waterfall data loading
- React Suspense mental model
`,

// ── Module 4: Styling & Theming ──
"2af2053c-6524-43ae-bb15-00bf3824653a": `# How Tailwind CSS Works in Next.js

Tailwind CSS is the recommended styling approach for Next.js applications. It's a utility-first CSS framework that generates only the CSS you use.

## How Tailwind Works

Instead of writing CSS classes and then styling them, you apply utility classes directly in your markup:

\`\`\`tsx
// Traditional CSS approach
<div className="card">
  <h2 className="card-title">Hello</h2>
</div>

// Tailwind approach — styles are in the markup
<div className="rounded-xl border bg-white p-6 shadow-md dark:bg-dark-300">
  <h2 className="text-xl font-bold text-dark-100 dark:text-light-900">Hello</h2>
</div>
\`\`\`

## Key Utility Categories

| Category | Examples | Purpose |
|---|---|---|
| Spacing | \`p-4\`, \`mx-auto\`, \`gap-6\` | Padding, margin, gaps |
| Typography | \`text-lg\`, \`font-bold\`, \`leading-6\` | Font size, weight, line height |
| Colors | \`text-primary-500\`, \`bg-dark-200\` | Text and background colors |
| Layout | \`flex\`, \`grid\`, \`grid-cols-3\` | Flexbox and Grid |
| Responsive | \`sm:\`, \`md:\`, \`lg:\`, \`xl:\` | Breakpoint prefixes |
| Dark mode | \`dark:bg-dark-300\` | Dark mode variants |

## Responsive Design

\`\`\`tsx
{/* Mobile first — styles apply at each breakpoint and up */}
<div className="
  flex flex-col        {/* Mobile: stack vertically */}
  sm:flex-row          {/* 640px+: side by side */}
  lg:gap-8             {/* 1024px+: more spacing */}
">
\`\`\`

> 💡 Tailwind purges unused styles in production, so your final CSS bundle is tiny — typically under 10KB gzipped.
`,

"44c9745d-a674-4523-9847-dc51644a2534": `# Tailwind in Code — Responsive QuestionCard

A fully responsive QuestionCard component using Tailwind.

## QuestionCard Component

\`\`\`tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface QuestionCardProps {
  question: {
    _id: string;
    title: string;
    tags: { _id: string; name: string }[];
    author: { _id: string; name: string; picture: string };
    upvotes: string[];
    answers: object[];
    views: number;
    createdAt: Date;
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="
      card-wrapper
      rounded-xl p-9
      sm:px-11
    ">
      {/* Timestamp — visible only on mobile */}
      <span className="subtle-regular text-dark400_light700 line-clamp-1 sm:hidden">
        {formatDistanceToNow(question.createdAt)} ago
      </span>

      {/* Title */}
      <Link href={\`/question/\${question._id}\`}>
        <h3 className="
          sm:h3-semibold base-semibold
          text-dark200_light900
          line-clamp-1
        ">
          {question.title}
        </h3>
      </Link>

      {/* Tags */}
      <div className="mt-3.5 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <Link
            key={tag._id}
            href={\`/tags/\${tag.name}\`}
            className="
              subtle-medium
              rounded-md
              bg-light-800 px-4 py-2
              uppercase
              text-light-400
              dark:bg-dark-300 dark:text-light-500
            "
          >
            {tag.name}
          </Link>
        ))}
      </div>

      {/* Metrics row */}
      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <img src={question.author.picture} className="size-5 rounded-full" />
          <p className="body-medium text-dark400_light700">
            {question.author.name}
            <span className="max-sm:hidden"> • asked {formatDistanceToNow(question.createdAt)} ago</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Metric icon="👍" value={question.upvotes.length} label="Votes" />
          <Metric icon="💬" value={question.answers.length} label="Answers" />
          <Metric icon="👁" value={question.views} label="Views" />
        </div>
      </div>
    </div>
  );
}
\`\`\`

> 💡 Notice mobile-first responsive design: base styles for mobile, \`sm:\` for tablets, \`lg:\` for desktops. The timestamp visibility toggles between mobile and desktop via \`sm:hidden\`.
`,

"ba3f6567-49db-4578-851e-3d00bd5342cd": `# How Dark Mode & Theming Work

Dark mode in Next.js with Tailwind uses a class-based approach — toggle the \`dark\` class on the HTML element.

## How It Works

1. Set \`darkMode: ["class"]\` in Tailwind config
2. Add \`dark:\` variants to your styles
3. Toggle the \`dark\` class on \`<html>\`

\`\`\`tsx
// Any element with dark: prefix
<div className="bg-white dark:bg-dark-300 text-black dark:text-white">
  This adapts to the theme
</div>
\`\`\`

## CSS Variables for Custom Themes

\`\`\`css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --primary: 24 100% 50%;
  --card: 0 0% 100%;
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --primary: 24 100% 50%;
  --card: 224 50% 8%;
}
\`\`\`

## System Preference Detection

\`\`\`tsx
"use client";
import { useEffect, useState } from "react";

function useSystemTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check saved preference first
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved as "light" | "dark");
      return;
    }
    // Fall back to system preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return theme;
}
\`\`\`

> 💡 Store the user's choice in \`localStorage\` so it persists across sessions. Use system preference as the default for first-time visitors.
`,

"b791009b-aed2-445f-a1e9-0bd0879e4a50": `# Dark Mode in Code — Full Implementation

Complete dark mode implementation for DevOverflow.

## Theme Provider

\`\`\`tsx
// context/ThemeProvider.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  mode: string;
  setMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "system";
    setMode(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(theme: string) {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }

  function handleSetMode(newMode: string) {
    setMode(newMode);
    applyTheme(newMode);
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
\`\`\`

## Theme Menu

\`\`\`tsx
"use client";
import { useTheme } from "@/context/ThemeProvider";
import { themes } from "@/constants";

const themes = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" },
];

export default function ThemeMenu() {
  const { mode, setMode } = useTheme();

  return (
    <div className="absolute right-0 mt-2 rounded-lg border bg-light-900 p-4 shadow-lg dark:border-dark-400 dark:bg-dark-300">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setMode(t.value)}
          className={"flex items-center gap-3 rounded-lg px-4 py-2 w-full " +
            (mode === t.value ? "bg-primary-500 text-white" : "hover:bg-light-800 dark:hover:bg-dark-400")}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
\`\`\`

> 💡 The three-way toggle (light/dark/system) is the gold standard UX. "System" respects the OS setting and changes automatically.
`,

"b4896187-048c-43fd-af61-e10f1f12dda3": `# How shadcn/ui Works

**shadcn/ui** is not a component library you install — it's a collection of beautifully designed, copy-paste components built on Radix UI and Tailwind CSS.

## Key Differences from Traditional UI Libraries

| Traditional Library | shadcn/ui |
|---|---|
| Install as npm package | Copy components into your project |
| Limited customization | Full control over source code |
| Version lock-in | No dependency — it's YOUR code |
| Black box | Every line visible and editable |

## How to Add Components

\`\`\`bash
# Initialize shadcn/ui in your project
npx shadcn-ui@latest init

# Add individual components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
\`\`\`

## What Gets Generated

\`\`\`
components/
└── ui/
    ├── button.tsx       # Fully customizable button
    ├── dialog.tsx       # Accessible modal dialog
    ├── dropdown-menu.tsx # Accessible dropdown
    ├── form.tsx         # React Hook Form integration
    ├── input.tsx        # Styled input field
    ├── tabs.tsx         # Accessible tabs
    └── toast.tsx        # Toast notifications
\`\`\`

Each component uses **Radix UI** primitives for accessibility (keyboard nav, screen readers, focus management) and **Tailwind** for styling.

> 💡 Because you own the component code, you can customize every aspect without fighting a library's API. Change colors, sizes, variants, animations — it's all in your project.
`,

"c8273b56-d45e-4207-8eef-416ee06cc422": `# shadcn/ui in Code — Installing & Customizing

Setting up and customizing shadcn/ui for DevOverflow.

## Installation & Configuration

\`\`\`json
// components.json — shadcn/ui config
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
\`\`\`

## Customizing the Button Component

\`\`\`tsx
// components/ui/button.tsx (customized for DevOverflow)
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "primary-gradient text-light-900 hover:opacity-90",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-light-700 bg-transparent hover:bg-light-800 dark:border-dark-400 dark:hover:bg-dark-300",
        secondary: "bg-light-800 text-dark-400 hover:bg-light-700 dark:bg-dark-400 dark:text-light-800",
        ghost: "hover:bg-light-800 dark:hover:bg-dark-300",
        link: "text-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
\`\`\`

## Using shadcn/ui with Forms

\`\`\`tsx
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input placeholder="your@email.com" {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full">Sign In</Button>
      </form>
    </Form>
  );
}
\`\`\`

> 💡 The \`cva\` (class-variance-authority) library creates type-safe component variants. Every variant combination is Tailwind-powered.
`,

"9c0f972e-1295-4a9a-96e0-a63d127b538f": `# Global Styles & CSS Variables in Code

Setting up the global styles system for DevOverflow.

## Global CSS Variables

\`\`\`css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --primary: 24 100% 50%;
    --muted: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;
    --border: 214.3 31.8% 91.4%;
    --ring: 24 100% 50%;
  }

  .dark {
    --background: 222 47% 5%;
    --foreground: 210 40% 98%;
    --primary: 24 100% 50%;
    --muted: 217.2 32.6% 17.5%;
    --accent: 217.2 32.6% 17.5%;
    --destructive: 0 62.8% 30.6%;
    --border: 217.2 32.6% 17.5%;
    --ring: 24 100% 55%;
  }
}

@layer utilities {
  .flex-center {
    @apply flex items-center justify-center;
  }

  .flex-between {
    @apply flex items-center justify-between;
  }

  .card-wrapper {
    @apply bg-light-900 dark:bg-dark-200
      shadow-light-100 dark:shadow-dark-100
      border border-light-700/50 dark:border-dark-400/50;
  }

  .primary-gradient {
    background: linear-gradient(129deg, #FF7000 0%, #E2995F 100%);
  }

  .h1-bold {
    @apply text-[30px] font-bold leading-[42px] tracking-tighter;
  }

  .h2-semibold {
    @apply text-[24px] font-semibold leading-[31.2px];
  }

  .body-regular {
    @apply text-[14px] font-normal leading-[19.6px];
  }
}
\`\`\`

> 💡 Custom utility classes like \`flex-center\`, \`card-wrapper\`, and \`primary-gradient\` reduce repetition while keeping styles composable with other Tailwind utilities.
`,

"a15c688d-67ad-455e-9a24-db6456d9b9e8": `# Task: Build the DevOverflow Theme System

Create a complete theme system with CSS variables and dark mode support!

## Your Task

Build a theme engine that manages CSS variable-based theming. Given a theme definition, generate the correct CSS variable values and handle theme switching.

> 💡 **Hint:** CSS variables use HSL format for easier manipulation. Convert hex colors to HSL.

## Requirements

- Implement \`createTheme(definition)\` that generates CSS variable objects for light and dark modes
- Implement \`hexToHSL(hex)\` that converts hex colors to HSL format
- Implement \`getActiveTheme(mode, themes)\` that returns the correct variable set
- Support "system" mode that detects OS preference

## What You'll Practice

- CSS custom properties (variables)
- Color space conversions
- Theme system architecture
`,

"a5a4d67c-d8f8-4241-9a46-3a7076cc87f3": `# Task: Style the 3-Column Home Layout

Build a responsive 3-column layout system!

## Your Task

Create a responsive layout calculator that determines column widths based on the viewport size and layout configuration.

> 💡 **Hint:** DevOverflow uses a left sidebar (264px), main content (flexible), and right sidebar (350px) — but on mobile, sidebars collapse.

## Requirements

- Implement \`calculateLayout(viewportWidth, config)\` that returns widths for each column
- Handle breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- On mobile: single column, sidebars hidden
- On tablet: main + right sidebar, left sidebar hidden
- On desktop: all three columns visible
- Return \`{ leftSidebar, mainContent, rightSidebar, visibleColumns }\`

## What You'll Practice

- Responsive layout algorithms
- CSS Grid/Flexbox mental model
- Breakpoint-based calculations
`,

// ── Module 5: Authentication ──
"f26db201-cc43-4fac-ab28-f44198832948": `# How OAuth 2.0 Works

OAuth 2.0 is the standard protocol for secure third-party authentication — "Sign in with Google/GitHub."

## The OAuth Flow

\`\`\`
1. User clicks "Sign in with GitHub"
2. App redirects to GitHub's authorization page
3. User grants permission on GitHub
4. GitHub redirects back with an authorization code
5. App exchanges code for an access token (server-side)
6. App uses token to fetch user profile from GitHub
7. App creates/updates user in database and sets session
\`\`\`

## Why OAuth Instead of Bare Passwords?

| Aspect | OAuth | Password-Based |
|---|---|---|
| Security | Provider handles security | You handle hashing, salting, etc. |
| UX | One-click sign in | Fill out forms, verify email |
| Trust | Users trust GitHub/Google | Users must trust YOUR security |
| Maintenance | Provider manages resets | You build password reset flow |

## OAuth Scopes

\`\`\`
// Common GitHub OAuth scopes
scope: "read:user user:email"

// What each scope grants:
read:user   → Name, avatar, bio
user:email  → Email address
repo        → Repository access (not needed for auth)
\`\`\`

## Token Types

| Token | Purpose | Lifetime |
|---|---|---|
| Authorization Code | One-time exchange for access token | ~10 minutes |
| Access Token | API calls to provider | ~1 hour |
| Refresh Token | Get new access tokens | ~30 days |
| Session Token | Identify the user in YOUR app | Configurable |

> 💡 Never store access tokens in localStorage — use HTTP-only cookies or server-side sessions for security.
`,

"825c6f33-15bd-42ce-aeae-02e4f6181cbb": `# NextAuth.js Setup in Code

Setting up authentication with NextAuth.js (Auth.js) for DevOverflow.

## Installation & Configuration

\`\`\`tsx
// auth.ts — Root auth configuration
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { signInSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = await signInSchema.parseAsync(credentials);
        const user = await User.findOne({ email });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
});
\`\`\`

## Environment Variables

\`\`\`bash
# .env.local
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
\`\`\`

> 💡 The \`MongoDBAdapter\` automatically creates \`users\`, \`accounts\`, \`sessions\` collections. The JWT strategy means sessions are stored in cookies, not the database.
`,

"58f5beb9-8b16-4e19-8106-32ce18b26c11": `# NextAuth API Route Handler in Code

The API route handler connects NextAuth to your Next.js app.

## Route Handler Setup

\`\`\`tsx
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
\`\`\`

That's it! This catch-all route handles:
- \`GET /api/auth/signin\` — Sign in page
- \`GET /api/auth/signout\` — Sign out
- \`POST /api/auth/callback/github\` — OAuth callback
- \`GET /api/auth/session\` — Session data
- \`POST /api/auth/csrf\` — CSRF token

## Using Auth in Server Components

\`\`\`tsx
// Any Server Component
import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <img src={session.user.image} alt="avatar" />
      <p>{session.user.email}</p>
    </div>
  );
}
\`\`\`

## Using Auth in Client Components

\`\`\`tsx
"use client";
import { useSession } from "next-auth/react";

export default function NavProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Skeleton className="h-9 w-9 rounded-full" />;
  if (!session) return <Link href="/sign-in">Sign In</Link>;

  return (
    <div className="flex items-center gap-2">
      <img src={session.user.image} className="size-9 rounded-full" />
      <span>{session.user.name}</span>
    </div>
  );
}
\`\`\`

> 💡 Use \`auth()\` in Server Components (no hook needed). Use \`useSession()\` in Client Components (requires \`SessionProvider\` wrapper).
`,

"b471ce03-d5f4-4d48-aa65-61e569b6c2c7": `# Task: Add Social Login to DevOverflow

Build an OAuth authentication flow simulator!

## Your Task

Create functions that simulate the OAuth 2.0 authorization code flow — the same pattern used by NextAuth.js under the hood.

> 💡 **Hint:** The flow is: generate auth URL → exchange code for token → fetch user profile.

## Requirements

- Implement \`generateAuthURL(provider, clientId, redirectUri, scopes)\` that builds a proper OAuth authorization URL
- Implement \`exchangeCodeForToken(code, clientId, clientSecret)\` that returns an access token object
- Implement \`fetchUserProfile(provider, accessToken)\` that returns a normalized user object
- Handle multiple providers (GitHub, Google) with different API endpoints

## What You'll Practice

- OAuth 2.0 authorization code flow
- URL construction with query parameters
- Token exchange patterns
`,

"0e33376b-3a68-4470-a240-0ec6605f5dc0": `# How Credentials Auth Works

Besides OAuth, DevOverflow supports email/password authentication for users who prefer it.

## Registration Flow

\`\`\`
1. User fills sign-up form (name, email, password)
2. Validate input with Zod schema
3. Check if email already exists
4. Hash the password with bcrypt
5. Create user in database
6. Sign in and redirect to home
\`\`\`

## Password Security

\`\`\`typescript
import bcrypt from "bcryptjs";

// Hashing (registration)
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(plainPassword, salt);
// Store hashedPassword in database

// Verification (login)
const isValid = await bcrypt.compare(enteredPassword, hashedPassword);
\`\`\`

### Why bcrypt?

- **Salted** — each password gets a unique random salt
- **Slow by design** — 12 rounds of hashing makes brute-force impractical
- **Adaptive** — increase rounds as hardware gets faster

## Zod Validation Schema

\`\`\`typescript
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
\`\`\`

> 💡 Never store plain-text passwords. Always hash with a strong algorithm like bcrypt or argon2.
`,

"360f1384-e9bc-489b-be73-95edb680f418": `# Credentials Auth in Code — Sign Up & Sign In

Complete credentials authentication implementation for DevOverflow.

## Sign Up Server Action

\`\`\`tsx
"use server";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/validations";
import User from "@/database/user.model";
import { signIn } from "@/auth";

export async function signUpWithCredentials(formData: {
  name: string;
  email: string;
  password: string;
}) {
  // 1. Validate input
  const { name, email, password } = signUpSchema.parse(formData);

  // 2. Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 4. Create user
  await User.create({
    name,
    email,
    password: hashedPassword,
    joinedAt: new Date(),
  });

  // 5. Auto sign-in after registration
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/",
  });
}
\`\`\`

## Sign In Form (Client Component)

\`\`\`tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/lib/validations";

export default function SignInForm() {
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      toast({ title: "Invalid credentials", variant: "destructive" });
    } else {
      router.push("/");
    }
  }

  // ... form JSX with Input components
}
\`\`\`

> 💡 The \`redirect: false\` option in \`signIn\` prevents automatic redirect, letting you handle errors in the UI before navigating.
`,

"3b733c00-6aa0-4602-aa1e-3afa0e02f2cd": `# Task: Build Sign Up & Sign In Pages

Create a complete authentication form validation system!

## Your Task

Build the form validation and auth flow logic used for signup and signin pages.

> 💡 **Hint:** Use schema-based validation that returns field-level errors.

## Requirements

- Implement \`validateSignUp(data)\` that validates name, email, and password with rules: name min 2 chars, valid email, password min 8 chars with uppercase and number
- Implement \`validateSignIn(data)\` that validates email and password (present)
- Implement \`hashPassword(plain)\` that simulates bcrypt-style hashing (prefix with hash marker + salt)
- Implement \`verifyPassword(plain, hashed)\` that verifies the hash
- Return \`{ success: true }\` or \`{ success: false, errors: { field: message } }\`

## What You'll Practice

- Form validation patterns
- Password hashing concepts
- Auth flow logic
`,

"f9fa9a2b-8aaf-4f25-bec8-62cffbfdbd4a": `# How Route Protection Works

Protecting routes ensures only authenticated (or authorized) users can access certain pages.

## Middleware-Based Protection

\`\`\`tsx
// middleware.ts (in project root)
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/sign-");
  const isProtected = ["/ask-question", "/profile", "/collection"].some(
    (path) => req.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/sign-in", req.nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
\`\`\`

## Component-Level Protection

\`\`\`tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AskQuestionPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return <QuestionForm userId={session.user.id} />;
}
\`\`\`

> 💡 Middleware runs on the Edge and is the fastest way to protect routes. It runs before the page even starts rendering.
`,

"b17535f6-65af-466b-a04f-ec0d4a71ed84": `# Route Protection in Code

Complete route protection patterns for DevOverflow.

## Auth Middleware

\`\`\`tsx
// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/ask-question",
  "/profile/edit",
  "/collection",
];

const authRoutes = ["/sign-in", "/sign-up"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Check protected routes
  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.nextUrl);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect logged-in users from auth pages
  if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
});
\`\`\`

## Conditional UI Based on Auth

\`\`\`tsx
// Server Component — conditional rendering
import { auth } from "@/auth";

export default async function QuestionDetail({ question }) {
  const session = await auth();
  const isAuthor = session?.user?.id === question.author._id;

  return (
    <article>
      <h1>{question.title}</h1>
      {isAuthor && (
        <div className="flex gap-2">
          <Link href={\`/question/\${question._id}/edit\`}>Edit</Link>
          <DeleteButton questionId={question._id} />
        </div>
      )}
    </article>
  );
}
\`\`\`

> 💡 The \`callbackUrl\` search param remembers where the user was trying to go, so after login they get redirected back to the right page.
`,

"4d1c0346-a0c1-4165-afe6-d606d889ac35": `# Profile Menu with Auth State in Code

Building the navbar profile menu that adapts to authentication state.

## Profile Dropdown

\`\`\`tsx
"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function ProfileMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return <div className="size-9 animate-pulse rounded-full bg-light-700 dark:bg-dark-400" />;
  }

  if (!session) {
    return (
      <div className="flex gap-3">
        <Link href="/sign-in" className="btn small-medium bg-light-800 dark:bg-dark-300">
          Log In
        </Link>
        <Link href="/sign-up" className="btn small-medium primary-gradient text-light-900">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Image
          src={session.user.image || "/assets/icons/avatar.svg"}
          alt="profile"
          width={36}
          height={36}
          className="rounded-full"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-light-900 p-4 shadow-lg dark:bg-dark-300">
          <p className="font-semibold">{session.user.name}</p>
          <p className="text-sm text-light-400">{session.user.email}</p>
          <hr className="my-3" />
          <Link href={\`/profile/\${session.user.id}\`} className="block py-2 hover:text-primary-500">
            My Profile
          </Link>
          <Link href="/collection" className="block py-2 hover:text-primary-500">
            My Collection
          </Link>
          <button onClick={() => signOut()} className="mt-2 w-full rounded-lg bg-red-500/10 py-2 text-red-500">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
\`\`\`

> 💡 Three different states (loading, unauthenticated, authenticated) create a smooth UX. Users never see a jarring layout shift.
`,

"aed28b26-4964-4f6f-899c-2e3981fecad1": `# Task: Protect DevOverflow Routes

Build a route protection system!

## Your Task

Create a middleware-style route protection system that checks authentication and authorization before allowing access.

> 💡 **Hint:** Check routes against a configuration of protected paths and their required roles.

## Requirements

- Implement \`checkAccess(path, user, routeConfig)\` that determines if a user can access a route
- Support route patterns: exact match (\`/profile/edit\`), prefix match (\`/admin/*\`), and dynamic (\`/question/:id/edit\`)
- Support role-based access: admin-only, authenticated, owner-only
- Return \`{ allowed: true }\` or \`{ allowed: false, redirect: "/sign-in", reason: "..." }\`
- Handle the callbackUrl pattern for post-login redirect

## What You'll Practice

- Route matching and pattern matching
- Role-based access control
- Middleware patterns
`,

// ── Module 6: Database & Server Actions ──
"93899d47-e6e1-42d9-ae4a-169dc7f1db32": `# How MongoDB & Mongoose Work

MongoDB is a NoSQL document database. Mongoose is the most popular ODM (Object Document Mapper) for MongoDB in Node.js.

## MongoDB vs SQL

| Concept | SQL (PostgreSQL) | NoSQL (MongoDB) |
|---|---|---|
| Storage unit | Row in table | Document in collection |
| Schema | Fixed, defined upfront | Flexible, per-document |
| Relationships | JOINs | Embed or Reference |
| Query | SQL language | JavaScript-like queries |
| Scaling | Vertical (bigger server) | Horizontal (more servers) |

## Document Structure

\`\`\`json
{
  "_id": "ObjectId('abc123')",
  "title": "How to use useEffect?",
  "content": "I'm trying to understand...",
  "tags": [
    { "_id": "tag1", "name": "react" },
    { "_id": "tag2", "name": "hooks" }
  ],
  "author": "ObjectId('user456')",
  "upvotes": ["user789", "user012"],
  "views": 42,
  "createdAt": "2024-01-15T10:30:00Z"
}
\`\`\`

## Embedding vs Referencing

| Strategy | When to Use | Example |
|---|---|---|
| **Embed** | Data always accessed together | Tags inside Question |
| **Reference** | Data accessed independently | Author → User ID |
| **Hybrid** | Performance matters | Embed name+avatar, reference full profile |

> 💡 MongoDB is schema-less, but Mongoose adds schemas — giving you the flexibility of NoSQL with the safety of defined types.
`,

"6620f191-fb22-4d2d-a48d-76467b802f86": `# MongoDB Connection Pattern in Code

The connection pattern ensures you don't create multiple database connections in development.

## Singleton Connection

\`\`\`tsx
// lib/mongoose.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not set");
  }

  if (isConnected) {
    console.log("=> Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devoverflow",
    });
    isConnected = true;
    console.log("=> MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
\`\`\`

## Why the Singleton Pattern?

In development, Next.js hot-reloads modules — without a singleton check, every reload would create a new MongoDB connection, quickly exhausting the connection pool.

## Usage in Server Actions

\`\`\`tsx
"use server";
import { connectToDatabase } from "@/lib/mongoose";
import Question from "@/database/question.model";

export async function getQuestions() {
  await connectToDatabase();  // Ensures connection before query

  const questions = await Question.find()
    .populate("author", "name picture")
    .populate("tags", "name")
    .sort({ createdAt: -1 });

  return questions;
}
\`\`\`

> 💡 Always call \`connectToDatabase()\` at the start of every server action that touches the database. The singleton check makes this cheap.
`,

"02f517b6-48f7-4657-af5b-a45a1382db02": `# Mongoose Schemas in Code — All Models

Complete Mongoose schemas for the DevOverflow data models.

## Question Model

\`\`\`tsx
// database/question.model.ts
import { Schema, models, model, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  content: string;
  tags: Schema.Types.ObjectId[];
  author: Schema.Types.ObjectId;
  upvotes: Schema.Types.ObjectId[];
  downvotes: Schema.Types.ObjectId[];
  answers: Schema.Types.ObjectId[];
  views: number;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Question || model<IQuestion>("Question", QuestionSchema);
\`\`\`

## User Model

\`\`\`tsx
// database/user.model.ts
const UserSchema = new Schema({
  clerkId: { type: String },
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  bio: { type: String },
  picture: { type: String },
  location: { type: String },
  portfolioWebsite: { type: String },
  reputation: { type: Number, default: 0 },
  saved: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  joinedAt: { type: Date, default: Date.now },
});
\`\`\`

## Tag Model

\`\`\`tsx
// database/tag.model.ts
const TagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdOn: { type: Date, default: Date.now },
});
\`\`\`

> 💡 The \`models.Question || model(...)\` pattern prevents the "Cannot overwrite model once compiled" error during hot reloads.
`,

"0af37875-b878-4a2d-bca9-7e2a68bd87c0": `# Task: Create All DevOverflow Models

Build a schema validation system for MongoDB-style documents!

## Your Task

Create a document schema validator that enforces types, required fields, defaults, and references — similar to how Mongoose validates documents.

> 💡 **Hint:** Define schemas as objects with field definitions, then validate documents against them.

## Requirements

- Implement \`createSchema(definition)\` that creates a reusable schema validator
- Support field types: String, Number, Boolean, Date, ObjectId, Array
- Support modifiers: required, default, unique, ref
- Implement \`validate(schema, document)\` that checks a document against the schema
- Return \`{ valid: true, document: normalizedDoc }\` or \`{ valid: false, errors: [...] }\`

## What You'll Practice

- Schema validation patterns
- Document database concepts
- Type checking and defaults
`,

"fef9c9ef-c6ce-47c7-91aa-543934aee054": `# How Server Actions Work

Server Actions are **async functions that run exclusively on the server**, called directly from Client or Server Components — no API routes needed.

## What Are Server Actions?

\`\`\`tsx
// Mark with "use server" — can ONLY run on the server
"use server";

export async function createQuestion(data: QuestionInput) {
  await connectToDatabase();

  const question = await Question.create({
    title: data.title,
    content: data.content,
    author: data.userId,
  });

  revalidatePath("/");  // Refresh the home page cache
  return question;
}
\`\`\`

## Server Actions vs API Routes

| Feature | Server Actions | API Routes |
|---|---|---|
| Syntax | Regular async function | Request/Response handler |
| Calling | Direct function call | fetch() request |
| Typing | Fully typed end-to-end | Manual type alignment |
| Caching | \`revalidatePath\` / \`revalidateTag\` | Must manage manually |
| Good for | Mutations (CRUD) | Webhooks, third-party APIs |

## Two Ways to Define

\`\`\`tsx
// 1. In a separate file (recommended for reuse)
// lib/actions/question.action.ts
"use server";
export async function createQuestion(data) { /* ... */ }
export async function deleteQuestion(id) { /* ... */ }

// 2. Inline in a Server Component
export default async function Page() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const title = formData.get("title");
    // ...
  }
  return <form action={handleSubmit}>...</form>;
}
\`\`\`

> 💡 Server Actions are the modern replacement for API routes when doing mutations. They're type-safe, easier to write, and automatically handle CSRF protection.
`,

"80c9aed3-a97e-42e5-9b6d-60a9b3ac359e": `# Server Actions in Code — Simple Example

A complete server action for creating a question with validation and cache invalidation.

## The Server Action

\`\`\`tsx
// lib/actions/question.action.ts
"use server";

import { connectToDatabase } from "@/lib/mongoose";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";

interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
  author: string;
}

export async function createQuestion(params: CreateQuestionParams) {
  await connectToDatabase();

  const { title, content, tags, author } = params;

  // 1. Create the question
  const question = await Question.create({
    title,
    content,
    author,
  });

  // 2. Create or find tags, link them to the question
  const tagDocuments = [];
  for (const tag of tags) {
    const tagDoc = await Tag.findOneAndUpdate(
      { name: { $regex: new RegExp(\`^\${tag}$\`, "i") } },
      {
        $setOnInsert: { name: tag },
        $push: { questions: question._id },
      },
      { upsert: true, new: true }
    );
    tagDocuments.push(tagDoc._id);
  }

  // 3. Link tags back to question
  await Question.findByIdAndUpdate(question._id, {
    $push: { tags: { $each: tagDocuments } },
  });

  // 4. Award reputation to author
  await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

  // 5. Invalidate cached pages
  revalidatePath("/");
}
\`\`\`

## Calling from a Client Component

\`\`\`tsx
"use client";
import { createQuestion } from "@/lib/actions/question.action";

async function onSubmit(values: QuestionInput) {
  await createQuestion({
    title: values.title,
    content: values.content,
    tags: values.tags,
    author: userId,
  });
  router.push("/");
}
\`\`\`

> 💡 \`revalidatePath("/")\` tells Next.js to re-generate the home page so the new question appears immediately for all users.
`,

"f3f5efba-bcd7-4b8d-a580-047d3761dbdf": `# How CRUD Operations Work with Mongoose

CRUD (Create, Read, Update, Delete) operations in Mongoose map directly to MongoDB operations.

## Create

\`\`\`tsx
// Create a single document
const question = await Question.create({
  title: "How to use useEffect?",
  content: "I'm confused about...",
  author: userId,
});

// Create multiple documents
const tags = await Tag.insertMany([
  { name: "react" },
  { name: "hooks" },
  { name: "javascript" },
]);
\`\`\`

## Read

\`\`\`tsx
// Find all with filters, sorting, and pagination
const questions = await Question.find({ tags: tagId })
  .populate("author", "name picture")  // Join author data
  .populate("tags", "name")             // Join tag data
  .sort({ createdAt: -1 })              // Newest first
  .skip((page - 1) * pageSize)          // Pagination offset
  .limit(pageSize);                     // Page size

// Find one by ID
const question = await Question.findById(questionId)
  .populate({ path: "author", select: "name picture reputation" });

// Count for pagination
const totalQuestions = await Question.countDocuments({ tags: tagId });
\`\`\`

## Update

\`\`\`tsx
// Update and return the updated document
const updated = await Question.findByIdAndUpdate(
  questionId,
  { $set: { title: "Updated title" } },
  { new: true }  // Return updated doc, not original
);

// Atomic operations
await Question.findByIdAndUpdate(questionId, {
  $inc: { views: 1 },                    // Increment views
  $push: { upvotes: userId },            // Add to array
  $pull: { downvotes: userId },          // Remove from array
  $addToSet: { tags: newTagId },         // Add if not present
});
\`\`\`

## Delete

\`\`\`tsx
await Question.findByIdAndDelete(questionId);
// Also clean up related data
await Answer.deleteMany({ question: questionId });
await Tag.updateMany(
  { questions: questionId },
  { $pull: { questions: questionId } }
);
\`\`\`

> 💡 Use atomic operations (\`$inc\`, \`$push\`, \`$pull\`) instead of read-modify-write to avoid race conditions.
`,

"d1bee2ec-5e5d-4b9e-a284-028087b0b16d": `# CRUD Server Actions in Code — Full Implementation

Complete CRUD operations for DevOverflow questions.

## Get Questions with Filtering & Sorting

\`\`\`tsx
"use server";

interface GetQuestionsParams {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  filter?: string;
}

export async function getQuestions(params: GetQuestionsParams) {
  await connectToDatabase();

  const { page = 1, pageSize = 10, searchQuery, filter } = params;

  // Build query
  const query: any = {};
  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { content: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Build sort
  let sortBy: any = {};
  switch (filter) {
    case "newest": sortBy = { createdAt: -1 }; break;
    case "frequent": sortBy = { views: -1 }; break;
    case "unanswered": query.answers = { $size: 0 }; break;
    default: sortBy = { createdAt: -1 };
  }

  const [questions, totalCount] = await Promise.all([
    Question.find(query)
      .populate("author", "name picture")
      .populate("tags", "name")
      .sort(sortBy)
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Question.countDocuments(query),
  ]);

  const hasMore = totalCount > page * pageSize;
  return { questions, totalCount, hasMore };
}
\`\`\`

## Delete Question with Cleanup

\`\`\`tsx
"use server";
export async function deleteQuestion(params: { questionId: string; path: string }) {
  await connectToDatabase();
  const { questionId, path } = params;

  await Question.deleteOne({ _id: questionId });
  await Answer.deleteMany({ question: questionId });
  await Interaction.deleteMany({ question: questionId });
  await Tag.updateMany(
    { questions: questionId },
    { $pull: { questions: questionId } }
  );

  revalidatePath(path);
}
\`\`\`

> 💡 Always clean up related documents when deleting. Use \`Promise.all\` for parallel cleanup where operations are independent.
`,

"4e7838ba-df6e-496f-ac35-d5db2450f881": `# Task: Build Question CRUD Actions

Implement a complete CRUD data layer with filtering and pagination!

## Your Task

Create a data access layer that handles Create, Read, Update, Delete operations with filtering, sorting, and pagination support.

> 💡 **Hint:** Build a query builder pattern that chains filters before executing.

## Requirements

- Implement \`create(collection, data)\` that adds a new document with auto-generated ID and timestamps
- Implement \`findMany(collection, { filter, sort, page, pageSize })\` that returns paginated results
- Implement \`findById(collection, id)\` that returns a single document or null
- Implement \`updateById(collection, id, updates)\` that applies partial updates with updatedAt timestamp
- Implement \`deleteById(collection, id)\` that removes a document and returns boolean
- Support filter operators: \`$eq\`, \`$gt\`, \`$lt\`, \`$regex\`, \`$in\`

## What You'll Practice

- CRUD operation patterns
- Query building with filters
- Pagination and sorting algorithms
`,

"7343cf98-1b71-4563-8e3b-8dac8609f3d1": `# How API Route Handlers Work

While Server Actions handle most mutations, API Route Handlers are needed for webhooks, third-party integrations, and custom APIs.

## Basic Route Handler

\`\`\`tsx
// app/api/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Question from "@/database/question.model";

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const questions = await Question.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    data: questions,
    page,
    totalPages: Math.ceil(await Question.countDocuments() / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate, create, respond...
  return NextResponse.json({ data: question }, { status: 201 });
}
\`\`\`

## Webhook Route Handler

\`\`\`tsx
// app/api/webhooks/clerk/route.ts
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const body = await request.json();

  // Verify webhook signature...
  // Handle event (user.created, user.updated, etc.)

  return NextResponse.json({ received: true });
}
\`\`\`

> 💡 Use Route Handlers for webhooks, CORS-enabled endpoints, and when you need fine-grained control over the HTTP response. Use Server Actions for everything else.
`,

"3939da36-f993-431b-a464-d64b7584de91": `# API Routes & Webhooks in Code

Production API route patterns for DevOverflow.

## RESTful API Route

\`\`\`tsx
// app/api/questions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const question = await Question.findById(params.id)
    .populate("author", "name picture")
    .populate("tags", "name")
    .lean();

  if (!question) {
    return NextResponse.json(
      { error: "Question not found" },
      { status: 404 }
    );
  }

  // Increment views
  await Question.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

  return NextResponse.json({ data: question });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await Question.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true }
  );

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Question.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
\`\`\`

> 💡 Each HTTP method is a named export: \`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`. Next.js routes the request to the right function.
`,

"f0bbb471-33d3-4e03-aee9-8e2bcb1f0dd0": `# Error Handling Pattern in Code

Robust error handling for Server Actions and API routes.

## Custom Error Class

\`\`\`typescript
// lib/errors.ts
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(resource + " not found", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Authentication required", 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
\`\`\`

## Server Action with Error Handling

\`\`\`tsx
"use server";

export async function getQuestionById(id: string) {
  try {
    await connectToDatabase();
    const question = await Question.findById(id)
      .populate("author")
      .populate("tags");

    if (!question) throw new NotFoundError("Question");

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message, code: error.statusCode };
    }
    console.error("Unexpected error:", error);
    return { success: false, error: "Internal server error", code: 500 };
  }
}
\`\`\`

## Client-Side Error Handling

\`\`\`tsx
"use client";
export default function QuestionPage() {
  async function handleDelete() {
    const result = await deleteQuestion(questionId);
    if (!result.success) {
      toast({ title: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Question deleted!" });
    router.push("/");
  }
}
\`\`\`

> 💡 Always return structured results from Server Actions: \`{ success: boolean, data?, error? }\`. Never let unhandled exceptions reach the client.
`,

"ea1c5c4e-2b73-4145-a191-9a68d58a198c": `# Task: Add Error Handling Across the App

Build a robust error handling system!

## Your Task

Create a comprehensive error handling utility that wraps async operations with proper error classification, logging, and user-friendly error messages.

> 💡 **Hint:** Use a Result type pattern (like Rust's Result) that forces callers to handle both success and error cases.

## Requirements

- Implement a \`Result<T>\` type that is either \`{ ok: true, data: T }\` or \`{ ok: false, error: AppError }\`
- Implement \`tryCatch<T>(fn)\` that wraps an async function and returns a Result
- Implement error classification: categorize errors as \`validation\`, \`auth\`, \`notFound\`, \`internal\`
- Implement \`toUserMessage(error)\` that converts technical errors to user-friendly messages
- Handle common error patterns: network timeout, duplicate key, invalid ObjectId

## What You'll Practice

- Error handling best practices
- Result/Either pattern
- Error classification and user messaging
`,
};

async function main() {
  console.log("Updating Ultimate Next.js — Modules 3-6...");
  let count = 0;
  for (const [id, content] of Object.entries(updates)) {
    await p.lesson.update({ where: { id }, data: { content } });
    count++;
    if (count % 10 === 0) console.log("  " + count + " lessons updated...");
  }
  console.log("Done! Updated " + count + " lessons.");
  await p.$disconnect();
}

main().catch(console.error);
