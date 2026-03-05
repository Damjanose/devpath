import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 3: Express.js Framework (12 lessons) ──
"1f9f624f-5d8b-4cdc-a5b6-7f254b94c41c": `# Why Express.js & How It Works

Express is the most popular Node.js web framework — it sits on top of the raw \`http\` module and adds routing, middleware, and developer-friendly APIs.

## Express vs Raw http

\`\`\`
Raw Node.js HTTP:
- Parse URL manually
- Parse body manually
- Route matching with regex
- No middleware pipeline
- Manual error handling
- ~80 lines for a basic CRUD endpoint

Express:
- Built-in URL parsing
- Body parsing middleware
- Declarative route definitions
- Middleware pipeline (use, before, after)
- Centralized error handling
- ~10 lines for the same endpoint
\`\`\`

## How Express Works Internally

\`\`\`
Incoming Request
    │
    ▼
┌──────────────────────────┐
│  Express App              │
│  ┌─────────────────────┐  │
│  │ Middleware Stack     │  │
│  │  1. cors()          │  │
│  │  2. json()          │  │
│  │  3. morgan()        │  │
│  │  4. authMiddleware  │  │
│  │  5. Route handler   │──│──▶ Response
│  │  6. errorHandler    │  │
│  └─────────────────────┘  │
└──────────────────────────┘
\`\`\`

## Key Express Concepts

| Concept | Description |
|---|---|
| App | The main Express instance |
| Router | Groups related routes |
| Middleware | Functions that process requests in order |
| Route handler | Function that generates the response |
| Error handler | Special middleware with 4 args (err, req, res, next) |

> 💡 Express processes middleware in the ORDER you define them. A logging middleware must come BEFORE your routes to log all requests.
`,

"3216f620-771f-485f-954a-e292ddea83f0": `# Express Setup in Code — Hello World to API

Setting up Express with TypeScript from scratch.

## Installation

\`\`\`bash
npm install express cors helmet morgan
npm install -D @types/express @types/cors @types/morgan
\`\`\`

## Basic App Setup

\`\`\`typescript
// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Built-in middleware
app.use(express.json());             // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Security middleware
app.use(helmet());                   // Security headers
app.use(cors({ origin: "http://localhost:5173" })); // CORS

// Logging
app.use(morgan("dev"));             // Request logging

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// API routes (we'll add these next)
app.get("/api/v1/projects", (req, res) => {
  res.json({ success: true, data: [] });
});

export default app;
\`\`\`

## Server Entry Point

\`\`\`typescript
// src/index.ts
import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log("TaskFlow API running on port " + config.port);
  console.log("Environment: " + config.nodeEnv);
});
\`\`\`

## Project Structure

\`\`\`
src/
├── app.ts          ← Express app setup
├── index.ts        ← Server startup
├── config.ts       ← Environment config
├── routes/         ← Route definitions
├── controllers/    ← Request handlers
├── services/       ← Business logic
├── middleware/      ← Custom middleware
├── types/          ← TypeScript types
└── lib/            ← Utilities
\`\`\`

> 💡 Always separate \`app.ts\` (Express setup) from \`index.ts\` (server startup). This lets you import the app in tests without starting the server.
`,

"93fe4382-4def-436a-9b9b-dc32909ada10": `# How Express Routing Works

Express routing maps HTTP method + URL pattern to handler functions.

## Route Definition

\`\`\`typescript
// Basic routes
app.get("/api/projects", listProjects);       // GET /api/projects
app.post("/api/projects", createProject);     // POST /api/projects
app.get("/api/projects/:id", getProject);     // GET /api/projects/abc123
app.put("/api/projects/:id", updateProject);  // PUT /api/projects/abc123
app.delete("/api/projects/:id", deleteProject); // DELETE /api/projects/abc123

// Route parameters
app.get("/api/projects/:projectId/tasks/:taskId", (req, res) => {
  const { projectId, taskId } = req.params;
  // projectId = "abc123", taskId = "task456"
});

// Query parameters
// GET /api/projects?page=2&limit=10&status=active
app.get("/api/projects", (req, res) => {
  const { page, limit, status } = req.query;
  // page = "2", limit = "10", status = "active"
});
\`\`\`

## Route Order Matters

\`\`\`typescript
// ❌ WRONG — /new matches /:id first!
app.get("/api/projects/:id", getProject);
app.get("/api/projects/new", newProjectForm);  // Never reached

// ✅ RIGHT — specific routes BEFORE parameterized
app.get("/api/projects/new", newProjectForm);
app.get("/api/projects/:id", getProject);
\`\`\`

## Express Router — Grouping Routes

\`\`\`typescript
// routes/projects.ts
import { Router } from "express";
const router = Router();

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Nested: /api/projects/:id/tasks
router.get("/:projectId/tasks", listProjectTasks);

export default router;

// app.ts — mount the router
app.use("/api/projects", projectRouter);
\`\`\`

> 💡 Express Router is like a mini-app — it has its own middleware stack and routes. Use it to organize routes by resource (projects, tasks, users).
`,

"ee501c6c-5800-461b-bb8b-af9ab0036ce6": `# Express Routing in Code — Full CRUD Router

Complete router implementation with typed handlers.

## Project Router

\`\`\`typescript
// routes/projects.ts
import { Router, Request, Response } from "express";

const router = Router();

// In-memory store (later replaced with database)
let projects: { id: string; title: string; description: string; status: string; createdAt: Date }[] = [];
let nextId = 1;

// GET /api/projects?status=active&search=task
router.get("/", (req: Request, res: Response) => {
  let filtered = [...projects];

  if (req.query.status) {
    filtered = filtered.filter(p => p.status === req.query.status);
  }
  if (req.query.search) {
    const term = (req.query.search as string).toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
  }

  res.json({ success: true, data: filtered });
});

// GET /api/projects/:id
router.get("/:id", (req: Request, res: Response) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: { message: "Project not found" } });
  }
  res.json({ success: true, data: project });
});

// POST /api/projects
router.post("/", (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: { message: "Title is required" } });
  }
  const project = {
    id: String(nextId++),
    title,
    description: description || "",
    status: "active",
    createdAt: new Date(),
  };
  projects.push(project);
  res.status(201).json({ success: true, data: project });
});

// PUT /api/projects/:id
router.put("/:id", (req: Request, res: Response) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: { message: "Not found" } });
  }
  projects[idx] = { ...projects[idx], ...req.body };
  res.json({ success: true, data: projects[idx] });
});

// DELETE /api/projects/:id
router.delete("/:id", (req: Request, res: Response) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: { message: "Not found" } });
  projects.splice(idx, 1);
  res.status(204).end();
});

export default router;
\`\`\`

> 💡 Always return proper status codes: 200 for reads, 201 for creation, 204 for deletion, 400 for bad input, 404 for not found.
`,

"7068e692-2da0-4d71-b04f-47b764ec1fa4": `# Task: Set Up the TaskFlow Express App

Build the TaskFlow API foundation with Express!

## Your Task

Set up a complete Express application with proper structure, middleware, and initial routes.

> 💡 **Hint:** Start with the app setup (middleware stack), then define routers for each resource.

## Requirements

- Create \`app.ts\` with Express setup: json parsing, cors, helmet, morgan
- Create \`index.ts\` that starts the server using the config module
- Create routers for: projects, tasks, users (even if handlers are placeholders)
- Mount routers at /api/v1/projects, /api/v1/tasks, /api/v1/users
- Add a GET /health endpoint returning { status: "ok", uptime, environment }
- Add a 404 catch-all route for unmatched paths
- Each router should have full CRUD routes (GET list, GET by id, POST, PUT, DELETE)

## What You'll Practice

- Express application setup
- Router organization by resource
- Middleware ordering
`,

"9a1a5cba-935a-423a-b769-3b889745164f": `# How Request & Response Objects Work

Express extends Node.js \`req\` and \`res\` with powerful helper methods.

## Request Object (req)

\`\`\`typescript
app.post("/api/projects/:id/tasks", (req, res) => {
  // URL parameters
  req.params.id;          // "abc123"

  // Query string (?page=2&limit=10)
  req.query.page;         // "2" (always string!)
  req.query.limit;        // "10"

  // Request body (requires express.json() middleware)
  req.body.title;         // "New Task"
  req.body.priority;      // "high"

  // Headers
  req.headers["authorization"];  // "Bearer eyJ..."
  req.headers["content-type"];   // "application/json"

  // Request info
  req.method;             // "POST"
  req.path;               // "/api/projects/abc123/tasks"
  req.originalUrl;        // "/api/projects/abc123/tasks?page=2"
  req.ip;                 // "127.0.0.1"
  req.hostname;           // "localhost"
  req.protocol;           // "http"
});
\`\`\`

## Response Object (res)

\`\`\`typescript
// Status + JSON (most common)
res.status(200).json({ success: true, data: project });

// Status codes
res.sendStatus(204);      // 204 No Content (for DELETE)

// Headers
res.set("X-Request-Id", requestId);
res.set("Cache-Control", "max-age=3600");

// Chaining
res
  .status(201)
  .set("Location", "/api/projects/" + project.id)
  .json({ success: true, data: project });

// Redirect
res.redirect(301, "/api/v2/projects");

// Send file
res.sendFile("/path/to/file.pdf");
res.download("/path/to/file.pdf", "report.pdf");
\`\`\`

> 💡 Query parameters are ALWAYS strings. Always parse them: \`parseInt(req.query.page as string)\` or use a validation library like Zod.
`,

"4f3e7748-4bc0-41f5-99eb-4ab662426fd4": `# Request & Response in Code — Typed Handlers

Building type-safe Express request handlers.

## Typed Request Handler Pattern

\`\`\`typescript
import { Request, Response, NextFunction } from "express";

// Generic typed handler
type TypedRequestHandler<
  Params = {},
  Body = {},
  Query = {}
> = (
  req: Request<Params, any, Body, Query>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Specific handler types
interface ProjectParams { id: string; }
interface CreateProjectBody { title: string; description?: string; }
interface ListProjectsQuery { page?: string; limit?: string; status?: string; }

// Typed handlers
const getProject: TypedRequestHandler<ProjectParams> = async (req, res) => {
  const { id } = req.params;  // TypeScript knows id is string
  const project = await projectService.findById(id);

  if (!project) {
    res.status(404).json({ success: false, error: { message: "Not found" } });
    return;
  }
  res.json({ success: true, data: project });
};

const createProject: TypedRequestHandler<{}, CreateProjectBody> = async (req, res) => {
  const { title, description } = req.body;  // Typed!
  const project = await projectService.create({ title, description });
  res.status(201).json({ success: true, data: project });
};

const listProjects: TypedRequestHandler<{}, {}, ListProjectsQuery> = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "20");
  const projects = await projectService.findMany({ page, limit, status: req.query.status });
  res.json({ success: true, data: projects, meta: { page, limit } });
};
\`\`\`

## async Handler Wrapper

\`\`\`typescript
// Catch async errors automatically
function asyncHandler(fn: TypedRequestHandler<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage — no try/catch needed!
router.get("/:id", asyncHandler(getProject));
router.post("/", asyncHandler(createProject));
\`\`\`

> 💡 The \`asyncHandler\` wrapper catches rejected promises and passes them to Express error middleware — no more forgotten try/catch blocks!
`,

"3fac265d-5b6e-4514-8bbd-9fe902146be6": `# How app.use() and Route Chaining Work

\`app.use()\` is the backbone of Express — it adds middleware, mounts routers, and defines the request processing pipeline.

## app.use() Patterns

\`\`\`typescript
// 1. Global middleware (runs for ALL routes)
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// 2. Path-specific middleware
app.use("/api", apiRateLimiter);         // Only /api/* routes
app.use("/api/admin", requireAdmin);     // Only /api/admin/* routes

// 3. Mount a router
app.use("/api/projects", projectRouter); // Router handles sub-paths

// 4. Multiple middleware
app.use("/api/projects", authenticate, authorize("admin"), projectRouter);
\`\`\`

## Route Chaining

\`\`\`typescript
// Method chaining for same path
router.route("/projects")
  .get(listProjects)       // GET /projects
  .post(createProject);    // POST /projects

router.route("/projects/:id")
  .get(getProject)         // GET /projects/:id
  .put(updateProject)      // PUT /projects/:id
  .delete(deleteProject);  // DELETE /projects/:id

// Multiple handlers per route
router.get("/projects/:id",
  authenticate,          // 1. Check auth
  loadProject,           // 2. Load project into req
  checkPermission,       // 3. Check access
  getProject             // 4. Send response
);
\`\`\`

## Execution Order

\`\`\`
Request: POST /api/projects
    │
    ▼
1. express.json()     ← Parse body
2. cors()             ← Add CORS headers
3. morgan("dev")      ← Log request
4. authenticate       ← Verify JWT
5. projectRouter      ← Match route
6.   → POST /         ← Handler
7. errorHandler       ← Catch any errors
    │
    ▼
Response: 201 { data: ... }
\`\`\`

> 💡 Middleware runs top-to-bottom. If you put error handling BEFORE your routes, it won't catch route errors. Always define error middleware LAST.
`,

"5e4e3cbc-64b3-4825-b7cb-a9e0f27767c6": `# Route Chaining in Code — Organizing the API

Complete route organization for a multi-resource API.

## API Route Index

\`\`\`typescript
// routes/index.ts — Central route registry
import { Router } from "express";
import projectRouter from "./projects";
import taskRouter from "./tasks";
import userRouter from "./users";
import authRouter from "./auth";

const router = Router();

// Public routes (no auth required)
router.use("/auth", authRouter);

// Protected routes (auth required)
router.use("/projects", projectRouter);
router.use("/tasks", taskRouter);
router.use("/users", userRouter);

// API info
router.get("/", (req, res) => {
  res.json({
    name: "TaskFlow API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      projects: "/api/v1/projects",
      tasks: "/api/v1/tasks",
      users: "/api/v1/users",
    },
  });
});

export default router;
\`\`\`

## Nested Routes

\`\`\`typescript
// routes/projects.ts
const router = Router();

// Project CRUD
router.route("/")
  .get(asyncHandler(listProjects))
  .post(asyncHandler(createProject));

router.route("/:id")
  .get(asyncHandler(getProject))
  .put(asyncHandler(updateProject))
  .delete(asyncHandler(deleteProject));

// Nested: Project's tasks
router.route("/:projectId/tasks")
  .get(asyncHandler(listProjectTasks))
  .post(asyncHandler(createProjectTask));

// Nested: Project's members
router.route("/:projectId/members")
  .get(asyncHandler(listProjectMembers))
  .post(asyncHandler(addProjectMember))
  .delete(asyncHandler(removeProjectMember));

export default router;
\`\`\`

## Mount Everything

\`\`\`typescript
// app.ts
import apiRouter from "./routes";

app.use("/api/v1", apiRouter);
// All routes are now prefixed with /api/v1
// /api/v1/projects, /api/v1/tasks, etc.
\`\`\`

> 💡 Versioning your API (\`/api/v1\`) lets you introduce breaking changes in \`/api/v2\` without affecting existing clients.
`,

"9820b5d1-1a11-4a78-b2c9-792563a17a9c": `# How Error Handling Works in Express

Express has a special error-handling middleware pattern with 4 parameters that catches all errors.

## Error Flow

\`\`\`
Normal middleware:   (req, res, next) → 3 params
Error middleware:    (err, req, res, next) → 4 params

throw new Error("x")     ─┐
next(error)               ─┤
Promise rejection         ─┤──→ Error middleware
asyncHandler catch        ─┘
\`\`\`

## Error Types Strategy

\`\`\`typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, resource + " not found", "NOT_FOUND");
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(403, message, "FORBIDDEN");
  }
}

// Usage in services
throw new NotFoundError("Project");
throw new BadRequestError("Title is required");
throw new UnauthorizedError();
\`\`\`

## Error Handler Middleware

\`\`\`typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  } else {
    console.error("Unexpected error:", err);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    });
  }
}
\`\`\`

> 💡 Never send raw error messages to clients in production — they may contain stack traces, SQL queries, or file paths. Always sanitize.
`,

"fd4ae949-8d12-4536-bc58-5ade00481153": `# Error Handling in Code — Global & Per-Route

Complete error handling implementation for the TaskFlow API.

## Global Error Handler

\`\`\`typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { config } from "../config";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log all errors
  console.error("[Error]", {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: config.isDev ? err.stack : undefined,
  });

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Database operation failed",
      },
    });
  }

  // Validation errors (Zod)
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: (err as any).errors,
      },
    });
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: config.isDev ? err.message : "Something went wrong",
    },
  });
}

// 404 handler (place AFTER all routes)
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route " + req.method + " " + req.path + " not found",
    },
  });
}
\`\`\`

## Register in App

\`\`\`typescript
// app.ts
app.use("/api/v1", apiRouter);
app.use(notFoundHandler);    // After all routes
app.use(errorHandler);       // Dead last
\`\`\`

> 💡 Order matters: 404 handler catches unmatched routes, error handler catches thrown errors. Both must come AFTER all route definitions.
`,

"d04eb294-9997-405b-8abc-8d81e227ca66": `# Task: Build Complete Error Handling for TaskFlow

Create a bullet-proof error handling system!

## Your Task

Implement a custom error class hierarchy and global error handler that catches every possible error.

> 💡 **Hint:** Create a base AppError class, then extend it for specific HTTP errors.

## Requirements

- Create AppError base class with: statusCode, message, code, isOperational
- Create subclasses: NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError, ConflictError, ValidationError (with field-level details)
- Create a global error handler middleware that:
  - Handles all AppError subclasses (use statusCode)
  - Handles Prisma errors (P2002 = conflict, P2025 = not found)
  - Handles Zod validation errors (format details array)
  - Handles JWT errors (expired, invalid token)
  - Hides error details in production (config.isProd)
  - Logs errors with request context (method, path, userId)
- Create an asyncHandler wrapper that catches promise rejections
- Add 404 catch-all route
- Test by throwing each error type from a /test-errors endpoint

## What You'll Practice

- Custom error class hierarchies
- Express error middleware pattern
- Error categorization and response formatting
`,

// ── Module 4: Middleware Deep Dive (11 lessons) ──
"8fa2189d-1a0f-425d-8f76-8d5a17c7d712": `# What Is Middleware & Why It Matters

Middleware is the core architectural pattern of Express — functions that process requests in sequence before the route handler.

## The Middleware Pattern

\`\`\`
Request ──▶ MW1 ──▶ MW2 ──▶ MW3 ──▶ Route Handler ──▶ Response
              │       │       │
              │       │       └── Authorization
              │       └── Authentication
              └── Body Parsing

Each middleware can:
✅ Execute code
✅ Modify req and res
✅ End the request (send response)
✅ Call next() to pass to next middleware
❌ If it doesn't call next() or send a response → request hangs!
\`\`\`

## Middleware Signature

\`\`\`typescript
// Regular middleware: 3 params
function myMiddleware(req: Request, res: Response, next: NextFunction) {
  // Do something
  next(); // Pass to next middleware
}

// Error middleware: 4 params
function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  // Handle error
  res.status(500).json({ error: err.message });
}
\`\`\`

## Common Middleware Types

| Type | Example | Purpose |
|---|---|---|
| Application-level | app.use(cors()) | Runs for all routes |
| Router-level | router.use(auth) | Runs for router routes |
| Route-level | router.get("/", auth, handler) | Runs for one route |
| Error-handling | app.use(errorHandler) | Catches errors |
| Built-in | express.json() | Body parsing |
| Third-party | cors(), helmet() | Security, features |

> 💡 Think of middleware as a pipeline — each step can inspect, transform, or reject the request. It's the Chain of Responsibility design pattern.
`,

"778fae69-768a-44a5-8326-6944b622e94a": `# Custom Middleware in Code — Logging & Timing

Writing your own middleware for request logging and performance monitoring.

## Request Logger

\`\`\`typescript
// middleware/logger.ts
import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: duration + "ms",
      ip: req.ip,
      userAgent: req.headers["user-agent"]?.substring(0, 50),
    };

    if (res.statusCode >= 500) {
      console.error("[ERROR]", log);
    } else if (res.statusCode >= 400) {
      console.warn("[WARN]", log);
    } else {
      console.log("[INFO]", log);
    }
  });

  next();
}
\`\`\`

## Request ID Middleware

\`\`\`typescript
// middleware/requestId.ts
import { randomUUID } from "crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.headers["x-request-id"] as string || randomUUID();
  req.headers["x-request-id"] = id;
  res.setHeader("X-Request-Id", id);
  next();
}

// Now every request has a unique ID for tracing!
\`\`\`

## Rate Limiter

\`\`\`typescript
// middleware/rateLimiter.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || now > entry.resetAt) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    entry.count++;
    next();
  };
}
\`\`\`

> 💡 The rate limiter above is per-process and resets on restart. For production, use Redis-backed rate limiting (\`express-rate-limit\` + \`rate-limit-redis\`).
`,

"514b3c69-fdd6-46c2-bd5e-c493641776bd": `# How Validation Middleware Works

Validation middleware checks request data BEFORE it reaches your route handler — rejecting bad input early.

## The Validation Flow

\`\`\`
Request ──▶ validate(schema) ──▶ Route Handler
              │
              ├── ✅ Valid → next()
              │
              └── ❌ Invalid → 400 Response
                    { errors: [{ field: "email", message: "Invalid" }] }
\`\`\`

## Why Validate at the Middleware Level?

\`\`\`typescript
// ❌ Without validation middleware — messy controllers
const createUser = async (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: "Name required" });
  if (!req.body.email) return res.status(400).json({ error: "Email required" });
  if (!req.body.email.includes("@")) return res.status(400).json({ error: "Invalid email" });
  if (!req.body.password) return res.status(400).json({ error: "Password required" });
  if (req.body.password.length < 8) return res.status(400).json({ error: "Password too short" });
  // 10 more lines of validation...
  // FINALLY the actual logic:
  const user = await userService.create(req.body);
};

// ✅ With validation middleware — clean separation
router.post("/", validate(createUserSchema), createUser);

const createUser = async (req, res) => {
  // req.body is GUARANTEED to be valid here!
  const user = await userService.create(req.body);
  res.status(201).json({ data: user });
};
\`\`\`

## Zod — The Best Validation Library

| Feature | Zod | Joi | Yup |
|---|---|---|---|
| TypeScript-first | ✅ Native | ❌ Bolted on | ❌ Bolted on |
| Type inference | ✅ Automatic | ❌ Manual | ❌ Manual |
| Bundle size | 13KB | 148KB | 40KB |
| Error messages | ✅ Great | ✅ Great | ✅ OK |

> 💡 Zod infers TypeScript types from schemas. Define the schema once, get both validation AND types — no duplication.
`,

"3e79f310-2082-4099-b3bd-7ac0b6412274": `# Validation in Code — Zod Middleware

Building a reusable validation middleware with Zod.

## Install Zod

\`\`\`bash
npm install zod
\`\`\`

## Validation Schemas

\`\`\`typescript
// schemas/project.schema.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().max(500).optional(),
    status: z.enum(["active", "archived", "completed"]).default("active"),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid project ID") }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(["active", "archived", "completed"]).optional(),
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    status: z.enum(["active", "archived", "completed"]).optional(),
    search: z.string().max(100).optional(),
  }),
});
\`\`\`

## Generic Validate Middleware

\`\`\`typescript
// middleware/validate.ts
import { AnyZodObject, ZodError } from "zod";

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.errors.map(e => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        });
      } else {
        next(error);
      }
    }
  };
}

// Usage
router.post("/", validate(createProjectSchema), createProject);
router.put("/:id", validate(updateProjectSchema), updateProject);
\`\`\`

> 💡 Zod's \`.transform()\` and \`.pipe()\` let you parse query strings to numbers in the schema — no manual \`parseInt()\` needed.
`,

"95779e57-90f2-4b5f-94c6-262cfc6c5e56": `# Task: Build Validation Middleware for TaskFlow

Create a complete validation system using Zod!

## Your Task

Implement Zod schemas for all TaskFlow resources and a reusable validation middleware.

> 💡 **Hint:** Validate body, params, AND query in the same schema. Use \`.transform()\` for type coercion.

## Requirements

- Create schemas for:
  - CreateProject: title (1-100 chars, required), description (max 500), status (enum)
  - CreateTask: title (required), description, priority (enum), dueDate (ISO date string → Date), assigneeId (uuid, optional)
  - UpdateTask: all fields optional (Partial)
  - ListTasks query: page, limit, status filter, priority filter, sortBy, order
  - ID params: id must be a valid UUID
- Create a \`validate(schema)\` middleware that validates body, params, query
- Return all validation errors at once (not just the first)
- Extract TypeScript types from schemas using \`z.infer<typeof schema>\`
- Add custom error messages for each field

## What You'll Practice

- Zod schema definitions
- Middleware factory pattern
- Type inference from validation schemas
`,

"9bc81cd3-417d-4b68-941a-381f8d63de0b": `# How CORS & Security Middleware Work

CORS (Cross-Origin Resource Sharing) and security headers protect your API from common web vulnerabilities.

## What Is CORS?

\`\`\`
Frontend: http://localhost:5173
Backend:  http://localhost:3000

Browser blocks cross-origin requests by default!

Solution: Backend sends CORS headers telling browser it's OK.

Preflight flow:
1. Browser sends OPTIONS request (preflight)
2. Server responds with allowed origins/methods/headers
3. Browser sends actual request
\`\`\`

## CORS Headers

| Header | Purpose | Example |
|---|---|---|
| Access-Control-Allow-Origin | Allowed origins | http://localhost:5173 |
| Access-Control-Allow-Methods | Allowed methods | GET, POST, PUT, DELETE |
| Access-Control-Allow-Headers | Allowed headers | Content-Type, Authorization |
| Access-Control-Allow-Credentials | Allow cookies | true |
| Access-Control-Max-Age | Cache preflight (sec) | 86400 |

## Security Headers (Helmet)

\`\`\`typescript
import helmet from "helmet";

app.use(helmet());
// Sets these security headers:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 0 (use CSP instead)
// Strict-Transport-Security: max-age=15552000
// Content-Security-Policy: default-src 'self'
// Referrer-Policy: no-referrer
\`\`\`

> 💡 In production, NEVER use \`origin: "*"\` with credentials. Always specify exact allowed origins.
`,

"011f9318-6a21-45f3-b8e6-a98c8053a732": `# Security Middleware in Code — CORS, Helmet, Rate Limits

Complete security middleware configuration.

## CORS Configuration

\`\`\`typescript
// middleware/cors.ts
import cors from "cors";
import { config } from "../config";

const allowedOrigins = config.isProd
  ? ["https://taskflow.app", "https://admin.taskflow.app"]
  : ["http://localhost:5173", "http://localhost:3000"];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
});
\`\`\`

## Rate Limiting

\`\`\`typescript
// middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 login attempts per 15 min
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many login attempts" },
  },
});

// Usage
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
\`\`\`

> 💡 Rate limiting prevents brute-force attacks and abuse. Use stricter limits on auth endpoints (login, register, password reset).
`,

"4e015d19-ca6a-43c5-8020-21916046790c": `# How Middleware Composition Works

Middleware composition lets you combine multiple middleware into reusable pipelines.

## Composing Middleware

\`\`\`typescript
// Individual middleware
const authenticate = async (req, res, next) => { /* verify JWT */ };
const authorize = (...roles: string[]) => (req, res, next) => { /* check role */ };
const validate = (schema) => async (req, res, next) => { /* validate */ };
const rateLimit = (max: number) => (req, res, next) => { /* limit */ };

// Compose into pipelines
function protectedRoute(...middleware: RequestHandler[]) {
  return [authenticate, ...middleware];
}

function adminRoute(...middleware: RequestHandler[]) {
  return [authenticate, authorize("admin"), ...middleware];
}

// Usage — clean and declarative
router.get("/", ...protectedRoute(validate(listSchema), listProjects));
router.post("/", ...protectedRoute(validate(createSchema), createProject));
router.delete("/:id", ...adminRoute(deleteProject));
\`\`\`

## Conditional Middleware

\`\`\`typescript
// Only run in specific environments
function conditionalMiddleware(condition: boolean, middleware: RequestHandler): RequestHandler {
  return condition
    ? middleware
    : (req, res, next) => next();
}

// Only log in development
app.use(conditionalMiddleware(config.isDev, morgan("dev")));

// Only rate limit in production
app.use(conditionalMiddleware(config.isProd, apiLimiter));
\`\`\`

## Middleware Factory Pattern

\`\`\`typescript
// Factory that creates configured middleware
function createCacheMiddleware(ttl: number) {
  const cache = new Map<string, { data: any; expiry: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cache.set(key, { data, expiry: Date.now() + ttl });
      return originalJson(data);
    };
    next();
  };
}

router.get("/stats", createCacheMiddleware(60000), getStats);
\`\`\`

> 💡 Middleware factories (functions that return middleware) are the most powerful pattern in Express — they let you configure middleware with parameters.
`,

"bdac0011-dd2e-4fde-af57-30e215a09dbd": `# Middleware Composition in Code

Advanced middleware patterns for production APIs.

## Request Context Middleware

\`\`\`typescript
// middleware/context.ts
// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      context: {
        requestId: string;
        startTime: number;
        user?: { id: string; role: string };
      };
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  req.context = {
    requestId: req.headers["x-request-id"] as string || randomUUID(),
    startTime: Date.now(),
  };
  res.setHeader("X-Request-Id", req.context.requestId);
  next();
}
\`\`\`

## Middleware Pipeline Builder

\`\`\`typescript
// lib/pipeline.ts
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

class PipelineBuilder {
  private stack: Middleware[] = [];

  use(mw: Middleware) { this.stack.push(mw); return this; }

  when(condition: boolean, mw: Middleware) {
    if (condition) this.stack.push(mw);
    return this;
  }

  auth() { this.stack.push(authenticate); return this; }

  role(...roles: string[]) { this.stack.push(authorize(...roles)); return this; }

  validate(schema: AnyZodObject) { this.stack.push(validateMiddleware(schema)); return this; }

  build(): Middleware[] { return this.stack; }
}

export const pipe = () => new PipelineBuilder();

// Usage
router.post("/",
  ...pipe()
    .auth()
    .validate(createProjectSchema)
    .when(config.isProd, apiLimiter)
    .build(),
  createProject
);

router.delete("/:id",
  ...pipe()
    .auth()
    .role("admin", "owner")
    .build(),
  deleteProject
);
\`\`\`

> 💡 A pipeline builder makes middleware composition declarative and readable — you can see the full request processing chain at a glance.
`,

"b0b66ce5-057d-4acc-8ee6-b47b44f2c986": `# How Third-Party Middleware Works

The Express ecosystem has hundreds of middleware packages for common tasks. Here are the essential ones.

## Essential Middleware Packages

| Package | Purpose | Usage |
|---|---|---|
| cors | Cross-origin requests | app.use(cors()) |
| helmet | Security headers | app.use(helmet()) |
| morgan | HTTP request logging | app.use(morgan("dev")) |
| compression | Gzip responses | app.use(compression()) |
| express-rate-limit | Rate limiting | app.use(rateLimit()) |
| cookie-parser | Parse cookies | app.use(cookieParser()) |
| express-slow-down | Slow down repeat requests | app.use(slowDown()) |
| hpp | HTTP parameter pollution | app.use(hpp()) |

## How morgan Works

\`\`\`typescript
import morgan from "morgan";

// Predefined formats
app.use(morgan("dev"));      // :method :url :status :response-time ms
app.use(morgan("combined")); // Apache-style logs (production)
app.use(morgan("tiny"));     // Minimal

// Custom format
app.use(morgan(":method :url :status :response-time ms :req[authorization]"));

// Custom token
morgan.token("user-id", (req: Request) => (req as any).context?.user?.id || "anon");
app.use(morgan(":method :url :status :user-id :response-time ms"));

// Write to file
import fs from "fs";
const accessLog = fs.createWriteStream("access.log", { flags: "a" });
app.use(morgan("combined", { stream: accessLog }));
\`\`\`

## Compression

\`\`\`typescript
import compression from "compression";

app.use(compression({
  threshold: 1024,    // Only compress above 1KB
  level: 6,           // Compression level (1-9)
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    return compression.filter(req, res);
  },
}));
\`\`\`

> 💡 Compression can reduce response sizes by 60-80%. Always enable it in production — the CPU cost is minimal compared to bandwidth savings.
`,

"aafb1389-9f08-4567-bc27-9bed10ed4f9a": `# Task: Build the Complete Middleware Stack

Assemble a production-ready middleware stack for TaskFlow!

## Your Task

Build and organize ALL middleware needed for a production API.

> 💡 **Hint:** Order matters! Security middleware should come first, then parsing, then auth, then routes, then error handling.

## Requirements

- Define the complete middleware stack in order:
  1. Request ID (generate UUID, attach to req and res header)
  2. Request logger (log method, path, status, duration)
  3. Security: helmet, cors (configurable origins), hpp
  4. parsing: express.json (with 10KB limit), urlencoded
  5. Compression (only in production)
  6. Rate limiting: general (100/15min), strict auth (10/15min)
  7. API routes (mounted at /api/v1)
  8. 404 handler (catch unmatched routes)
  9. Error handler (global, with environment-aware logging)
- Create a pipeline builder (compose middleware fluently)
- Add request timing (X-Response-Time header)
- Add conditional middleware (only run in certain environments)

## What You'll Practice

- Middleware ordering strategy
- Security hardening
- Middleware composition
`,
};

async function main() {
  console.log("Updating Node.js Express — Modules 3-4...");
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
