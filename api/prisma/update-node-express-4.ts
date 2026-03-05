import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 7: CRUD API — Building the Core (12 lessons) ──
"ea643990-7afb-4afa-8d2b-5444af87fe8d": `# How a Service Layer Works

The service layer contains your business logic — separate from HTTP handling (controllers) and data access (Prisma).

## Three-Layer Architecture

\`\`\`
Controller Layer (HTTP)
  ├── Parses req.params, req.body, req.query
  ├── Calls service methods
  ├── Sends HTTP response
  └── Knows about HTTP but NOT business rules

Service Layer (Business Logic)
  ├── Validates business rules
  ├── Orchestrates data operations
  ├── Handles authorization logic
  └── Knows about business rules but NOT HTTP

Data Access Layer (Prisma)
  ├── Queries database
  ├── Returns raw data
  └── Knows about DB but NOT business rules
\`\`\`

## Why Separate Layers?

\`\`\`typescript
// ❌ Everything in the controller — messy and untestable
router.post("/projects", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const existing = await prisma.project.findFirst({ where: { title } });
  if (existing) return res.status(409).json({ error: "Title taken" });
  const project = await prisma.project.create({ data: { title, ownerId: req.user.id } });
  await prisma.projectMember.create({ data: { projectId: project.id, userId: req.user.id, role: "OWNER" } });
  res.status(201).json({ data: project });
});

// ✅ Clean separation
router.post("/projects", authenticate, asyncHandler(projectController.create));
// Controller calls service, service calls Prisma
\`\`\`

> 💡 Services are testable without HTTP. You can unit test \`projectService.create()\` directly without setting up Express requests.
`,

"cdc1ffa6-7d05-4ff6-a6a3-0b642adf6858": `# Service Layer in Code — Projects

Complete project service implementation.

## Project Service

\`\`\`typescript
// services/project.service.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { NotFoundError, ForbiddenError, ConflictError } from "../lib/errors";

const prisma = new PrismaClient();

export const projectService = {
  async findById(id: string, userId?: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });
    if (!project) throw new NotFoundError("Project");
    return project;
  },

  async findMany(params: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { userId, page = 1, limit = 20, status, search } = params;

    const where: Prisma.ProjectWhereInput = {
      members: { some: { userId } }, // Only projects user is member of
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, page, limit };
  },

  async create(data: { title: string; description?: string }, userId: string) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { title: data.title, description: data.description, ownerId: userId },
      });
      await tx.projectMember.create({
        data: { projectId: project.id, userId, role: "OWNER" },
      });
      return project;
    });
  },

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.project.delete({ where: { id } });
  },
};
\`\`\`

> 💡 \`Promise.all\` runs the data query and count query in PARALLEL — twice as fast as running them sequentially.
`,

"1b31b08c-d78d-4c8d-a587-e35e538544c8": `# Task: Build the Projects Service & Controller

Implement the complete Projects CRUD with proper layering!

## Your Task

Build the project service (business logic) and controller (HTTP layer) following clean architecture.

> 💡 **Hint:** The controller only handles HTTP concerns (status codes, response format). The service handles business logic (validation, authorization, data orchestration).

## Requirements

- ProjectService methods:
  - create(data, userId): create project + add creator as OWNER member (transaction)
  - findById(id): include owner, member count, task count
  - findMany(userId, filters): only projects where user is member, search, filter by status, pagination
  - update(id, data): update project fields
  - delete(id): delete project (cascade to tasks, members)
  - addMember(projectId, userId, role): add member (check not already member)
  - removeMember(projectId, userId): remove member (can't remove owner)
- ProjectController: map service methods to HTTP handlers with proper status codes
- Use asyncHandler wrapper on all controller methods

## What You'll Practice

- Service layer patterns
- Controller-service separation
- Transaction-based creation
`,

"e60bd418-d59c-4ec2-81be-ee6f85b96103": `# How Filtering, Sorting & Pagination Work

Every API needs filtering, sorting, and pagination to handle large datasets efficiently.

## Pagination Strategies

\`\`\`
Offset-based (simple, common):
  GET /tasks?page=3&limit=20
  → SKIP 40, TAKE 20
  Pro: Simple, random page access
  Con: Slow on large datasets, inconsistent during inserts

Cursor-based (efficient, scalable):
  GET /tasks?cursor=abc123&limit=20
  → WHERE id > 'abc123' ORDER BY id LIMIT 20
  Pro: Fast, consistent
  Con: No random page access, forward-only
\`\`\`

## Filtering Patterns

\`\`\`
Query parameters:
  ?status=active               → Exact match
  ?priority=high,urgent        → Multiple values (IN)
  ?search=bug                  → Text search (LIKE)
  ?minDate=2024-01-01          → Range (>=)
  ?maxDate=2024-12-31          → Range (<=)
  ?assignee=user123            → Relation filter

Prisma translation:
  where: {
    status: "active",
    priority: { in: ["high", "urgent"] },
    title: { contains: "bug", mode: "insensitive" },
    dueDate: { gte: new Date("2024-01-01"), lte: new Date("2024-12-31") },
    assigneeId: "user123",
  }
\`\`\`

## Sorting

\`\`\`
  ?sort=createdAt&order=desc
  ?sort=priority&order=asc

  orderBy: { [sort]: order }

  Multiple sorts:
  ?sort=priority,-createdAt
  orderBy: [{ priority: "asc" }, { createdAt: "desc" }]
\`\`\`

> 💡 Always set a maximum page size (e.g., 100). Without it, a client could request ?limit=999999 and crash your server.
`,

"9c809cf4-1d22-4920-a3e2-cc8da11ead80": `# Filtering, Sorting & Pagination in Code

Building reusable query helpers for Prisma.

## Generic Query Builder

\`\`\`typescript
// lib/queryBuilder.ts
import { Prisma } from "@prisma/client";

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
  search?: string;
  [key: string]: string | undefined;
}

export function buildPagination(params: QueryParams) {
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || "20")));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildOrderBy(params: QueryParams, allowedFields: string[]) {
  const sort = params.sort || "createdAt";
  const order = params.order === "asc" ? "asc" : "desc";
  if (!allowedFields.includes(sort)) return { createdAt: "desc" as const };
  return { [sort]: order };
}

export function buildSearchFilter(search: string | undefined, fields: string[]) {
  if (!search) return undefined;
  return {
    OR: fields.map(field => ({
      [field]: { contains: search, mode: "insensitive" as const },
    })),
  };
}

// Usage in service
async function findTasks(projectId: string, queryParams: QueryParams) {
  const { skip, take, page, limit } = buildPagination(queryParams);
  const orderBy = buildOrderBy(queryParams, ["createdAt", "priority", "dueDate", "title"]);
  const searchFilter = buildSearchFilter(queryParams.search, ["title", "description"]);

  const where: Prisma.TaskWhereInput = {
    projectId,
    ...searchFilter,
    ...(queryParams.status && { status: queryParams.status as any }),
    ...(queryParams.priority && { priority: { in: queryParams.priority.split(",") as any[] } }),
    ...(queryParams.assigneeId && { assigneeId: queryParams.assigneeId }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, orderBy, skip, take }),
    prisma.task.count({ where }),
  ]);

  return { data: tasks, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
\`\`\`

> 💡 The query builder is reusable across all resources. Import \`buildPagination\`, \`buildOrderBy\`, and \`buildSearchFilter\` in any service.
`,

"87ee05fa-2815-4a94-808c-48869fa4c6f6": `# Task: Add Filtering & Pagination to Projects

Implement full query support for the Projects API!

## Your Task

Add filtering, sorting, and pagination to the project listing endpoint.

> 💡 **Hint:** Build generic helper functions that can be reused for Tasks and other resources too.

## Requirements

- GET /api/v1/projects accepts these query params:
  - page (default: 1, min: 1)
  - limit (default: 20, min: 1, max: 100)
  - sort (allowed: createdAt, title, status; default: createdAt)
  - order (asc or desc; default: desc)
  - search (case-insensitive search in title and description)
  - status (exact match filter)
- Return paginated response with meta: { page, limit, total, totalPages }
- Validate query params with Zod (transform strings to numbers)
- Create reusable buildPagination, buildOrderBy, buildSearchFilter helpers
- Test edge cases: page beyond total, empty results, no filters

## What You'll Practice

- Query parameter parsing
- Prisma dynamic filtering
- Reusable query utilities
`,

"2471d8f1-8da3-4b1e-8d16-3f510f3fd6d9": `# How Nested Resources Work

Nested resources represent parent-child relationships in your API — tasks belong to projects, comments belong to tasks.

## URL Design

\`\`\`
Flat (simple but loses context):
  GET /api/tasks?projectId=p1          ← Which project?
  POST /api/tasks  { projectId: "p1" } ← Must include in body

Nested (RESTful, explicit relationship):
  GET /api/projects/p1/tasks           ← Tasks OF project p1
  POST /api/projects/p1/tasks          ← Create task IN project p1
  GET /api/projects/p1/tasks/t1        ← Task t1 IN project p1

Hybrid (common in practice):
  GET /api/projects/p1/tasks           ← List tasks in project
  GET /api/tasks/t1                    ← Get task directly (no project context needed)
  PATCH /api/tasks/t1                  ← Update task directly
\`\`\`

## When to Nest?

| Nest ✅ | Don't Nest ❌ |
|---|---|
| List children of parent | Access child directly |
| Create child in parent context | Update/delete child |
| Maximum 2 levels deep | More than 2 levels |
| /projects/:id/tasks | /projects/:id/tasks/:id/comments/:id |

## Route Setup

\`\`\`typescript
// Nested routes: /api/projects/:projectId/tasks
const taskRouter = Router({ mergeParams: true });
// mergeParams: true → req.params includes projectId from parent

taskRouter.get("/", listProjectTasks);
taskRouter.post("/", createProjectTask);

projectRouter.use("/:projectId/tasks", authenticate, requireProjectAccess("EDITOR"), taskRouter);

// Direct routes: /api/tasks/:id
const directTaskRouter = Router();
directTaskRouter.get("/:id", getTask);
directTaskRouter.patch("/:id", updateTask);
directTaskRouter.delete("/:id", deleteTask);

app.use("/api/tasks", authenticate, directTaskRouter);
\`\`\`

> 💡 Use \`mergeParams: true\` when mounting a nested router. Without it, \`req.params.projectId\` from the parent route won't be available.
`,

"9fb9fc5e-b625-4eeb-a97b-a677ce38ba75": `# Nested Resources in Code — Tasks Under Projects

Implementing the Task service and nested routes.

## Task Service

\`\`\`typescript
// services/task.service.ts
export const taskService = {
  async findByProject(projectId: string, params: QueryParams) {
    const { skip, take, page, limit } = buildPagination(params);
    const orderBy = buildOrderBy(params, ["createdAt", "priority", "dueDate", "status"]);

    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(params.status && { status: params.status as any }),
      ...(params.priority && { priority: { in: params.priority.split(",") as any } }),
      ...(params.assigneeId && { assigneeId: params.assigneeId }),
      ...buildSearchFilter(params.search, ["title", "description"]),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.task.count({ where }),
    ]);

    return { data: tasks, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, title: true } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!task) throw new NotFoundError("Task");
    return task;
  },

  async create(projectId: string, data: CreateTaskInput, userId: string) {
    return prisma.task.create({
      data: { ...data, projectId },
      include: { assignee: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.task.delete({ where: { id } });
  },
};
\`\`\`

> 💡 Notice how the service doesn't know about HTTP at all — it takes plain objects and returns data. This makes it easily testable.
`,

"13cceb0f-8cb3-4b80-8cc8-5dda301170c9": `# Task: Build the Tasks CRUD API

Build the complete Tasks API with nested routes!

## Your Task

Implement CRUD operations for tasks that belong to projects.

> 💡 **Hint:** Use nested routes for listing and creating (POST /projects/:projectId/tasks). Use flat routes for getting, updating, and deleting individual tasks (PATCH /tasks/:id).

## Requirements

- POST /projects/:projectId/tasks — create task in project
- GET /projects/:projectId/tasks — list project tasks (with filters)
- GET /tasks/:id — get task with comments
- PATCH /tasks/:id — update task fields
- DELETE /tasks/:id — delete task
- PATCH /tasks/:id/status — update status only (todo → in_progress → review → done)
- PATCH /tasks/:id/assign — assign/unassign user
- Filter: status, priority, assignee, search, date range
- Sort: createdAt, priority, dueDate, title
- Include assignee info and comment count in list

## What You'll Practice

- Nested resource routes
- Service-controller separation
- Complex Prisma queries
`,

"3e507124-77e3-41d8-b029-8c79d1f9e6d3": `# How Comments & Sub-Resources Work

Comments are a common sub-resource pattern — they always belong to a parent (task) and are authored by a user.

## Comment Model

\`\`\`prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  taskId    String   @map("task_id")
  authorId  String   @map("author_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@map("comments")
}
\`\`\`

## Comment Permissions

\`\`\`
Create comment: Any project member
Edit comment:   Author only (or admin)
Delete comment: Author, project owner, or admin

Permission check:
1. User is authenticated ✓
2. User is member of the task's project ✓
3. For edit/delete: user is author OR admin ✓
\`\`\`

## Comment API Design

\`\`\`
POST   /api/tasks/:taskId/comments     → Create comment
GET    /api/tasks/:taskId/comments     → List comments for task
PATCH  /api/comments/:id              → Edit comment (author only)
DELETE /api/comments/:id              → Delete comment (author/admin)
\`\`\`

> 💡 Always use \`onDelete: Cascade\` for comments — when a task is deleted, its comments should be automatically deleted too.
`,

"da1b79f7-328c-4722-9bab-e869ff47b3d0": `# Comments API in Code

Complete comment service and controller implementation.

## Comment Service

\`\`\`typescript
// services/comment.service.ts
export const commentService = {
  async findByTask(taskId: string, params: QueryParams) {
    const { skip, take, page, limit } = buildPagination(params);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { taskId },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take,
      }),
      prisma.comment.count({ where: { taskId } }),
    ]);

    return { data: comments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async create(taskId: string, content: string, authorId: string) {
    // Verify task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError("Task");

    return prisma.comment.create({
      data: { taskId, content, authorId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  async update(id: string, content: string, userId: string) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError("Comment");
    if (comment.authorId !== userId) {
      throw new ForbiddenError("Can only edit your own comments");
    }
    return prisma.comment.update({
      where: { id },
      data: { content },
    });
  },

  async delete(id: string, userId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError("Comment");
    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenError("Can only delete your own comments");
    }
    await prisma.comment.delete({ where: { id } });
  },
};
\`\`\`

> 💡 The comment service handles permission checks internally — you could also implement this as middleware, but keeping it in the service is simpler for sub-resources.
`,

"422a497e-fcf7-4904-aed4-43043953ea70": `# Task: Build the Comments API

Implement comments as a sub-resource of tasks!

## Your Task

Build the comments CRUD API with proper ownership and permission checks.

> 💡 **Hint:** Comments are always created in the context of a task (/tasks/:taskId/comments) but edited/deleted directly (/comments/:id).

## Requirements

- POST /tasks/:taskId/comments — create comment (any project member)
- GET /tasks/:taskId/comments — list comments with author info, paginated
- PATCH /comments/:id — edit comment (author only)
- DELETE /comments/:id — delete comment (author, project owner, or admin)
- Validate: content is required, max 2000 characters
- Include author info (id, name, avatar) in all responses
- Verify task exists before creating comment
- Verify user is a member of the task's project before creating

## What You'll Practice

- Sub-resource API patterns
- Ownership-based permissions
- Cross-resource authorization
`,

// ── Module 8: File Uploads & Email (8 lessons) ──
"cd7e6141-97f2-4c18-adad-2d1d6fed4d54": `# How File Uploads Work in Express

File uploads use multipart/form-data encoding — different from JSON. Express needs special middleware to handle them.

## multipart/form-data vs JSON

\`\`\`
JSON (regular API request):
  Content-Type: application/json
  Body: { "name": "Alice" }

multipart/form-data (file upload):
  Content-Type: multipart/form-data; boundary=---abc123
  Body:
  ---abc123
  Content-Disposition: form-data; name="avatar"
  Content-Type: image/jpeg

  <binary file data>
  ---abc123
  Content-Disposition: form-data; name="name"

  Alice
  ---abc123--
\`\`\`

## Upload Strategies

| Strategy | Pros | Cons |
|---|---|---|
| Local disk | Simple, free | Lost on deploy, not scalable |
| Cloud (S3/Cloudinary) | Scalable, CDN, transforms | Cost, complexity |
| Database (BLOB) | Simple backup | Slow, large DB size |

## Flow

\`\`\`
Client uploads file
    │
    ▼
Multer middleware
    ├── Validates file type (image/jpeg, image/png)
    ├── Validates file size (max 5MB)
    ├── Saves to temp location (or memory)
    │
    ▼
Route handler
    ├── Upload to cloud storage (Cloudinary/S3)
    ├── Get URL from cloud
    ├── Save URL to database
    └── Return URL in response
\`\`\`

> 💡 Never store raw file uploads permanently on your server — use cloud storage. Server storage is lost on redeployment.
`,

"e5769210-93bd-4616-8cb9-b74e9c256fcb": `# File Upload in Code — Multer

Implementing file uploads with Multer middleware.

## Installation

\`\`\`bash
npm install multer
npm install -D @types/multer
\`\`\`

## Multer Configuration

\`\`\`typescript
// middleware/upload.ts
import multer from "multer";
import path from "path";
import { BadRequestError } from "../lib/errors";

// Memory storage (for cloud upload)
const storage = multer.memoryStorage();

// File filter
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only JPEG, PNG, WebP, and GIF images are allowed"));
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: imageFilter,
}).single("avatar");

export const uploadAttachments = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
}).array("attachments", 5);

// Route usage
router.patch("/profile/avatar",
  authenticate,
  uploadAvatar,
  asyncHandler(updateAvatar)
);
\`\`\`

## Controller

\`\`\`typescript
const updateAvatar = async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError("No file uploaded");

  // Upload to cloud (next lesson)
  const url = await cloudService.upload(req.file.buffer, req.file.mimetype);

  // Save URL to database
  const user = await userService.update(req.user!.id, { avatar: url });
  res.json({ success: true, data: user });
};
\`\`\`

> 💡 Use \`memoryStorage()\` when uploading to cloud — the file stays in memory (Buffer) and gets uploaded directly without touching disk.
`,

"9e223ebd-1d54-4d83-9d5c-3a429564fc43": `# How Cloud File Storage Works

Cloud storage (AWS S3, Cloudinary, etc.) provides scalable, CDN-backed file hosting.

## Why Cloud Storage?

\`\`\`
Local Storage:
  ❌ Lost on redeployment
  ❌ Not shared across instances
  ❌ No CDN (slow for global users)
  ❌ No image transforms

Cloud Storage:
  ✅ Persistent across deploys
  ✅ Shared across all instances
  ✅ Global CDN
  ✅ Auto-resize, format conversion
  ✅ Bandwidth offloaded from your server
\`\`\`

## Cloudinary vs AWS S3

| Feature | Cloudinary | AWS S3 |
|---|---|---|
| Image transforms | ✅ URL-based | ❌ Need Lambda |
| Setup complexity | Easy | Medium |
| Free tier | 25GB + 25K transforms | 5GB / 12 months |
| CDN | ✅ Built-in | Need CloudFront |
| Best for | Images/video | Any files |

## Cloudinary URL Transforms

\`\`\`
Original:
https://res.cloudinary.com/demo/image/upload/sample.jpg

Resize to 200x200:
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/sample.jpg

Auto-format (WebP for supported browsers):
https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg
\`\`\`

> 💡 Cloudinary's URL-based transforms mean you upload once and get infinite variations — thumbnails, avatars, banners — all from one upload.
`,

"6534d0ec-a6e8-4474-9e6b-2576340cc749": `# Cloud Upload in Code — Cloudinary

Implementing cloud file uploads with Cloudinary.

## Installation

\`\`\`bash
npm install cloudinary
\`\`\`

## Configuration

\`\`\`typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const cloudService = {
  async uploadImage(buffer: Buffer, folder: string = "taskflow"): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      stream.end(buffer);
    });
  },

  async uploadAvatar(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "taskflow/avatars",
          transformation: [
            { width: 200, height: 200, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      stream.end(buffer);
    });
  },

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },
};
\`\`\`

> 💡 Use \`gravity: "face"\` for avatar crops — Cloudinary's AI automatically detects and centers on the person's face.
`,

"39b03a15-1953-42a3-9f60-7d5b7e8b3db5": `# Task: Add Avatar Upload to TaskFlow

Implement user avatar uploads with cloud storage!

## Your Task

Build the avatar upload feature — accept image uploads, validate, resize, store in the cloud, and save the URL.

> 💡 **Hint:** Use Multer for parsing the upload, Cloudinary for storage, and update the user record with the returned URL.

## Requirements

- PATCH /api/v1/users/me/avatar — upload avatar image
- Accept: JPEG, PNG, WebP only
- Max file size: 5MB
- Auto-resize to 200x200 with face detection cropping
- Upload to Cloudinary (or mock the cloud service for now)
- Save the Cloudinary URL in the user's avatar field
- DELETE /api/v1/users/me/avatar — remove avatar (delete from cloud + set null)
- Return updated user profile after upload

## What You'll Practice

- Multer file upload middleware
- Cloud storage integration
- Image processing pipeline
`,

"07911221-ad9f-4bc1-8ea7-7598d2f0d3ef": `# How Email Sending Works in Node.js

Email is essential for user registration confirmations, password resets, and notifications.

## Email Flow

\`\`\`
Your App → SMTP Server → Recipient's Mail Server → Inbox

Options:
1. SMTP directly (Nodemailer) — full control
2. Email API (SendGrid, Resend) — managed service
3. Dev tools (Mailtrap, Ethereal) — testing
\`\`\`

## Nodemailer

\`\`\`typescript
import nodemailer from "nodemailer";

// Development — Ethereal (fake SMTP)
const devTransport = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: { user: "test@ethereal.email", pass: "password" },
});

// Production — Real SMTP (SendGrid example)
const prodTransport = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY },
});

// Send email
await transport.sendMail({
  from: '"TaskFlow" <noreply@taskflow.dev>',
  to: "alice@example.com",
  subject: "Welcome to TaskFlow!",
  html: "<h1>Welcome!</h1><p>Your account has been created.</p>",
});
\`\`\`

## Email Types for an API

| Type | Trigger | Priority |
|---|---|---|
| Welcome | User registration | Medium |
| Password reset | Forgot password | High |
| Email verification | Registration | High |
| Task assignment | Task assigned to user | Low |
| Daily digest | Cron job | Low |

> 💡 Don't send emails synchronously in request handlers — it slows down the API response. Use a job queue (Module 10) for non-critical emails.
`,

"f7e7b060-a0b5-4487-8d59-2269df23bd70": `# Email in Code — Nodemailer & Templates

Building an email service with templates.

## Email Service

\`\`\`typescript
// services/email.service.ts
import nodemailer from "nodemailer";
import { config } from "../config";

const transport = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

type EmailTemplate = "welcome" | "passwordReset" | "taskAssigned";

const templates: Record<EmailTemplate, (data: any) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: "Welcome to TaskFlow!",
    html: "<div style='font-family: sans-serif; max-width: 600px;'>" +
      "<h1>Welcome, " + data.name + "!</h1>" +
      "<p>Your TaskFlow account is ready. Start creating projects and managing tasks.</p>" +
      '<a href="' + data.loginUrl + '" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Log In</a>' +
      "</div>",
  }),

  passwordReset: (data) => ({
    subject: "Reset Your Password",
    html: "<div style='font-family: sans-serif;'>" +
      "<h2>Password Reset</h2>" +
      "<p>Click below to reset your password. This link expires in 1 hour.</p>" +
      '<a href="' + data.resetUrl + '">Reset Password</a>' +
      "</div>",
  }),

  taskAssigned: (data) => ({
    subject: "New Task Assigned: " + data.taskTitle,
    html: "<div><h2>You've been assigned a task</h2>" +
      "<p><strong>" + data.taskTitle + "</strong> in project " + data.projectTitle + "</p></div>",
  }),
};

export const emailService = {
  async send(to: string, template: EmailTemplate, data: any) {
    const { subject, html } = templates[template](data);
    const info = await transport.sendMail({
      from: '"TaskFlow" <noreply@taskflow.dev>',
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  },
};
\`\`\`

> 💡 In development, use Ethereal Email (ethereal.email) — it catches all outgoing emails so you can preview them without actually delivering.
`,

"ccedb5ad-aea7-4f52-b9dc-3ef6ca10e01a": `# Task: Add Password Reset Email Flow

Build the complete "forgot password" flow!

## Your Task

Implement a secure password reset flow with email verification.

> 💡 **Hint:** Generate a random token, store its hash in the DB with expiry, email the raw token, then verify the hash when the user clicks the link.

## Requirements

- POST /api/v1/auth/forgot-password — send reset email
  - Find user by email (don't reveal if email exists or not)
  - Generate random token (crypto.randomBytes)
  - Hash the token and store in DB with 1-hour expiry
  - Send email with reset link containing the raw token
  - Always return 200 (even if email not found — prevents enumeration)
- POST /api/v1/auth/reset-password — reset with token
  - Hash the provided token
  - Find matching record in DB (not expired)
  - Update user's password (hash with bcrypt)
  - Delete the reset token record
  - Return success
- Rate limit: max 3 reset requests per hour per email
- Security: store hashed tokens only (like passwords)

## What You'll Practice

- Secure token generation and storage
- Email integration
- Time-limited operations
`,
};

async function main() {
  console.log("Updating Node.js Express — Modules 7-8...");
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
