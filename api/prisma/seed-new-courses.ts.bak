import { PrismaClient, ContentType } from "@prisma/client";
import { seedCourse, ModuleInput, LessonInput } from "./seed-helpers";

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════
// Seed new detailed courses — runs standalone, does NOT wipe data
// Usage: cd api && npx tsx prisma/seed-new-courses.ts
// ══════════════════════════════════════════════════════════════

async function main() {
  console.log("🌱 Seeding new courses (additive — no data wipe)...\n");

  // Find admin user to set as course creator
  const admin = await prisma.user.findFirst({
    where: { roles: { some: { role: "admin" } } },
  });
  if (!admin) {
    throw new Error("No admin user found. Run the main seed first: npm run db:seed");
  }
  console.log(`👤 Using admin: ${admin.email}\n`);

  // ══════════════════════════════════════════════════════════════
  // Helper: generate lesson content based on type
  // ══════════════════════════════════════════════════════════════
  function textLesson(title: string, description: string, minutes = 5): LessonInput {
    return {
      title,
      contentType: "text" as ContentType,
      estimatedMinutes: minutes,
      pointsReward: 10,
      content: `# ${title}\n\n${description}\n\n> 📖 This is a short explanation lesson. Full content will be added in Phase 2.`,
    };
  }

  function codeLesson(title: string, description: string, lang = "typescript", minutes = 8): LessonInput {
    return {
      title,
      contentType: "code_example" as ContentType,
      language: lang,
      estimatedMinutes: minutes,
      pointsReward: 10,
      content: `# ${title}\n\n${description}\n\n\`\`\`${lang}\n// Code example — full annotated code coming in Phase 3\n\`\`\``,
    };
  }

  function quizLesson(title: string, description: string): LessonInput {
    return {
      title,
      contentType: "quiz" as ContentType,
      estimatedMinutes: 5,
      pointsReward: 10,
      content: JSON.stringify([
        {
          question: `Placeholder question for: ${title}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "Full quiz content coming in Phase 4.",
        },
      ]),
    };
  }

  function taskLesson(title: string, description: string, xp = 20, lang = "typescript"): LessonInput {
    return {
      title,
      contentType: "coding_challenge" as ContentType,
      language: lang,
      estimatedMinutes: 15,
      pointsReward: xp,
      bonusPoints: 10,
      content: `# ${title}\n\n${description}\n\n> 🛠️ Full starter code, tests, and solution coming in Phase 5.`,
      starterCode: `// TODO: Implement ${title}\n`,
      testCode: `test('placeholder', () => { expect(true).toBe(true); });\n`,
      solutionCode: `// Solution coming soon\n`,
      hints: [
        "Break the problem into smaller steps.",
        "Refer back to the explanation and code example lessons.",
      ],
    };
  }

  // ══════════════════════════════════════════════════════════════
  // COURSE: The Ultimate Next.js Course
  // ══════════════════════════════════════════════════════════════
  const existingNextjs = await prisma.course.findFirst({
    where: { title: "The Ultimate Next.js Course" },
  });

  if (existingNextjs) {
    console.log("⏭️  'The Ultimate Next.js Course' already exists — skipping\n");
  } else {
    await seedCourse(admin.id, {
      title: "The Ultimate Next.js Course",
      description: "Master Next.js by building a full-stack DevOverflow app. Every topic: short explanation, real code example, quiz. Plus hands-on coding challenges.",
      difficulty: "intermediate",
      pointsReward: 300,
    }, [
      // ── Module 1: Getting Started & Project Setup ──
      {
        title: "Getting Started & Project Setup",
        description: "Set up your environment, learn TypeScript essentials, and understand web rendering strategies.",
        lessons: [
          textLesson("Course Overview & What You'll Build", "What DevOverflow is, the tech stack, how lessons work, what to expect"),
          textLesson("How Web Rendering Works — CSR, SSR, SSG, ISR", "Short explanation of each strategy: what happens, when to use, trade-offs"),
          codeLesson("Rendering Strategies in Code", "The same page rendered 4 ways with annotated output differences"),
          quizLesson("Quiz: Web Rendering", "SSR vs CSR, hydration, when to use SSG, ISR revalidation"),
          textLesson("TypeScript Essentials for Next.js", "Types vs interfaces, generics, union types, utility types"),
          codeLesson("TypeScript in Practice — Annotated Examples", "Typing props, API responses, generic components, Partial<T>, Pick<T>, Omit<T>"),
          quizLesson("Quiz: TypeScript Fundamentals", "Type vs interface, generics, type narrowing, utility types"),
          taskLesson("Task: Type the DevOverflow Data Models", "Define TypeScript interfaces for User, Question, Answer, and Tag", 20),
          textLesson("How a Next.js Project Is Structured", "What create-next-app generates, the app/ directory, special files, config files"),
          codeLesson("Project Setup in Code — Every File Explained", "next.config.ts, tsconfig.json, app/layout.tsx, app/page.tsx, tailwind.config.ts"),
          quizLesson("Quiz: Project Structure", "Special files, config options, app/ directory conventions"),
          codeLesson("Configuring Tailwind, ESLint & Path Aliases", "tailwind.config.ts, .eslintrc.json, tsconfig.json paths"),
          taskLesson("Task: Initialize the DevOverflow Project", "Scaffold project, configure TS + Tailwind, create root layout, verify it runs", 20),
        ],
      },
      // ── Module 2: Routing Deep Dive ──
      {
        title: "Routing Deep Dive",
        description: "Master file-system routing, dynamic routes, navigation, and error boundaries.",
        lessons: [
          textLesson("How File-System Routing Works", "Folders = routes, page.tsx = page, layout.tsx = wrapper, nesting rules"),
          codeLesson("Static Routes — page.tsx & layout.tsx in Code", "Creating /, /about, /contact with nested layouts"),
          textLesson("How Dynamic Routes Work", "[id], [...slug], [[...slug]] — what they match, how params flows"),
          codeLesson("Dynamic Routes in Code — 3 Patterns", "Three annotated examples showing [id], [...slug], [[...slug]]"),
          quizLesson("Quiz: Routing Basics", "File naming, layout inheritance, dynamic vs static, params"),
          taskLesson("Task: Build the DevOverflow Route Tree", "Create all routes: home, questions/[id], tags, tags/[id], community, profile/[id]", 20),
          textLesson("How Route Groups & Parallel Routes Work", "(auth) grouping, @modal slots, intercepting routes"),
          codeLesson("Route Groups & Parallel Routes in Code", "Auth layout with (auth)/sign-in/page.tsx, @modal slot"),
          quizLesson("Quiz: Advanced Routing", "Route groups, parallel routes, intercepting routes"),
          textLesson("How Navigation Works in Next.js", "<Link> with prefetching, useRouter(), server-side redirect()"),
          codeLesson("Navigation in Code — Link, useRouter, redirect", "Annotated code for each navigation method + active link component"),
          quizLesson("Quiz: Navigation", "Prefetching, client vs server navigation, active links"),
          taskLesson("Task: Build the Sidebar Navigation", "Left sidebar with icons, active states, mobile drawer", 20),
          textLesson("How Error Boundaries & Loading States Work", "loading.tsx, error.tsx, not-found.tsx, Suspense"),
          codeLesson("Loading, Error & Not Found in Code", "Three complete files: skeleton loader, error boundary, 404 page"),
          taskLesson("Task: Add Loading & Error States", "Add skeleton loaders, error boundaries, not-found pages", 15),
        ],
      },
      // ── Module 3: Server Components & Client Components ──
      {
        title: "Server Components & Client Components",
        description: "Understand the server/client boundary, composition patterns, and data fetching strategies.",
        lessons: [
          textLesson("What Are Server Components?", "What runs where, the mental model, zero JS on client"),
          codeLesson("Server Component in Code — Direct Data Fetching", "Async server component querying DB directly"),
          codeLesson("Server Component — Headers, Cookies & searchParams", "Using headers(), cookies(), and searchParams"),
          quizLesson("Quiz: Server Components", "What you can/can't do, async patterns, zero-JS output"),
          textLesson("What Are Client Components?", "'use client' directive, when you need interactivity"),
          codeLesson("Client Component in Code — Interactive UI", "Vote button with useState, onClick, event handlers"),
          codeLesson("Client Component — Hooks in Action", "Search bar with useSearchParams + useRouter with debounce"),
          quizLesson("Quiz: Client Components", "When to use 'use client', hooks, interactivity rules"),
          textLesson("How Server & Client Components Compose", "The composition pattern, what crosses the boundary"),
          codeLesson("Composition Pattern in Code — Server Inside Client", "Client <Tabs> wrapper receiving server-rendered children"),
          quizLesson("Quiz: Component Boundaries", "Composition rules, serialization, what breaks and why"),
          taskLesson("Task: Refactor Client-Heavy Page to Server Components", "Convert a page with useEffect + useState to server component", 20),
          textLesson("How Data Fetching Patterns Work", "Sequential vs parallel, Promise.all, React cache()"),
          codeLesson("Data Fetching Patterns in Code", "Side-by-side waterfall vs Promise.all + cache() deduplication"),
          taskLesson("Task: Add Streaming to the Home Page", "Wrap slow sections in <Suspense> with skeleton fallbacks", 20),
        ],
      },
      // ── Module 4: Styling & Theming ──
      {
        title: "Styling & Theming",
        description: "Build a theme system with Tailwind CSS, dark mode, and shadcn/ui components.",
        lessons: [
          textLesson("How Tailwind CSS Works in Next.js", "Utility-first approach, responsive breakpoints, dark mode prefix"),
          codeLesson("Tailwind in Code — Responsive QuestionCard", "Responsive card: mobile stack → tablet 2-col → desktop 3-col + cn() utility"),
          quizLesson("Quiz: Tailwind Fundamentals", "Breakpoints, utility classes, customization, cn() utility"),
          textLesson("How Dark Mode & Theming Work", "CSS variables, next-themes, system detection, persistence"),
          codeLesson("Dark Mode in Code — Full Implementation", "ThemeProvider in layout, useTheme() toggle button, CSS variables"),
          quizLesson("Quiz: Dark Mode & Theming", "Theme persistence, CSS variables, system detection"),
          textLesson("How shadcn/ui Works", "Copy-paste components, cva variants, customization approach"),
          codeLesson("shadcn/ui in Code — Installing & Customizing", "Button, Input, Select, Dialog — customized with variants"),
          codeLesson("Global Styles & CSS Variables in Code", "globals.css with custom properties, next/font setup"),
          quizLesson("Quiz: Component Styling Patterns", "shadcn customization, CSS variables, font loading"),
          taskLesson("Task: Build the DevOverflow Theme System", "Full theme: custom Tailwind config, CSS variables, dark mode toggle, shadcn", 25),
          taskLesson("Task: Style the 3-Column Home Layout", "Responsive layout: left sidebar, center feed, right sidebar", 20),
        ],
      },
      // ── Module 5: Authentication ──
      {
        title: "Authentication",
        description: "Implement OAuth, credentials auth, route protection, and session management.",
        lessons: [
          textLesson("How OAuth 2.0 Works", "The OAuth dance: redirect → authorize → callback → session"),
          codeLesson("NextAuth.js Setup in Code", "Complete auth.ts with GitHub + Google providers, callbacks"),
          codeLesson("NextAuth API Route Handler in Code", "app/api/auth/[...nextauth]/route.ts catch-all handler"),
          quizLesson("Quiz: OAuth & NextAuth Basics", "OAuth flow, providers, session vs JWT, callback URLs"),
          taskLesson("Task: Add Social Login to DevOverflow", "Wire up GitHub + Google auth with sign-in/sign-out UI", 25),
          textLesson("How Credentials Auth Works", "Email/password flow, bcrypt hashing, why separate from OAuth"),
          codeLesson("Credentials Auth in Code — Sign Up & Sign In", "Registration: Zod → bcrypt → create user. Login: compare hash → session."),
          quizLesson("Quiz: Credentials Auth", "bcrypt, Zod validation, error handling, session creation"),
          taskLesson("Task: Build Sign Up & Sign In Pages", "Full auth forms with validation, error handling, redirect", 25),
          textLesson("How Route Protection Works", "Middleware matching, auth() on server, useSession() on client"),
          codeLesson("Route Protection in Code", "middleware.ts matching protected paths + session access patterns"),
          codeLesson("Profile Menu with Auth State in Code", "Dropdown: avatar + name when signed in, sign-in button when not"),
          quizLesson("Quiz: Auth in Practice", "Middleware patterns, session access, protected routes"),
          taskLesson("Task: Protect DevOverflow Routes", "Middleware config + redirect logic for protected routes", 20),
          quizLesson("Quiz: Authentication Review", "Comprehensive review of OAuth, credentials, middleware, session"),
        ],
      },
      // ── Module 6: Database & Server Actions ──
      {
        title: "Database & Server Actions",
        description: "Connect MongoDB with Mongoose, implement CRUD server actions, and handle errors.",
        lessons: [
          textLesson("How MongoDB & Mongoose Work", "Document vs relational, schemas, refs, indexes"),
          codeLesson("MongoDB Connection Pattern in Code", "Singleton connection with caching for serverless"),
          codeLesson("Mongoose Schemas in Code — All Models", "Question, User, Answer, Tag schemas with TypeScript interfaces"),
          quizLesson("Quiz: Database Design", "Schema design, refs vs embedding, indexing, connection pooling"),
          taskLesson("Task: Create All DevOverflow Models", "Implement Question, Answer, User, Tag, Interaction schemas", 25),
          textLesson("How Server Actions Work", "'use server' directive, form submission, revalidation, security model"),
          codeLesson("Server Actions in Code — Simple Example", "Form submission → server action → revalidatePath → return value"),
          quizLesson("Quiz: Server Actions Basics", "Security, revalidation, forms vs startTransition"),
          textLesson("How CRUD Operations Work with Mongoose", "Create, Read, Update, Delete patterns with Mongoose"),
          codeLesson("CRUD Server Actions in Code — Full Implementation", "createQuestion(), getQuestions(), updateQuestion(), deleteQuestion()"),
          quizLesson("Quiz: CRUD Operations", "Mongoose queries, population, pagination, Zod validation"),
          taskLesson("Task: Build Question CRUD Actions", "Implement all CRUD server actions with Zod + error handling", 25),
          textLesson("How API Route Handlers Work", "When to use route handlers vs server actions, GET/POST, webhooks"),
          codeLesson("API Routes & Webhooks in Code", "app/api/search/route.ts + app/api/webhooks/route.ts"),
          codeLesson("Error Handling Pattern in Code", "Custom ApiError class, global handler, client-side toast"),
          quizLesson("Quiz: API Routes & Error Handling", "Route handlers, webhooks, error boundaries, toast patterns"),
          taskLesson("Task: Add Error Handling Across the App", "try/catch in server actions, error.tsx pages, toasts", 20),
        ],
      },
      // ── Module 7: Questions & Answers — Building the Core ──
      {
        title: "Questions & Answers — Building the Core",
        description: "Build the full Q&A system: forms, feeds, detail pages, and voting.",
        lessons: [
          textLesson("How Forms Work in Next.js", "React Hook Form + Zod, controlled fields, validation strategy"),
          codeLesson("Form Setup in Code — React Hook Form + Zod", "Complete form with useForm, zodResolver, field registration"),
          codeLesson("Rich Text & Tag Input in Code", "Tiptap editor + custom tag input with autocomplete"),
          quizLesson("Quiz: Forms & Validation", "React Hook Form API, Zod schemas, controlled fields"),
          taskLesson("Task: Build the Ask Question Page", "Full form: title, rich text content, tag input, validation, submission", 25),
          textLesson("How a Server-Rendered Feed Works", "Server component fetching data, URL-based filters, sort tabs"),
          codeLesson("Question Feed in Code — Server Component + Cards", "Home page: fetch questions, sort tabs, QuestionCard component"),
          quizLesson("Quiz: Data Display Patterns", "Server component data flow, URL-based state, card patterns"),
          taskLesson("Task: Build the Home Page Feed", "Question list with sort tabs, QuestionCards, empty state", 25),
          textLesson("How Question Detail Pages Work", "Fetching question by ID, rendering content, answer forms"),
          codeLesson("Question Detail in Code — Full Layout", "Server component: fetch question, render HTML, answer form + list"),
          quizLesson("Quiz: Detail Pages", "Data fetching, HTML rendering, component composition"),
          taskLesson("Task: Build Question Detail & Answers", "Complete detail page with answer form and answer list", 25),
          textLesson("How Optimistic Voting Works", "useOptimistic hook, instant UI update, server action rollback"),
          codeLesson("Voting System in Code — Optimistic UI", "upvoteQuestion()/downvoteQuestion() actions + useOptimistic"),
          taskLesson("Task: Implement Voting System", "Upvote/downvote on questions and answers with optimistic UI", 20),
        ],
      },
      // ── Module 8: AI Integration ──
      {
        title: "AI Integration",
        description: "Add AI-generated answers with streaming responses and rate limiting.",
        lessons: [
          textLesson("How AI APIs Work in Web Apps", "OpenAI API, API key management, streaming vs batch"),
          codeLesson("AI Answer Generator in Code", "Server action: build prompt → call GPT-4 → return response"),
          quizLesson("Quiz: AI API Basics", "API keys, prompt engineering, cost management, security"),
          textLesson("How Streaming Responses Work", "ReadableStream, chunked responses, async iterators"),
          codeLesson("Streaming AI Responses in Code", "Route handler returning ReadableStream + client consuming chunks"),
          codeLesson("'Generate AI Answer' Button in Code", "Complete integration: button → loading → stream into answer section"),
          quizLesson("Quiz: AI Integration", "Streaming, error handling, rate limiting, prompt design"),
          taskLesson("Task: Add AI-Generated Answers", "Full AI answer flow with streaming and error fallback", 25),
          codeLesson("Rate Limiting & Error Fallback in Code", "In-memory rate limiter, graceful degradation"),
        ],
      },
      // ── Module 9: Tags, Search & Pagination ──
      {
        title: "Tags, Search & Pagination",
        description: "Build tag pages, global search, URL-based filters, and pagination.",
        lessons: [
          textLesson("How the Tag System Works", "Tag model, aggregation for counts, tag-question relationships"),
          codeLesson("Tag System in Code — Model & Actions", "Tag schema, getAllTags() with aggregation, getTagBySlug()"),
          codeLesson("Tags Page in Code — Grid with Search", "Tags grid: card per tag with name, description, question count"),
          quizLesson("Quiz: Tags", "Tag model design, aggregation, search implementation"),
          taskLesson("Task: Build the Tags Page", "Tags grid with search input, question counts, links", 20),
          textLesson("How Global Search Works", "Debouncing, multi-source queries, categorized results"),
          codeLesson("Global Search in Code — Multi-Source Query", "Debounced input → search questions, answers, users, tags"),
          quizLesson("Quiz: Search Patterns", "Debouncing, multi-source search, keyboard accessibility"),
          taskLesson("Task: Implement Global Search", "Full search: debounced input, multi-source results, keyboard nav", 25),
          textLesson("How URL-Based Filters & Pagination Work", "searchParams as state, shareable URLs, cursor vs offset"),
          codeLesson("Filters & Pagination in Code", "Filter components + reusable <Pagination> + paginated server action"),
          quizLesson("Quiz: URL State & Pagination", "searchParams, URL as state, pagination patterns"),
          taskLesson("Task: Add Pagination & Filters Everywhere", "Pagination on questions, tags, and community pages", 20),
        ],
      },
      // ── Module 10: User Profiles & Community ──
      {
        title: "User Profiles & Community",
        description: "Build profile pages, editing, community directory, and collections.",
        lessons: [
          textLesson("How Profile Pages Work", "Fetching user data, stats aggregation, tabbed views"),
          codeLesson("Profile Page in Code — Stats & Tabs", "Fetch user, stats cards, tabbed content"),
          quizLesson("Quiz: Profile Pages", "Data aggregation, tab patterns, stats display"),
          taskLesson("Task: Build the Profile Page", "Profile header, stats, tabs for questions/answers/saved", 25),
          textLesson("How Profile Editing & Image Upload Work", "Pre-filled forms, optimistic updates, Cloudinary upload"),
          codeLesson("Edit Profile in Code — Form + Image Upload", "Pre-filled form, Cloudinary avatar upload, server action update"),
          quizLesson("Quiz: Profile Editing", "Optimistic UI, image upload, form pre-filling"),
          taskLesson("Task: Implement Profile Editing", "Edit name, bio, location, URL, avatar — with validation", 20),
          textLesson("How Community & Collections Work", "User directory, save/unsave toggle, collections feed"),
          codeLesson("Community Page & Collections in Code", "User cards grid + save toggle action + saved questions page"),
          quizLesson("Quiz: Community Features", "User directory, save toggle, collections patterns"),
          taskLesson("Task: Build Community Page & Collections", "User directory with search/sort + save button + collections", 20),
        ],
      },
      // ── Module 11: State Management & Advanced Patterns ──
      {
        title: "State Management & Advanced Patterns",
        description: "Master URL state, React Context, and optimistic update patterns.",
        lessons: [
          textLesson("How State Management Works in Next.js", "URL state vs Context vs Zustand — decision matrix"),
          codeLesson("URL as State Manager in Code — nuqs Library", "Refactoring useState filters to type-safe URL params"),
          codeLesson("Complex URL State in Code — Multi-Filter Page", "Sort + filter + search + page — all in URL"),
          quizLesson("Quiz: URL State Management", "When URL vs Context, serialization, nuqs patterns"),
          textLesson("How React Context Works in the App Router", "Context + 'use client' providers, layout placement"),
          codeLesson("React Context in Code — Theme & Auth", "Theme context in layout + SessionProvider + consuming in components"),
          quizLesson("Quiz: React Context Patterns", "Provider placement, client boundary, context vs prop drilling"),
          textLesson("How Optimistic Updates Work — Full Pattern", "useOptimistic setup, reducers, rollback on failure"),
          codeLesson("Optimistic UI in Code — Vote, Save, Delete", "Vote toggle + instant star save + instant removal with undo toast"),
          quizLesson("Quiz: Optimistic Patterns", "Reducer pattern, rollback strategy, where optimistic UI makes sense"),
          taskLesson("Task: Refactor to Optimistic UI Across Features", "Add optimistic updates to voting, saving, and answer submission", 25),
        ],
      },
      // ── Module 12: Reputation & Recommendation ──
      {
        title: "Reputation & Recommendation",
        description: "Build the reputation system, badge awards, and personalized recommendations.",
        lessons: [
          textLesson("How Reputation Systems Work", "Point values per action, level thresholds, anti-gaming"),
          codeLesson("Reputation Tracking in Code — Server Actions", "createInteraction() recording views/votes/answers"),
          codeLesson("Reputation Update on Vote/Accept in Code", "Hooking into vote/accept actions to update reputation"),
          quizLesson("Quiz: Reputation Design", "Point systems, anti-gaming, interaction tracking"),
          taskLesson("Task: Implement the Reputation System", "Track interactions, update reputation, display on profile", 25),
          textLesson("How Badge & Recommendation Systems Work", "Badge criteria checking, content-based recommendation"),
          codeLesson("Badges in Code — Award Logic & Display", "Check thresholds after interactions + badge card component"),
          codeLesson("Recommendation Algorithm in Code", "MongoDB aggregation: user's tags → weight → score → sort"),
          quizLesson("Quiz: Badges & Recommendations", "Badge criteria, content-based filtering, cold start"),
          taskLesson("Task: Build the Recommendation Feed", "'For You' tab showing personalized recommendations", 25),
          quizLesson("Quiz: Gamification Review", "Comprehensive review of reputation, badges, recommendations"),
        ],
      },
      // ── Module 13: Performance & Optimization ──
      {
        title: "Performance & Optimization",
        description: "Optimize caching, images, fonts, code splitting, and SEO.",
        lessons: [
          textLesson("How Caching Works in Next.js — 4 Layers", "Request memoization → data cache → full route cache → router cache"),
          codeLesson("Caching in Code — revalidatePath vs revalidateTag", "Path vs tag invalidation, fetch options, ISR with revalidate"),
          quizLesson("Quiz: Caching Strategies", "Cache layers, invalidation, static vs dynamic, revalidation"),
          textLesson("How Image & Font Optimization Work", "next/image responsive loading, blur placeholders, next/font"),
          codeLesson("Image & Font Optimization in Code", "Avatar component, responsive sizes, blur placeholder, font loading"),
          quizLesson("Quiz: Asset Optimization", "Image formats, responsive sizes, font loading strategies"),
          textLesson("How Code Splitting & Bundle Analysis Work", "next/dynamic, tree-shaking, @next/bundle-analyzer"),
          codeLesson("Dynamic Imports & Bundle Analysis in Code", "next/dynamic for heavy components + analyzer setup"),
          quizLesson("Quiz: Code Splitting", "Dynamic imports, tree-shaking, bundle analysis"),
          taskLesson("Task: Optimize the DevOverflow Bundle", "Dynamic import heavy components, reduce bundle by 30%", 25),
          textLesson("How SEO & Metadata Work in Next.js", "generateMetadata, OpenGraph, JSON-LD, sitemap.ts"),
          codeLesson("SEO & Metadata in Code", "Dynamic metadata for questions, OG images, JSON-LD, sitemap.ts"),
          taskLesson("Task: Add Metadata to All Pages", "Dynamic titles, descriptions, OG images for questions", 20),
        ],
      },
      // ── Module 14: Testing ──
      {
        title: "Testing",
        description: "Unit test services and components, integration test routes, E2E test flows.",
        lessons: [
          textLesson("How Testing Works in Next.js", "Testing pyramid, unit vs integration vs E2E"),
          codeLesson("Vitest Setup in Code", "vitest.config.ts for Next.js, test utilities, mock setup"),
          quizLesson("Quiz: Testing Fundamentals", "Test types, mocking strategy, what to test, assertions"),
          textLesson("How to Test Server Actions & Components", "Mocking Mongoose, testing async server components"),
          codeLesson("Testing Server Actions in Code", "Unit tests for createQuestion, getQuestions with mocked models"),
          codeLesson("Testing Components in Code", "Tests for QuestionCard, VoteButton, SearchBar"),
          quizLesson("Quiz: Unit & Component Testing", "Mocking patterns, component testing API, async testing"),
          taskLesson("Task: Write Tests for Core Components", "Test suite for QuestionCard, VoteButton, SearchBar, AnswerForm — >80%", 25),
          textLesson("How E2E Testing Works with Playwright", "Setup, config, selectors, full user flow testing"),
          codeLesson("E2E Testing in Code — Full User Flow", "Setup + playwright.config.ts + full flow: sign in → ask → answer → vote"),
          taskLesson("Task: E2E Test the Auth Flow", "Sign up, sign in, access protected route, sign out", 20),
        ],
      },
      // ── Module 15: Deployment & Production ──
      {
        title: "Deployment & Production",
        description: "Deploy to Vercel, set up CI/CD, monitoring, and security headers.",
        lessons: [
          textLesson("How Deployment Works — Production Checklist", "Env vars, security headers, build optimization"),
          codeLesson("Deploying to Vercel in Code", "vercel.json config, env setup, next.config.ts production settings"),
          codeLesson("Env Variables in Code — Dev vs Prod Pattern", ".env.local structure, NEXT_PUBLIC_ prefix, Zod validation"),
          quizLesson("Quiz: Deployment Basics", "Env management, build process, edge vs serverless"),
          textLesson("How CI/CD Pipelines Work", "GitHub Actions: lint → test → build → deploy"),
          codeLesson("CI/CD Pipeline in Code", "Full .github/workflows/ci.yml + Vercel preview URLs"),
          quizLesson("Quiz: CI/CD", "GitHub Actions, preview deployments, status checks"),
          taskLesson("Task: Set Up CI/CD Pipeline", "GitHub Actions: lint, test, build on every PR", 20),
          textLesson("How Monitoring & Security Headers Work", "Sentry integration, CSP, HSTS, X-Frame-Options"),
          codeLesson("Monitoring & Security in Code", "Sentry SDK + instrumentation.ts + security headers"),
          textLesson("Course Recap & What's Next", "Skills learned, portfolio-ready project, continued learning"),
        ],
      },
    ]);
    console.log("");
  }

  // ══════════════════════════════════════════════════════════════
  // COURSE: Node.js & Express — Backend Mastery
  // ══════════════════════════════════════════════════════════════
  const existingNode = await prisma.course.findFirst({
    where: { title: "Node.js & Express — Backend Mastery" },
  });

  if (existingNode) {
    console.log("⏭️  'Node.js & Express — Backend Mastery' already exists — skipping\n");
  } else {
    await seedCourse(admin.id, {
      title: "Node.js & Express — Backend Mastery",
      description: "Master backend development by building a full TaskFlow API. Every topic: short explanation, real code example, quiz. Plus hands-on coding challenges.",
      difficulty: "intermediate",
      pointsReward: 300,
    }, [
      // ── Module 1: Node.js Fundamentals ──
      {
        title: "Node.js Fundamentals",
        description: "Understand the Node.js runtime, modules, file system, events, and built-in modules.",
        lessons: [
          textLesson("Course Overview & What You'll Build", "What TaskFlow API is, the tech stack, how lessons work"),
          textLesson("What Is Node.js & How It Works", "V8 engine, event loop, single-threaded non-blocking I/O"),
          codeLesson("Node.js in Code — Your First Script", "Running a script, process object, __dirname, console methods"),
          quizLesson("Quiz: Node.js Basics", "Event loop, V8, non-blocking I/O, Node vs browser"),
          textLesson("How Node.js Modules Work", "CommonJS vs ESM, require vs import, module.exports vs export"),
          codeLesson("Modules in Code — import, export, barrel files", "ESM imports/exports, default vs named, barrel index.ts"),
          quizLesson("Quiz: Modules", "ESM vs CJS, resolution, barrel files, circular deps"),
          taskLesson("Task: Create a Modular Calculator", "Build add, subtract, multiply, divide in separate modules", 20),
          textLesson("How the File System Works in Node.js", "fs module, sync vs async, promises API, streams overview"),
          codeLesson("File System in Code — Read, Write, Stream", "fs.promises.readFile, writeFile, createReadStream → pipe"),
          quizLesson("Quiz: File System", "Sync vs async, streams, encoding, error handling"),
          textLesson("How Events & the EventEmitter Work", "Observer pattern, EventEmitter class, .on(), .emit(), .once()"),
          codeLesson("EventEmitter in Code — Custom Events", "Custom Logger class extending EventEmitter, typed events"),
          quizLesson("Quiz: Events", "EventEmitter API, observer pattern, memory leaks, max listeners"),
          textLesson("How Built-in Modules Work — path, os, url", "path.join, path.resolve, os.cpus(), new URL()"),
          codeLesson("Built-in Modules in Code", "Annotated examples: path for file paths, os for system info, url for parsing"),
        ],
      },
      // ── Module 2: TypeScript for Backend Development ──
      {
        title: "TypeScript for Backend Development",
        description: "Configure TypeScript for Node.js backends and type your API layer.",
        lessons: [
          textLesson("Why TypeScript for Backend", "Type safety for APIs, catching bugs at compile time, better DX"),
          codeLesson("TypeScript Setup in Code — tsconfig for Node", "tsconfig.json: target, module, moduleResolution, strict, outDir"),
          quizLesson("Quiz: TypeScript Setup", "Compiler options, strict mode, module resolution"),
          textLesson("How TypeScript Types Work for APIs", "Interfaces for request/response, generics for handlers, union types"),
          codeLesson("TypeScript Types in Code — API Patterns", "Typing request bodies, response shapes, error types, ApiResponse<T>"),
          quizLesson("Quiz: TypeScript API Types", "Interface vs type, generics, Zod inference, request typing"),
          taskLesson("Task: Type the TaskFlow Data Models", "Define interfaces for User, Project, Task, Comment", 20),
          textLesson("How Utility Types Help Backend Code", "Partial<T>, Pick<T>, Omit<T>, Record<K,V>, mapped types for DTOs"),
          codeLesson("Utility Types in Code — DTOs & Transformations", "CreateTaskInput, UpdateTaskInput, TaskResponse using utility types"),
          quizLesson("Quiz: Utility Types", "Partial, Pick, Omit, Record, when to use each"),
          textLesson("How ts-node-dev & Build Tooling Work", "tsx, ts-node-dev, tsc --watch, build vs dev mode"),
          taskLesson("Task: Set Up the TaskFlow Project with TypeScript", "Initialize project, configure tsconfig, set up dev script", 20),
        ],
      },
      // ── Module 3: HTTP & Building a Server from Scratch ──
      {
        title: "HTTP & Building a Server from Scratch",
        description: "Understand HTTP from the ground up and build an API server without any framework.",
        lessons: [
          textLesson("How HTTP Works", "Request/response cycle, methods, status codes, headers, body"),
          codeLesson("HTTP Server in Code — Node's http Module", "http.createServer(), parsing URL, reading body, sending JSON responses"),
          quizLesson("Quiz: HTTP Fundamentals", "Methods, status codes, headers, request/response lifecycle"),
          textLesson("How Routing Works at a Low Level", "Parsing URLs, matching method + path, extracting params"),
          codeLesson("Basic Router in Code — Without Express", "Hand-built router: object mapping METHOD /path → handler"),
          quizLesson("Quiz: Routing Concepts", "Route matching, params, method handling, 404s"),
          taskLesson("Task: Build a Todo API with Raw Node.js", "CRUD API using http.createServer() — GET, POST, PUT, DELETE", 25),
          textLesson("How JSON APIs Work", "Content-Type, JSON parsing, response formatting, CORS basics"),
          codeLesson("JSON API Patterns in Code", "Parsing req.body, sending typed JSON, error response shapes"),
          quizLesson("Quiz: JSON APIs", "JSON parsing, content types, error formats, CORS"),
          textLesson("How Environment Variables Work", "process.env, .env files, dotenv, NODE_ENV, secrets management"),
          codeLesson("Environment Variables in Code", "dotenv setup, typed config with Zod validation"),
          quizLesson("Quiz: Environment Variables", "dotenv, NODE_ENV, secrets, env validation"),
          taskLesson("Task: Add Config Management to TaskFlow", "Create config.ts with Zod-validated env vars", 15),
        ],
      },
      // ── Module 4: Express.js — The Framework ──
      {
        title: "Express.js — The Framework",
        description: "Set up Express, master routing, request/response objects, and error handling.",
        lessons: [
          textLesson("What Is Express & Why Use It", "Express vs raw Node.js, middleware model, routing, ecosystem"),
          codeLesson("Express Setup in Code — Hello World to Structured App", "express(), app.listen(), app.get(), JSON parsing, folder structure"),
          quizLesson("Quiz: Express Basics", "Express vs Node.js, app setup, middleware, listening"),
          textLesson("How Express Routing Works", "Router(), route params, query strings, req.params, req.query"),
          codeLesson("Express Routing in Code — Full Router Setup", "Router with GET/POST/PUT/DELETE, params, query parsing"),
          quizLesson("Quiz: Express Routing", "Router, params, query, chaining, mounting"),
          taskLesson("Task: Create the TaskFlow Express App", "Initialize Express + TypeScript app with health check", 25),
          textLesson("How Request & Response Objects Work", "req.body, req.params, req.query, req.headers, res.json(), res.status()"),
          codeLesson("Request & Response in Code — Typed Handlers", "TypeScript-typed handlers with Request<Params, ResBody, ReqBody, ReqQuery>"),
          quizLesson("Quiz: Request & Response", "req/res properties, typing, response methods, status codes"),
          textLesson("How Route Groups & Versioning Work", "/api/v1/ prefix, router separation by resource, barrel imports"),
          codeLesson("Route Groups in Code — Modular Architecture", "routes/projects.ts, routes/tasks.ts, routes/index.ts barrel"),
          quizLesson("Quiz: Route Organization", "Versioning, barrel files, router mounting"),
          taskLesson("Task: Build the TaskFlow Route Structure", "Create routes for /api/v1/projects, tasks, users, comments", 20),
          textLesson("How Express Error Handling Works", "Error middleware signature, next(err), async error catching"),
          codeLesson("Error Handling in Code — Full Pattern", "ApiError class, async handler wrapper, global error middleware"),
        ],
      },
      // ── Module 5: Middleware ──
      {
        title: "Middleware",
        description: "Build custom middleware, add validation, security, and third-party middleware.",
        lessons: [
          textLesson("What Is Middleware & How It Works", "The middleware pipeline, next(), order matters"),
          codeLesson("Middleware Pipeline in Code", "Logger middleware, request timer, JSON body parser"),
          quizLesson("Quiz: Middleware Basics", "Pipeline order, next(), app-level vs router-level"),
          taskLesson("Task: Write a Request Logger Middleware", "Log method, URL, status code, response time", 20),
          textLesson("How Input Validation Middleware Works", "Validate before handler runs, Zod schemas, returning 400"),
          codeLesson("Validation Middleware in Code — Zod", "Generic validate(schema) middleware, validating body/params/query"),
          quizLesson("Quiz: Validation", "Zod vs manual, body/params/query validation, error format"),
          taskLesson("Task: Add Zod Validation to TaskFlow Routes", "Create schemas for project/task creation and update", 25),
          textLesson("How CORS & Security Middleware Work", "Same-origin policy, CORS headers, helmet, rate-limit"),
          codeLesson("Security Middleware in Code", "cors() config, helmet() headers, rate limiter, compression"),
          quizLesson("Quiz: Security Middleware", "CORS, helmet headers, rate limiting, compression"),
          textLesson("How Third-Party Middleware Works", "morgan, cookie-parser, multer, express-session"),
          codeLesson("Third-Party Middleware in Code", "Morgan logging, file upload with multer, cookie parsing"),
          taskLesson("Task: Add Security & Logging Middleware to TaskFlow", "Wire up CORS, helmet, rate limiter, morgan, compression", 20),
        ],
      },
      // ── Module 6: Database — PostgreSQL & Prisma ORM ──
      {
        title: "Database — PostgreSQL & Prisma ORM",
        description: "Connect PostgreSQL, define schemas with Prisma, master CRUD, relations, and seeding.",
        lessons: [
          textLesson("How Relational Databases Work", "Tables, rows, columns, primary keys, foreign keys, relationships"),
          codeLesson("SQL Basics in Code — SELECT, INSERT, UPDATE, DELETE", "Raw SQL queries with pg driver: CRUD, JOINs, WHERE"),
          quizLesson("Quiz: Relational Database Fundamentals", "Tables, keys, relationships, SQL syntax"),
          textLesson("How ORMs & Prisma Work", "What ORMs solve, Prisma vs Sequelize vs TypeORM, schema-first"),
          codeLesson("Prisma Setup in Code — Schema & Migration", "schema.prisma with User/Project/Task models, prisma migrate"),
          quizLesson("Quiz: Prisma Basics", "Schema syntax, migrations, client generation"),
          taskLesson("Task: Set Up PostgreSQL & Prisma for TaskFlow", "Docker Postgres + Prisma init + schema with all models", 25),
          textLesson("How Prisma CRUD Operations Work", "create, findMany, findUnique, update, delete, includes"),
          codeLesson("Prisma CRUD in Code — Full Implementation", "All CRUD operations with TypeScript types, nested includes"),
          quizLesson("Quiz: Prisma CRUD", "Query methods, includes, selects, filtering"),
          taskLesson("Task: Build the TaskFlow Data Access Layer", "CRUD functions for projects and tasks using Prisma", 25),
          textLesson("How Database Relations Work in Prisma", "One-to-many, many-to-many, self-relations, @relation, cascade"),
          codeLesson("Relations in Code — Nested Queries & Transactions", "Nested creates, include chains, $transaction for atomicity"),
          quizLesson("Quiz: Relations & Transactions", "Relation types, cascade deletes, transactions"),
          textLesson("How Database Seeding Works", "Seed scripts, idempotent seeding, faker data, prisma db seed"),
          codeLesson("Seeding in Code — TaskFlow Sample Data", "Seed script creating users, projects, tasks, comments"),
          quizLesson("Quiz: Seeding & Migrations", "Seed strategies, idempotency, migration workflow"),
          taskLesson("Task: Seed the TaskFlow Database", "Write seed with 5 users, 3 projects, 10 tasks, 15 comments", 20),
        ],
      },
      // ── Module 7: Authentication & Authorization ──
      {
        title: "Authentication & Authorization",
        description: "Implement JWT auth, password hashing, login/logout, middleware protection, and RBAC.",
        lessons: [
          textLesson("How Authentication Works — Sessions vs Tokens", "Session-based vs token-based auth, cookies vs headers"),
          textLesson("How JWT Tokens Work", "Header, payload, signature, signing, verifying, expiration"),
          codeLesson("JWT in Code — Sign & Verify", "jsonwebtoken: jwt.sign(), jwt.verify(), typed payloads"),
          quizLesson("Quiz: JWT Fundamentals", "JWT structure, signing, verification, stateless auth"),
          textLesson("How Password Hashing Works", "bcrypt, salt rounds, hashing vs encrypting, timing attacks"),
          codeLesson("Password Hashing in Code — bcrypt", "bcrypt.hash(), bcrypt.compare(), salt rounds, registration"),
          quizLesson("Quiz: Password Security", "Hashing vs encrypting, salt, bcrypt rounds"),
          taskLesson("Task: Build User Registration", "Register: validate → check duplicate → hash password → create → return JWT", 25),
          textLesson("How Login & Token Flow Works", "Login flow: credentials → verify → issue JWT → store"),
          codeLesson("Login & Token Flow in Code", "Login endpoint, auth cookie setup, refresh token, logout"),
          quizLesson("Quiz: Login Flow", "Login steps, cookie settings, refresh strategy, logout"),
          taskLesson("Task: Build Login & Logout", "Login endpoint + refresh token + HTTP-only cookie + logout", 25),
          textLesson("How Auth Middleware Works", "Extracting token, verifying, attaching user to req"),
          codeLesson("Auth Middleware in Code — Protect Routes", "authenticate middleware: extract Bearer → verify → req.user"),
          quizLesson("Quiz: Auth Middleware", "Token extraction, verification, req.user"),
          textLesson("How Role-Based Access Control (RBAC) Works", "Roles (admin/member/viewer), permissions, role guard"),
          codeLesson("RBAC in Code — Role Guard & Ownership", "requireRole('admin') middleware, requireOwnership() check"),
          taskLesson("Task: Protect TaskFlow Routes with Auth & RBAC", "Add auth middleware + role guards to all endpoints", 25),
        ],
      },
      // ── Module 8: CRUD API — Building the Core ──
      {
        title: "CRUD API — Building the Core",
        description: "Build the full API with service layer, filtering, pagination, and nested resources.",
        lessons: [
          textLesson("How a Service Layer Works", "Controller → Service → Repository, separation of concerns"),
          codeLesson("Service Layer in Code — Projects", "ProjectService with create(), getAll(), getById(), update(), delete()"),
          quizLesson("Quiz: Service Layer Pattern", "Separation of concerns, controller vs service"),
          taskLesson("Task: Build the Projects Service & Controller", "Full CRUD for projects: service + controller + routes + validation", 25),
          textLesson("How Filtering, Sorting & Pagination Work", "Query params: ?status=active&sort=createdAt&order=desc&page=1"),
          codeLesson("Filtering, Sorting & Pagination in Code", "Prisma queries with dynamic where, orderBy, skip/take"),
          quizLesson("Quiz: Query Patterns", "Query params, Prisma filtering, pagination math"),
          taskLesson("Task: Add Filtering & Pagination to Projects", "GET /projects with query params: status, sort, order, page, limit", 20),
          textLesson("How Nested Resources Work", "/projects/:projectId/tasks, parent existence check"),
          codeLesson("Nested Resources in Code — Tasks Under Projects", "Task routes nested under projects, scoped CRUD"),
          quizLesson("Quiz: Nested Resources", "Nested routes, parent validation, scoping"),
          taskLesson("Task: Build the Tasks CRUD API", "Full CRUD for tasks nested under projects with auth", 25),
          textLesson("How Comments & Sub-Resources Work", "/tasks/:taskId/comments, shallow vs deep nesting"),
          codeLesson("Comments API in Code", "Create/list/delete comments on tasks, author association"),
          quizLesson("Quiz: Sub-Resources & API Design", "Nesting depth, shallow routes, denormalization"),
          taskLesson("Task: Build the Comments API", "CRUD comments on tasks with auth, ownership checks", 20),
        ],
      },
      // ── Module 9: File Uploads & Email ──
      {
        title: "File Uploads & Email",
        description: "Handle file uploads with Multer, cloud storage, and transactional email.",
        lessons: [
          textLesson("How File Uploads Work in Express", "multipart/form-data, multer, disk vs memory storage"),
          codeLesson("File Upload in Code — Multer", "Multer setup: file filter, size limits, storage config"),
          quizLesson("Quiz: File Uploads", "Multipart, multer config, file validation"),
          textLesson("How Cloud File Storage Works", "Local vs cloud (S3/Cloudinary), presigned URLs, CDN"),
          codeLesson("Cloud Upload in Code — Cloudinary", "multer → buffer → Cloudinary SDK → URL saved to DB"),
          quizLesson("Quiz: Cloud Storage", "S3 vs Cloudinary, presigned URLs, CDN"),
          taskLesson("Task: Add Avatar Upload to TaskFlow", "Upload profile picture with validation, cloud storage", 25),
          textLesson("How Email Sending Works in Node.js", "SMTP, transactional email, Nodemailer, Resend, templates"),
          codeLesson("Email in Code — Nodemailer & Templates", "Nodemailer setup, HTML template, password reset email"),
          quizLesson("Quiz: Email", "SMTP, transactional vs marketing, templates, dev testing"),
          taskLesson("Task: Add Password Reset Email Flow", "Generate reset token → send email → reset endpoint → update password", 25),
        ],
      },
      // ── Module 10: Real-Time Features ──
      {
        title: "Real-Time Features",
        description: "Add WebSocket communication with Socket.io for notifications and live activity.",
        lessons: [
          textLesson("How WebSockets Work", "HTTP vs WebSocket, upgrade handshake, persistent connection"),
          textLesson("How Socket.io Works", "Socket.io vs raw WS, rooms, namespaces, events, auto-reconnect"),
          codeLesson("Socket.io in Code — Basic Setup", "Server setup with Express, connection/disconnect, emit/listen"),
          quizLesson("Quiz: WebSocket Fundamentals", "HTTP vs WS, Socket.io features, connection lifecycle"),
          textLesson("How Real-Time Notifications Work", "Broadcasting, rooms for scoped events, persistence"),
          codeLesson("Real-Time Notifications in Code", "Task assignment notification: emit to room → client listens"),
          quizLesson("Quiz: Notification Patterns", "Broadcasting vs rooms, user association, persistence"),
          taskLesson("Task: Add Real-Time Task Notifications", "Notify when: task assigned, status changed, comment added", 25),
          textLesson("How Live Collaboration Works", "Presence (who's online), live cursors, conflict resolution"),
          codeLesson("Live Activity Feed in Code", "Activity stream: join project room → see live updates"),
          quizLesson("Quiz: Collaboration Patterns", "Presence, activity feeds, conflict handling"),
          taskLesson("Task: Build a Live Activity Feed", "Real-time activity feed showing project updates as they happen", 20),
        ],
      },
      // ── Module 11: Caching, Queues & Background Jobs ──
      {
        title: "Caching, Queues & Background Jobs",
        description: "Add Redis caching, BullMQ job queues, and scheduled cron tasks.",
        lessons: [
          textLesson("How Caching Works in Backend APIs", "In-memory vs Redis, cache-aside pattern, TTL, invalidation"),
          codeLesson("Redis Caching in Code", "Redis setup, get/set with TTL, cache-aside in service layer"),
          quizLesson("Quiz: Caching Strategies", "Cache-aside, TTL, invalidation, Redis vs in-memory"),
          taskLesson("Task: Add Redis Caching to TaskFlow", "Cache project list and task queries, invalidate on mutation", 25),
          textLesson("How Background Jobs & Queues Work", "Why async processing, BullMQ, workers, retries, dead letter"),
          codeLesson("BullMQ in Code — Job Queue Setup", "Queue setup, adding jobs, worker processing, retry config"),
          quizLesson("Quiz: Job Queues", "Queue vs sync, BullMQ API, retries, workers, dead letters"),
          taskLesson("Task: Add Email Jobs to a Queue", "Move email sending to BullMQ with retries and failure handling", 25),
          textLesson("How Scheduled Tasks & Cron Jobs Work", "node-cron, @bull-board/express, scheduled cleanup"),
          codeLesson("Cron Jobs in Code — Scheduled Maintenance", "Cron for daily cleanup, weekly report, Bull Board"),
          quizLesson("Quiz: Scheduled Tasks", "Cron syntax, scheduling strategies, monitoring"),
          taskLesson("Task: Add a Daily Summary Job", "Scheduled job aggregating daily task metrics", 20),
        ],
      },
      // ── Module 12: Testing ──
      {
        title: "Testing",
        description: "Write unit tests, integration tests with Supertest, and set up CI testing.",
        lessons: [
          textLesson("How Testing Works for Backend APIs", "Testing pyramid, unit vs integration vs E2E"),
          codeLesson("Vitest Setup in Code for Express", "vitest.config.ts, test utilities, mock setup, test DB config"),
          quizLesson("Quiz: Testing Fundamentals", "Test types, mocking, test isolation, assertions"),
          textLesson("How to Unit Test Services", "Mocking Prisma, testing business logic, error cases"),
          codeLesson("Unit Testing Services in Code", "Tests for ProjectService.create(), .getById(), error handling"),
          quizLesson("Quiz: Unit Testing", "Mocking patterns, service testing, error assertions"),
          taskLesson("Task: Write Unit Tests for TaskFlow Services", "Test suite for ProjectService and TaskService — >80%", 25),
          textLesson("How Integration Testing with Supertest Works", "supertest, testing full route → middleware → controller → service"),
          codeLesson("Integration Tests in Code — Full Route Testing", "Supertest: auth → create → read → update → delete on /api/v1/projects"),
          quizLesson("Quiz: Integration Testing", "Supertest API, test DB setup, auth in tests, cleanup"),
          taskLesson("Task: Write Integration Tests for TaskFlow Routes", "Full test suite for projects and tasks routes with auth", 25),
          textLesson("How Test Databases & CI Testing Work", "Test DB strategy, Docker for CI, GitHub Actions test workflow"),
          codeLesson("CI Testing in Code — GitHub Actions + Docker", ".github/workflows/test.yml: spin up Postgres → migrate → test"),
          quizLesson("Quiz: CI/CD Testing", "Docker in CI, test isolation, coverage thresholds"),
        ],
      },
      // ── Module 13: Performance & Security ──
      {
        title: "Performance & Security",
        description: "Optimize queries, harden security, add logging, and generate API documentation.",
        lessons: [
          textLesson("How API Performance Works", "N+1 queries, eager loading, connection pooling, query optimization"),
          codeLesson("Performance Optimization in Code", "Fixing N+1 with Prisma includes, connection pool config"),
          quizLesson("Quiz: Performance Patterns", "N+1, eager loading, pooling, query optimization"),
          taskLesson("Task: Optimize TaskFlow Queries", "Find and fix N+1 queries, add indexes, measure before/after", 25),
          textLesson("How API Security Works", "OWASP top 10: injection, broken auth, mass assignment, rate limiting"),
          codeLesson("Security Hardening in Code", "Input sanitization, SQL injection prevention, mass assignment guards"),
          quizLesson("Quiz: API Security", "OWASP, injection, mass assignment, helmet headers"),
          textLesson("How Logging & Monitoring Work", "Structured logging (pino/winston), log levels, Sentry, health checks"),
          codeLesson("Logging & Monitoring in Code", "Pino logger, request ID middleware, health endpoint"),
          quizLesson("Quiz: Logging & Monitoring", "Structured logging, log levels, request tracing"),
          textLesson("How API Documentation Works", "OpenAPI/Swagger, auto-generation, schema-first vs code-first"),
          codeLesson("Swagger in Code — Auto-Generated Docs", "swagger-jsdoc + swagger-ui-express, annotating routes"),
          quizLesson("Quiz: API Documentation", "OpenAPI spec, annotation patterns, Swagger UI"),
          taskLesson("Task: Add Swagger Docs to TaskFlow", "Annotate all endpoints, generate OpenAPI spec, serve Swagger UI", 20),
        ],
      },
      // ── Module 14: Deployment & Production ──
      {
        title: "Deployment & Production",
        description: "Dockerize the app, deploy to Railway, set up CI/CD, and prepare for production.",
        lessons: [
          textLesson("How Docker Works for Node.js", "Containers vs VMs, Dockerfile, images, layers, multi-stage builds"),
          codeLesson("Dockerfile in Code — Multi-Stage Build", "Dockerfile: install → build → production image. docker-compose.yml"),
          quizLesson("Quiz: Docker Basics", "Layers, multi-stage, docker-compose, volumes, networking"),
          taskLesson("Task: Dockerize the TaskFlow API", "Write Dockerfile + docker-compose with API + Postgres + Redis", 25),
          textLesson("How Production Deployment Works", "Railway vs Render vs AWS, env config, database hosting"),
          codeLesson("Deploying to Railway in Code", "railway.json config, env setup, Postgres provisioning"),
          quizLesson("Quiz: Deployment", "Platform comparison, env management, database hosting, SSL"),
          textLesson("How CI/CD Pipelines Work", "GitHub Actions: lint → test → build → deploy"),
          codeLesson("CI/CD Pipeline in Code", "Full .github/workflows/deploy.yml: test → Docker → deploy"),
          quizLesson("Quiz: CI/CD", "Pipeline stages, branch protection, rollback strategies"),
          taskLesson("Task: Set Up CI/CD for TaskFlow", "GitHub Actions: lint, test, build Docker, deploy on merge", 20),
          textLesson("Production Checklist", "Security headers, logging, monitoring, backups, graceful shutdown"),
          textLesson("Course Recap & What's Next", "Skills learned, portfolio-ready API, next steps"),
        ],
      },
    ]);
    console.log("");
  }

  // ── Summary ─────────────────────────────────────────────────
  const courseCount = await prisma.course.count();
  const moduleCount = await prisma.module.count();
  const lessonCount = await prisma.lesson.count();

  console.log(`\n🎉 Done!`);
  console.log(`   📘 Total courses: ${courseCount}`);
  console.log(`   📦 Total modules: ${moduleCount}`);
  console.log(`   📝 Total lessons: ${lessonCount}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
