import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 11: Testing (10 lessons) ──
"22aa276f-0787-41fc-a36c-714f380dabb8": `# How Testing Works for Backend APIs

Testing ensures your API behaves correctly — now and after future changes.

## Testing Pyramid

\`\`\`
        ╱ E2E Tests ╲           Few, slow, expensive
       ╱─────────────╲
      ╱  Integration   ╲        Some, moderate speed
     ╱──── Tests ───────╲
    ╱    Unit Tests       ╲     Many, fast, cheap
   ╱───────────────────────╲

Unit Tests:
  Test a single function/service in isolation
  Mock dependencies (DB, external services)
  Fast: 1000s per second

Integration Tests:
  Test routes end-to-end (HTTP → DB → Response)
  Real database (test DB)
  Moderate: 100s per second

E2E Tests:
  Test full user flows (Frontend + API + DB)
  Slowest, most realistic
  Few: 10s per run
\`\`\`

## What to Test in an API

\`\`\`
Unit Tests:
  ✅ Service business logic
  ✅ Validation functions
  ✅ Utility/helper functions
  ✅ Error handling logic

Integration Tests:
  ✅ Route handlers (status codes, response shape)
  ✅ Authentication/authorization
  ✅ Database operations (CRUD)
  ✅ Error responses (404, 400, 403)

Skip:
  ❌ Prisma/ORM internals
  ❌ Express framework code
  ❌ Third-party library internals
\`\`\`

> 💡 Aim for ~70% unit tests, ~20% integration tests, ~10% E2E tests. Unit tests give the most bang for the buck.
`,

"f6c1f6db-e9a0-4951-bb5d-1e01102a25cc": `# Vitest Setup in Code for Express

Setting up Vitest for testing your Express API.

## Installation

\`\`\`bash
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
\`\`\`

## Configuration

\`\`\`typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
    testTimeout: 10000,
    hookTimeout: 30000,
  },
});
\`\`\`

## Test Setup

\`\`\`typescript
// src/test/setup.ts
import { beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean tables before each test (order matters for foreign keys)
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.task.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
\`\`\`

## Package.json Scripts

\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
\`\`\`

> 💡 Use a separate test database (set DATABASE_URL in .env.test). Never run tests against your development or production database!
`,

"95576f7c-1781-4f68-8c26-851f39e9ee20": `# How to Unit Test Services

Unit tests isolate the service layer by mocking its dependencies (database, external services).

## Mocking Prisma

\`\`\`typescript
// We don't want real DB calls in unit tests
// Option 1: Manual mock
const mockPrisma = {
  project: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(mockPrisma)),
};

// Option 2: vi.mock (auto-mock the module)
vi.mock("../lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));
\`\`\`

## Test Structure: AAA Pattern

\`\`\`typescript
describe("ProjectService", () => {
  it("should create a project and add owner as member", async () => {
    // Arrange — set up data and mocks
    const userId = "user-1";
    const input = { title: "My Project", description: "Test" };
    const mockProject = { id: "proj-1", ...input, ownerId: userId };

    mockPrisma.project.create.mockResolvedValue(mockProject);
    mockPrisma.projectMember.create.mockResolvedValue({});

    // Act — call the function being tested
    const result = await projectService.create(input, userId);

    // Assert — verify the behavior
    expect(result).toEqual(mockProject);
    expect(mockPrisma.project.create).toHaveBeenCalledWith({
      data: { title: "My Project", description: "Test", ownerId: userId },
    });
    expect(mockPrisma.projectMember.create).toHaveBeenCalledWith({
      data: { projectId: "proj-1", userId, role: "OWNER" },
    });
  });

  it("should throw NotFoundError when project does not exist", async () => {
    // Arrange
    mockPrisma.project.findUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(projectService.findById("nonexistent"))
      .rejects.toThrow(NotFoundError);
  });
});
\`\`\`

> 💡 AAA — Arrange, Act, Assert. Every test should follow this structure. It makes tests readable and consistent.
`,

"8420f818-6205-44a9-9c60-a4de55f308c9": `# Unit Testing Services in Code

Full unit test examples for the TaskFlow project service.

## Project Service Tests

\`\`\`typescript
// services/__tests__/project.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectService } from "../project.service";
import { prisma } from "../../lib/prisma";
import { NotFoundError, ForbiddenError } from "../../lib/errors";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    projectMember: { create: vi.fn(), findFirst: vi.fn() },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe("projectService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates project and adds owner as member", async () => {
    const input = { title: "New Project" };
    const mockProject = { id: "p1", title: "New Project", ownerId: "u1" };

    vi.mocked(prisma.project.create).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.projectMember.create).mockResolvedValue({} as any);

    const result = await projectService.create(input, "u1");

    expect(result.title).toBe("New Project");
    expect(prisma.project.create).toHaveBeenCalledOnce();
    expect(prisma.projectMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "OWNER" }),
      })
    );
  });
});

describe("projectService.findById", () => {
  it("returns project when found", async () => {
    const mockProject = { id: "p1", title: "Test" };
    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

    const result = await projectService.findById("p1");
    expect(result.id).toBe("p1");
  });

  it("throws NotFoundError when not found", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

    await expect(projectService.findById("missing")).rejects.toThrow(NotFoundError);
  });
});

describe("projectService.update", () => {
  it("updates and returns project", async () => {
    const updated = { id: "p1", title: "Updated" };
    vi.mocked(prisma.project.update).mockResolvedValue(updated as any);

    const result = await projectService.update("p1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });
});
\`\`\`

> 💡 Use \`vi.clearAllMocks()\` in \`beforeEach\` to reset mock state between tests. Without it, tests can leak state and produce false results.
`,

"bdff1f90-44e6-4a49-b305-be4d69f6a69c": `# Task: Write Unit Tests for TaskFlow Services

Write comprehensive unit tests for the project and task services!

## Your Task

Create unit tests that cover the business logic in your service layer, using mocked database calls.

> 💡 **Hint:** Mock the Prisma client using vi.mock(), then test each service method for both success and error cases.

## Requirements

- Test ProjectService:
  - create: creates project + member in transaction
  - findById: returns project; throws NotFoundError when missing
  - findMany: returns paginated results, applies filters
  - update: updates fields, returns updated record
  - delete: deletes project
- Test TaskService:
  - create: creates task in project
  - findByProject: applies status/priority/search filters
  - update: updates task fields
  - updateStatus: validates status transitions
  - assignTask: assigns user, throws if user not project member
- Test error handling:
  - NotFoundError for missing records
  - ForbiddenError for unauthorized actions
  - ConflictError for duplicate names
- Minimum 15 test cases
- Use AAA pattern (Arrange, Act, Assert)
- Run: npm test — all tests should pass

## What You'll Practice

- Unit testing with Vitest
- Mocking with vi.mock and vi.fn
- Testing error scenarios
`,

"3ef50783-dd17-491b-b601-5f354c885e02": `# How Integration Testing with Supertest Works

Integration tests send real HTTP requests to your Express app and verify the full request lifecycle.

## Unit vs Integration

\`\`\`
Unit Test:
  ✅ Fast (no HTTP, no DB)
  ✅ Tests business logic in isolation
  ❌ Doesn't test routes, middleware, serialization

Integration Test:
  ✅ Tests the full stack (HTTP → middleware → controller → service → DB)
  ✅ Catches wiring bugs (wrong status code, missing auth)
  ❌ Slower (real DB, real HTTP)
\`\`\`

## Supertest

\`\`\`typescript
import request from "supertest";
import { app } from "../app"; // Express app (not listening)

describe("POST /api/v1/projects", () => {
  it("creates a project when authenticated", async () => {
    const token = await getAuthToken(); // Helper to get JWT

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Authorization", "Bearer " + token)
      .send({ title: "Test Project", description: "A test" })
      .expect(201);

    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.title).toBe("Test Project");
  });

  it("returns 401 without auth token", async () => {
    await request(app)
      .post("/api/v1/projects")
      .send({ title: "Test" })
      .expect(401);
  });

  it("returns 400 with missing title", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Authorization", "Bearer " + token)
      .send({ description: "No title" })
      .expect(400);

    expect(res.body.error).toContain("title");
  });
});
\`\`\`

> 💡 Import \`app\` (the Express instance) NOT \`server\` (the listening server). Supertest manages its own server lifecycle.
`,

"8fa8843c-a8b8-4e1e-8bfe-89fa78ea1f32": `# Integration Tests in Code — Full Route Testing

Complete integration test examples for TaskFlow routes.

## Test Helpers

\`\`\`typescript
// src/test/helpers.ts
import request from "supertest";
import { app } from "../app";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

export async function createTestUser(overrides = {}) {
  const password = await bcrypt.hash("Test123!", 10);
  return prisma.user.create({
    data: {
      email: "test-" + Date.now() + "@example.com",
      name: "Test User",
      password,
      ...overrides,
    },
  });
}

export async function getAuthToken(user?: any) {
  if (!user) user = await createTestUser();
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: user.email, password: "Test123!" });
  return { token: res.body.data.token, user };
}

export async function createTestProject(token: string, data = {}) {
  const res = await request(app)
    .post("/api/v1/projects")
    .set("Authorization", "Bearer " + token)
    .send({ title: "Test Project " + Date.now(), ...data });
  return res.body.data;
}
\`\`\`

## Route Tests

\`\`\`typescript
// routes/__tests__/projects.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { getAuthToken, createTestProject } from "../../test/helpers";
import { prisma } from "../../lib/prisma";

describe("Projects API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    const auth = await getAuthToken();
    token = auth.token;
    userId = auth.user.id;
  });

  describe("POST /api/v1/projects", () => {
    it("creates project and returns 201", async () => {
      const res = await request(app)
        .post("/api/v1/projects")
        .set("Authorization", "Bearer " + token)
        .send({ title: "My Project" })
        .expect(201);

      expect(res.body.data.title).toBe("My Project");
      expect(res.body.data.ownerId).toBe(userId);
    });
  });

  describe("GET /api/v1/projects", () => {
    it("returns only user's projects", async () => {
      await createTestProject(token, { title: "Proj 1" });
      await createTestProject(token, { title: "Proj 2" });

      const res = await request(app)
        .get("/api/v1/projects")
        .set("Authorization", "Bearer " + token)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });

    it("supports search filter", async () => {
      await createTestProject(token, { title: "Alpha" });
      await createTestProject(token, { title: "Beta" });

      const res = await request(app)
        .get("/api/v1/projects?search=alpha")
        .set("Authorization", "Bearer " + token)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Alpha");
    });
  });
});
\`\`\`

> 💡 Use \`Date.now()\` in test data to avoid unique constraint conflicts when creating multiple test records.
`,

"73c02398-f470-4c44-8180-85d47dbf8353": `# Task: Write Integration Tests for TaskFlow Routes

Build a comprehensive integration test suite for the API!

## Your Task

Write integration tests that verify routes, auth, validation, and database operations working together.

> 💡 **Hint:** Create test helper functions for common operations (create user, get token, create project). Use a fresh database state before each test.

## Requirements

- Auth routes tests:
  - POST /auth/register — success, duplicate email, invalid input
  - POST /auth/login — success, wrong password, missing user
- Project routes tests:
  - CRUD: create, read, update, delete
  - List: pagination, search filter, status filter
  - Auth: 401 without token, 403 for non-members
- Task routes tests:
  - Create task in project
  - List tasks with filters
  - Update task
  - Assign task
  - Status transitions
- Test error responses (proper status codes, error messages)
- Test helpers: createTestUser, getAuthToken, createTestProject
- Clean database before each test
- Minimum 20 integration tests
- All tests pass: npm test

## What You'll Practice

- Supertest for HTTP testing
- Test helper patterns
- Database state management
`,

"6dc78269-3830-4c5a-861c-7c79467dbf4d": `# How Test Databases & CI Testing Work

Separate environments ensure tests don't corrupt development data and run automatically on every push.

## Test Database Setup

\`\`\`
Development:     DATABASE_URL=postgres://localhost/taskflow_dev
Testing:         DATABASE_URL=postgres://localhost/taskflow_test
Production:      DATABASE_URL=postgres://prod-server/taskflow

.env:            Development variables
.env.test:       Test-specific variables

cross-env loads the right .env:
  "test": "cross-env NODE_ENV=test dotenv -e .env.test vitest run"
\`\`\`

## Database per Test Run

\`\`\`typescript
// Global setup: create clean DB
// globalSetup.ts
export async function setup() {
  // Run migrations on test DB
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  });
}

// Before each test: clean tables
beforeEach(async () => {
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.task.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});
\`\`\`

## Docker Compose for Test DB

\`\`\`yaml
# docker-compose.test.yml
services:
  test-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: taskflow_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"  # Different port to avoid conflicts
    tmpfs:
      - /var/lib/postgresql/data  # In-memory for speed
\`\`\`

> 💡 Use \`tmpfs\` for the test database — it runs entirely in memory, making tests dramatically faster since there are no disk writes.
`,

"591f49de-61da-4426-930c-8bc28789706b": `# CI Testing in Code — GitHub Actions + Docker

Automating tests to run on every push and pull request.

## GitHub Actions Workflow

\`\`\`yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: taskflow_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/taskflow_test

      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/taskflow_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          NODE_ENV: test

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
\`\`\`

> 💡 GitHub Actions \`services\` spins up real PostgreSQL and Redis containers alongside your tests — no mocking needed for CI.
`,

// ── Module 12: Performance & Security (10 lessons) ──
"bb4465af-84c8-44a0-a0db-d879bf3c8f51": `# How API Performance Works

Performance optimization means making your API respond faster and handle more concurrent requests.

## Performance Metrics

\`\`\`
Response Time:
  < 100ms  → Excellent
  100-300ms → Good
  300-1000ms → Acceptable
  > 1000ms → Needs optimization

Throughput:
  Requests per second your API can handle
  Express + Prisma: ~1,000-5,000 RPS (depending on queries)
  With caching: ~10,000+ RPS

P50/P95/P99:
  P50: Median response time (50% of requests faster)
  P95: 95th percentile (5% of requests slower)
  P99: 99th percentile (1% of requests slower)
  Focus on P95/P99 — they show worst-case performance
\`\`\`

## Common Bottlenecks

| Bottleneck | Symptom | Fix |
|---|---|---|
| N+1 queries | Slow list endpoints | Use include/join |
| Missing indexes | Slow WHERE/ORDER BY | Add DB indexes |
| No caching | Same data queried repeatedly | Add Redis cache |
| Large payloads | High bandwidth, slow parsing | Pagination, select fields |
| Sync heavy ops | Blocked event loop | Use job queues |
| No compression | Large response bodies | Enable gzip |

## N+1 Query Problem

\`\`\`typescript
// ❌ N+1: 1 query for projects + N queries for owners
const projects = await prisma.project.findMany();
for (const p of projects) {
  p.owner = await prisma.user.findUnique({ where: { id: p.ownerId } });
}
// 21 queries for 20 projects!

// ✅ Include: 1 query with JOIN
const projects = await prisma.project.findMany({
  include: { owner: { select: { id: true, name: true } } },
});
// 1 query total!
\`\`\`

> 💡 N+1 queries are the #1 performance killer in APIs. Always use \`include\` (Prisma) or \`JOIN\` (SQL) to load related data.
`,

"877f8ff7-dac6-44f1-bca0-b0183abffee3": `# Performance Optimization in Code

Practical techniques to speed up your Express API.

## 1. Compression

\`\`\`typescript
import compression from "compression";
app.use(compression()); // Gzip responses — 60-80% smaller
\`\`\`

## 2. Database Indexes

\`\`\`prisma
model Task {
  id        String @id @default(uuid())
  title     String
  status    String
  priority  String
  projectId String
  dueDate   DateTime?
  createdAt DateTime @default(now())

  @@index([projectId, status])    // Composite: filter by project + status
  @@index([projectId, createdAt]) // Composite: sort by date in project
  @@index([assigneeId])           // Foreign key lookup
  @@index([dueDate])              // Date range queries
}
\`\`\`

## 3. Select Only Needed Fields

\`\`\`typescript
// ❌ Fetches ALL fields (including large text content)
const tasks = await prisma.task.findMany({ where: { projectId } });

// ✅ Select only what the list view needs
const tasks = await prisma.task.findMany({
  where: { projectId },
  select: {
    id: true, title: true, status: true, priority: true, dueDate: true,
    assignee: { select: { id: true, name: true, avatar: true } },
  },
});
\`\`\`

## 4. Connection Pooling

\`\`\`
# .env — Prisma connection pool
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=20&pool_timeout=10"
\`\`\`

## 5. Request Timeout

\`\`\`typescript
import timeout from "connect-timeout";
app.use(timeout("10s")); // Kill requests taking > 10s
app.use((req, res, next) => {
  if (!req.timedout) next();
});
\`\`\`

> 💡 Add indexes to every column used in WHERE, ORDER BY, or JOIN. Without indexes, PostgreSQL scans every row — deadly on large tables.
`,

"da1976ed-af55-4645-b274-f16cc19cb188": `# Task: Optimize TaskFlow Queries

Find and fix performance bottlenecks in the TaskFlow API!

## Your Task

Profile your API, identify slow queries, and apply optimizations.

> 💡 **Hint:** Enable Prisma query logging to see all SQL queries. Look for N+1 patterns, missing indexes, and over-fetching.

## Requirements

- Enable Prisma query logging:
  - new PrismaClient({ log: ["query", "info", "warn", "error"] })
- Find and fix N+1 queries:
  - Task list should use include instead of separate queries
  - Activity feed should join user data
- Add database indexes:
  - tasks: [projectId, status], [projectId, createdAt], [assigneeId], [dueDate]
  - activities: [projectId, createdAt]
  - comments: [taskId, createdAt]
- Use select instead of full entity loading on list endpoints
- Enable gzip compression
- Add connection pooling (connection_limit=20)
- Measure before/after: log response times with middleware
- Target: all list endpoints < 200ms

## What You'll Practice

- Query profiling
- Index optimization
- Selective field loading
`,

"9593cae1-e8c4-45ad-a16a-5af287dfda8c": `# How API Security Works

Security protects your API from attacks — injection, XSS, brute force, data exposure.

## OWASP Top 10 for APIs

\`\`\`
1. Broken Object-Level Authorization
   → User A accesses User B's project
   Fix: Check ownership in every handler

2. Broken Authentication
   → Weak passwords, token leaks
   Fix: bcrypt, JWT rotation, HTTPS

3. Excessive Data Exposure
   → API returns password hash, internal fields
   Fix: Explicit select, response DTOs

4. Lack of Rate Limiting
   → Brute force login, DDoS
   Fix: express-rate-limit

5. Injection
   → SQL injection, NoSQL injection
   Fix: Parameterized queries (Prisma does this)

6. Mass Assignment
   → User sends { role: "admin" } in body
   Fix: Validate input with Zod, whitelist fields
\`\`\`

## Security Checklist

| Category | Implementation |
|---|---|
| Authentication | bcrypt (12 rounds), JWT with short expiry |
| Authorization | Role-based + resource ownership checks |
| Input validation | Zod schemas on every endpoint |
| Rate limiting | express-rate-limit (100 req/15min) |
| CORS | Whitelist specific origins |
| Headers | helmet for security headers |
| HTTPS | Always in production |
| Secrets | Environment variables, never in code |
| Logging | Log auth events, don't log passwords |

> 💡 Security is not optional — every API is attacked. Even "internal" APIs get compromised through supply chain attacks or stolen credentials.
`,

"dccd8c87-cf94-4404-be5b-966d872adb94": `# Security Hardening in Code

Implementing security best practices in Express.

## Helmet — Security Headers

\`\`\`typescript
import helmet from "helmet";
app.use(helmet());
// Sets: Content-Security-Policy, X-Content-Type-Options,
// X-Frame-Options, Strict-Transport-Security, etc.
\`\`\`

## Rate Limiting

\`\`\`typescript
import rateLimit from "express-rate-limit";

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: { error: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 min
  message: { error: "Too many login attempts" },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);
\`\`\`

## CORS

\`\`\`typescript
import cors from "cors";
app.use(cors({
  origin: ["https://taskflow.dev", "https://app.taskflow.dev"],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
\`\`\`

## Input Sanitization

\`\`\`typescript
// Prevent Mongo injection (if using MongoDB)
import mongoSanitize from "express-mongo-sanitize";
app.use(mongoSanitize());

// Prevent XSS in user input
import xss from "xss";
const sanitized = xss(userInput);
\`\`\`

> 💡 Apply rate limiting to auth endpoints SEPARATELY with stricter limits. 5 login attempts per 15 minutes is a good starting point.
`,

"38450048-269d-4a58-bedb-cd2f9b07597f": `# How Logging & Monitoring Work

Logging captures what happens in your API; monitoring alerts you when things go wrong.

## Log Levels

\`\`\`
error:  Something broke — needs immediate attention
warn:   Something unexpected — investigate soon
info:   Normal operations — audit trail
debug:  Detailed info — development only

Production: error + warn + info
Development: all levels
\`\`\`

## What to Log

\`\`\`
✅ Log:
  - HTTP requests (method, path, status, duration)
  - Authentication events (login, logout, failed attempts)
  - Business events (project created, task assigned)
  - Errors with stack traces
  - Slow queries (> 500ms)
  - External API calls

❌ Don't log:
  - Passwords or tokens
  - Full request bodies (PII risk)
  - Credit card numbers
  - Health check requests (too noisy)
\`\`\`

## Structured Logging

\`\`\`typescript
// ❌ Unstructured — hard to search
console.log("User alice@test.com logged in at 2024-01-15");

// ✅ Structured JSON — searchable, parseable
logger.info({
  event: "user.login",
  userId: "u123",
  email: "alice@test.com",
  ip: "192.168.1.1",
  timestamp: "2024-01-15T10:30:00Z",
});
\`\`\`

## Monitoring Stack

\`\`\`
Application Logging: Pino / Winston → JSON logs
Log Aggregation:     DataDog / Grafana Loki / ELK Stack
Error Tracking:      Sentry
Metrics:             Prometheus + Grafana
Uptime Monitoring:   Better Uptime / Pingdom
APM:                 DataDog APM / New Relic
\`\`\`

> 💡 Use structured JSON logging (Pino) instead of console.log. JSON logs can be searched, filtered, and aggregated by monitoring tools.
`,

"ac1e9293-12cf-4fea-8ba6-3875de662317": `# Logging & Monitoring in Code

Implementing structured logging with Pino.

## Setup

\`\`\`bash
npm install pino pino-http pino-pretty
\`\`\`

\`\`\`typescript
// lib/logger.ts
import pino from "pino";
import { config } from "../config";

export const logger = pino({
  level: config.logLevel || "info",
  transport: config.nodeEnv === "development"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined, // JSON in production
  redact: ["req.headers.authorization", "password", "token"],
});
\`\`\`

## HTTP Request Logging

\`\`\`typescript
import pinoHttp from "pino-http";

app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/health", // Skip health checks
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userId: req.raw?.user?.id, // Add user ID if authenticated
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
}));
\`\`\`

## Business Event Logging

\`\`\`typescript
// In services:
logger.info({ event: "project.created", projectId: project.id, userId }, "Project created");
logger.warn({ event: "auth.failed", email, ip: req.ip }, "Login failed");
logger.error({ event: "payment.failed", userId, error: err.message }, "Payment processing failed");
\`\`\`

## Slow Query Detection

\`\`\`typescript
// Prisma middleware for query timing
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;

  if (duration > 500) {
    logger.warn({
      event: "slow_query",
      model: params.model,
      action: params.action,
      duration,
    }, "Slow database query detected");
  }
  return result;
});
\`\`\`

> 💡 Use Pino's \`redact\` option to automatically remove sensitive fields from logs. Never log passwords, tokens, or API keys.
`,

"b13285fc-b368-4707-b34b-8d56fab9eb09": `# How API Documentation Works

API documentation tells developers how to use your API — endpoints, parameters, request/response formats, and authentication.

## Documentation Approaches

\`\`\`
Manual Docs (Markdown/Notion):
  ❌ Gets outdated quickly
  ❌ No interactive testing
  ✅ Full control over content

Auto-Generated (Swagger/OpenAPI):
  ✅ Always matches code
  ✅ Interactive "Try it" UI
  ✅ Client SDK generation
  ❌ Less narrative control

Hybrid (best practice):
  ✅ Auto-generated from code annotations
  ✅ Manual guides for complex flows
  ✅ Examples and tutorials
\`\`\`

## OpenAPI Specification

\`\`\`yaml
openapi: 3.0.0
info:
  title: TaskFlow API
  version: 1.0.0
  description: Project management API

paths:
  /api/v1/projects:
    get:
      summary: List user's projects
      tags: [Projects]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: search
          in: query
          schema: { type: string }
      responses:
        200:
          description: Paginated project list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/Project' }
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
        401:
          description: Unauthorized
\`\`\`

> 💡 Good API docs include: endpoint descriptions, request/response examples, error codes, authentication guide, and rate limit info.
`,

"152b279c-616c-47ee-a65e-2db1c7efc937": `# Swagger in Code — Auto-Generated Docs

Setting up Swagger UI with auto-generated documentation.

## Installation

\`\`\`bash
npm install swagger-ui-express swagger-jsdoc
npm install -D @types/swagger-ui-express @types/swagger-jsdoc
\`\`\`

## Configuration

\`\`\`typescript
// lib/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description: "Project management API built with Express + Prisma",
    },
    servers: [
      { url: "http://localhost:3000", description: "Development" },
      { url: "https://api.taskflow.dev", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Scan route files for JSDoc comments
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec, {
    customCss: ".swagger-ui .topbar { display: none }",
  }));
  app.get("/api-docs.json", (req, res) => res.json(spec));
}
\`\`\`

## Annotating Routes

\`\`\`typescript
// routes/projects.ts
/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "My Project" }
 *               description: { type: string }
 *     responses:
 *       201: { description: Project created }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.post("/", authenticate, validate(createProjectSchema), projectController.create);
\`\`\`

> 💡 Visit http://localhost:3000/api-docs to see the interactive Swagger UI — you can test every endpoint directly from the browser.
`,

"d9495918-6c80-4456-adaa-1b826307577e": `# Task: Add Swagger Docs to TaskFlow

Document the full TaskFlow API with Swagger!

## Your Task

Add auto-generated API documentation with Swagger UI.

> 💡 **Hint:** Use swagger-jsdoc to generate the spec from JSDoc comments in your route files, then serve it with swagger-ui-express.

## Requirements

- Set up swagger-jsdoc + swagger-ui-express
- Serve docs at /api-docs
- Serve raw spec at /api-docs.json
- Document all endpoints:
  - Auth: register, login, forgot-password, reset-password
  - Projects: CRUD + members
  - Tasks: CRUD + status + assign
  - Comments: CRUD
- Include for each endpoint:
  - Summary and description
  - Request parameters (path, query, body)
  - Request body schema with examples
  - Response schemas (success + error)
  - Authentication requirements
- Add component schemas: User, Project, Task, Comment, PaginationMeta
- Add security scheme (Bearer JWT)
- Group endpoints by tag

## What You'll Practice

- OpenAPI specification
- Swagger JSDoc annotations
- API documentation best practices
`,

// ── Module 13: Deployment & Production (10 lessons) ──
"735028c3-1987-47f0-a99d-e50198625a68": `# How Docker Works for Node.js

Docker packages your app with its dependencies into a container — it runs the same everywhere.

## Why Docker?

\`\`\`
"It works on my machine!" → Problem solved.

Without Docker:
  Dev: Node 20, npm 10, PostgreSQL 16
  Prod: Node 18, npm 9, PostgreSQL 15
  CI: Node 20, npm 10, no PostgreSQL
  → Version mismatches, missing deps, broken builds

With Docker:
  Dockerfile defines EXACTLY what the app needs
  → Same container runs in dev, CI, staging, and production
\`\`\`

## Docker Concepts

\`\`\`
Image: Blueprint (like a class)
  → Built from Dockerfile
  → Immutable, shareable, versioned

Container: Running instance (like an object)
  → Created from an image
  → Isolated process with its own filesystem
  → Ephemeral (can be destroyed and recreated)

Registry: Storage for images (like npm for packages)
  → Docker Hub, GitHub Container Registry, AWS ECR

Dockerfile → build → Image → run → Container
\`\`\`

## Key Docker Commands

\`\`\`bash
# Build image from Dockerfile
docker build -t taskflow-api .

# Run container
docker run -p 3000:3000 taskflow-api

# List running containers
docker ps

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>
\`\`\`

> 💡 Docker containers are disposable — design your app to be stateless. Store data in external databases, files in cloud storage, sessions in Redis.
`,

"2220fb1f-0ffd-4a9a-b4e3-18ca993b1796": `# Dockerfile in Code — Multi-Stage Build

Creating an optimized Docker image for production.

## Multi-Stage Dockerfile

\`\`\`dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs appuser

# Copy only what's needed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Generate Prisma client for production
RUN npx prisma generate

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
\`\`\`

## Docker Compose for Development

\`\`\`yaml
# docker-compose.yml
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/taskflow
      REDIS_URL: redis://redis:6379
    depends_on: [db, redis]

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_PASSWORD: postgres
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
\`\`\`

> 💡 Multi-stage builds produce images ~10x smaller. The builder stage has all dev tools; the runner stage has only production code.
`,

"931bbdc4-76e0-4ba9-90d0-2599265a0a30": `# Task: Dockerize the TaskFlow API

Create a production-ready Docker setup for TaskFlow!

## Your Task

Write a multi-stage Dockerfile and docker-compose.yml for the complete TaskFlow stack.

> 💡 **Hint:** Stage 1 builds the TypeScript. Stage 2 runs the compiled JavaScript with minimal dependencies.

## Requirements

- Multi-stage Dockerfile:
  - Stage 1 (builder): install all deps, generate Prisma, compile TS
  - Stage 2 (runner): copy compiled code, production deps only
  - Use node:20-alpine for small image size
  - Run as non-root user
  - Add HEALTHCHECK
  - Use .dockerignore to exclude node_modules, .git, etc.
- Docker Compose:
  - api: your Express app
  - db: PostgreSQL 16
  - redis: Redis 7
  - Volumes for data persistence
  - Environment variables for all services
  - depends_on with health checks
- .dockerignore file
- Build and test: docker compose up —build
- Verify: curl http://localhost:3000/health

## What You'll Practice

- Multi-stage Docker builds
- Docker Compose orchestration
- Production container configuration
`,

"58fe53f7-6086-429d-a0ef-02f595f85d11": `# How Production Deployment Works

Deploying means getting your Docker container running on a cloud server with a real domain and HTTPS.

## Deployment Options

\`\`\`
PaaS (Platform as a Service) — Easiest:
  Railway, Render, Fly.io, Heroku
  → Push code, they handle everything
  → Good for: MVPs, small-medium apps
  → Cost: $5-25/month

VPS (Virtual Private Server) — More control:
  DigitalOcean, Linode, Hetzner
  → You manage the server
  → Good for: Custom setups, cost optimization
  → Cost: $5-20/month

Cloud (IaaS) — Most control:
  AWS ECS/EKS, GCP Cloud Run, Azure Container Apps
  → Full infrastructure control
  → Good for: Large-scale, enterprise
  → Cost: Variable
\`\`\`

## Railway Deployment Flow

\`\`\`
1. Connect GitHub repo to Railway
2. Railway detects Dockerfile
3. On push to main:
   → Builds Docker image
   → Deploys container
   → Provisions PostgreSQL and Redis
   → Sets up HTTPS + custom domain
4. Zero-downtime deployments
\`\`\`

## Environment Variables for Production

\`\`\`
Required:
  DATABASE_URL=postgresql://...
  REDIS_URL=redis://...
  JWT_SECRET=<random-64-char-string>
  NODE_ENV=production
  PORT=3000

Optional:
  CORS_ORIGIN=https://taskflow.dev
  SMTP_HOST=smtp.sendgrid.net
  CLOUDINARY_URL=cloudinary://...
  SENTRY_DSN=https://...
\`\`\`

> 💡 Start with Railway or Render for your first deployment. You can always migrate to AWS later when you need more control.
`,

"39cbc406-37db-43c4-9173-5b44d706ece6": `# Deploying to Railway in Code

Step-by-step Railway deployment for TaskFlow.

## Prerequisites

\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
\`\`\`

## Project Setup

\`\`\`bash
# Create new Railway project
railway init

# Add PostgreSQL database
railway add --plugin postgresql

# Add Redis
railway add --plugin redis

# Set environment variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://taskflow.dev
\`\`\`

## Railway Configuration

\`\`\`toml
# railway.toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "npx prisma migrate deploy && node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
\`\`\`

## Deploy

\`\`\`bash
# Deploy from local
railway up

# Or connect GitHub for auto-deploy on push
railway link
# → Every push to main triggers a deployment
\`\`\`

## Custom Domain

\`\`\`bash
# Add custom domain
railway domain

# Point your DNS:
# CNAME api.taskflow.dev → your-app.up.railway.app
# Railway auto-provisions SSL certificate
\`\`\`

> 💡 The start command runs migrations before starting the server — this ensures your database schema is always up to date on deploy.
`,

"714263f9-0e28-483e-9a65-97f3604fcd09": `# How CI/CD Pipelines Work

CI/CD automates testing and deployment — every push is tested, and merges to main are deployed automatically.

## CI vs CD

\`\`\`
CI (Continuous Integration):
  → Automatically run tests on every push
  → Catch bugs before they reach main
  → Build and validate the code

CD (Continuous Deployment):
  → Automatically deploy after tests pass
  → No manual deployment steps
  → Main branch is always deployed

Pipeline:
  Push → Lint → Test → Build → Deploy
         ←── CI ──→  ←── CD ──→
\`\`\`

## Pipeline Stages

\`\`\`
1. Lint & Type Check
   └── eslint, tsc --noEmit
   └── Fast (<30s), catches syntax/type errors

2. Unit Tests
   └── vitest run --coverage
   └── Fast (1-2min), tests business logic

3. Integration Tests
   └── vitest run --integration
   └── Medium (3-5min), tests routes + DB

4. Build
   └── docker build -t taskflow-api .
   └── Medium (2-3min), creates image

5. Deploy (only on main)
   └── Push image to registry → deploy
   └── Medium (2-5min), zero-downtime
\`\`\`

## Branch Strategy

\`\`\`
main      ──●───●───●───●── (deployed)
              ╲   ╱   ╲   ╱
feature     ──●─●─    ──●─ (PR + tests)
              ╲       ╱
develop     ──●──●──●── (staging)
\`\`\`

> 💡 Never deploy untested code. The CI pipeline should be your gatekeeper — if tests fail, the deploy is blocked automatically.
`,

"754b47a1-bd1d-4e5d-aea4-02ac9deac307": `# CI/CD Pipeline in Code

Complete GitHub Actions workflow for CI/CD.

## Full Pipeline

\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 20
  REGISTRY: ghcr.io
  IMAGE_NAME: taskflow-api

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: taskflow_test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/taskflow_test
      - run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/taskflow_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN }}
\`\`\`

> 💡 The \`needs\` keyword creates dependencies — \`test\` waits for \`lint\`, \`deploy\` waits for \`test\`. If any step fails, downstream jobs are skipped.
`,

"e0f7110d-bafb-48a3-81e7-0b8f17d68485": `# Task: Set Up CI/CD for TaskFlow

Build a complete CI/CD pipeline with GitHub Actions!

## Your Task

Create a GitHub Actions workflow that lints, tests, builds, and deploys TaskFlow automatically.

> 💡 **Hint:** Use job dependencies (needs) to create a pipeline: lint → test → build → deploy. Only deploy on pushes to main.

## Requirements

- Trigger: push to main/develop, PRs to main
- Lint job:
  - Run ESLint
  - Run TypeScript type check (tsc --noEmit)
- Test job (depends on lint):
  - Spin up PostgreSQL and Redis services
  - Run Prisma migrations
  - Run full test suite with coverage
  - Upload coverage report as artifact
- Build job (depends on test):
  - Build Docker image
  - Push to GitHub Container Registry (ghcr.io)
  - Tag with commit SHA and "latest"
- Deploy job (main branch only, depends on build):
  - Deploy to Railway/Fly.io/Render
  - Run post-deployment health check
- Status badge in README
- Slack notification on failure (optional)

## What You'll Practice

- GitHub Actions workflows
- Multi-job pipelines
- Docker in CI
- Automated deployment
`,

"2e5a32d4-0b51-4238-8502-c64230fd92a7": `# Production Checklist

Before going live, verify every item on this checklist.

## Security

\`\`\`
□ HTTPS everywhere (no HTTP)
□ Helmet security headers enabled
□ CORS restricted to specific origins
□ Rate limiting on all endpoints
□ Strict rate limiting on auth endpoints
□ Input validation (Zod) on every endpoint
□ SQL injection prevention (Prisma parameterized queries)
□ Passwords hashed with bcrypt (12+ rounds)
□ JWT secret is random, long, and from env vars
□ No secrets in code or logs
□ Dependencies audited (npm audit)
\`\`\`

## Performance

\`\`\`
□ Database indexes on frequently queried columns
□ N+1 queries eliminated (use include/join)
□ Response compression enabled (gzip)
□ Connection pooling configured
□ Redis caching for hot data
□ Background jobs for heavy operations
□ Request timeout (10s max)
□ Pagination on all list endpoints (max 100)
\`\`\`

## Reliability

\`\`\`
□ Health check endpoint (/health)
□ Structured logging (Pino/Winston, JSON format)
□ Error tracking (Sentry)
□ Graceful shutdown handler
□ Database migrations tested
□ Backup strategy for database
□ Monitoring and alerts set up
\`\`\`

## DevOps

\`\`\`
□ Dockerfile with multi-stage build
□ CI/CD pipeline (lint → test → build → deploy)
□ Environment variables for all config
□ README with setup instructions
□ API documentation (Swagger)
□ .env.example with all required variables
\`\`\`

> 💡 Go through this checklist before every production deployment. Missing even one item can lead to security breaches or outages.
`,

"c9096de4-8529-4efd-be0a-ea3391ed7388": `# Course Recap & What's Next

Congratulations! You've built a complete production-ready API from scratch.

## What You Built: TaskFlow API

\`\`\`
Features:
  ✅ JWT authentication with refresh tokens
  ✅ Role-based authorization (RBAC)
  ✅ Project CRUD with membership
  ✅ Task management with status workflows
  ✅ Comment system with ownership
  ✅ File uploads with cloud storage
  ✅ Email with templates
  ✅ Real-time notifications (Socket.io)
  ✅ Redis caching
  ✅ Background job queues (BullMQ)
  ✅ Scheduled tasks (cron)
  ✅ Testing (unit + integration)
  ✅ API documentation (Swagger)
  ✅ Docker containerization
  ✅ CI/CD pipeline
  ✅ Production deployment
\`\`\`

## Tech Stack Mastered

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL + Prisma |
| Cache | Redis + ioredis |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| Queues | BullMQ |
| Email | Nodemailer |
| Storage | Cloudinary |
| Testing | Vitest + Supertest |
| Docs | Swagger/OpenAPI |
| Container | Docker |
| CI/CD | GitHub Actions |
| Deploy | Railway/Fly.io |

## Where to Go Next

1. **GraphQL**: Learn Apollo Server as an alternative to REST
2. **Microservices**: Break the monolith into separate services
3. **Kubernetes**: Container orchestration for large-scale deployments
4. **Event-driven architecture**: Kafka, RabbitMQ for async communication
5. **Serverless**: AWS Lambda, Vercel Functions for auto-scaling APIs

> 💡 Building a real project and deploying it is the best way to learn. Take TaskFlow, customize it, and add your own features. Ship it!
`,
};

async function main() {
  console.log("Updating Node.js Express — Modules 11-13...");
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
