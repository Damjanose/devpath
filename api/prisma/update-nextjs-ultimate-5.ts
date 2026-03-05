import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 11: Reputation & Recommendation (8 lessons) ──
"f3546540-b69a-461b-9776-293afdced9d0": `# How the Reputation System Works

Reputation measures a user's trustworthiness and contributions. Users earn or lose reputation based on community interactions.

## Reputation Events

| Event | Reputation Change |
|---|---|
| Upvote on your question | +5 |
| Downvote on your question | -2 |
| Upvote on your answer | +10 |
| Downvote on your answer | -2 |
| Your answer accepted | +15 |
| You accept an answer | +2 |
| Downvote by you (costs) | -1 |

## Implementation Strategy

\`\`\`tsx
// Reputation is updated alongside the action that triggered it
// NOT in a separate cron job or queue

async function handleUpvote(targetUserId: string, type: "question" | "answer") {
  const points = type === "question" ? 5 : 10;
  await User.findByIdAndUpdate(targetUserId, {
    $inc: { reputation: points },
  });
}

async function handleDownvote(targetUserId: string) {
  await User.findByIdAndUpdate(targetUserId, {
    $inc: { reputation: -2 },
  });
}
\`\`\`

## Why Inline Updates?

\`\`\`
Option A: Update rep in the same transaction ← DevOverflow uses this
  ✅ Always consistent
  ✅ No eventual consistency lag
  ❌ More code in each action

Option B: Background job processes rep changes
  ✅ Cleaner action code
  ❌ Reputation lag
  ❌ More infrastructure needed
\`\`\`

> 💡 Reputation changes are always integers and always tied to a specific action. This makes them auditable and reversible if an action is undone.
`,

"843f5d61-137b-4700-a117-610f87286b00": `# Reputation System in Code — Upvote, Downvote, Accept

Complete reputation tracking implementation.

## Upvote Question with Reputation

\`\`\`tsx
"use server";

export async function upvoteQuestion(params: {
  questionId: string;
  userId: string;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  path: string;
}) {
  await connectToDatabase();
  const { questionId, userId, hasUpvoted, hasDownvoted, path } = params;

  let updateQuery = {};
  let authorRepChange = 0;

  if (hasUpvoted) {
    // Remove upvote
    updateQuery = { $pull: { upvotes: userId } };
    authorRepChange = -5;
  } else if (hasDownvoted) {
    // Switch from downvote to upvote
    updateQuery = {
      $pull: { downvotes: userId },
      $push: { upvotes: userId },
    };
    authorRepChange = 7; // Remove -2 penalty + add +5
  } else {
    // New upvote
    updateQuery = { $push: { upvotes: userId } };
    authorRepChange = 5;
  }

  const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

  // Update author reputation
  await User.findByIdAndUpdate(question.author, {
    $inc: { reputation: authorRepChange },
  });

  // Update voter reputation
  if (!hasUpvoted) {
    await User.findByIdAndUpdate(userId, { $inc: { reputation: 1 } });
  }

  revalidatePath(path);
}
\`\`\`

## Accept Answer with Reputation

\`\`\`tsx
"use server";

export async function acceptAnswer(params: { answerId: string; questionId: string; userId: string; path: string }) {
  await connectToDatabase();

  // Give +15 to answer author, +2 to question author
  const answer = await Answer.findById(params.answerId);
  await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } });
  await User.findByIdAndUpdate(params.userId, { $inc: { reputation: 2 } });

  // Mark question as answered
  await Question.findByIdAndUpdate(params.questionId, { $set: { acceptedAnswer: params.answerId } });

  revalidatePath(params.path);
}
\`\`\`

> 💡 The "switch vote" case (downvote → upvote) applies the full reversal: +2 for removing the downvote, then +5 for the upvote = +7 total.
`,

"0e7f3342-f733-4f25-9def-abae4a5e2dbf": `# Task: Build the Reputation System

Create a complete reputation tracking system!

## Your Task

Build a reputation engine that awards, deducts, and tracks reputation points for all user actions.

> 💡 **Hint:** Each action type has symmetric changes — what goes up must come back down when the action is undone.

## Requirements

- Implement \`calculateRepChange(action, context)\` for actions: upvote_question (+5), upvote_answer (+10), downvote (-2), accept_answer (+15/+2), switch_vote (reversal + new)
- Implement \`applyRepChange(userId, change, reason)\` that updates reputation and logs the change
- Implement \`canUserPerform(userId, action)\` that checks reputation thresholds: downvote (125+), vote to close (500+), create tag (1500+)
- Implement \`getRepHistory(userId)\` that returns a timeline of reputation changes

## What You'll Practice

- Point-based reputation systems
- Permission gating by reputation level
- Audit trail patterns
`,

"28f32a5f-6ef5-4fa3-b47d-3e9abc3deafa": `# How the Badge System Works

Badges reward long-term milestones, not single actions. They're computed based on cumulative activity.

## Badge Criteria

| Badge | Gold | Silver | Bronze |
|---|---|---|---|
| Question | Asked 100+ Qs | Asked 50+ Qs | Asked 10+ Qs |
| Answer | Answered 100+ | Answered 50+ | Answered 10+ |
| Popular | 1M+ Q views | 100K+ Q views | 10K+ Q views |
| Helpful | 500+ upvotes | 100+ upvotes | 50+ upvotes |
| Star | 100+ saves | 50+ saves | 10+ saves |

## Badge Computation

\`\`\`tsx
"use server";

interface BadgeCriteria {
  type: "QUESTION_COUNT" | "ANSWER_COUNT" | "QUESTION_UPVOTES" | "TOTAL_VIEWS";
  count: number;
}

const BADGE_CRITERIA = {
  GOLD: [
    { type: "QUESTION_COUNT", count: 100 },
    { type: "ANSWER_COUNT", count: 100 },
    { type: "QUESTION_UPVOTES", count: 500 },
    { type: "TOTAL_VIEWS", count: 1000000 },
  ],
  SILVER: [
    { type: "QUESTION_COUNT", count: 50 },
    { type: "ANSWER_COUNT", count: 50 },
    { type: "QUESTION_UPVOTES", count: 100 },
    { type: "TOTAL_VIEWS", count: 100000 },
  ],
  BRONZE: [
    { type: "QUESTION_COUNT", count: 10 },
    { type: "ANSWER_COUNT", count: 10 },
    { type: "QUESTION_UPVOTES", count: 50 },
    { type: "TOTAL_VIEWS", count: 10000 },
  ],
};
\`\`\`

## Counting Badges

\`\`\`tsx
function assignBadges(stats: { totalQuestions: number; totalAnswers: number; totalUpvotes: number; totalViews: number }) {
  const counts = { GOLD: 0, SILVER: 0, BRONZE: 0 };

  for (const [level, criteria] of Object.entries(BADGE_CRITERIA)) {
    for (const criterion of criteria) {
      let value = 0;
      switch (criterion.type) {
        case "QUESTION_COUNT": value = stats.totalQuestions; break;
        case "ANSWER_COUNT": value = stats.totalAnswers; break;
        case "QUESTION_UPVOTES": value = stats.totalUpvotes; break;
        case "TOTAL_VIEWS": value = stats.totalViews; break;
      }
      if (value >= criterion.count) counts[level]++;
    }
  }

  return counts;
}
\`\`\`

> 💡 Badges are computed on-the-fly when viewing a user's profile, not stored in the database. This ensures they're always accurate without needing background synchronization.
`,

"19d622f4-5171-4548-842e-d9ddbe82272a": `# Badge System in Code — Stats Component

The Stats component displays reputation, badge counts, and user activity metrics.

## Stats Component

\`\`\`tsx
import Image from "next/image";

interface StatsProps {
  totalQuestions: number;
  totalAnswers: number;
  badges: { GOLD: number; SILVER: number; BRONZE: number };
  reputation: number;
}

export default function Stats({ totalQuestions, totalAnswers, badges, reputation }: StatsProps) {
  return (
    <div className="mt-10">
      <h4 className="h3-semibold text-dark200_light900">Stats — {reputation} reputation</h4>
      <div className="mt-5 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        {/* Question & Answer Stats */}
        <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-evenly gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200">
          <div>
            <p className="paragraph-semibold text-dark200_light900">{formatNumber(totalQuestions)}</p>
            <p className="body-medium text-dark400_light700">Questions</p>
          </div>
          <div>
            <p className="paragraph-semibold text-dark200_light900">{formatNumber(totalAnswers)}</p>
            <p className="body-medium text-dark400_light700">Answers</p>
          </div>
        </div>

        {/* Badge Cards */}
        <StatsCard imgUrl="/assets/icons/gold-medal.svg" value={badges.GOLD} title="Gold Badges" />
        <StatsCard imgUrl="/assets/icons/silver-medal.svg" value={badges.SILVER} title="Silver Badges" />
        <StatsCard imgUrl="/assets/icons/bronze-medal.svg" value={badges.BRONZE} title="Bronze Badges" />
      </div>
    </div>
  );
}

function StatsCard({ imgUrl, value, title }: { imgUrl: string; value: number; title: string }) {
  return (
    <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-start gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200">
      <Image src={imgUrl} alt={title} width={40} height={50} />
      <div>
        <p className="paragraph-semibold text-dark200_light900">{value}</p>
        <p className="body-medium text-dark400_light700">{title}</p>
      </div>
    </div>
  );
}
\`\`\`

> 💡 The \`formatNumber()\` function displays 1000 as "1K", 1000000 as "1M" — keeping stat cards clean and readable.
`,

"a9cafe28-f183-4f4b-926b-eafdcbf0c142": `# How the Recommendation Algorithm Works

DevOverflow shows recommended questions on the home page, personalized to each user based on their interests.

## Algorithm Overview

\`\`\`
1. Identify user interests
   ├── Tags from their questions
   ├── Tags from questions they interacted with
   └── Tags they follow

2. Find questions matching those tags
   ├── Exclude questions they've already seen/answered
   └── Sort by recency + activity

3. Fill remaining slots with popular questions
\`\`\`

## Implementation

\`\`\`tsx
"use server";

export async function getRecommendedQuestions(params: { userId: string; page?: number; pageSize?: number }) {
  await connectToDatabase();
  const { userId, page = 1, pageSize = 10 } = params;

  // Step 1: Find user's interactions
  const user = await User.findById(userId);
  const userQuestions = await Question.find({ author: userId }).select("tags");
  const userAnswers = await Answer.find({ author: userId }).select("question");

  // Get tags from user's questions
  const userTags = userQuestions.flatMap((q) => q.tags.map((t: any) => t.toString()));
  // Get questions user has answered
  const answeredQuestions = userAnswers.map((a) => a.question.toString());

  // Step 2: Find matching questions
  const recommended = await Question.find({
    _id: { $nin: [...answeredQuestions, ...userQuestions.map((q) => q._id)] },
    tags: { $in: userTags },
  })
    .populate("author", "name picture")
    .populate("tags", "name")
    .sort({ createdAt: -1, upvotes: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize + 1);

  const hasMore = recommended.length > pageSize;
  return { questions: recommended.slice(0, pageSize), hasMore };
}
\`\`\`

> 💡 The \`$nin\` (not-in) filter ensures users never see their own questions or questions they've already answered — keeping the feed fresh and relevant.
`,

"274150ad-f0e9-4206-842d-5aaabddc2026": `# Recommendation Engine in Code — Full Pipeline

Wiring up the recommendation engine to the home page.

## Home Page with Recommendations

\`\`\`tsx
// app/(root)/page.tsx
import { auth } from "@/auth";
import { getRecommendedQuestions, getQuestions } from "@/lib/actions/question.action";

export default async function HomePage({ searchParams }) {
  const session = await auth();
  const isRecommended = searchParams.filter === "recommended";

  let result;
  if (isRecommended && session?.user?.id) {
    result = await getRecommendedQuestions({
      userId: session.user.id,
      page: Number(searchParams.page) || 1,
    });
  } else {
    result = await getQuestions({
      searchQuery: searchParams.q,
      filter: searchParams.filter,
      page: Number(searchParams.page) || 1,
    });
  }

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <HomeFilters />
      <QuestionFeed questions={result.questions} />
      <Pagination page={Number(searchParams.page) || 1} isNext={result.hasMore} />
    </>
  );
}
\`\`\`

## Home Filters with Recommended Tab

\`\`\`tsx
const HomeFilters = [
  { name: "Newest", value: "newest" },
  { name: "Recommended", value: "recommended" },
  { name: "Frequent", value: "frequent" },
  { name: "Unanswered", value: "unanswered" },
];
\`\`\`

> 💡 The recommendation algorithm is a real-time query, not a pre-computed feed. This means recommendations are always fresh, but may be slower for users with many interactions.
`,

"23a27dc0-5823-486e-bc36-d73793b8e795": `# Task: Build the Recommendation Engine

Create a content-based recommendation system!

## Your Task

Build a recommendation engine that suggests relevant questions based on user interests and activity patterns.

> 💡 **Hint:** Combine multiple signals (tags, upvotes, views) to create a weighted relevance score.

## Requirements

- Implement \`extractUserInterests(userId, data)\` that computes a tag affinity map \`{ tagName: score }\` from their questions (weight: 3), answers (weight: 2), and upvotes (weight: 1)
- Implement \`scoreQuestion(question, interests)\` that computes a relevance score for a question based on tag overlap with user interests
- Implement \`getRecommendations(userId, allQuestions, limit)\` that:
  1. Builds user interests
  2. Filters out user's own questions + already answered
  3. Scores remaining questions
  4. Returns top N by score, with ties broken by recency

## What You'll Practice

- Content-based filtering algorithms
- Weighted scoring systems
- Interest graph computation
`,

// ── Module 12: Performance & Optimization (10 lessons) ──
"eea236f4-d31c-440c-9464-74b962d21dee": `# How Next.js Caching Works — The Full Picture

Next.js has four layers of caching. Understanding when data is cached vs. fresh is critical for building correct applications.

## The 4 Cache Layers

\`\`\`
Request ──→ ① Request Memoization ──→ ② Data Cache ──→ ③ Full Route Cache ──→ ④ Router Cache
            (Per-request dedup)     (Server, persistent) (Server, build-time)  (Client, in-memory)
\`\`\`

| Layer | Where | What | Duration | How to Opt Out |
|---|---|---|---|---|
| Request Memoization | Server | Dedups same fetch() in one render | Per-request | Can't opt out (automatic) |
| Data Cache | Server | Caches fetch() responses | Until revalidated | fetch(\`...\`, { cache: "no-store" }) |
| Full Route Cache | Server | Caches rendered HTML + RSC | Until revalidated | export const dynamic = "force-dynamic" |
| Router Cache | Client | Caches visited routes | 30s (dynamic), 5m (static) | router.refresh() |

## Revalidation Strategies

\`\`\`tsx
// Time-based: Refresh every 60 seconds
fetch("https://api.example.com/data", { next: { revalidate: 60 } });

// On-demand: Refresh when data changes
import { revalidatePath, revalidateTag } from "next/cache";

// In a Server Action:
revalidatePath("/questions");           // Revalidate entire page
revalidateTag("questions");             // Revalidate tagged fetches

// Tag a fetch for on-demand revalidation:
fetch("https://api.example.com/questions", { next: { tags: ["questions"] } });
\`\`\`

> 💡 When in doubt, add \`{ cache: "no-store" }\` to your fetch. It's better to have correct data than fast stale data. Then optimize caching later.
`,

"cb489900-8ffe-450b-a970-6a9b2a5e0d89": `# Caching in Code — Revalidation Strategies

Implementing effective caching for DevOverflow's data fetching.

## Tag-Based Revalidation

\`\`\`tsx
// Fetching with cache tags
async function getQuestion(questionId: string) {
  const response = await fetch(API_URL + "/questions/" + questionId, {
    next: {
      tags: ["question-" + questionId, "questions"],
      revalidate: 3600, // Also revalidate every hour as fallback
    },
  });
  return response.json();
}

// When a question is updated via Server Action
"use server";

export async function editQuestion(params: EditQuestionParams) {
  await connectToDatabase();
  await Question.findByIdAndUpdate(params.questionId, params.updateData);

  // Revalidate specific question AND question lists
  revalidateTag("question-" + params.questionId);
  revalidateTag("questions");
  revalidatePath("/questions/" + params.questionId);
}
\`\`\`

## Partial vs Full Revalidation

\`\`\`
Scenario: User edits their profile

Option A: revalidatePath("/") — Nuclear option 💣
  Revalidates EVERYTHING. Clears all cached routes.
  
Option B: revalidatePath("/profile/[id]") — Targeted ✓
  Only revalidates the profile page.

Option C: revalidateTag("user-123") — Surgical ✓✓
  Only revalidates fetches tagged with this user ID.
\`\`\`

## unstable_cache for Database Queries

\`\`\`tsx
import { unstable_cache } from "next/cache";

// Cache a database query (not using fetch)
const getCachedPopularTags = unstable_cache(
  async () => {
    const tags = await Tag.find({}).sort({ questions: -1 }).limit(10);
    return JSON.parse(JSON.stringify(tags));
  },
  ["popular-tags"],        // Cache key
  { revalidate: 3600 }     // 1 hour
);
\`\`\`

> 💡 Use \`revalidateTag()\` over \`revalidatePath()\` when possible. Tags let you invalidate just the data that changed, while paths invalidate entire pages.
`,

"8ab46600-c870-4aed-8ef7-1174cae92d48": `# Task: Implement Smart Caching

Build an intelligent caching layer!

## Your Task

Create a cache manager that handles multiple caching strategies with tag-based invalidation and TTL management.

> 💡 **Hint:** Different data needs different caching strategies. User profiles change rarely, question lists change often.

## Requirements

- Implement \`CacheManager\` class with:
  - \`get(key)\` — returns cached value or null (check TTL expiry)
  - \`set(key, value, options)\` — stores value with tags and TTL
  - \`invalidateByTag(tag)\` — removes all entries with that tag
  - \`invalidateByKey(key)\` — removes a specific entry
- Support TTL (time-to-live) per entry, default 3600 seconds
- Support tags — each entry can have multiple tags
- Implement \`getOrFetch(key, fetchFn, options)\` — returns cached value or calls fetchFn, caches result

## What You'll Practice

- Cache invalidation strategies
- TTL management
- Tag-based cache organization
`,

"b85c5996-706c-4373-a146-a7561e869c74": `# How Route Optimization Works — Static vs. Dynamic

Understanding when routes are static (pre-rendered) vs. dynamic (rendered on request) is key to performance.

## Static vs. Dynamic Detection

Next.js automatically determines if a route is static or dynamic:

\`\`\`
Static (pre-rendered at build time):
├── No dynamic functions (cookies(), headers(), searchParams)
├── No uncached data requests
└── All data is cacheable

Dynamic (rendered per request):
├── Uses cookies() or headers()
├── Uses searchParams in Server Component
├── Has fetch with { cache: 'no-store' }
└── Has export const dynamic = 'force-dynamic'
\`\`\`

## generateStaticParams

\`\`\`tsx
// Generate static pages for all questions at build time
// app/questions/[id]/page.tsx

export async function generateStaticParams() {
  const questions = await getAllQuestionIds();
  return questions.map((q) => ({ id: q._id }));
}

// These pages are now pre-rendered as static HTML!
export default async function QuestionPage({ params }: { params: { id: string } }) {
  const question = await getQuestion(params.id);
  return <QuestionDetail question={question} />;
}
\`\`\`

## When to Use Each

| Page | Strategy | Why |
|---|---|---|
| Home (no auth) | Static + ISR | Content changes, but not rapidly |
| Question detail | Static + on-demand revalidation | Changes when edited/voted |
| User profile | Dynamic | Needs auth check for edit button |
| Search results | Dynamic | Depends on search params |
| Ask question form | Dynamic | Needs auth |

> 💡 Use \`generateStaticParams\` for pages with finite, known paths (like question detail pages). This pre-renders them at build time for instant loading.
`,

"37f495a0-37c4-402c-b65d-8e319e499163": `# Route Optimization in Code — ISR & generateStaticParams

Implementing Incremental Static Regeneration in DevOverflow.

## ISR Configuration

\`\`\`tsx
// app/questions/[id]/page.tsx

// Pre-render the most popular questions at build time
export async function generateStaticParams() {
  // Only pre-render top 100 questions (not all 10,000+)
  const questions = await Question.find({})
    .sort({ views: -1 })
    .limit(100)
    .select("_id");

  return questions.map((q) => ({ id: q._id.toString() }));
}

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const question = await getQuestion(params.id);
  if (!question) notFound();

  return <QuestionDetail question={question} />;
}
\`\`\`

## Dynamic Imports for Code Splitting

\`\`\`tsx
import dynamic from "next/dynamic";

// Heavy editor component — only load when needed
const MarkdownEditor = dynamic(
  () => import("@/components/editor/MarkdownEditor"),
  {
    loading: () => <div className="h-[350px] animate-pulse rounded-md bg-gray-200" />,
    ssr: false, // Editor doesn't need SSR
  }
);

// Heavy chart component — only load when scrolled into view
const ActivityChart = dynamic(
  () => import("@/components/charts/ActivityChart"),
  { loading: () => <ChartSkeleton /> }
);
\`\`\`

## Route Segment Config

\`\`\`tsx
// Per-page configuration
export const dynamic = "force-dynamic";          // Always render on request
export const revalidate = 60;                    // ISR: every 60 seconds
export const fetchCache = "default-cache";       // Default caching
export const runtime = "nodejs";                 // Node.js runtime (vs edge)
export const preferredRegion = "auto";          // Deploy close to data
\`\`\`

> 💡 Pre-render only your most popular pages. The long tail will be rendered on-demand and cached after the first visit.
`,

"9998eda4-912c-4e28-811d-48917413829e": `# How Image & Font Optimization Work

Next.js provides built-in image and font optimization for dramatically better performance.

## Image Optimization

\`\`\`tsx
import Image from "next/image";

// ❌ Regular HTML img — no optimization
<img src="/hero.jpg" alt="Hero" />

// ✅ Next.js Image — automatic optimization
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority              // Load immediately (above the fold)
  placeholder="blur"    // Show blurred preview while loading
  blurDataURL="data:..." // Base64 blur placeholder
/>
\`\`\`

## What Next.js Image Does

| Feature | Benefit |
|---|---|
| Automatic WebP/AVIF | 30-50% smaller files |
| Responsive srcSet | Right size for each device |
| Lazy loading | Only loads when visible |
| Blur placeholder | Better perceived performance |
| CDN caching | Optimized images cached on CDN |

## Font Optimization with next/font

\`\`\`tsx
// app/layout.tsx
import { Inter, Space_Grotesk } from "next/font/google";

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

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable + " " + spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
\`\`\`

## next/font Benefits

- **Zero layout shift** — font dimensions known at build time
- **Self-hosted** — fonts served from your domain
- **No external requests** — no calls to Google Fonts
- **Preloaded** — critical fonts load immediately

> 💡 Always use \`priority\` for above-the-fold images (hero images, logos). This tells Next.js to preload them immediately instead of lazy loading.
`,

"b7dc9154-d272-41b6-aa5d-e57efed10d25": `# Image & Font Optimization in Code

Implementing performance optimizations across DevOverflow.

## Avatar Component with Optimization

\`\`\`tsx
import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: 24, md: 40, lg: 100 };

export default function Avatar({ src, alt, size = "md" }: AvatarProps) {
  const dimension = sizes[size];

  return (
    <Image
      src={src || "/assets/icons/avatar.svg"}
      alt={alt}
      width={dimension}
      height={dimension}
      className="rounded-full object-cover"
      quality={size === "lg" ? 90 : 75}  // Higher quality for larger images
    />
  );
}
\`\`\`

## Metadata for SEO

\`\`\`tsx
// app/questions/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const question = await getQuestion(params.id);

  return {
    title: question.title + " | DevOverflow",
    description: question.content.substring(0, 160),
    openGraph: {
      title: question.title,
      description: question.content.substring(0, 160),
      images: [{ url: "/api/og?title=" + encodeURIComponent(question.title) }],
    },
  };
}
\`\`\`

## Loading States with Suspense

\`\`\`tsx
// app/questions/[id]/page.tsx
import { Suspense } from "react";

export default async function QuestionPage({ params }) {
  const question = await getQuestion(params.id);

  return (
    <>
      <QuestionHeader question={question} />
      <QuestionContent question={question} />

      {/* Answers can load independently — don't block the page */}
      <Suspense fallback={<AnswersSkeleton />}>
        <Answers questionId={params.id} />
      </Suspense>
    </>
  );
}

function AnswersSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      ))}
    </div>
  );
}
\`\`\`

> 💡 Wrapping slow data fetches in \`<Suspense>\` shows the rest of the page immediately while the slow section loads — dramatically improving perceived performance.
`,

"9f642c67-0de5-439b-ae70-cebda7997bc2": `# How Loading.tsx & Error.tsx Work

Next.js has built-in conventions for loading and error states that work with React Suspense and Error Boundaries.

## Loading.tsx

\`\`\`tsx
// app/(root)/questions/loading.tsx
// Automatically shown while page.tsx is loading

export default function Loading() {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">All Questions</h1>

      {/* Skeleton for search bar */}
      <div className="mt-11 h-14 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />

      {/* Skeleton for filter buttons */}
      <div className="mt-6 flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>

      {/* Skeleton for question cards */}
      <div className="mt-10 flex flex-col gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-48 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </section>
  );
}
\`\`\`

## Error.tsx

\`\`\`tsx
// app/(root)/questions/error.tsx
"use client"; // Error boundaries must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-center min-h-[400px] flex-col">
      <h2 className="h2-bold text-dark200_light900">Something went wrong!</h2>
      <p className="body-regular text-dark500_light700 mt-3.5 max-w-md text-center">
        {error.message || "An unexpected error occurred while loading questions."}
      </p>
      <button
        onClick={reset}
        className="primary-gradient mt-5 rounded-lg px-8 py-3 text-light-900"
      >
        Try again
      </button>
    </div>
  );
}
\`\`\`

## File Convention Hierarchy

\`\`\`
app/(root)/questions/
  ├── loading.tsx    ← Shown while page loads (Suspense boundary)
  ├── error.tsx      ← Shown on error (Error boundary)
  ├── not-found.tsx  ← Shown when notFound() is called
  └── page.tsx       ← The actual page
\`\`\`

> 💡 Make skeletons match the actual page layout. Users perceive pages as loading faster when the skeleton resembles the final content.
`,

"61aa18ec-3d51-4212-b0c6-dfcfcaedcca6": `# Task: Implement Loading & Error States

Build skeleton loaders and error boundaries!

## Your Task

Create a UI state management system that handles loading, error, and empty states consistently.

> 💡 **Hint:** Each state should match the final layout to minimize layout shift.

## Requirements

- Implement \`SkeletonCard(type)\` that returns a skeleton shape matching "question", "user", or "tag" card layouts
- Implement \`SkeletonList(type, count)\` that renders the right number of skeleton cards
- Implement \`ErrorState(error, onRetry)\` that displays error message + retry button
- Implement \`EmptyState(title, description, actionLabel, actionHref)\` that shows when no results found

## What You'll Practice

- Loading state patterns (skeleton screens)
- Error recovery and retry logic
- Empty state UX design
`,

"3012d2b5-4fe4-44d7-ba18-29d02f2b14be": `# Task: Performance Audit & Optimization

Run a performance audit on a Next.js application!

## Your Task

Build a performance analysis tool that identifies common Next.js performance bottlenecks.

> 💡 **Hint:** Look for patterns like unnecessary "use client", missing loading.tsx, uncached fetches, and unoptimized images.

## Requirements

- Implement \`analyzeRouteConfig(routes)\` that checks for: missing loading.tsx, missing error.tsx, force-dynamic without reason
- Implement \`analyzeClientComponents(components)\` that identifies components that could be Server Components (no hooks, no event handlers)
- Implement \`analyzeDataFetching(fetches)\` that finds: uncached fetches that could be cached, duplicate fetches that should use Request Memoization, missing revalidation settings
- Implement \`generateReport(analysis)\` that produces a prioritized list of optimizations with estimated impact

## What You'll Practice

- Next.js performance patterns
- Static analysis of code patterns
- Performance optimization strategies
`,

// ── Module 13: Testing (9 lessons) ──
"3636a3d7-9f26-47db-807c-fe7e76d50706": `# How Testing Works in Next.js — The Testing Pyramid

Testing in Next.js involves testing at multiple levels: unit tests, integration tests, and end-to-end tests.

## The Testing Pyramid

\`\`\`
         ╱╲
        ╱ E2E ╲          Few: Full browser, slow, expensive
       ╱────────╲         Tool: Playwright or Cypress
      ╱Integration╲      Some: API + DB, medium, reliable
     ╱──────────────╲     Tool: Jest + Supertest
    ╱   Unit Tests    ╲   Many: Pure functions, fast, cheap
   ╱────────────────────╲ Tool: Jest + React Testing Library
\`\`\`

## What to Test at Each Level

| Level | What to Test | Example |
|---|---|---|
| Unit | Pure functions, utils, helpers | formatDate(), calculateBadges() |
| Unit | React Components (rendering) | QuestionCard renders title correctly |
| Integration | Server Actions | createQuestion() writes to DB |
| Integration | API Routes | POST /api/questions returns 201 |
| E2E | User Flows | User can ask a question and see it listed |

## Testing Setup for Next.js

\`\`\`bash
# Install testing dependencies
npm install -D jest @jest/types @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom ts-jest
npm install -D playwright @playwright/test  # For E2E
\`\`\`

\`\`\`tsx
// jest.config.ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
\`\`\`

> 💡 Next.js's \`next/jest\` helper auto-configures Jest to understand CSS modules, image imports, path aliases, and the App Router.
`,

"ba6f03f4-27af-453c-9c13-cc21c81d0dbe": `# Unit Testing in Code — Components & Utils

Writing unit tests for DevOverflow components and utility functions.

## Testing Utility Functions

\`\`\`tsx
// __tests__/utils.test.ts
import { formatNumber, getTimestamp, formatDate } from "@/lib/utils";

describe("formatNumber", () => {
  it("returns number as-is below 1000", () => {
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with K", () => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(10000)).toBe("10K");
  });

  it("formats millions with M", () => {
    expect(formatNumber(1000000)).toBe("1M");
    expect(formatNumber(2500000)).toBe("2.5M");
  });
});

describe("getTimestamp", () => {
  it('returns "just now" for recent dates', () => {
    expect(getTimestamp(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(getTimestamp(fiveMinAgo)).toBe("5 minutes ago");
  });
});
\`\`\`

## Testing React Components

\`\`\`tsx
// __tests__/components/QuestionCard.test.tsx
import { render, screen } from "@testing-library/react";
import QuestionCard from "@/components/cards/QuestionCard";

const mockQuestion = {
  _id: "1",
  title: "How to use useEffect?",
  tags: [{ _id: "t1", name: "react" }],
  author: { _id: "u1", name: "John", picture: "/avatar.jpg" },
  upvotes: 42,
  answers: [],
  views: 1500,
  createdAt: new Date("2024-01-01"),
};

describe("QuestionCard", () => {
  it("renders question title", () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText("How to use useEffect?")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  it("renders formatted vote count", () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders formatted view count", () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText("1.5K")).toBeInTheDocument();
  });
});
\`\`\`

> 💡 Mock data should be realistic enough to catch edge cases (large numbers, special characters, empty arrays) but simple enough to understand at a glance.
`,

"55449310-ba7d-42c0-978b-ec749a7c142d": `# Task: Write Unit Tests for Core Utils

Test the core utility functions!

## Your Task

Write comprehensive unit tests for utility functions used throughout the application.

> 💡 **Hint:** Good tests cover normal cases, edge cases, and error cases. Think about boundary values.

## Requirements

- Test \`formatNumber(n)\`: 0, 1, 999, 1000, 1500, 10000, 1000000, negative numbers
- Test \`getTimestamp(date)\`: just now (< 1 min), minutes ago, hours ago, days ago, months ago, years ago
- Test \`calculateBadges(stats)\`: no badges (zeroes), bronze only, silver, gold, multiple badge types
- Test \`slugify(text)\`: normal text, special characters, spaces, already-slugified text, empty string

## What You'll Practice

- Writing comprehensive test cases
- Edge case identification
- Test organization with describe/it
`,

"09930cb5-74cb-4f98-ba1b-3c7901d8e042": `# How to Test Server Actions — Integration Testing

Server Actions interact with the database, making them integration tests. You need a test database.

## Test Database Setup

\`\`\`tsx
// jest.setup.ts — for integration tests
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clean all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
\`\`\`

## Testing a Server Action

\`\`\`tsx
// __tests__/actions/question.test.ts
import { createQuestion, getQuestions, deleteQuestion } from "@/lib/actions/question.action";
import User from "@/database/user.model";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";

describe("Question Actions", () => {
  let testUser: any;

  beforeEach(async () => {
    testUser = await User.create({
      clerkId: "test-clerk-id",
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      picture: "/test.jpg",
    });
  });

  it("creates a question with tags", async () => {
    await createQuestion({
      title: "What is React?",
      content: "I want to learn React",
      tags: ["react", "javascript"],
      author: testUser._id.toString(),
      path: "/",
    });

    const questions = await Question.find({});
    expect(questions).toHaveLength(1);
    expect(questions[0].title).toBe("What is React?");

    const tags = await Tag.find({});
    expect(tags).toHaveLength(2);
    expect(tags.map((t) => t.name)).toEqual(expect.arrayContaining(["react", "javascript"]));
  });

  it("increments user reputation on question creation", async () => {
    await createQuestion({ title: "Test", content: "Test", tags: ["test"], author: testUser._id.toString(), path: "/" });
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.reputation).toBe(5);
  });
});
\`\`\`

> 💡 \`MongoMemoryServer\` spins up an in-memory MongoDB instance for testing. No external database needed, and each test starts clean.
`,

"c6de320b-d5ea-4924-8fea-34bc79f7d95e": `# Integration Tests in Code — CRUD + Voting

Testing complex server action workflows.

## Testing Vote Actions

\`\`\`tsx
// __tests__/actions/vote.test.ts
describe("Vote Actions", () => {
  let user1: any, user2: any, question: any;

  beforeEach(async () => {
    user1 = await User.create({ clerkId: "u1", name: "User 1", username: "user1", email: "u1@test.com", picture: "/" });
    user2 = await User.create({ clerkId: "u2", name: "User 2", username: "user2", email: "u2@test.com", picture: "/" });
    question = await Question.create({ title: "Test Q", content: "Content", author: user1._id, tags: [] });
  });

  it("adds upvote to question", async () => {
    await upvoteQuestion({
      questionId: question._id.toString(),
      userId: user2._id.toString(),
      hasUpvoted: false,
      hasDownvoted: false,
      path: "/",
    });

    const updated = await Question.findById(question._id);
    expect(updated.upvotes).toContainEqual(user2._id);
  });

  it("toggles upvote off", async () => {
    // First upvote
    await upvoteQuestion({ questionId: question._id.toString(), userId: user2._id.toString(), hasUpvoted: false, hasDownvoted: false, path: "/" });
    // Then remove
    await upvoteQuestion({ questionId: question._id.toString(), userId: user2._id.toString(), hasUpvoted: true, hasDownvoted: false, path: "/" });

    const updated = await Question.findById(question._id);
    expect(updated.upvotes).not.toContainEqual(user2._id);
  });

  it("switches downvote to upvote", async () => {
    question.downvotes.push(user2._id);
    await question.save();

    await upvoteQuestion({ questionId: question._id.toString(), userId: user2._id.toString(), hasUpvoted: false, hasDownvoted: true, path: "/" });

    const updated = await Question.findById(question._id);
    expect(updated.upvotes).toContainEqual(user2._id);
    expect(updated.downvotes).not.toContainEqual(user2._id);
  });

  it("updates author reputation on upvote", async () => {
    await upvoteQuestion({ questionId: question._id.toString(), userId: user2._id.toString(), hasUpvoted: false, hasDownvoted: false, path: "/" });
    const author = await User.findById(user1._id);
    expect(author.reputation).toBeGreaterThan(0);
  });
});
\`\`\`

> 💡 Testing vote toggling (on → off → switch) covers the three most complex code paths. If these pass, simpler cases are likely correct too.
`,

"bf5e7d30-2994-4769-aef5-54fe21b8c6ac": `# How End-to-End Testing Works with Playwright

E2E tests verify complete user journeys through the actual browser.

## Playwright Setup

\`\`\`tsx
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Fail CI if test.only is left in
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",  // Capture trace on failure for debugging
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],

  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
\`\`\`

## Writing E2E Tests

\`\`\`tsx
// e2e/question-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Question Flow", () => {
  test("user can browse questions", async ({ page }) => {
    await page.goto("/");

    // Verify page loaded
    await expect(page.getByRole("heading", { name: "All Questions" })).toBeVisible();

    // Click on a question
    const firstQuestion = page.locator("article").first();
    await firstQuestion.click();

    // Verify question detail page
    await expect(page.getByText("Answers")).toBeVisible();
    await expect(page.getByText("votes")).toBeVisible();
  });

  test("search filters questions", async ({ page }) => {
    await page.goto("/");

    // Type in search
    await page.getByPlaceholder("Search").fill("react");
    await page.keyboard.press("Enter");

    // Verify URL updated
    await expect(page).toHaveURL(/q=react/);

    // Verify results contain search term
    const titles = await page.locator("h3").allTextContents();
    expect(titles.some((t) => t.toLowerCase().includes("react"))).toBe(true);
  });
});
\`\`\`

> 💡 Playwright's \`trace\` feature records a timeline of actions, network requests, and screenshots when a test fails — making debugging much easier.
`,

"74fc0d87-618a-4360-8b94-c4fc8b5af078": `# E2E Tests in Code — Full User Journey

Complete E2E tests for the authentication and question-asking flow.

## Auth Flow Test

\`\`\`tsx
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users from ask-question", async ({ page }) => {
    await page.goto("/ask-question");
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("shows sign-in page with OAuth buttons", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText("Sign In")).toBeVisible();
    await expect(page.getByText("Continue with GitHub")).toBeVisible();
    await expect(page.getByText("Continue with Google")).toBeVisible();
  });
});
\`\`\`

## Question CRUD Test

\`\`\`tsx
// e2e/questions.spec.ts
import { test, expect } from "@playwright/test";

// Use authenticated state
test.use({ storageState: "e2e/.auth/user.json" });

test.describe("Question Management", () => {
  test("user can ask a question", async ({ page }) => {
    await page.goto("/ask-question");

    // Fill in question form
    await page.getByLabel("Question Title").fill("How to use React hooks?");

    // Fill in editor (Monaco or TinyMCE)
    const editor = page.locator(".ql-editor, [role='textbox']").first();
    await editor.fill("I want to understand useState and useEffect hooks.");

    // Add tags
    await page.getByPlaceholder("Add tags").fill("react");
    await page.keyboard.press("Enter");
    await page.getByPlaceholder("Add tags").fill("hooks");
    await page.keyboard.press("Enter");

    // Submit
    await page.getByRole("button", { name: "Ask a Question" }).click();

    // Verify redirect to question page
    await expect(page.getByText("How to use React hooks?")).toBeVisible();
    await expect(page.getByText("react")).toBeVisible();
    await expect(page.getByText("hooks")).toBeVisible();
  });

  test("user can edit their question", async ({ page }) => {
    await page.goto("/");
    // Navigate to own question
    await page.getByText("How to use React hooks?").click();
    await page.getByRole("button", { name: "Edit" }).click();

    // Modify title
    await page.getByLabel("Question Title").fill("How to use React hooks effectively?");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("How to use React hooks effectively?")).toBeVisible();
  });
});
\`\`\`

## Visual Regression Test

\`\`\`tsx
// e2e/visual.spec.ts
test("home page screenshot", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home-page.png", {
    maxDiffPixelRatio: 0.01,
  });
});
\`\`\`

> 💡 Store authenticated browser state in a JSON file (\`storageState\`) and reuse it across tests. This avoids logging in before every single test.
`,

"4dddb3e3-1e97-4c32-9273-100c104ed12f": `# Task: Write E2E Tests for Core User Flows

Create end-to-end tests for critical user journeys!

## Your Task

Write Playwright-style E2E test specifications that cover the most important user flows.

> 💡 **Hint:** Focus on the happy path first, then add edge cases. Each test should be independent and leave no side effects.

## Requirements

- Test the question browsing flow: load home → verify questions visible → click question → verify detail page
- Test the search flow: home → type search → verify URL updates → verify filtered results
- Test the tag browsing flow: navigate to tags → click a tag → verify questions with that tag shown
- Test responsive behavior: same flows on mobile viewport (375px width)
- Each test should verify: correct URL, visible content, no console errors

## What You'll Practice

- E2E test design patterns
- User flow modeling
- Cross-device testing strategies
`,

// ── Module 14: Deployment & Production (9 lessons) ──
"10fe3139-ef5f-4ecd-8414-d5e5e2064cd5": `# Task: E2E Test the Auth Flow

Write end-to-end tests for the authentication flow!

## Your Task

Create Playwright-style E2E test specifications that cover the complete authentication journey.

> 💡 **Hint:** Test both the happy path (successful auth) and error paths (invalid credentials, expired sessions).

## Requirements

- Test unauthenticated redirect: visiting /ask-question redirects to /sign-in
- Test sign-in page renders OAuth buttons (GitHub, Google)
- Test protected route access after authentication (simulated with storageState)
- Test sign-out flow: click sign out → verify redirect to home → verify protected route access revoked
- Test session persistence: reload page → verify user stays logged in

## What You'll Practice

- Authentication flow testing
- Protected route verification
- Session state management in tests
`,

"4973dc34-1bce-4554-bc0f-257e462d0e1a": `# Vercel Deployment in Code — Configuration & Preview

Setting up Vercel for production deployment.

## vercel.json Configuration

\`\`\`json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "redirects": [
    { "source": "/home", "destination": "/", "permanent": true }
  ]
}
\`\`\`

## Preview Deployments

\`\`\`
Every pull request gets a unique preview URL:

PR #42 → https://devoverflow-pr-42.vercel.app

This enables:
✅ QA testing before merge
✅ Visual review by teammates
✅ Automated E2E tests against preview
✅ Stakeholder sign-off
\`\`\`

## Build Output Analysis

\`\`\`
Route (app)                    Size     First Load JS
┌ ○ /                         5.2 kB      92 kB
├ ○ /questions                3.1 kB      89 kB
├ λ /questions/[id]           8.4 kB      95 kB
├ ○ /tags                     2.8 kB      89 kB
├ λ /profile/[id]             6.1 kB      93 kB
└ λ /ask-question             12 kB       99 kB

○ = Static (pre-rendered)
λ = Dynamic (rendered on request)
\`\`\`

> 💡 Review the build output table after every deploy. If a page you expected to be static (○) shows as dynamic (λ), investigate — you might have an unnecessary dynamic function.
`,

"fc3c7f61-ad98-48b9-91e5-21cc5a909953": `# Task: Configure Deployment Pipeline

Set up a CI/CD pipeline for a Next.js app!

## Your Task

Create configuration for a complete deployment pipeline with environment management, build optimization, and health checks.

> 💡 **Hint:** The pipeline should handle build, test, and deploy stages with proper environment variable management.

## Requirements

- Implement \`validateEnvVars(required, env)\` that checks all required env vars are present and returns \`{ valid, missing }\`
- Implement \`parseBuildOutput(output)\` that extracts route info: path, type (static/dynamic), size, firstLoadJS
- Implement \`checkBuildHealth(routes)\` that flags: pages over 100KB first load, unexpected dynamic pages, missing static pages
- Implement \`generateDeployConfig(options)\` that creates a deployment config matching the target platform

## What You'll Practice

- CI/CD pipeline design
- Build analysis and optimization
- Environment management
`,

"c773d4b9-e899-47c5-98a9-7376a0943814": `# How Database Deployment Works — MongoDB Atlas

Setting up MongoDB Atlas for production with proper security and performance.

## Atlas Setup Checklist

\`\`\`
1. ✅ Create MongoDB Atlas account
2. ✅ Create a cluster (M0 free tier for testing, M10+ for production)
3. ✅ Create database user (strong password)
4. ✅ Whitelist IP addresses (0.0.0.0/0 for Vercel, or specific IPs)
5. ✅ Get connection string
6. ✅ Set DATABASE_URL in Vercel env vars
7. ✅ Create indexes for frequently queried fields
\`\`\`

## Connection String Format

\`\`\`
mongodb+srv://username:password@cluster0.abc123.mongodb.net/devoverflow?retryWrites=true&w=majority
\`\`\`

## Database Indexes for Performance

\`\`\`tsx
// These indexes dramatically speed up common queries

// Questions — searched by title, filtered by tags, sorted by date
QuestionSchema.index({ title: "text", content: "text" });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ views: -1 });
QuestionSchema.index({ author: 1 });

// Users — searched by name, sorted by reputation
UserSchema.index({ name: "text", username: "text" });
UserSchema.index({ reputation: -1 });

// Tags — searched by name
TagSchema.index({ name: 1 }, { unique: true });
TagSchema.index({ questions: -1 }); // Sort by popularity
\`\`\`

## Connection Pool Management

\`\`\`tsx
// lib/mongoose.ts — Singleton connection
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  await mongoose.connect(process.env.DATABASE_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log("MongoDB connected");
}
\`\`\`

> 💡 In serverless environments (Vercel), each function invocation might create a new database connection. The singleton pattern (\`isConnected\` flag) prevents connection exhaustion.
`,

"ee57c6ba-d72a-4fca-a889-9b9e8bc56deb": `# Database Deployment in Code — Migrations & Backups

Managing database changes in production.

## Migration Strategy

\`\`\`tsx
// scripts/migrate.ts
// For MongoDB, "migrations" are scripts that modify existing data

async function migrate() {
  await connectToDatabase();

  console.log("Running migration: Add bio field to users");

  // Add default bio to all users without one
  const result = await User.updateMany(
    { bio: { $exists: false } },
    { $set: { bio: "" } }
  );
  console.log("Updated " + result.modifiedCount + " users");

  console.log("Running migration: Normalize tag names");
  const tags = await Tag.find({});
  for (const tag of tags) {
    const normalized = tag.name.toLowerCase().trim();
    if (normalized !== tag.name) {
      await Tag.findByIdAndUpdate(tag._id, { name: normalized });
    }
  }

  console.log("Migrations complete");
  process.exit(0);
}
\`\`\`

## Backup Script

\`\`\`bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

# Dump from Atlas
mongodump --uri="$DATABASE_URL" --out="$BACKUP_DIR"

# Compress
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "Backup saved to $BACKUP_DIR.tar.gz"

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR.tar.gz" s3://devoverflow-backups/
\`\`\`

## Health Check Endpoint

\`\`\`tsx
// app/api/health/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    return NextResponse.json({
      status: dbState === 1 ? "healthy" : "degraded",
      database: dbState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", error: String(error) }, { status: 503 });
  }
}
\`\`\`

> 💡 Always have a \`/api/health\` endpoint. Monitoring services (like UptimeRobot or Vercel) can ping it to detect downtime immediately.
`,

"89ad1f61-dc01-4736-8472-10815cff1b17": `# How Error Monitoring & Logging Work in Production

You need visibility into production errors and performance. Tools like Sentry provide real-time error tracking.

## Sentry Integration

\`\`\`bash
npx @sentry/wizard@latest -i nextjs
\`\`\`

\`\`\`tsx
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,     // 10% of transactions
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of error sessions
});

// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
\`\`\`

## Error Tracking Flow

\`\`\`
1. Error occurs in production
2. Sentry captures: stack trace, browser info, user context, breadcrumbs
3. Groups duplicate errors together
4. Sends alert (email, Slack, PagerDuty)
5. Links to source maps for readable stack traces

Error → Sentry → Alert → Fix → Deploy → Verify
\`\`\`

## Custom Error Context

\`\`\`tsx
// Add user context to errors
Sentry.setUser({ id: session.user.id, email: session.user.email });

// Add breadcrumbs for debugging
Sentry.addBreadcrumb({
  category: "question",
  message: "User viewed question " + questionId,
  level: "info",
});

// Capture custom errors
try {
  await createQuestion(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "create-question" },
    extra: { questionData: data },
  });
  throw error;
}
\`\`\`

> 💡 Set \`tracesSampleRate\` low (0.05-0.1) in production to avoid excessive costs. Full tracing is expensive — sample just enough to identify patterns.
`,

"a3abb5fa-1e05-41ae-be09-f85e40e6dff6": `# Production Monitoring in Code — Sentry, Analytics & Performance

Complete production monitoring setup.

## Custom Monitoring Dashboard

\`\`\`tsx
// lib/monitoring.ts
export function trackEvent(name: string, properties?: Record<string, any>) {
  // Send to analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, properties);
  }
  
  // Also log to Sentry as breadcrumb
  Sentry.addBreadcrumb({ category: "event", message: name, data: properties, level: "info" });
}

// Usage
trackEvent("question_created", { tags: ["react", "hooks"], hasCode: true });
trackEvent("answer_accepted", { responseTime: 45 }); // minutes to accept
trackEvent("search_performed", { query: "useEffect", resultsCount: 12 });
\`\`\`

## Web Vitals Monitoring

\`\`\`tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />  {/* Core Web Vitals tracking */}
        <Analytics />       {/* Page view analytics */}
      </body>
    </html>
  );
}
\`\`\`

## Custom Performance Monitoring

\`\`\`tsx
// Measure Server Action performance
export async function createQuestion(params: CreateQuestionParams) {
  const start = performance.now();

  try {
    await connectToDatabase();
    // ... create question logic
    
    const duration = performance.now() - start;
    if (duration > 2000) {
      console.warn("Slow createQuestion: " + duration.toFixed(0) + "ms");
      Sentry.captureMessage("Slow Server Action", {
        level: "warning",
        tags: { action: "createQuestion" },
        extra: { duration },
      });
    }
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
\`\`\`

> 💡 Track business metrics (questions asked, answers accepted, search queries) alongside technical metrics (response time, error rate). Both are essential for understanding app health.
`,

"9e2e8269-579c-4e40-aa69-e6bfa9485d20": `# Security Hardening for Production

Before going live, implement these security measures to protect your application and users.

## Security Checklist

\`\`\`
Authentication:
✅ Rate limit login attempts
✅ Secure session management (httpOnly cookies)
✅ CSRF protection (SameSite cookies)
✅ OAuth tokens encrypted at rest

Authorization:
✅ Server-side permission checks for every action
✅ Don't trust client-side role checks alone
✅ Validate ownership before edit/delete

Input Validation:
✅ Sanitize HTML in user content (XSS prevention)
✅ Validate all input server-side (Zod schemas)
✅ Parameterize database queries (MongoDB injection prevention)
✅ Limit request body size

Headers:
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ Content-Security-Policy
✅ Strict-Transport-Security (HSTS)
\`\`\`

## Content Security Policy

\`\`\`tsx
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://img.clerk.com",
      "font-src 'self'",
      "connect-src 'self' https://*.clerk.dev https://*.mongodb.net",
    ].join("; ")
  );

  return response;
}
\`\`\`

## Rate Limiting

\`\`\`tsx
// lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  if (entry.count >= limit) {
    return false; // Rate limited
  }

  entry.count++;
  return true;
}

// Usage in Server Action
export async function createQuestion(params) {
  const allowed = rateLimit("create-question:" + params.userId, 10, 60 * 1000);
  if (!allowed) throw new Error("Too many questions. Please wait a minute.");
  // ... proceed
}
\`\`\`

> 💡 Rate limiting on the server is essential — client-side rate limiting can be bypassed. Always enforce limits where the data processing happens.
`,

"8bb1176b-1f1d-45c8-be1d-8f3d7b4eba02": `# Task: Build the Deployment Checklist

Create a production readiness validation system!

## Your Task

Build a comprehensive pre-deployment checker that validates all critical configuration for a production Next.js app.

> 💡 **Hint:** Combine automated checks with manual verification items. Some things can be validated programmatically, others need human review.

## Requirements

- Implement \`checkEnvironmentVars(required, env)\` that validates presence of all required env vars (DATABASE_URL, AUTH_SECRET, etc.)
- Implement \`checkSecurityHeaders(headers)\` that verifies CSP, HSTS, X-Frame-Options, X-Content-Type-Options are present
- Implement \`checkBuildSize(routes, maxFirstLoad)\` that flags routes exceeding a first-load JS budget (default: 100KB)
- Implement \`generateReadinessReport(checks)\` that produces a pass/fail report with recommendations for each failed check

## What You'll Practice

- Production readiness validation
- Security header configuration
- Build budget enforcement
`,

"b92d2608-ac01-43f6-a20c-bbff6887237a": `# Course Recap & What's Next

Congratulations! You've completed The Ultimate Next.js Course. Here's everything you've learned and where to go next.

## What You've Built

Throughout this course, you built **DevOverflow** — a full-stack Q&A platform with:

- Server & Client Components with the App Router
- Server Actions for mutations
- MongoDB database with Mongoose ODM
- Clerk authentication with OAuth
- AI-generated answers with OpenAI
- Global search across 4 collections
- Tag system with auto-creation
- Reputation & badge system
- Pagination, filtering & URL state
- Performance optimization (caching, ISR, code splitting)
- Full testing suite (unit, integration, E2E)
- Production deployment on Vercel

## Key Concepts Mastered

| Area | Concepts |
|---|---|
| Rendering | Server Components, Client Components, Streaming, Suspense |
| Data | Server Actions, revalidation, caching, optimistic updates |
| Auth | OAuth, sessions, RBAC, middleware protection |
| Performance | ISR, code splitting, image/font optimization, loading states |
| Testing | Jest, React Testing Library, Playwright, MongoMemoryServer |
| Production | Vercel, MongoDB Atlas, Sentry, security headers |

## Where to Go Next

1. **Add features** to DevOverflow: real-time notifications, markdown preview, code snippets
2. **Build your own project** using the patterns you've learned
3. **Explore** Next.js Middleware, Edge Runtime, and Partial Prerendering
4. **Learn** database scaling (sharding, read replicas, connection pooling)
5. **Contribute** to open-source Next.js projects

> 💡 The best way to solidify what you've learned is to build something new. Start a project, hit problems, solve them — that's where real learning happens.
`,
};

async function main() {
  console.log("Updating Ultimate Next.js — Modules 12-14 (Reputation, Perf, Testing, Deploy)...");
  let count = 0;
  let skipped = 0;
  for (const [id, content] of Object.entries(updates)) {
    try {
      await p.lesson.update({ where: { id }, data: { content } });
      count++;
      if (count % 10 === 0) console.log("  " + count + " lessons updated...");
    } catch (e: any) {
      if (e.code === "P2025") {
        console.log("  SKIP (not found): " + id);
        skipped++;
      } else {
        throw e;
      }
    }
  }
  console.log("Done! Updated " + count + " lessons, skipped " + skipped + ".");
  await p.$disconnect();
}

main().catch(console.error);
