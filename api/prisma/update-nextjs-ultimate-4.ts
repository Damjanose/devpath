import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 8: Tags, Search & Pagination (10 lessons) ──
"1af43c20-9818-4812-a184-0b981bda90a6": `# How the Tag System Works

Tags categorize questions and help users discover content. In DevOverflow, tags are stored as separate documents linked to questions via references.

## Tag Data Model

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

## How Tags Get Created

Tags are created on-the-fly when a user asks a question. The \`findOneAndUpdate\` with \`upsert: true\` pattern ensures:

1. If the tag exists → link the question to it
2. If the tag doesn't exist → create it and link the question

\`\`\`tsx
const tagDoc = await Tag.findOneAndUpdate(
  { name: { $regex: new RegExp("^" + tagName + "$", "i") } },
  {
    $setOnInsert: { name: tagName },
    $push: { questions: questionId },
  },
  { upsert: true, new: true }
);
\`\`\`

## Tag Features

| Feature | Implementation |
|---|---|
| Tag page | List all questions with that tag |
| Tag search | Filter tags by name |
| Popular tags | Sort by question count |
| Follow tags | Users can follow tags for personalized feed |

> 💡 The case-insensitive regex match (\`$regex\` with "i" flag) prevents duplicate tags like "React", "react", "REACT".
`,

"e495ef1f-da6f-4c05-99fd-9ea8dc9e96b7": `# Tag System in Code — Model & Actions

Complete tag system implementation.

## Get All Tags with Search

\`\`\`tsx
"use server";

export async function getAllTags(params: { searchQuery?: string; filter?: string; page?: number; pageSize?: number }) {
  await connectToDatabase();
  const { searchQuery, filter, page = 1, pageSize = 20 } = params;

  const query: any = {};
  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: "i" };
  }

  let sortBy: any = {};
  switch (filter) {
    case "popular": sortBy = { questions: -1 }; break;
    case "recent": sortBy = { createdOn: -1 }; break;
    case "name": sortBy = { name: 1 }; break;
    case "old": sortBy = { createdOn: 1 }; break;
    default: sortBy = { questions: -1 };
  }

  const [tags, totalCount] = await Promise.all([
    Tag.find(query).sort(sortBy).skip((page - 1) * pageSize).limit(pageSize),
    Tag.countDocuments(query),
  ]);

  return {
    tags: tags.map((tag) => ({
      _id: tag._id.toString(),
      name: tag.name,
      description: tag.description,
      questionCount: tag.questions.length,
    })),
    hasMore: totalCount > page * pageSize,
  };
}
\`\`\`

## Get Questions by Tag

\`\`\`tsx
"use server";

export async function getQuestionsByTagId(params: { tagId: string; searchQuery?: string; page?: number }) {
  await connectToDatabase();
  const { tagId, searchQuery, page = 1 } = params;

  const tag = await Tag.findById(tagId).populate({
    path: "questions",
    match: searchQuery ? { title: { $regex: searchQuery, $options: "i" } } : {},
    options: {
      sort: { createdAt: -1 },
      skip: (page - 1) * 10,
      limit: 11, // Fetch one extra to check hasMore
    },
    populate: [
      { path: "author", select: "name picture" },
      { path: "tags", select: "name" },
    ],
  });

  const questions = tag.questions.slice(0, 10);
  const hasMore = tag.questions.length > 10;

  return { tagTitle: tag.name, questions, hasMore };
}
\`\`\`

> 💡 Fetching \`limit + 1\` documents is an efficient way to check if more pages exist without running a separate count query.
`,

"052008d3-8101-4b96-8cbc-9fe84910a3d7": `# Tags Page in Code — Grid with Search

The tags page displays all tags in a responsive grid with search filtering.

## Tags Page Component

\`\`\`tsx
// app/(root)/tags/page.tsx
import { getAllTags } from "@/lib/actions/tag.action";
import LocalSearch from "@/components/shared/search/LocalSearch";
import Filter from "@/components/shared/Filter";
import Link from "next/link";

export default async function TagsPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; page?: string };
}) {
  const result = await getAllTags({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Tags</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch route="/tags" placeholder="Search for tags" />
        <Filter filters={TagFilters} otherClasses="min-h-[56px] sm:min-w-[170px]" />
      </div>

      <section className="mt-12 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {result.tags.length > 0 ? (
          result.tags.map((tag) => (
            <Link
              key={tag._id}
              href={"/tags/" + tag._id}
              className="shadow-light100_darknone"
            >
              <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border p-8">
                <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
                  <p className="paragraph-semibold text-dark300_light900">{tag.name}</p>
                </div>
                <p className="small-medium text-dark400_light500 mt-3.5">
                  <span className="body-semibold primary-text-gradient mr-2.5">
                    {tag.questionCount}+
                  </span>
                  Questions
                </p>
              </article>
            </Link>
          ))
        ) : (
          <NoResult title="No Tags Found" description="It looks like there are no tags yet." />
        )}
      </section>
    </>
  );
}
\`\`\`

> 💡 The responsive grid (\`grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4\`) adapts the number of tag cards to the screen width.
`,

"4c3bf19f-48e8-4a64-bfaf-2f94e773292a": `# Task: Build the Tags Page

Create a tag management and display system!

## Your Task

Build a tagging system that handles tag creation, deduplication, search, and statistics.

> 💡 **Hint:** Tags should be case-insensitive and automatically deduplicated.

## Requirements

- Implement \`createTag(name)\` that creates a normalized (lowercase, trimmed) tag
- Implement \`findOrCreateTags(tagNames)\` that returns existing tags or creates new ones (case-insensitive dedup)
- Implement \`searchTags(query)\` that fuzzy-matches tag names
- Implement \`getPopularTags(limit)\` that returns tags sorted by question count
- Implement \`getTagStats()\` that returns \`{ totalTags, avgQuestionsPerTag, topTag }\`

## What You'll Practice

- Case-insensitive string matching
- Upsert patterns (find or create)
- Aggregation and statistics
`,

"e14ecab7-a6f2-454e-baa2-70601ecd5569": `# How Global Search Works

Global search searches across multiple collections simultaneously — questions, answers, users, and tags.

## The Search Architecture

\`\`\`
User types: "useEffect"
       │
       ▼
Global Search Component
       │
       ▼ (debounced, 300ms)
Server Action: globalSearch("useEffect")
       │
       ├──→ Questions.find(title/content contains "useEffect")
       ├──→ Answers.find(content contains "useEffect")
       ├──→ Users.find(name contains "useEffect")
       └──→ Tags.find(name contains "useEffect")
       │
       ▼
Unified results with type labels
[
  { type: "question", title: "How to use useEffect", id: "..." },
  { type: "answer", title: "Answer in: React hooks guide", id: "..." },
  { type: "user", title: "useEffect_master", id: "..." },
  { type: "tag", title: "useeffect", id: "..." },
]
\`\`\`

## Key Design Decisions

| Decision | Approach | Why |
|---|---|---|
| Debounce | 300ms delay | Avoid excessive queries while typing |
| Multi-source | Parallel queries | Search all collections at once |
| Result limit | 2-3 per type | Keep dropdown manageable |
| Type filter | Optional | Let users focus on questions/users/tags |

> 💡 Using \`Promise.all\` for parallel queries makes global search fast — all four collections are searched simultaneously.
`,

"e8ac7446-3e45-4ef0-ba44-1d0537595fdd": `# Global Search in Code — Multi-Source Query

Complete global search implementation.

## Server Action

\`\`\`tsx
"use server";

const SEARCHABLE_TYPES = ["question", "answer", "user", "tag"] as const;

export async function globalSearch(params: { query: string; type?: string }) {
  await connectToDatabase();
  const { query, type } = params;

  const regexQuery = { $regex: query, $options: "i" };
  let results: { type: string; id: string; title: string }[] = [];

  const typesToSearch = type ? [type] : SEARCHABLE_TYPES;

  const searchPromises = typesToSearch.map(async (searchType) => {
    switch (searchType) {
      case "question": {
        const questions = await Question.find({ title: regexQuery }).limit(3).select("title");
        return questions.map((q) => ({ type: "question", id: q._id.toString(), title: q.title }));
      }
      case "answer": {
        const answers = await Answer.find({ content: regexQuery })
          .limit(3)
          .populate("question", "title");
        return answers.map((a) => ({
          type: "answer",
          id: a.question._id.toString(),
          title: "Answer in: " + a.question.title,
        }));
      }
      case "user": {
        const users = await User.find({ name: regexQuery }).limit(3).select("name");
        return users.map((u) => ({ type: "user", id: u._id.toString(), title: u.name }));
      }
      case "tag": {
        const tags = await Tag.find({ name: regexQuery }).limit(3).select("name");
        return tags.map((t) => ({ type: "tag", id: t._id.toString(), title: t.name }));
      }
      default: return [];
    }
  });

  const allResults = await Promise.all(searchPromises);
  results = allResults.flat();

  return JSON.parse(JSON.stringify(results));
}
\`\`\`

## Global Search Component

\`\`\`tsx
"use client";
export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        const data = await globalSearch({ query });
        setResults(data);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-[600px]">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search globally..." />
      {isOpen && <GlobalSearchResults results={results} />}
    </div>
  );
}
\`\`\`

> 💡 The 300ms debounce prevents firing a search on every keystroke. Only searches when the user pauses typing.
`,

"c60a2cdb-1c31-4cc7-bf12-a15bb3f226de": `# Task: Implement Global Search

Build a multi-source search engine!

## Your Task

Create a search system that queries multiple data sources in parallel and returns unified, ranked results.

> 💡 **Hint:** Search all sources simultaneously with Promise.all, then merge and rank results.

## Requirements

- Implement \`globalSearch(query, sources, options)\` that searches across multiple collections
- Support source types: "question", "answer", "user", "tag"
- Search each source with case-insensitive regex matching
- Limit results per source (default: 3 each)
- Return unified results with \`{ type, id, title, relevance }\`
- Implement basic relevance scoring: exact match > starts with > contains

## What You'll Practice

- Parallel async operations
- Multi-source search patterns
- Relevance scoring algorithms
`,

"455e33fc-6c09-4b38-94b5-ee12dfd0fbc8": `# How URL-Based Filters & Pagination Work

In DevOverflow, filters and pagination live in the URL — making them sharable, bookmarkable, and SEO-friendly.

## URL as State Manager

\`\`\`
/questions?q=react&filter=newest&page=2

q      = search query
filter = sort/filter option
page   = current page number
\`\`\`

## How It Works

\`\`\`
1. Client Component updates URL search params
2. Next.js triggers a re-render of the Server Component
3. Server Component reads searchParams and fetches new data
4. Page streams new content
\`\`\`

## Filter Component Pattern

\`\`\`tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Filter({ filters }: { filters: { name: string; value: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "";

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === activeFilter) {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    params.delete("page"); // Reset page when filter changes
    router.push("?" + params.toString(), { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => handleFilter(f.value)}
          className={activeFilter === f.value ? "bg-primary-100 text-primary-500" : "bg-light-800 dark:bg-dark-300"}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
\`\`\`

> 💡 Resetting the page number when filters change prevents users from landing on an empty page. If a filter has 5 pages and another has 2, switching while on page 5 would show nothing.
`,

"82d318ae-9e98-4861-831f-8485f82055e8": `# Filters & Pagination in Code

Complete pagination component.

## Pagination Component

\`\`\`tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  pageNumber: number;
  isNext: boolean;
}

export default function Pagination({ pageNumber, isNext }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleNavigation(direction: "prev" | "next") {
    const nextPageNumber = direction === "prev" ? pageNumber - 1 : pageNumber + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPageNumber));
    router.push("?" + params.toString());
  }

  if (pageNumber === 1 && !isNext) return null; // Only one page

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <button
        disabled={pageNumber === 1}
        onClick={() => handleNavigation("prev")}
        className="flex min-h-[36px] items-center justify-center gap-2 rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← Prev
      </button>
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <span className="font-semibold text-white">{pageNumber}</span>
      </div>
      <button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="flex min-h-[36px] items-center justify-center gap-2 rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  );
}
\`\`\`

## Server-Side Pagination Logic

\`\`\`tsx
// In any server action that supports pagination
const page = params.page || 1;
const pageSize = params.pageSize || 10;

const [results, totalCount] = await Promise.all([
  Model.find(query)
    .sort(sortBy)
    .skip((page - 1) * pageSize)
    .limit(pageSize),
  Model.countDocuments(query),
]);

const hasMore = totalCount > page * pageSize;
return { results, totalCount, hasMore };
\`\`\`

> 💡 The skip/limit pattern works well for moderate datasets. For very large collections (millions), consider cursor-based pagination instead.
`,

"7abfe7b7-2146-42d8-b111-ee35fe82f51d": `# Task: Add Pagination & Filters Everywhere

Build a complete URL-based state management system!

## Your Task

Create a URL query parameter manager that handles filters, sorting, pagination, and search — keeping everything in sync.

> 💡 **Hint:** The URL is the single source of truth. Every state change updates the URL, and the page reads from the URL.

## Requirements

- Implement \`createURLState(searchParams)\` that parses URL query params into a typed object
- Implement \`setFilter(params, key, value)\` that updates a single filter in the URL
- Implement \`setPage(params, page)\` that updates the page number
- Implement \`resetFilters(params)\` that clears all filters and resets page to 1
- Implement \`toQueryString(state)\` that converts state back to a URL query string
- Ensure changing a filter resets the page to 1

## What You'll Practice

- URL state management patterns
- Query string parsing and serialization
- State synchronization
`,

// ── Module 9: User Profiles & Community (9 lessons) ──
"58b87368-4751-4e94-a682-38b7af76fc9f": `# How Profile Pages Work

Profile pages display user information, stats, and their contributions (questions and answers) in a tabbed layout.

## Profile Page Structure

\`\`\`
/profile/[id]

┌─────────────────────────────────────────┐
│  Avatar   Name           [Edit Profile] │
│           @username                     │
│           📍 Location · 🔗 Portfolio    │
│           📅 Joined March 2024          │
│           Bio text here...              │
├─────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │
│  │ 42   │ │ 128  │ │ 🥇 3 │ │ 🥈 12  │ │
│  │ Ques.│ │ Ans. │ │ Gold │ │ Silver │ │
│  └──────┘ └──────┘ └──────┘ └────────┘ │
├─────────────────────────────────────────┤
│  [Top Questions]  [Top Answers]         │
│                                         │
│  Question Card 1                        │
│  Question Card 2                        │
│  ...                                    │
└─────────────────────────────────────────┘
\`\`\`

## Data Flow

1. Dynamic route \`/profile/[id]\` reads the user ID
2. Server Component fetches user info + stats in parallel
3. Tab content (questions/answers) loaded in respective tabs
4. Edit button shown only if viewing own profile

> 💡 Profile pages are Server Components for SEO — search engines can index user profiles with all their stats and contributions.
`,

"f079cd76-dca0-46dd-9dc5-715eed843925": `# Profile Page in Code — Stats & Tabs

Complete profile page implementation.

## Profile Page

\`\`\`tsx
// app/(root)/profile/[id]/page.tsx
import { auth } from "@/auth";
import { getUserInfo } from "@/lib/actions/user.action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionTab from "@/components/shared/QuestionTab";
import AnswerTab from "@/components/shared/AnswerTab";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const session = await auth();
  const { user, totalQuestions, totalAnswers, badgeCounts } = await getUserInfo({
    userId: params.id,
  });

  const isOwnProfile = session?.user?.id === params.id;

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <Image src={user.picture} width={140} height={140} className="rounded-full" />
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">@{user.username}</p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              {user.portfolioWebsite && <ProfileLink icon="🔗" title={user.portfolioWebsite} />}
              {user.location && <ProfileLink icon="📍" title={user.location} />}
              <ProfileLink icon="📅" title={"Joined " + formatDate(user.joinedAt)} />
            </div>
            {user.bio && <p className="paragraph-regular text-dark400_light800 mt-8">{user.bio}</p>}
          </div>
        </div>
        {isOwnProfile && (
          <Link href="/profile/edit" className="btn paragraph-medium text-dark300_light900 min-h-[46px] min-w-[175px]">
            Edit Profile
          </Link>
        )}
      </div>

      {/* Stats */}
      <Stats totalQuestions={totalQuestions} totalAnswers={totalAnswers} badges={badgeCounts} />

      {/* Content Tabs */}
      <div className="mt-10 flex gap-10">
        <Tabs defaultValue="questions" className="flex-1">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="questions">Top Questions</TabsTrigger>
            <TabsTrigger value="answers">Answers</TabsTrigger>
          </TabsList>
          <TabsContent value="questions">
            <QuestionTab userId={params.id} searchParams={searchParams} />
          </TabsContent>
          <TabsContent value="answers">
            <AnswerTab userId={params.id} searchParams={searchParams} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
\`\`\`

> 💡 The \`isOwnProfile\` check ensures only the profile owner sees the "Edit Profile" button. Other viewers see the profile read-only.
`,

"89f3fe55-5e47-426e-8c18-effe147508b2": `# Task: Build the Profile Page

Create a user statistics and profile data system!

## Your Task

Build a profile data aggregator that computes user statistics from their activity data.

> 💡 **Hint:** Aggregate data from multiple sources (questions, answers, votes) to build a comprehensive profile.

## Requirements

- Implement \`getUserStats(userId, data)\` that computes stats from user activity
- Calculate: totalQuestions, totalAnswers, totalUpvotes received, totalViews
- Implement \`calculateBadges(stats)\` that awards badges based on thresholds
  - Gold: 100+ questions or 500+ upvotes
  - Silver: 50+ questions or 100+ upvotes
  - Bronze: 10+ questions or 50+ upvotes
- Implement \`getTopContributions(userId, type, limit)\` that returns top questions or answers sorted by upvotes
- Return \`{ stats, badges, reputation }\`

## What You'll Practice

- Data aggregation patterns
- Badge/achievement systems
- Stats computation from activity data
`,

"0b3ef6dc-e2cb-4d37-8f21-9438e1c3ffcf": `# How Profile Editing & Image Upload Work

Profile editing combines form handling with file uploads for the avatar image.

## Edit Profile Architecture

\`\`\`
1. User navigates to /profile/edit
2. Server Component loads current profile data
3. Client Component renders form pre-filled with current data
4. User edits fields and/or uploads new avatar
5. Image uploaded to Cloudinary (or similar)
6. Server Action updates user in database
7. Revalidate profile page, redirect
\`\`\`

## Image Upload Flow

\`\`\`
Select File → Preview → Upload to Cloudinary → Get URL → Save URL to User
\`\`\`

\`\`\`tsx
"use client";
import { useState, useRef } from "react";

function useImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function upload(): Promise<string | null> {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url;
  }

  return { preview, handleSelect, upload, fileRef };
}
\`\`\`

> 💡 Always validate image uploads on both client (type, size) and server (file type, dimensions). Never trust client-side validation alone.
`,

"9c3201a5-d231-4604-82c8-75d430d9b5a9": `# Edit Profile in Code — Form + Image Upload

Complete profile editing implementation.

## Edit Profile Server Action

\`\`\`tsx
"use server";

export async function updateUser(params: {
  userId: string;
  name: string;
  username: string;
  bio: string;
  portfolioWebsite: string;
  location: string;
  picture?: string;
}) {
  await connectToDatabase();

  const { userId, ...updateData } = params;

  // Remove empty strings
  const cleanData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );

  await User.findByIdAndUpdate(userId, cleanData);
  revalidatePath("/profile/" + userId);
}
\`\`\`

## Edit Profile Form

\`\`\`tsx
"use client";

export default function EditProfileForm({ user }: { user: UserType }) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      portfolioWebsite: user.portfolioWebsite || "",
      location: user.location || "",
    },
  });

  async function onSubmit(values: ProfileInput) {
    let pictureUrl = user.picture;

    if (imageUpload.file) {
      pictureUrl = await imageUpload.upload();
    }

    await updateUser({
      userId: user._id,
      ...values,
      picture: pictureUrl || undefined,
    });

    router.push("/profile/" + user._id);
    toast({ title: "Profile updated!" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-9 flex w-full flex-col gap-9">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <Image
            src={imageUpload.preview || user.picture || "/assets/icons/avatar.svg"}
            width={80} height={80} className="rounded-full"
          />
          <button type="button" onClick={() => imageUpload.fileRef.current?.click()}
            className="paragraph-medium text-primary-500">
            Change Avatar
          </button>
          <input ref={imageUpload.fileRef} type="file" accept="image/*"
            onChange={imageUpload.handleSelect} className="hidden" />
        </div>

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* ... other fields */}
        <Button type="submit" disabled={form.formState.isSubmitting} className="primary-gradient w-fit">
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
\`\`\`

> 💡 Pre-filling the form with \`defaultValues\` from the current user data creates a seamless editing experience — users see their existing info and can change only what they want.
`,

"7a6a388c-e594-4ba5-9420-68ca81a99089": `# Task: Implement Profile Editing

Build a profile update system with validation!

## Your Task

Create a profile editor that validates updates, handles partial updates, and manages image upload state.

> 💡 **Hint:** Support partial updates — users should only need to change what they want, keeping other fields as-is.

## Requirements

- Implement \`validateProfile(data)\` with rules: name (2-50 chars), username (3-20, alphanumeric), bio (max 150), portfolioWebsite (valid URL or empty), location (max 50)
- Implement \`mergeProfileUpdates(current, updates)\` that applies only changed fields
- Implement \`validateImageUpload(file)\` that checks type (image/*), size (max 5MB), and returns \`{ valid, error }\`
- Implement \`generateImagePreview(file)\` that returns a data URL for preview

## What You'll Practice

- Partial update patterns
- Form validation with optional fields
- File upload validation
`,

"da6ef6e3-f07c-4f18-97d8-e90ab2cb0efb": `# How Community & Collections Work

The community page shows all users, and collections let users save favorite questions.

## Community Page

\`\`\`tsx
// app/(root)/community/page.tsx
export default async function CommunityPage({ searchParams }) {
  const result = await getAllUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <LocalSearch route="/community" placeholder="Search amazing minds here..." />
      <section className="mt-12 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3">
        {result.users.map((user) => <UserCard key={user._id} user={user} />)}
      </section>
      <Pagination pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.hasMore} />
    </>
  );
}
\`\`\`

## Save to Collection

\`\`\`tsx
"use server";

export async function toggleSaveQuestion(params: { userId: string; questionId: string; path: string }) {
  await connectToDatabase();
  const { userId, questionId, path } = params;

  const user = await User.findById(userId);
  const isSaved = user.saved.includes(questionId);

  if (isSaved) {
    await User.findByIdAndUpdate(userId, { $pull: { saved: questionId } });
  } else {
    await User.findByIdAndUpdate(userId, { $addToSet: { saved: questionId } });
  }

  revalidatePath(path);
}
\`\`\`

## Collections Page

\`\`\`tsx
export default async function CollectionPage({ searchParams }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const result = await getSavedQuestions({
    userId: session.user.id,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      {result.questions.map((q) => <QuestionCard key={q._id} question={q} />)}
    </>
  );
}
\`\`\`

> 💡 The \`$addToSet\` operator only adds the ID if it's not already in the array — preventing duplicates without needing to check first.
`,

"7aee970a-c377-4aff-b893-dbb908d5272b": `# Community Page & Collections in Code

Complete community and collection implementations.

## User Card Component

\`\`\`tsx
import Link from "next/link";
import Image from "next/image";
import RenderTag from "../shared/RenderTag";

interface UserCardProps {
  user: {
    _id: string;
    name: string;
    username: string;
    picture: string;
    topTags?: { _id: string; name: string }[];
  };
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={"/profile/" + user._id}
      className="shadow-light100_darknone w-full xs:w-[260px]"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
        <Image
          src={user.picture || "/assets/icons/avatar.svg"}
          width={100}
          height={100}
          className="rounded-full"
          alt={user.name}
        />
        <div className="mt-4 text-center">
          <h3 className="h3-bold text-dark200_light900 line-clamp-1">{user.name}</h3>
          <p className="body-regular text-dark500_light500 mt-2">@{user.username}</p>
        </div>
        {user.topTags && user.topTags.length > 0 && (
          <div className="mt-5 flex gap-2">
            {user.topTags.map((tag) => (
              <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
\`\`\`

## Get All Users Action

\`\`\`tsx
"use server";

export async function getAllUsers(params: { searchQuery?: string; filter?: string; page?: number }) {
  await connectToDatabase();
  const { searchQuery, filter, page = 1, pageSize = 20 } = params;

  const query = searchQuery ? { $or: [{ name: { $regex: searchQuery, $options: "i" } }, { username: { $regex: searchQuery, $options: "i" } }] } : {};

  let sortBy = {};
  switch (filter) {
    case "new_users": sortBy = { joinedAt: -1 }; break;
    case "old_users": sortBy = { joinedAt: 1 }; break;
    case "top_contributors": sortBy = { reputation: -1 }; break;
    default: sortBy = { reputation: -1 };
  }

  const users = await User.find(query).sort(sortBy).skip((page - 1) * pageSize).limit(pageSize);
  const totalCount = await User.countDocuments(query);

  return { users: JSON.parse(JSON.stringify(users)), hasMore: totalCount > page * pageSize };
}
\`\`\`

> 💡 The UserCard shows each user's top tags — providing a quick visual of their expertise areas. This is computed from their most-used tags in questions.
`,

"9efccdae-57df-43f9-b61e-a58b26cc0c3a": `# Task: Build Community Page & Collections

Create a user directory and collection system!

## Your Task

Build a user directory with search and filtering, plus a collection (save/bookmark) system.

> 💡 **Hint:** The collection toggle is an idempotent operation — it should work the same whether an item is currently saved or not.

## Requirements

- Implement \`searchUsers(query, filter, page)\` that searches users by name/username with filtering (newest, oldest, top contributors)
- Implement \`toggleSave(userId, itemId)\` that adds to collection if not saved, removes if saved
- Implement \`getSavedItems(userId, page, pageSize)\` that returns paginated saved items
- Implement \`getUserTopTags(userId)\` that returns the user's most-used tags based on their questions

## What You'll Practice

- Directory search and filtering
- Toggle/bookmark patterns
- Data aggregation from related documents
`,

// ── Module 10: State Management & Advanced Patterns (8 lessons) ──
"f31980f9-26f5-4078-8bba-9c47dfd47115": `# How State Management Works in Next.js

In the App Router, state management is fundamentally different from traditional React SPAs. The **URL is your primary state manager**.

## State Management Layers

| Layer | Tool | Use Case |
|---|---|---|
| URL State | searchParams, useSearchParams | Filters, pagination, search queries |
| Server State | Server Components + Server Actions | Database data, user info |
| UI State | useState (Client Components) | Modals, dropdowns, hover states |
| Shared State | React Context | Theme, auth session, locale |
| Form State | react-hook-form | Input values, validation errors |

## The Key Insight

\`\`\`
In Next.js App Router, you DON'T need:
❌ Redux / Zustand / Jotai for most things
❌ React Query / SWR for server data
❌ Global state for filters/pagination

Because:
✅ URL params replace filter/search state
✅ Server Components replace data fetching libraries
✅ Server Actions replace mutation state
✅ React Context handles the few remaining global needs (theme, auth)
\`\`\`

## When You DO Need Client State

- Theme toggle (light/dark/system)
- Auth session (useSession)
- Complex form state (multi-step wizards)
- Real-time collaboration state
- Animation state

> 💡 Ask yourself: "Can this state live in the URL?" If yes, use searchParams. It's simpler, shareable, and works without JavaScript.
`,

"ba5d6717-1d1b-46cb-bf9c-4cb81da1f26d": `# URL as State Manager in Code — nuqs Library

Using the \`nuqs\` library for type-safe URL state management.

## Why nuqs?

\`\`\`tsx
// Without nuqs — manual, error-prone
"use client";
function FilterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse manually (stringly typed, easy to mess up)
  const page = Number(searchParams.get("page")) || 1;
  const q = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "newest";

  // Update manually (verbose, easy to forget params)
  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push("?" + params.toString());
  }
}

// With nuqs — type-safe, concise
"use client";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

function FilterPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [filter, setFilter] = useQueryState("filter", parseAsString.withDefault("newest"));

  // Type-safe! page is number, q and filter are strings
  // Updating is simple:
  setPage(2);        // URL becomes ?page=2
  setQ("react");     // URL becomes ?q=react
  setFilter("hot");  // URL becomes ?filter=hot
}
\`\`\`

## Setup

\`\`\`tsx
// app/layout.tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
\`\`\`

> 💡 nuqs gives you \`useState\`-like ergonomics for URL search params, with full TypeScript support and serialization built in.
`,

"916df8dd-4f75-4c08-af96-25d8d0291bf5": `# Complex URL State in Code — Multi-Filter Page

Advanced URL state patterns for the DevOverflow questions page.

## Multi-Filter State with nuqs

\`\`\`tsx
"use client";
import { useQueryStates, parseAsString, parseAsInteger, parseAsArrayOf } from "nuqs";

export function useQuestionFilters() {
  return useQueryStates({
    q: parseAsString.withDefault(""),
    filter: parseAsString.withDefault("newest"),
    page: parseAsInteger.withDefault(1),
    tags: parseAsArrayOf(parseAsString).withDefault([]),
  });
}

// Usage in component
function QuestionsPage() {
  const [filters, setFilters] = useQuestionFilters();

  // Read values (fully typed)
  filters.q       // string
  filters.filter  // string
  filters.page    // number
  filters.tags    // string[]

  // Update multiple at once (atomic URL update)
  setFilters({ filter: "popular", page: 1 }); // resets page when changing filter
}
\`\`\`

## Server-Side Reading

\`\`\`tsx
// Server Component reads the same URL state
export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; page?: string; tags?: string };
}) {
  const result = await getQuestions({
    searchQuery: searchParams.q,
    filter: searchParams.filter ?? "newest",
    page: Number(searchParams.page) || 1,
    tags: searchParams.tags?.split(",") ?? [],
  });

  return (
    <>
      <ClientFilterBar />
      <QuestionFeed questions={result.questions} />
      <Pagination page={result.page} hasMore={result.hasMore} />
    </>
  );
}
\`\`\`

> 💡 The Client Component (filter bar) and Server Component (page) read the same URL state. The URL is the bridge between client interactivity and server data fetching.
`,

"d386e8d5-65de-47b4-b217-ed144e7e3887": `# How React Context Works in the App Router

React Context in Next.js App Router requires careful placement — Providers must be Client Components, but their children can be Server Components.

## The Provider Pattern

\`\`\`tsx
// context/ThemeProvider.tsx — must be "use client"
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  mode: string;
  setMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") ?? "system";
    setMode(savedTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
\`\`\`

## Placing Providers in Layout

\`\`\`tsx
// app/layout.tsx — Server Component
import { ThemeProvider } from "@/context/ThemeProvider";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <ThemeProvider>
            {children}  {/* Server Components pass through! */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
\`\`\`

> 💡 Even though ThemeProvider is a Client Component, it renders its \`children\` prop — which can be Server Components. The children "pass through" the client boundary.
`,

"f3274a36-3f3b-4824-bc70-1b038669c4dd": `# React Context in Code — Theme & Auth

Multiple context providers working together.

## Auth Context with Next-Auth

\`\`\`tsx
// Wrap your app in SessionProvider for auth context
"use client";
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children, session }: { children: React.ReactNode; session: any }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

// Access auth anywhere in client components
"use client";
import { useSession } from "next-auth/react";

function NavBar() {
  const { data: session, status } = useSession();
  // session: { user: { id, name, email, image } } or null
}
\`\`\`

## Composing Multiple Providers

\`\`\`tsx
// components/providers/index.tsx
"use client";
import { ThemeProvider } from "@/context/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}

// app/layout.tsx — clean!
import { Providers } from "@/components/providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
\`\`\`

## When NOT to Use Context

\`\`\`
❌ Fetching data → Use Server Components instead
❌ Filters/search state → Use URL params instead
❌ Form state → Use react-hook-form instead
❌ Animation state → Keep local with useState

✅ Theme (light/dark/system)
✅ Auth session (user identity)
✅ Locale/language
✅ Toast notifications
\`\`\`

> 💡 In the App Router, React Context is needed for far fewer things than in Pages Router. URL state and Server Components handle most of what Context used to do.
`,

"66d23779-a150-4605-be51-e067c45b7929": `# How Optimistic Updates Work — Full Pattern

A deep dive into the optimistic update lifecycle and edge cases.

## The Complete Lifecycle

\`\`\`
1. User Action (click vote button)
   └─→ 2. Optimistic Update (UI shows +1 immediately)
        └─→ 3. Server Action Fires (async)
             ├─→ 4a. SUCCESS: UI already correct ✓
             └─→ 4b. FAILURE: Revert UI to original ✗
                      └─→ Show error toast
\`\`\`

## React 19 Pattern

\`\`\`tsx
"use client";
import { useOptimistic, useTransition } from "react";

function SaveButton({ questionId, isSaved, userId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(isSaved);

  function handleSave() {
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved);
      try {
        await toggleSaveQuestion({ questionId, userId });
      } catch {
        // React automatically reverts useOptimistic on error
        toast({ title: "Failed to save", variant: "destructive" });
      }
    });
  }

  return (
    <button
      onClick={handleSave}
      disabled={isPending}
      className={optimisticSaved ? "text-yellow-500" : "text-gray-400"}
    >
      {optimisticSaved ? "★" : "☆"} {optimisticSaved ? "Saved" : "Save"}
    </button>
  );
}
\`\`\`

## Edge Cases to Handle

| Edge Case | Solution |
|---|---|
| Double-click | Disable button during transition |
| Network error | useOptimistic auto-reverts |
| Slow network | Show transition indicator |
| Stale data | Server revalidation corrects UI |
| Offline | Queue action, retry on reconnect |

> 💡 \`useOptimistic\` automatically reverts when the transition (startTransition) throws an error. You don't need manual revert logic!
`,

"8aa92006-c0bb-422f-b3f7-de500a749257": `# Optimistic UI in Code — Vote, Save, Delete

Multiple optimistic update patterns in DevOverflow.

## Optimistic Delete

\`\`\`tsx
"use client";
import { useOptimistic, useTransition } from "react";

function DeleteButton({ questionId, onDelete }: { questionId: string; onDelete: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleted, setIsDeleted] = useOptimistic(false);

  function handleDelete() {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    startTransition(async () => {
      setIsDeleted(true); // Optimistically remove from UI
      await deleteQuestion({ questionId, path: "/" });
      onDelete(); // Notify parent to remove from list
    });
  }

  if (isDeleted) return null; // Render nothing

  return (
    <button onClick={handleDelete} disabled={isPending}
      className="text-red-500 hover:text-red-600">
      {isPending ? "Deleting..." : "🗑 Delete"}
    </button>
  );
}
\`\`\`

## Optimistic List Operations

\`\`\`tsx
"use client";

function QuestionFeed({ initialQuestions }: { initialQuestions: Question[] }) {
  const [optimisticQuestions, addOptimistic] = useOptimistic(
    initialQuestions,
    (state, action: { type: "delete"; id: string } | { type: "vote"; id: string; direction: "up" | "down" }) => {
      switch (action.type) {
        case "delete":
          return state.filter((q) => q._id !== action.id);
        case "vote":
          return state.map((q) =>
            q._id === action.id
              ? { ...q, upvotes: action.direction === "up" ? q.upvotes + 1 : q.upvotes }
              : q
          );
        default:
          return state;
      }
    }
  );

  return (
    <div className="flex flex-col gap-6">
      {optimisticQuestions.map((q) => (
        <QuestionCard
          key={q._id}
          question={q}
          onVote={(dir) => addOptimistic({ type: "vote", id: q._id, direction: dir })}
          onDelete={() => addOptimistic({ type: "delete", id: q._id })}
        />
      ))}
    </div>
  );
}
\`\`\`

> 💡 The reducer pattern in \`useOptimistic\` lets you handle multiple action types (delete, vote, save) with a single optimistic state.
`,

"8386991c-7799-491a-9c5e-e2a6c02c575f": `# Task: Refactor to Optimistic UI Across Features

Build an optimistic state management system!

## Your Task

Create a reusable optimistic state manager that handles multiple action types with automatic rollback on failure.

> 💡 **Hint:** Build a mini version of useOptimistic that works with any data type and action.

## Requirements

- Implement \`createOptimistic(initialState, reducer)\` that creates an optimistic state manager
- The reducer receives current state and an action, returning new optimistic state
- Implement \`.dispatch(action, serverAction)\` that:
  1. Immediately applies the reducer (optimistic update)
  2. Runs the serverAction async
  3. On success: keeps the optimistic state
  4. On failure: reverts to the last confirmed state
- Support action types: "add", "remove", "update", "toggle"
- Implement \`.getState()\` that returns current display state
- Implement \`.getPending()\` that returns list of pending actions

## What You'll Practice

- Optimistic update patterns
- State management with rollback
- Action dispatch patterns
`,
};

async function main() {
  console.log("Updating Ultimate Next.js — Modules 9-11 (Tags, Profiles, State)...");
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
