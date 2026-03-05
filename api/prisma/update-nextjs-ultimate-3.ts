import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 6 (sortOrder): Questions & Answers — Building the Core (13 lessons) ──
"c12e0159-8ba8-423f-bf8e-c4e071114eb6": `# How Forms Work in Next.js

Forms in Next.js can use either **Server Actions** (progressive enhancement) or **Client Components** (rich interactions) — and often both together.

## Two Approaches

### 1. Server Action Form (Progressive Enhancement)

\`\`\`tsx
// Works without JavaScript!
export default function SimpleForm() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    await createQuestion({ title });
  }

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <button type="submit">Post</button>
    </form>
  );
}
\`\`\`

### 2. Client Component Form (Rich UX)

\`\`\`tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RichForm() {
  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: { title: "", content: "", tags: [] },
  });

  async function onSubmit(values: QuestionInput) {
    await createQuestion(values);
    router.push("/");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Rich inputs with validation */}
      </form>
    </Form>
  );
}
\`\`\`

## React Hook Form + Zod

| Library | Role | Why |
|---|---|---|
| react-hook-form | Form state management | Minimal re-renders, great DX |
| @hookform/resolvers | Schema validation bridge | Connects RHF to Zod |
| zod | Schema validation | Type-safe, composable schemas |

> 💡 Use Server Action forms for simple forms and Client Components for rich interactions (live validation, multi-step, dynamic fields).
`,

"d2235420-b1c2-4c96-a948-cc5685ea9b07": `# Form Setup in Code — React Hook Form + Zod

Complete form setup for the DevOverflow "Ask a Question" page.

## Validation Schema

\`\`\`tsx
// lib/validations.ts
import { z } from "zod";

export const questionSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(130, "Title must be at most 130 characters"),
  content: z.string()
    .min(100, "Content must be at least 100 characters"),
  tags: z.array(z.string().min(1).max(15))
    .min(1, "Add at least one tag")
    .max(3, "You can add up to 3 tags"),
});

export type QuestionInput = z.infer<typeof questionSchema>;
\`\`\`

## Form Component

\`\`\`tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionSchema, QuestionInput } from "@/lib/validations";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function QuestionForm({ userId }: { userId: string }) {
  const form = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: { title: "", content: "", tags: [] },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: QuestionInput) {
    try {
      await createQuestion({ ...values, author: userId });
      router.push("/");
    } catch {
      toast({ title: "Failed to post question", variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="paragraph-regular background-light900_dark300 light-border-2 min-h-[56px] border"
                  placeholder="What's your question?"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="primary-gradient w-fit !text-light-900">
          {isSubmitting ? "Posting..." : "Post Question"}
        </Button>
      </form>
    </Form>
  );
}
\`\`\`

> 💡 The \`zodResolver\` automatically validates on blur and on submit. Error messages come from the Zod schema definitions.
`,

"3f8affdf-0ea1-4b76-a6d8-1a3470546daf": `# Rich Text & Tag Input in Code

Building the rich text editor and tag input for DevOverflow.

## Rich Text Editor with TinyMCE

\`\`\`tsx
"use client";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface RichEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
      onInit={(evt, editor) => { editorRef.current = editor; }}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 350,
        menubar: false,
        plugins: ["advlist", "autolink", "lists", "link", "image", "charmap",
          "preview", "anchor", "searchreplace", "visualblocks", "codesample", "fullscreen"],
        toolbar: "undo redo | blocks | bold italic forecolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist | codesample",
        content_style: "body { font-family: Inter, sans-serif; font-size: 16px }",
        skin: mode === "dark" ? "oxide-dark" : "oxide",
        content_css: mode === "dark" ? "dark" : "default",
      }}
    />
  );
}
\`\`\`

## Custom Tag Input

\`\`\`tsx
"use client";
import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";

export default function TagInput({ value, onChange, maxTags = 3 }: TagInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (value.length >= maxTags) {
        return toast({ title: "Max " + maxTags + " tags", variant: "destructive" });
      }
      if (!value.includes(input.trim().toLowerCase())) {
        onChange([...value, input.trim().toLowerCase()]);
      }
      setInput("");
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <Badge key={tag} className="subtle-medium background-light800_dark300 text-light400_light500 flex items-center gap-2 rounded-md border-none px-4 py-2 capitalize">
            {tag}
            <button onClick={() => removeTag(tag)}>✕</button>
          </Badge>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tags..."
        className="paragraph-regular background-light900_dark300 light-border-2 min-h-[56px] w-full rounded-md border px-4"
      />
    </div>
  );
}
\`\`\`

> 💡 The tag input uses the Enter key to add tags and shows them as removable badges. The Zod schema enforces min 1, max 3 tags with max 15 chars each.
`,

"94b7856e-6985-4bb7-b3ac-88846930e5f6": `# Task: Build the Ask Question Page

Create a form validation and submission system!

## Your Task

Build a form handler that validates structured input, manages field-level errors, and handles submission with loading states.

> 💡 **Hint:** Implement a miniature version of React Hook Form's validation pipeline.

## Requirements

- Implement \`createFormValidator(schema)\` that creates a reusable validator from a schema definition
- Schema fields have: type (string/number/array), min, max, required, custom (fn)
- Implement \`validate(data)\` that returns \`{ valid: true }\` or \`{ valid: false, errors: { fieldName: message } }\`
- Implement \`handleSubmit(data, validator, onSubmit)\` that validates before calling onSubmit
- Support async custom validators (e.g., check if title already exists)

## What You'll Practice

- Form validation patterns
- Schema-based validation
- Error message generation
`,

"f9e81333-6a7e-499d-9a5b-cfd66ed75cb2": `# How a Server-Rendered Feed Works

The home page question feed in DevOverflow is a **Server Component** — it fetches data on the server and streams HTML to the client.

## The Feed Architecture

\`\`\`
URL: /?q=react&filter=newest&page=2

         ┌─────────────────────────┐
         │   Server Component      │
         │   (reads searchParams)  │
         └───────────┬─────────────┘
                     │
        ┌────────────▼────────────┐
        │  Server Action:         │
        │  getQuestions({         │
        │    searchQuery: "react",│
        │    filter: "newest",    │
        │    page: 2              │
        │  })                     │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  MongoDB Query with     │
        │  populate, sort, skip,  │
        │  limit                  │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  QuestionCard[]         │
        │  rendered as HTML       │
        │  streamed to client     │
        └─────────────────────────┘
\`\`\`

## Key Patterns

1. **searchParams as state** — filters live in the URL, not React state
2. **Suspense streaming** — the feed loads independently from the rest of the page
3. **Server-side filtering** — the database does the heavy lifting, not JavaScript
4. **Parallel data fetching** — sidebar data loads alongside the feed

> 💡 URL-based state means users can share links like \`/?q=react&filter=frequent\` — bookmarkable, shareable, and works without JavaScript.
`,

"4baf452f-5ea8-414d-ba3f-045a9818c22d": `# Question Feed in Code — Server Component + Cards

Complete home page implementation with streaming.

## The Home Page

\`\`\`tsx
// app/(root)/(home)/page.tsx
import { Suspense } from "react";
import LocalSearch from "@/components/shared/search/LocalSearch";
import Filter from "@/components/shared/Filter";
import QuestionCard from "@/components/cards/QuestionCard";
import Pagination from "@/components/shared/Pagination";
import { getQuestions } from "@/lib/actions/question.action";

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; page?: string };
}) {
  const result = await getQuestions({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch route="/" placeholder="Search for questions" />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))
        ) : (
          <NoResult
            title="There are no questions to show"
            description="Ask a question and kickstart the discussion!"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      <div className="mt-10">
        <Pagination pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.hasMore} />
      </div>
    </>
  );
}
\`\`\`

> 💡 The entire page is a Server Component. \`LocalSearch\` and \`Filter\` are Client Components that update URL params — the page re-renders server-side with new data.
`,

"4de74010-75aa-44e4-b596-de1718fc15a9": `# Task: Build the Home Page Feed

Create a data feed system with filtering and pagination!

## Your Task

Build a feed engine that processes a list of items with search, filtering, sorting, and pagination — the same logic that powers the DevOverflow home page.

> 💡 **Hint:** Each filter transforms the array before pagination slices it.

## Requirements

- Implement \`createFeed(items)\` that creates a chainable feed processor
- Support \`.search(query, fields)\` — fuzzy text search across specified fields
- Support \`.filter(name)\` — predefined filters like "newest", "unanswered", "frequent"
- Support \`.paginate(page, pageSize)\` — return a page of results
- Return \`{ results, totalCount, hasMore, page, totalPages }\`
- Handle empty results with a descriptive message

## What You'll Practice

- Data processing pipelines
- Search, filter, sort, and paginate patterns
- Chainable API design
`,

"b1851947-6fe5-4ab2-be98-fd94eeda5824": `# How Question Detail Pages Work

The question detail page is one of the most complex pages — it combines server-rendered content, interactive voting, an answer form, and dynamic answer listing.

## Page Architecture

\`\`\`
/question/[id]

┌─────────────────────────────────────┐
│ Question Title                      │
│ Asked 3 days ago · Viewed 42 times  │
├─────────────────────────────────────┤
│ 👍 12  Question Content (HTML)  👎 3│
│       Tags: [react] [hooks]         │
│       Author: John · 3 days ago     │
├─────────────────────────────────────┤
│ 5 Answers                           │
├──────────┬──────────────────────────┤
│ 👍 8     │ Answer 1 content         │
│ ✓ Accept │ Author: Jane · 2 days   │
├──────────┼──────────────────────────┤
│ 👍 3     │ Answer 2 content         │
│          │ Author: Bob · 1 day      │
├──────────┴──────────────────────────┤
│ Your Answer                         │
│ ┌─────────────────────────────────┐ │
│ │ Rich Text Editor                │ │
│ └─────────────────────────────────┘ │
│ [Post Your Answer]                  │
└─────────────────────────────────────┘
\`\`\`

## Data Flow

1. **Server Component** fetches question by ID with populated author, tags, answers
2. **Votes Component** (Client) handles interactive voting with optimistic updates
3. **ParseHTML Component** renders the question/answer content safely
4. **Answer Form** (Client) submits via Server Action, revalidates the page

## Dynamic Route Setup

\`\`\`tsx
// app/(root)/question/[id]/page.tsx
export default async function QuestionDetail({ params }: { params: { id: string } }) {
  const question = await getQuestionById({ questionId: params.id });
  // ... render question detail
}
\`\`\`

> 💡 The dynamic \`[id]\` segment means Next.js generates a unique page for each question. Combined with SSR, this gives excellent SEO for each question.
`,

"518f8e8e-4344-49fd-8a60-3f2a5f2972c1": `# Question Detail in Code — Full Layout

Complete question detail page implementation.

## The Detail Page

\`\`\`tsx
// app/(root)/question/[id]/page.tsx
import { auth } from "@/auth";
import { getQuestionById } from "@/lib/actions/question.action";
import ParseHTML from "@/components/shared/ParseHTML";
import Votes from "@/components/shared/Votes";
import AllAnswers from "@/components/shared/AllAnswers";
import AnswerForm from "@/components/forms/AnswerForm";

export default async function QuestionDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { filter?: string; page?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const question = await getQuestionById({ questionId: params.id });

  return (
    <>
      {/* Header: Author + Votes */}
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center">
          <Link href={\`/profile/\${question.author._id}\`} className="flex items-center gap-1">
            <Image src={question.author.picture} width={22} height={22} className="rounded-full" />
            <p className="paragraph-semibold text-dark300_light700">{question.author.name}</p>
          </Link>
          <Votes
            type="question"
            itemId={question._id}
            userId={userId}
            upvotes={question.upvotes.length}
            hasUpvoted={question.upvotes.includes(userId)}
            downvotes={question.downvotes.length}
            hasDownvoted={question.downvotes.includes(userId)}
            hasSaved={question.isSaved}
          />
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">{question.title}</h2>
      </div>

      {/* Question Content */}
      <div className="mt-4">
        <ParseHTML data={question.content} />
      </div>

      {/* Tags */}
      <div className="mt-8 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      {/* Answers Section */}
      <AllAnswers
        questionId={params.id}
        userId={userId}
        totalAnswers={question.answers.length}
        filter={searchParams?.filter}
        page={searchParams?.page ? +searchParams.page : 1}
      />

      {/* Answer Form */}
      {userId && <AnswerForm questionId={params.id} userId={userId} />}
    </>
  );
}
\`\`\`

> 💡 The page mixes Server Components (data fetch, HTML render) with Client Components (Votes, AnswerForm). Only interactive parts ship JavaScript.
`,

"ca881a17-e11b-465b-9174-3efece7d9d57": `# Task: Build Question Detail & Answers

Create a nested content rendering system!

## Your Task

Build a content renderer that handles nested data structures — a question with answers, each having their own votes and metadata.

> 💡 **Hint:** Think of it as a tree: Question → Answers[] → each Answer has votes, author, timestamps.

## Requirements

- Implement \`renderQuestionDetail(question)\` that produces a structured output
- Handle nested answers with their own vote counts and author info
- Implement \`sortAnswers(answers, filter)\` supporting: "highestUpvotes", "lowestUpvotes", "recent", "old"
- Implement \`formatTimestamp(date)\` that returns relative time ("3 days ago", "just now", "2 months ago")
- Handle edge cases: no answers, deleted author, accepted answer at top

## What You'll Practice

- Nested data processing
- Sorting and filtering algorithms
- Relative time formatting
`,

"bd9b487e-c25b-46f2-aa80-3801a3513d5c": `# How Optimistic Voting Works

Optimistic updates make the UI feel instant by updating immediately, then syncing with the server.

## The Problem

\`\`\`
Without optimistic updates:
Click 👍 → Wait 200-500ms → See count change
User thinks: "Did it work? Is it broken?"

With optimistic updates:
Click 👍 → Count changes INSTANTLY → Server syncs in background
User thinks: "Nice, fast app!"
\`\`\`

## How It Works

\`\`\`
1. User clicks upvote
2. UI immediately shows +1 (optimistic)
3. Server Action fires in background
4. If SUCCESS: UI already matches server ✓
5. If FAILURE: Revert the optimistic update ✗
\`\`\`

## React 19's useOptimistic

\`\`\`tsx
import { useOptimistic } from "react";

// initial = current server state
// reducer = how to compute optimistic state
const [optimistic, addOptimistic] = useOptimistic(
  initialState,
  (currentState, optimisticValue) => {
    // Return the new state you EXPECT after the server action
    return computeNewState(currentState, optimisticValue);
  }
);
\`\`\`

## When to Use Optimistic Updates

| Action | Optimistic? | Why |
|---|---|---|
| Vote up/down | ✅ Yes | Instant feedback critical |
| Save to collection | ✅ Yes | Toggle is visually important |
| Delete question | ❌ No | Destructive, should confirm |
| Post question | ❌ No | Complex, needs server validation |
| Edit profile | ⚡ Maybe | Depends on the field |

> 💡 Only use optimistic updates for actions that are very likely to succeed. For risky operations, show a loading state instead.
`,

"b854767f-ef0b-4725-bd6f-68cade5228c5": `# Voting System in Code — Optimistic UI

Complete voting implementation with optimistic updates.

## The Votes Component

\`\`\`tsx
"use client";
import { useOptimistic, useTransition } from "react";
import { voteQuestion, voteAnswer } from "@/lib/actions/vote.action";
import { toggleSaveQuestion } from "@/lib/actions/user.action";

interface VotesProps {
  type: "question" | "answer";
  itemId: string;
  userId?: string;
  upvotes: number;
  hasUpvoted: boolean;
  downvotes: number;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}

export default function Votes(props: VotesProps) {
  const { type, itemId, userId, hasSaved } = props;
  const [isPending, startTransition] = useTransition();

  const [votes, setOptimisticVotes] = useOptimistic(
    {
      upvotes: props.upvotes,
      downvotes: props.downvotes,
      hasUpvoted: props.hasUpvoted,
      hasDownvoted: props.hasDownvoted,
    },
    (state, action: "upvote" | "downvote") => {
      if (action === "upvote") {
        return {
          upvotes: state.hasUpvoted ? state.upvotes - 1 : state.upvotes + 1,
          downvotes: state.hasDownvoted ? state.downvotes - 1 : state.downvotes,
          hasUpvoted: !state.hasUpvoted,
          hasDownvoted: false,
        };
      }
      return {
        upvotes: state.hasUpvoted ? state.upvotes - 1 : state.upvotes,
        downvotes: state.hasDownvoted ? state.downvotes - 1 : state.downvotes + 1,
        hasUpvoted: false,
        hasDownvoted: !state.hasDownvoted,
      };
    }
  );

  function handleVote(action: "upvote" | "downvote") {
    if (!userId) return router.push("/sign-in");

    startTransition(async () => {
      setOptimisticVotes(action);
      const voteAction = type === "question" ? voteQuestion : voteAnswer;
      await voteAction({
        itemId,
        userId,
        action,
        hasUpvoted: votes.hasUpvoted,
        hasDownvoted: votes.hasDownvoted,
      });
    });
  }

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <button onClick={() => handleVote("upvote")}>
          <span className={votes.hasUpvoted ? "text-primary-500" : ""}>👍</span>
        </button>
        <span className="subtle-medium">{votes.upvotes}</span>
      </div>
      <div className="flex-center gap-2.5">
        <button onClick={() => handleVote("downvote")}>
          <span className={votes.hasDownvoted ? "text-red-500" : ""}>👎</span>
        </button>
        <span className="subtle-medium">{votes.downvotes}</span>
      </div>
    </div>
  );
}
\`\`\`

> 💡 \`useTransition\` keeps the UI responsive during the server action. \`useOptimistic\` instantly updates the count before the server responds.
`,

"0be54617-182d-4075-b562-81c04c8bea5f": `# Task: Implement Voting System

Build an optimistic data update system!

## Your Task

Create a state management system that handles optimistic updates with automatic rollback on failure.

> 💡 **Hint:** Track both the "display state" (what the user sees) and the "server state" (what's confirmed). Reconcile them after the async action.

## Requirements

- Implement \`createOptimisticState(initialState)\` that creates an optimistic state manager
- Implement \`.apply(action, optimisticReducer)\` that immediately updates display state
- Implement \`.commit(serverAction)\` that runs the server action and confirms or reverts
- If server action succeeds: display state becomes confirmed state
- If server action fails: revert display state back to last confirmed state
- Support multiple pending actions queued up

## What You'll Practice

- Optimistic update patterns
- State management with rollback
- Async action queuing
`,

// ── Module 7: AI Integration (7 lessons) ──
"de61bf69-dfd1-4278-97e4-b25694a616d8": `# How AI APIs Work in Web Apps

Integrating AI into DevOverflow means calling AI APIs (like OpenAI) from Server Actions and streaming responses back to the client.

## The Architecture

\`\`\`
User clicks "Generate AI Answer"
       │
       ▼
Client Component ──→ Server Action ──→ OpenAI API
       │                                    │
       ◄────── Streaming Response ◄─────────┘
       │
       ▼
Display answer word by word
\`\`\`

## OpenAI API Basics

\`\`\`tsx
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple completion
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a helpful coding assistant." },
    { role: "user", content: "How do I use useEffect in React?" },
  ],
  temperature: 0.7,
  max_tokens: 1000,
});

const answer = response.choices[0].message.content;
\`\`\`

## Parameters Explained

| Parameter | Description | Typical Value |
|---|---|---|
| model | AI model | gpt-4o-mini (fast), gpt-4o (smart) |
| messages | Conversation history | System + user messages |
| temperature | Creativity (0=focused, 2=random) | 0.3-0.7 for code |
| max_tokens | Response length limit | 500-2000 |
| stream | Stream response word by word | true for UI |

> 💡 Always call AI APIs from the server side to protect your API key. Never expose \`OPENAI_API_KEY\` in client code.
`,

"6630697c-f340-4acc-acd9-a1f59e852d80": `# AI Answer Generator in Code

Complete implementation of the AI answer generation feature.

## Server Action

\`\`\`tsx
// lib/actions/ai.action.ts
"use server";
import OpenAI from "openai";
import { getQuestionById } from "./question.action";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIAnswer(params: { questionId: string; questionTitle: string; questionContent: string }) {
  const { questionTitle, questionContent } = params;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a knowledgeable programming assistant on DevOverflow. " +
          "Provide detailed, accurate answers with code examples when appropriate. " +
          "Format your response in Markdown. Include explanations for the approach chosen.",
      },
      {
        role: "user",
        content:
          "Question: " + questionTitle + "\\n\\n" +
          "Details: " + questionContent + "\\n\\n" +
          "Please provide a comprehensive answer.",
      },
    ],
    temperature: 0.5,
    max_tokens: 1500,
  });

  const answer = completion.choices[0]?.message?.content;

  if (!answer) throw new Error("Failed to generate AI answer");

  return { answer };
}
\`\`\`

## Prompt Engineering Tips

\`\`\`
System prompt sets the AI's personality and constraints:
- "You are a knowledgeable programming assistant" → set role
- "Provide detailed, accurate answers" → set quality expectation
- "Format your response in Markdown" → set output format
- "Include code examples" → set content expectation

User prompt provides the specific question:
- Include both title and content for full context
- Ask explicitly for what you want
\`\`\`

> 💡 The system prompt is crucial. A well-crafted system prompt can dramatically improve answer quality. Always be specific about format and expectations.
`,

"d6c5cb7a-ce02-484f-9ad6-5d6e6f75c663": `# How Streaming Responses Work

Instead of waiting for the entire AI response, streaming shows words as they're generated — just like ChatGPT.

## Why Streaming?

\`\`\`
Without streaming:
[Click] ──── 3 seconds of nothing ──── [Full answer appears at once]
User thinks: "Is it broken?"

With streaming:
[Click] ── words appear one by one ── [Answer builds up naturally]
User thinks: "It's working, I can read as it generates!"
\`\`\`

## How Streaming Works

1. Server creates a streaming response from OpenAI
2. Server pipes chunks to the client via a ReadableStream
3. Client reads chunks and appends to the displayed text

\`\`\`tsx
// Server-side streaming
const stream = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [...],
  stream: true,  // Enable streaming
});

// Create a ReadableStream for the response
const readableStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      controller.enqueue(new TextEncoder().encode(text));
    }
    controller.close();
  },
});

return new Response(readableStream, {
  headers: { "Content-Type": "text/event-stream" },
});
\`\`\`

## Client-Side Reading

\`\`\`tsx
"use client";
const response = await fetch("/api/ai/generate", { method: "POST", body: JSON.stringify({ question }) });
const reader = response.body?.getReader();
const decoder = new TextDecoder();

let fullText = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  fullText += decoder.decode(value);
  setAnswer(fullText);  // Update UI progressively
}
\`\`\`

> 💡 Streaming transforms a 3-second wait into an engaging experience. Users can start reading while the AI is still generating.
`,

"7b12acaf-787a-4b90-b076-7a9239823d56": `# Streaming AI Responses in Code

Full streaming implementation for DevOverflow.

## API Route Handler (Streaming)

\`\`\`tsx
// app/api/ai/generate/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { auth } from "@/auth";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { question, questionContent } = await request.json();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful programming assistant. " +
          "Provide clear, concise answers with code examples in Markdown.",
      },
      {
        role: "user",
        content: question + "\\n\\n" + questionContent,
      },
    ],
    stream: true,
    temperature: 0.5,
    max_tokens: 1500,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
\`\`\`

## Client-Side Stream Reader

\`\`\`tsx
"use client";
import { useState } from "react";

export function useAIStream() {
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateAnswer(question: string, content: string) {
    setIsGenerating(true);
    setAnswer("");

    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, questionContent: content }),
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let outputText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      outputText += decoder.decode(value, { stream: true });
      setAnswer(outputText);
    }

    setIsGenerating(false);
    return outputText;
  }

  return { answer, isGenerating, generateAnswer };
}
\`\`\`

> 💡 The custom \`useAIStream\` hook encapsulates all the streaming logic. Any component can call \`generateAnswer()\` and display the progressively updating \`answer\`.
`,

"493d0076-1360-42dc-ad7c-053e1f1b03aa": `# 'Generate AI Answer' Button in Code

The button component that triggers AI answer generation on the question detail page.

## The Button Component

\`\`\`tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { useAIStream } from "@/hooks/useAIStream";
import ParseHTML from "../shared/ParseHTML";

interface GenerateAIButtonProps {
  questionTitle: string;
  questionContent: string;
  onAnswerGenerated?: (answer: string) => void;
}

export default function GenerateAIButton({
  questionTitle,
  questionContent,
  onAnswerGenerated,
}: GenerateAIButtonProps) {
  const { answer, isGenerating, generateAnswer } = useAIStream();

  async function handleClick() {
    const result = await generateAnswer(questionTitle, questionContent);
    onAnswerGenerated?.(result);
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </>
        ) : (
          <>
            <span>✨</span>
            Generate AI Answer
          </>
        )}
      </button>

      {answer && (
        <div className="rounded-xl border bg-light-800/50 p-6 dark:bg-dark-300/50">
          <div className="mb-2 flex items-center gap-2 text-sm text-primary-500">
            <span>🤖</span> AI Generated Answer
          </div>
          <ParseHTML data={answer} />
        </div>
      )}
    </div>
  );
}
\`\`\`

> 💡 The AI answer panel appears below the button and fills in progressively as the stream delivers text. The user can read while it generates.
`,

"b7e58457-a4f2-42f3-a228-acab001053b9": `# Task: Add AI-Generated Answers

Build a streaming text processor!

## Your Task

Create a streaming text processor that simulates how AI streaming works — processing text chunk by chunk and emitting results progressively.

> 💡 **Hint:** Think of it as a pipeline: chunks arrive → get processed → get emitted to listeners.

## Requirements

- Implement \`createTextStream(text, chunkSize)\` that splits text into chunks and emits them with a delay
- Implement \`onChunk(callback)\` that fires for each chunk received
- Implement \`onComplete(callback)\` that fires when all chunks are emitted
- Implement \`getProgress()\` that returns \`{ received: number, total: number, percentage: number }\`
- Implement \`cancel()\` that stops the stream early

## What You'll Practice

- Streaming data patterns
- Event-based architecture
- Progressive content delivery
`,

"64737a7d-29fb-4f16-96f2-85998e5968db": `# Rate Limiting & Error Fallback in Code

Protecting the AI endpoint from abuse and handling errors gracefully.

## Rate Limiter

\`\`\`tsx
// lib/rateLimit.ts
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(userId: string, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const user = rateLimitMap.get(userId);

  if (!user || now - user.lastReset > windowMs) {
    rateLimitMap.set(userId, { count: 1, lastReset: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (user.count >= maxRequests) {
    const retryAfter = Math.ceil((user.lastReset + windowMs - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  user.count++;
  return { allowed: true, remaining: maxRequests - user.count };
}
\`\`\`

## Applying Rate Limiting

\`\`\`tsx
// app/api/ai/generate/route.ts
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { allowed, retryAfter } = rateLimit(session.user.id, 5, 60000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again in " + retryAfter + "s" }),
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  // ... continue with AI generation
}
\`\`\`

## Client-Side Error Handling

\`\`\`tsx
async function generateAnswer(question: string, content: string) {
  setIsGenerating(true);
  setError(null);
  try {
    const response = await fetch("/api/ai/generate", { /* ... */ });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to generate answer");
    }
    // ... process stream
  } catch (error) {
    setError(error instanceof Error ? error.message : "Something went wrong");
    toast({ title: error.message, variant: "destructive" });
  } finally {
    setIsGenerating(false);
  }
}
\`\`\`

> 💡 Rate limiting protects your AI budget. 5 requests per minute per user is a reasonable limit. Always show the retry time to the user.
`,
};

async function main() {
  console.log("Updating Ultimate Next.js — Modules 7-8 (Q&A + AI)...");
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
