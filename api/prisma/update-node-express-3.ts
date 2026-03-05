import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 5: Database — PostgreSQL & Prisma ORM (13 lessons) ──
"391ed6c3-0b67-46ae-9b0f-ede8b0fa60ec": `# How Relational Databases Work

Relational databases store data in structured tables with defined relationships — the backbone of most backend APIs.

## Tables, Rows, Columns

\`\`\`
users table:
┌────────┬──────────┬───────────────────┬─────────┐
│ id     │ name     │ email             │ role    │
├────────┼──────────┼───────────────────┼─────────┤
│ u1     │ Alice    │ alice@example.com │ admin   │
│ u2     │ Bob      │ bob@example.com   │ user    │
└────────┴──────────┴───────────────────┴─────────┘

projects table:
┌────────┬───────────┬──────────┬─────────┐
│ id     │ title     │ owner_id │ status  │
├────────┼───────────┼──────────┼─────────┤
│ p1     │ TaskFlow  │ u1       │ active  │
│ p2     │ ChatApp   │ u2       │ active  │
└────────┴───────────┴──────────┴─────────┘

owner_id → users.id (Foreign Key relationship)
\`\`\`

## Relationship Types

| Type | Example | SQL |
|---|---|---|
| One-to-One | User → Profile | profile.user_id UNIQUE |
| One-to-Many | User → Projects | project.owner_id |
| Many-to-Many | User ↔ Projects (members) | project_members join table |

## Why PostgreSQL?

| Feature | PostgreSQL | MySQL | SQLite |
|---|---|---|---|
| JSON support | ✅ Native (jsonb) | ⚠️ Basic | ❌ |
| Full-text search | ✅ Built-in | ⚠️ Plugin | ❌ |
| Arrays | ✅ Native | ❌ | ❌ |
| Transactions | ✅ ACID | ✅ ACID | ✅ ACID |
| Scale | ✅ Enterprise | ✅ Enterprise | ❌ Small |

> 💡 PostgreSQL is the most feature-rich open-source database. It handles JSON, arrays, full-text search, and complex queries that other databases can't.
`,

"4fe9659d-292b-431b-8c6d-ccf9072d6614": `# SQL Basics in Code — SELECT, INSERT, UPDATE, DELETE

The four fundamental SQL operations (CRUD) that every backend developer needs.

## SELECT — Reading Data

\`\`\`sql
-- Get all users
SELECT * FROM users;

-- Get specific columns
SELECT name, email FROM users;

-- Filter with WHERE
SELECT * FROM users WHERE role = 'admin';

-- Multiple conditions
SELECT * FROM tasks 
WHERE status = 'in_progress' 
  AND priority = 'high' 
  AND due_date < NOW();

-- Sort and limit (pagination)
SELECT * FROM projects 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 40;  -- Page 3, 20 per page

-- Count
SELECT COUNT(*) FROM tasks WHERE project_id = 'p1';

-- Join (combine tables)
SELECT p.title, u.name as owner_name
FROM projects p
JOIN users u ON p.owner_id = u.id;
\`\`\`

## INSERT, UPDATE, DELETE

\`\`\`sql
-- INSERT — Create
INSERT INTO projects (id, title, owner_id, status)
VALUES ('p3', 'NewProject', 'u1', 'active')
RETURNING *;  -- PostgreSQL: return the created row

-- UPDATE — Modify
UPDATE tasks 
SET status = 'done', updated_at = NOW()
WHERE id = 't1'
RETURNING *;

-- DELETE — Remove
DELETE FROM tasks WHERE id = 't1';

-- Soft delete (mark as deleted, don't remove)
UPDATE tasks SET deleted_at = NOW() WHERE id = 't1';
\`\`\`

## Common Patterns

\`\`\`sql
-- Upsert (insert or update)
INSERT INTO users (id, name, email)
VALUES ('u1', 'Alice Updated', 'alice@new.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Group by (aggregation)
SELECT status, COUNT(*) as count
FROM tasks
WHERE project_id = 'p1'
GROUP BY status;
\`\`\`

> 💡 Always use parameterized queries in code (never concatenate user input into SQL). Prisma does this automatically — one less thing to worry about.
`,

"3ad85609-248e-428c-a862-022dd29705d4": `# How ORMs & Prisma Work

An ORM (Object-Relational Mapping) lets you interact with the database using TypeScript objects instead of raw SQL.

## Raw SQL vs ORM

\`\`\`typescript
// Raw SQL — works but fragile
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
const user = result.rows[0]; // any type — no safety!

// Prisma ORM — type-safe and readable
const user = await prisma.user.findUnique({
  where: { email },
}); // Fully typed! Returns User | null
\`\`\`

## How Prisma Works

\`\`\`
1. Define schema    →  prisma/schema.prisma
2. Run migration    →  prisma migrate dev
3. Generate client  →  prisma generate
4. Use in code      →  prisma.user.findMany()

Schema (source of truth)
    │
    ├──▶ Database tables (via migrations)
    │
    └──▶ TypeScript types (via generation)
         Both stay perfectly in sync!
\`\`\`

## Prisma vs Other ORMs

| Feature | Prisma | TypeORM | Sequelize |
|---|---|---|---|
| Type safety | ✅ Generated | ⚠️ Decorators | ❌ Manual |
| Migrations | ✅ Auto-generated | ⚠️ Manual | ⚠️ Manual |
| Query builder | ✅ Fluent API | ✅ Query builder | ✅ Methods |
| Relations | ✅ Declarative | ⚠️ Decorators | ⚠️ Methods |
| Learning curve | Easy | Medium | Medium |
| Raw SQL escape | ✅ prisma.$queryRaw | ✅ | ✅ |

> 💡 Prisma's killer feature is generating types from your schema. Change a column? \`prisma generate\` updates all types — TypeScript catches every affected file.
`,

"6e5f10a0-9dff-4cb4-b6e6-fd739156a48c": `# Prisma Setup in Code — Schema & Migration

Setting up Prisma for the TaskFlow project.

## Installation

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## Schema Definition

\`\`\`prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         Role      @default(USER)
  avatar       String?
  bio          String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relations
  ownedProjects Project[] @relation("ProjectOwner")
  memberships   ProjectMember[]
  assignedTasks Task[]    @relation("TaskAssignee")
  comments      Comment[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
}

model Project {
  id          String        @id @default(uuid())
  title       String
  description String?
  status      ProjectStatus @default(ACTIVE)
  ownerId     String        @map("owner_id")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  // Relations
  owner       User            @relation("ProjectOwner", fields: [ownerId], references: [id])
  members     ProjectMember[]
  tasks       Task[]

  @@map("projects")
}
\`\`\`

## Migration

\`\`\`bash
# Create and run migration
npx prisma migrate dev --name init

# Generate client (types)
npx prisma generate

# View database in browser
npx prisma studio
\`\`\`

> 💡 \`@@map("users")\` maps the Prisma model name \`User\` to the SQL table name \`users\`. Follow the convention: PascalCase models, snake_case tables.
`,

"e390db23-792a-4de1-bbb6-76fb7401bdd1": `# Task: Set Up PostgreSQL & Prisma for TaskFlow

Create the complete database schema for TaskFlow!

## Your Task

Define the Prisma schema with all TaskFlow models, generate migrations, and verify with Prisma Studio.

> 💡 **Hint:** Start with User and Project models, then add Task and Comment. Use \`@@map\` for snake_case table names.

## Requirements

- Define these models:
  - User: id (uuid), name, email (unique), passwordHash, role (enum: USER/ADMIN), avatar?, bio?, timestamps
  - Project: id, title, description?, status (enum: ACTIVE/ARCHIVED/COMPLETED), ownerId (FK), timestamps
  - ProjectMember: userId + projectId (composite PK), role (enum: OWNER/EDITOR/VIEWER), joinedAt
  - Task: id, title, description?, status (enum), priority (enum), projectId (FK), assigneeId? (FK), dueDate?, tags (String[]), timestamps
  - Comment: id, content, taskId (FK), authorId (FK), timestamps
- Set up proper relations with cascade deletes on Project → Tasks → Comments
- Use snake_case table and column names via @@map and @map
- Run migration and verify in Prisma Studio

## What You'll Practice

- Prisma schema definition
- Database migrations
- Relation modeling
`,

"7a5f8194-015a-4aaa-a16d-366570c2efcf": `# How Prisma CRUD Operations Work

Prisma provides a fluent API for all database operations with full TypeScript support.

## The CRUD Operations

\`\`\`typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CREATE
const user = await prisma.user.create({
  data: { name: "Alice", email: "alice@example.com", passwordHash: "..." },
});

// READ (single)
const user = await prisma.user.findUnique({ where: { id: "u1" } });
const user = await prisma.user.findUnique({ where: { email: "alice@example.com" } });
const user = await prisma.user.findFirst({ where: { role: "ADMIN" } });

// READ (many)
const users = await prisma.user.findMany({
  where: { role: "USER" },
  orderBy: { createdAt: "desc" },
  skip: 20,   // Offset
  take: 10,   // Limit
});

// UPDATE
const user = await prisma.user.update({
  where: { id: "u1" },
  data: { name: "Alice Updated" },
});

// DELETE
await prisma.user.delete({ where: { id: "u1" } });

// COUNT
const count = await prisma.user.count({ where: { role: "USER" } });
\`\`\`

## Filtering

\`\`\`typescript
const tasks = await prisma.task.findMany({
  where: {
    AND: [
      { status: "IN_PROGRESS" },
      { priority: { in: ["HIGH", "URGENT"] } },
      { dueDate: { lte: new Date() } },        // Overdue
      { title: { contains: "bug", mode: "insensitive" } },
    ],
  },
});
\`\`\`

> 💡 Prisma's \`findUnique\` returns \`T | null\`, while \`findUniqueOrThrow\` returns \`T\` (throws if not found). Use \`OrThrow\` variants when you know the record must exist.
`,

"d95c83a1-e36c-4950-a88b-58a556c05b2a": `# Prisma CRUD in Code — Full Implementation

Complete CRUD service using Prisma.

## User Service

\`\`\`typescript
// services/user.service.ts
import { PrismaClient, Prisma, User } from "@prisma/client";

const prisma = new PrismaClient();

// Public user type (exclude passwordHash)
type PublicUser = Omit<User, "passwordHash">;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userService = {
  async findById(id: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
    // Returns full user WITH passwordHash (for login)
  },

  async findMany(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const where: Prisma.UserWhereInput = search
      ? { OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]}
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  async create(data: Prisma.UserCreateInput): Promise<PublicUser> {
    const user = await prisma.user.create({ data, select: publicUserSelect });
    return user;
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<PublicUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};
\`\`\`

> 💡 Use Prisma's \`select\` to control which fields are returned. This prevents accidentally sending \`passwordHash\` to the client.
`,

"655e1934-510b-449c-b910-a81e71dc8fc8": `# Task: Build the TaskFlow Data Access Layer

Create Prisma services for all TaskFlow models!

## Your Task

Build a complete data access layer with Prisma services for Users, Projects, and Tasks.

> 💡 **Hint:** Use \`select\` to create "public" versions that exclude sensitive fields. Use \`Promise.all\` for parallel count + data queries.

## Requirements

- UserService: findById, findByEmail (with hash), findMany (search + pagination), create, update, delete
- ProjectService: findById (include owner + member count), findMany (filter by status, search, pagination), create, update, delete, addMember, removeMember
- TaskService: findByProject (filter by status/priority/assignee, pagination), findById (include comments), create, update, updateStatus, assign, delete
- All services should:
  - Use \`select\` to exclude sensitive fields
  - Support search with case-insensitive contains
  - Return paginated results with total count
  - Use \`satisfies Prisma.XxxSelect\` for type-safe selects

## What You'll Practice

- Prisma query patterns
- Service layer architecture
- Type-safe database access
`,

"23567ad6-db84-428e-ab2a-3cdd94019839": `# How Database Relations Work in Prisma

Prisma makes working with related data elegant through include, nested writes, and transactions.

## Include Related Data

\`\`\`typescript
// Include owner when fetching project
const project = await prisma.project.findUnique({
  where: { id: "p1" },
  include: {
    owner: { select: { id: true, name: true, avatar: true } },
    members: { include: { user: true } },
    tasks: { where: { status: "IN_PROGRESS" } },
    _count: { select: { tasks: true, members: true } },
  },
});

// project.owner.name ← works!
// project._count.tasks ← number of tasks
\`\`\`

## Nested Writes

\`\`\`typescript
// Create project WITH tasks in one operation
const project = await prisma.project.create({
  data: {
    title: "TaskFlow",
    owner: { connect: { id: userId } },
    members: {
      create: { userId, role: "OWNER" },
    },
    tasks: {
      create: [
        { title: "Set up project", priority: "HIGH" },
        { title: "Design API", priority: "MEDIUM" },
      ],
    },
  },
  include: { tasks: true, members: true },
});
\`\`\`

## Transactions

\`\`\`typescript
// Transfer task between projects (must be atomic)
const [task, sourceCount, destCount] = await prisma.$transaction([
  prisma.task.update({
    where: { id: taskId },
    data: { projectId: newProjectId },
  }),
  prisma.project.update({
    where: { id: oldProjectId },
    data: { taskCount: { decrement: 1 } },
  }),
  prisma.project.update({
    where: { id: newProjectId },
    data: { taskCount: { increment: 1 } },
  }),
]);
\`\`\`

> 💡 Transactions ensure that either ALL operations succeed or NONE do. Use them whenever you modify multiple related records.
`,

"1a0bf657-08e6-4eed-a60c-c15ef87210aa": `# Relations in Code — Nested Queries & Transactions

Advanced Prisma relation patterns for the TaskFlow API.

## Deep Nested Queries

\`\`\`typescript
// Get project with all related data
const projectDetail = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    owner: { select: { id: true, name: true, avatar: true } },
    members: {
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { joinedAt: "asc" },
    },
    tasks: {
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    },
    _count: { select: { tasks: true, members: true } },
  },
});
\`\`\`

## Interactive Transaction

\`\`\`typescript
// Create project with default setup (interactive)
async function createProjectWithSetup(userId: string, data: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Create project
    const project = await tx.project.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: userId,
      },
    });

    // 2. Add creator as owner member
    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: "OWNER",
      },
    });

    // 3. Create default tasks
    await tx.task.createMany({
      data: [
        { title: "Project Setup", projectId: project.id, priority: "HIGH", status: "TODO" },
        { title: "Define Requirements", projectId: project.id, priority: "MEDIUM", status: "TODO" },
      ],
    });

    // Return with all includes
    return tx.project.findUnique({
      where: { id: project.id },
      include: { owner: true, members: true, tasks: true },
    });
  });
}
\`\`\`

> 💡 Interactive transactions (\`$transaction(async (tx) => { ... })\`) let you use conditional logic inside the transaction. Use \`tx\` instead of \`prisma\` for all queries within.
`,

"e5016889-5d77-48dc-9732-0b899a89323e": `# How Database Seeding Works

Seeding populates your database with initial or test data — essential for development and testing.

## Why Seed?

\`\`\`
Without seeding:
- Start app → empty database → can't test anything
- Every developer sets up data manually → inconsistent
- CI tests start with no data → tests fail or need setup

With seeding:
- npx prisma db seed → consistent data every time
- Same data across all developers
- CI starts with known state
\`\`\`

## Seed Script

\`\`\`typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding database...");

  // Clear existing data (order matters — respect FK constraints)
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "alice@taskflow.dev",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "ADMIN",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Developer",
      email: "bob@taskflow.dev",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "USER",
    },
  });

  // Create project with tasks
  await prisma.project.create({
    data: {
      title: "TaskFlow MVP",
      description: "Build the initial TaskFlow API",
      ownerId: alice.id,
      tasks: {
        create: [
          { title: "User Authentication", priority: "HIGH", status: "DONE", assigneeId: alice.id },
          { title: "Project CRUD", priority: "HIGH", status: "IN_PROGRESS", assigneeId: bob.id },
          { title: "Task Management", priority: "MEDIUM", status: "TODO" },
        ],
      },
      members: {
        create: [
          { userId: alice.id, role: "OWNER" },
          { userId: bob.id, role: "EDITOR" },
        ],
      },
    },
  });

  console.log("Seed complete!");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
\`\`\`

> 💡 Always delete in reverse dependency order (Comments → Tasks → Projects → Users). Creating in forward order. This respects foreign key constraints.
`,

"be27a738-ab8a-4bf7-8a7f-299cc8b8bd00": `# Seeding in Code — TaskFlow Sample Data

Building a comprehensive seed script with realistic data.

## Seed Helpers

\`\`\`typescript
// prisma/seed-helpers.ts
import { PrismaClient, Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export function createUserData(overrides: Partial<Prisma.UserCreateInput> = {}) {
  return {
    name: "Test User",
    email: "test@taskflow.dev",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "USER" as Role,
    ...overrides,
  };
}

export function createManyTasks(projectId: string, count: number) {
  const statuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

  return Array.from({ length: count }, (_, i) => ({
    title: "Task #" + (i + 1),
    description: "Description for task " + (i + 1),
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    projectId,
  }));
}
\`\`\`

## package.json Seed Config

\`\`\`json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
\`\`\`

## Run Seeds

\`\`\`bash
# Run seed
npx prisma db seed

# Reset database and seed
npx prisma migrate reset

# Seed with specific environment
NODE_ENV=test npx prisma db seed
\`\`\`

## Test Data Factory

\`\`\`typescript
// For tests — create unique data per test
export function createTestUser(overrides = {}) {
  const id = randomUUID();
  return createUserData({
    email: "user-" + id.substring(0, 8) + "@test.com",
    name: "Test User " + id.substring(0, 8),
    ...overrides,
  });
}
\`\`\`

> 💡 Use factory functions for test data — they generate unique values per test, preventing conflicts in parallel test runs.
`,

"83a69271-9ca2-4b4b-a501-cd6cc8fda185": `# Task: Seed the TaskFlow Database

Create a comprehensive seed script for development!

## Your Task

Build a seed script that populates the database with realistic sample data for all models.

> 💡 **Hint:** Create helper functions for generating data, then compose them into a complete seed.

## Requirements

- Create 5+ users (1 admin, rest users) with hashed passwords
- Create 3+ projects with different statuses
- Add project members with different roles (owner, editor, viewer)
- Create 20+ tasks across projects with varied statuses, priorities, and assignees
- Add 10+ comments on different tasks
- Create a factory function for generating unique test users
- Handle idempotency: running seed twice should reset data, not duplicate
- Add console.log progress indicators
- Configure in package.json so \`npx prisma db seed\` works

## What You'll Practice

- Database seeding patterns
- Factory functions for test data
- Prisma nested create operations
`,

// ── Module 6: Authentication & Authorization (14 lessons) ──
"6f76e68d-3255-41d9-aade-4128635a8816": `# How Authentication Works — Sessions vs Tokens

Authentication verifies WHO you are. Authorization determines WHAT you can do.

## Sessions vs Tokens

\`\`\`
Session-Based:
1. User logs in → Server creates session (stored in DB/memory)
2. Server sends session ID as cookie
3. Browser sends cookie with every request
4. Server looks up session to identify user

Token-Based (JWT):
1. User logs in → Server creates JWT (signed token)
2. Server sends JWT to client
3. Client sends JWT in Authorization header
4. Server verifies JWT signature (no DB lookup needed!)
\`\`\`

## Why JWT for APIs?

| Feature | Sessions | JWT |
|---|---|---|
| Storage | Server-side (DB/Redis) | Client-side (localStorage) |
| Scalability | Needs shared store | Stateless (any server) |
| Mobile apps | ❌ Cookies don't work | ✅ Header-based |
| Performance | DB lookup per request | Signature verification |
| Revocation | ✅ Delete session | ⚠️ Need blocklist |

## JWT Structure

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1MSJ9.sig

Header.Payload.Signature

Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "userId": "u1", "role": "admin", "exp": 1699999999 }
Signature: HMAC-SHA256(header + payload, SECRET_KEY)
\`\`\`

> 💡 JWTs are signed, NOT encrypted. Anyone can read the payload (Base64 decode). Never put sensitive data (passwords, credit cards) in a JWT.
`,

"d1e67082-270a-4ddf-9c52-8c22e707a282": `# How JWT Tokens Work

JWT (JSON Web Token) is a compact, self-contained way to securely transmit information between parties.

## Token Flow

\`\`\`
Login:
Client ──POST /auth/login──▶ Server
         { email, password }
                               │
                               ├── Find user by email
                               ├── Compare password hash
                               ├── Generate JWT
                               │
Client ◀── { token: "eyJ..." } ──┘

Authenticated Request:
Client ──GET /api/projects──▶ Server
  Header: Authorization:        │
  Bearer eyJ...                 ├── Extract token
                               ├── Verify signature
                               ├── Decode payload → { userId }
                               ├── Load user from DB
                               │
Client ◀── { data: [...] }  ──┘
\`\`\`

## Token Lifecycle

\`\`\`
Access Token (short-lived: 15min - 1hr)
  └── Used for API requests
  └── Short expiry limits damage if stolen

Refresh Token (long-lived: 7-30 days)
  └── Used ONLY to get new access tokens
  └── Stored securely (httpOnly cookie)
  └── Can be revoked (stored in DB)
\`\`\`

## Token Claims

| Claim | Type | Description |
|---|---|---|
| sub | Standard | Subject (userId) |
| iat | Standard | Issued at (timestamp) |
| exp | Standard | Expiration (timestamp) |
| role | Custom | User role |

> 💡 Use short-lived access tokens (15 min) + long-lived refresh tokens (7 days). This limits exposure if an access token is stolen.
`,

"2c35b8fb-e1a9-4505-afef-826aad79c0a0": `# JWT in Code — Sign & Verify

Implementing JWT token generation and verification.

## Install jsonwebtoken

\`\`\`bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
\`\`\`

## Token Service

\`\`\`typescript
// services/token.service.ts
import jwt from "jsonwebtoken";
import { config } from "../config";

interface TokenPayload {
  userId: string;
  role: string;
}

export const tokenService = {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: "15m",
    });
  },

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: "7d",
    });
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  },

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  },

  generateTokenPair(payload: TokenPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },
};

// Usage
const tokens = tokenService.generateTokenPair({ userId: "u1", role: "user" });
// { accessToken: "eyJ...", refreshToken: "eyJ..." }

const payload = tokenService.verifyAccessToken(tokens.accessToken);
// { userId: "u1", role: "user" }
\`\`\`

> 💡 Use separate secrets for access and refresh tokens. If the access token secret is compromised, refresh tokens remain secure.
`,

"5e91f333-aa63-47c9-90ab-7a3199c94989": `# How Password Hashing Works

Never store passwords in plain text! Password hashing converts passwords into irreversible strings.

## Why Not Encrypt?

\`\`\`
Encryption (reversible):
"password123" ──encrypt──▶ "x7Ks9a..." ──decrypt──▶ "password123"
If the key leaks, ALL passwords are exposed!

Hashing (one-way):
"password123" ──hash──▶ "$2b$10$..."  ──❌ can't reverse──▶ ???
Even if the hash leaks, the password is safe!
\`\`\`

## How bcrypt Works

\`\`\`
"password123"
    │
    ├── Add salt (random string)
    │   "password123" + "Xk9aP2..."
    │
    ├── Hash with bcrypt (CPU-intensive, intentionally slow)
    │   → "$2b$10$Xk9aP2...hashed..."
    │
    └── Result: "$2b$10$Xk9aP2...hashed..."
               ^^^^  ^^ ^^^^^^^^^^^^^
               algo  cost  salt + hash

Verification:
  bcrypt.compare("password123", "$2b$10$Xk9aP2...") → true
  bcrypt.compare("wrong",       "$2b$10$Xk9aP2...") → false
\`\`\`

## Cost Factor (Salt Rounds)

| Rounds | Time | Use Case |
|---|---|---|
| 8 | ~40ms | Tests (fast) |
| 10 | ~100ms | Default (balanced) |
| 12 | ~300ms | High security |
| 14 | ~1s | Maximum security |

> 💡 bcrypt is intentionally SLOW. That means brute-force attacks need 100ms per attempt instead of microseconds — making dictionary attacks impractical.
`,

"2167ad83-daa0-4f74-b634-00e9cb432efc": `# Password Hashing in Code — bcrypt

Implementing secure password hashing and comparison.

## Install bcrypt

\`\`\`bash
npm install bcryptjs
npm install -D @types/bcryptjs
\`\`\`

## Password Service

\`\`\`typescript
// services/password.service.ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const passwordService = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Must be at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Must contain lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Must contain a number");
    return { valid: errors.length === 0, errors };
  },
};

// Usage
const hash = await passwordService.hash("MyP@ssw0rd");
// "$2b$10$..."

const isValid = await passwordService.compare("MyP@ssw0rd", hash);
// true

const validation = passwordService.validate("weak");
// { valid: false, errors: ["Must be at least 8 characters", ...] }
\`\`\`

> 💡 Use \`bcryptjs\` (pure JS) instead of \`bcrypt\` (native). It's slower but requires no native compilation — works everywhere without build tools.
`,

"31927734-7ff4-4dd2-bd78-7864dbff7679": `# Task: Build User Registration

Implement the user registration endpoint!

## Your Task

Build a complete registration flow with validation, password hashing, and JWT token generation.

> 💡 **Hint:** Hash the password BEFORE saving to the database. Return the token pair so the user is logged in immediately after registration.

## Requirements

- POST /api/v1/auth/register endpoint
- Validate input with Zod: name (required), email (required, valid format), password (min 8 chars, uppercase + lowercase + number)
- Check if email already exists → 409 Conflict
- Hash password with bcrypt (10 salt rounds)
- Create user in database
- Generate JWT access token (15 min) + refresh token (7 days)
- Return user profile (WITHOUT passwordHash) + token pair
- Return 201 Created on success

## What You'll Practice

- Password hashing with bcrypt
- JWT token generation
- Duplicate detection
- Validation + service layer
`,

"f9357d71-3d04-449b-acd4-83b7994af8d7": `# How Login & Token Flow Works

The login flow verifies credentials and issues tokens for subsequent authenticated requests.

## Login Flow

\`\`\`
1. Client sends email + password
2. Server finds user by email
3. Server compares password with stored hash
4. If match → generate token pair
5. If no match → 401 Unauthorized

POST /auth/login
  Body: { email: "alice@example.com", password: "secret" }

  Success (200):
  {
    user: { id: "u1", name: "Alice", role: "admin" },
    accessToken: "eyJ...",
    refreshToken: "eyJ..."
  }

  Failure (401):
  { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } }
\`\`\`

## Token Refresh Flow

\`\`\`
When access token expires (after 15 min):

POST /auth/refresh
  Body: { refreshToken: "eyJ..." }

  1. Verify refresh token signature
  2. Check if token is revoked (optional: check DB)
  3. Generate new access token
  4. Return new tokens

  Success: { accessToken: "eyJ...(new)", refreshToken: "eyJ...(new)" }
  Failure: { error: "Invalid refresh token" } → force re-login
\`\`\`

## Security Considerations

| Concern | Solution |
|---|---|
| Timing attacks | Always hash before compare (even if user not found) |
| Brute force | Rate limit login endpoint (10/15min) |
| Token theft | Short access token expiry (15 min) |
| Token revocation | Store refresh tokens in DB, delete on logout |

> 💡 Always return the same error message for wrong email AND wrong password: "Invalid email or password". Don't reveal which one was wrong — it helps attackers enumerate valid emails.
`,

"92c3cba0-ff07-4d31-92f7-67dac8f8bc8a": `# Login & Token Flow in Code

Implementing the login and token refresh endpoints.

## Auth Service

\`\`\`typescript
// services/auth.service.ts
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";
import { userService } from "./user.service";
import { UnauthorizedError } from "../lib/errors";

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    // Check duplicate
    const existing = await userService.findByEmail(data.email);
    if (existing) throw new ConflictError("Email already registered");

    // Hash password
    const passwordHash = await passwordService.hash(data.password);

    // Create user
    const user = await userService.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    // Generate tokens
    const tokens = tokenService.generateTokenPair({
      userId: user.id,
      role: user.role,
    });

    return { user, ...tokens };
  },

  async login(email: string, password: string) {
    // Find user (with passwordHash)
    const user = await userService.findByEmail(email);
    if (!user) {
      // Still hash to prevent timing attacks
      await passwordService.hash("dummy");
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare password
    const valid = await passwordService.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    // Generate tokens
    const tokens = tokenService.generateTokenPair({
      userId: user.id,
      role: user.role,
    });

    const { passwordHash, ...publicUser } = user;
    return { user: publicUser, ...tokens };
  },

  async refresh(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    return tokenService.generateTokenPair(payload);
  },
};
\`\`\`

> 💡 The timing attack prevention is subtle: even when the user doesn't exist, we still call \`passwordService.hash()\` so the response time is the same. An attacker can't tell if the email exists by measuring response speed.
`,

"c50e5445-c9b3-48a5-944a-bc3af180b8ba": `# Task: Build Login & Logout

Implement the complete login/logout/refresh flow!

## Your Task

Build the login endpoint, token refresh, and logout (token invalidation).

> 💡 **Hint:** For logout, you need to invalidate the refresh token so it can't be used again. Store a token blocklist or delete it from the DB.

## Requirements

- POST /api/v1/auth/login — email + password → tokens + user profile
- POST /api/v1/auth/refresh — refresh token → new token pair
- POST /api/v1/auth/logout — invalidate refresh token
- Rate limit: max 10 login attempts per 15 minutes per IP
- Same error message for wrong email and wrong password ("Invalid email or password")
- Timing attack prevention (hash even when user not found)
- Return 200 for login, 401 for bad credentials

## What You'll Practice

- Credential verification
- Token lifecycle management
- Security best practices
`,

"d5f86b92-bd15-4c88-ac9e-ea847fb79547": `# How Auth Middleware Works

Auth middleware intercepts requests and verifies the JWT token before the route handler runs.

## Auth Middleware Flow

\`\`\`
Request with Authorization header
    │
    ▼
Auth Middleware:
  1. Extract token from "Bearer <token>"
  2. Verify JWT signature
  3. Decode payload → { userId, role }
  4. Fetch user from DB (optional but recommended)
  5. Attach user to req.user
  6. Call next()

If any step fails → 401 Unauthorized
\`\`\`

## Implementation

\`\`\`typescript
// middleware/auth.ts
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }

  const token = header.split(" ")[1];

  try {
    const payload = tokenService.verifyAccessToken(token);
    const user = await userService.findById(payload.userId);
    if (!user) throw new UnauthorizedError("User not found");

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError("Invalid token");
  }
}

// Usage
router.get("/projects", authenticate, listProjects);
router.post("/projects", authenticate, createProject);
\`\`\`

> 💡 Always fetch the user from the DB in auth middleware (not just trust the JWT payload). This ensures the user still exists and hasn't been banned since the token was issued.
`,

"3a17ecd2-abdf-440d-8bb3-38ac4c8d5b29": `# Auth Middleware in Code — Protect Routes

Complete authentication middleware implementation.

## Typed Auth Middleware

\`\`\`typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenService } from "../services/token.service";
import { userService } from "../services/user.service";
import { UnauthorizedError } from "../lib/errors";

// Augment Express types
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = header.slice(7); // Remove "Bearer "
    const payload = tokenService.verifyAccessToken(token);

    const user = await userService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired — please refresh"));
    } else {
      next(error);
    }
  }
}

// Optional auth — don't error, just don't set req.user
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    await authenticate(req, res, next);
  } catch {
    next(); // Continue without user
  }
}
\`\`\`

> 💡 \`optionalAuth\` is useful for endpoints that work differently when logged in vs anonymous — like a post detail page that shows an "edit" button only for the author.
`,

"e61a01fb-a4eb-4a7e-a327-6af0aa99057c": `# How Role-Based Access Control (RBAC) Works

RBAC restricts access based on user roles — admin, editor, viewer, etc.

## RBAC Model

\`\`\`
Global Roles (user.role):
  ADMIN → Can do everything
  USER  → Can only access own resources

Resource Roles (projectMember.role):
  OWNER  → Full control over project
  EDITOR → Can create/edit tasks
  VIEWER → Read-only access

Permission Check Flow:
  1. Is user authenticated? → auth middleware
  2. Does user have the required global role? → role guard
  3. Does user have access to this specific resource? → ownership check
\`\`\`

## Permission Matrix

| Action | Admin | Owner | Editor | Viewer | Non-member |
|---|---|---|---|---|---|
| View project | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create task | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit task | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Add member | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete project | ✅ | ✅ | ❌ | ❌ | ❌ |

## RBAC vs ABAC

| Feature | RBAC | ABAC |
|---|---|---|
| Based on | User roles | Attributes (role + context) |
| Complexity | Simple | Complex |
| Flexibility | Limited | Full control |
| Example | "admin can delete" | "owner can delete if project is not archived" |

> 💡 Start with RBAC. It covers 90% of use cases. Only add ABAC (attribute-based) if you need complex conditional permissions.
`,

"3f12dcc6-c75e-404d-99bc-714b642a3850": `# RBAC in Code — Role Guard & Ownership

Implementing role-based access control middleware.

## Role Guard Middleware

\`\`\`typescript
// middleware/authorize.ts
import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";

// Check global role
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Requires role: " + roles.join(" or "));
    }
    next();
  };
}

// Usage
router.get("/admin/users", authenticate, requireRole("ADMIN"), listAllUsers);
router.delete("/users/:id", authenticate, requireRole("ADMIN"), deleteUser);
\`\`\`

## Resource Ownership Check

\`\`\`typescript
// middleware/checkAccess.ts
export function requireProjectAccess(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.user!.id;

    // Admins bypass
    if (req.user!.role === "ADMIN") return next();

    // Check membership
    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!member) throw new ForbiddenError("Not a project member");
    if (allowedRoles.length && !allowedRoles.includes(member.role)) {
      throw new ForbiddenError("Requires project role: " + allowedRoles.join(" or "));
    }

    req.memberRole = member.role;
    next();
  };
}

// Usage
router.delete("/:id",
  authenticate,
  requireProjectAccess("OWNER"),
  deleteProject
);

router.post("/:projectId/tasks",
  authenticate,
  requireProjectAccess("OWNER", "EDITOR"),
  createTask
);
\`\`\`

> 💡 Always check resource ownership in addition to role. An admin should bypass, but a regular user should only access projects they're a member of.
`,

"be9d75df-cd91-4137-9e51-388ffe8d28e2": `# Task: Protect TaskFlow Routes with Auth & RBAC

Implement the complete authentication and authorization system!

## Your Task

Protect all TaskFlow API routes with JWT authentication and role-based access control.

> 💡 **Hint:** Create \`authenticate\`, \`requireRole\`, and \`requireProjectAccess\` middleware. Compose them on routes.

## Requirements

- Auth endpoints (public): register, login, refresh
- User endpoints: profile (own only), update own profile, admin can list all / delete
- Project endpoints:
  - Create: any authenticated user
  - List: only projects user is a member of (admin sees all)
  - Get/Update: project members only
  - Delete: project owner or admin only
  - Add/remove members: project owner or admin
- Task endpoints:
  - List/Create/Update: project editors and owners
  - Delete: project owner or admin
  - Assign: project owner or admin
- Augment Express Request type for TypeScript
- Test each permission level: admin override, owner, editor, viewer, non-member

## What You'll Practice

- JWT authentication middleware
- Role-based authorization
- Resource-level access control
`,
};

async function main() {
  console.log("Updating Node.js Express — Modules 5-6...");
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
      } else { throw e; }
    }
  }
  console.log("Done! Updated " + count + " lessons, skipped " + skipped + ".");
  await p.$disconnect();
}

main().catch(console.error);
