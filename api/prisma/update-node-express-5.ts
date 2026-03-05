import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 9: Real-Time with WebSockets (9 lessons) ──
"960199b6-0133-4ec6-ad4c-37719f1bb82c": `# How WebSockets Work

WebSockets provide full-duplex, persistent connections between client and server — unlike HTTP's request/response model.

## HTTP vs WebSocket

\`\`\`
HTTP (half-duplex):
  Client → Server: "Any new messages?"     ← Request
  Server → Client: "No"                     ← Response
  Client → Server: "Any new messages?"     ← Request
  Server → Client: "Yes, here's one"       ← Response
  (Polling: wasteful, high latency)

WebSocket (full-duplex):
  Client ↔ Server: Persistent connection
  Server → Client: "New message arrived!"  ← Push instantly
  Client → Server: "User is typing..."     ← Push instantly
  (Real-time: efficient, low latency)
\`\`\`

## WebSocket Lifecycle

\`\`\`
1. HTTP Upgrade handshake
   Client: GET /ws HTTP/1.1
           Upgrade: websocket
           Connection: Upgrade

   Server: HTTP/1.1 101 Switching Protocols
           Upgrade: websocket
           Connection: Upgrade

2. Bidirectional communication
   ← Server sends events
   → Client sends events

3. Close connection
   Either side can close
\`\`\`

## Use Cases

| Real-Time Feature | Protocol |
|---|---|
| Chat messages | WebSocket |
| Live notifications | WebSocket or SSE |
| Collaborative editing | WebSocket |
| Live dashboard data | WebSocket or SSE |
| File download progress | SSE |
| REST API calls | HTTP |

> 💡 WebSockets are for real-time push. If you only need server-to-client updates, Server-Sent Events (SSE) are simpler and work over regular HTTP.
`,

"7a9f6ec0-154c-4d6e-a3d7-edc33db36487": `# How Socket.io Works

Socket.io is a library that provides WebSocket-like functionality with automatic fallbacks, rooms, and built-in reconnection.

## Socket.io Features

\`\`\`
Raw WebSockets:
  ✅ Native browser API
  ❌ No rooms/namespaces
  ❌ No auto-reconnect
  ❌ No fallback transport
  ❌ No acknowledgments

Socket.io:
  ✅ Rooms and namespaces
  ✅ Auto-reconnect with backoff
  ✅ Fallback to long-polling
  ✅ Built-in acknowledgments
  ✅ Broadcasting helpers
  ✅ Middleware support
\`\`\`

## Core Concepts

\`\`\`
Namespace: Logical separation (e.g., /chat, /admin)
  └── Room: Group of sockets (e.g., "project:abc123")
       └── Socket: Individual connection (one per client)

Events:
  emit("event", data)        → Send to one socket
  to("room").emit(...)       → Send to all in room
  broadcast.emit(...)        → Send to all EXCEPT sender
  
  socket.join("room")        → Add socket to room
  socket.leave("room")       → Remove from room
\`\`\`

## Architecture

\`\`\`
HTTP Server (Express)
  └── Socket.io Server
       ├── Namespace: /
       │    ├── Room: "project:abc"
       │    │    ├── Socket (User A)
       │    │    └── Socket (User B)
       │    └── Room: "project:xyz"
       │         └── Socket (User C)
       └── Namespace: /admin
            └── Room: "dashboard"
\`\`\`

> 💡 Rooms are the key concept — they let you broadcast events to specific groups (like all members of a project) without sending to everyone.
`,

"c743c966-ce9a-4279-94f0-565f2603585b": `# Socket.io in Code — Basic Setup

Setting up Socket.io with Express and authentication.

## Installation

\`\`\`bash
npm install socket.io
\`\`\`

## Server Setup

\`\`\`typescript
// socket/index.ts
import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "../middleware/auth";

let io: SocketServer;

export function initSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware — verify JWT before connecting
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    console.log("User connected:", userId);

    // Join personal room (for direct notifications)
    socket.join("user:" + userId);

    // Join project rooms
    socket.on("join:project", (projectId: string) => {
      socket.join("project:" + projectId);
      console.log(userId + " joined project:" + projectId);
    });

    socket.on("leave:project", (projectId: string) => {
      socket.leave("project:" + projectId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
\`\`\`

## Express Integration

\`\`\`typescript
// index.ts
import express from "express";
import { createServer } from "http";
import { initSocket } from "./socket";

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

httpServer.listen(3000);
\`\`\`

> 💡 Use \`socket.data\` to store user info from auth middleware — it persists for the socket's entire lifetime.
`,

"d2af49d2-5e82-465e-9075-45636bd29416": `# How Real-Time Notifications Work

Server emits events when things happen; connected clients receive them instantly.

## Event-Driven Architecture

\`\`\`
Service Layer (action happens)
    │
    ▼
Event Emitter (notify socket layer)
    │
    ▼
Socket.io broadcasts to relevant rooms
    │
    ▼
Connected clients receive event
\`\`\`

## Notification Types for TaskFlow

\`\`\`typescript
type NotificationEvent =
  | { type: "task:created";    data: { task: Task; projectId: string } }
  | { type: "task:updated";    data: { task: Task; projectId: string } }
  | { type: "task:assigned";   data: { task: Task; userId: string } }
  | { type: "task:completed";  data: { task: Task; projectId: string } }
  | { type: "comment:created"; data: { comment: Comment; taskId: string } }
  | { type: "member:joined";   data: { user: User; projectId: string } }
  | { type: "project:updated"; data: { project: Project } };
\`\`\`

## Targeting

\`\`\`
Broadcast to project room:
  io.to("project:abc").emit("task:created", taskData);
  → All members of project "abc" get notified

Send to specific user:
  io.to("user:xyz").emit("task:assigned", taskData);
  → Only user "xyz" gets notified

Exclude sender:
  socket.to("project:abc").emit("task:updated", taskData);
  → All members EXCEPT current user
\`\`\`

> 💡 Always broadcast to rooms, not individual sockets. A user might have multiple tabs open (multiple sockets), and rooms handle that automatically.
`,

"c5c49fb0-6463-4abb-bb2c-ab32a4005bc0": `# Real-Time Notifications in Code

Integrating Socket.io events into the service layer.

## Notification Service

\`\`\`typescript
// services/notification.service.ts
import { getIO } from "../socket";

export const notificationService = {
  taskCreated(projectId: string, task: any) {
    getIO().to("project:" + projectId).emit("task:created", {
      type: "task:created",
      data: task,
      timestamp: new Date().toISOString(),
    });
  },

  taskUpdated(projectId: string, task: any) {
    getIO().to("project:" + projectId).emit("task:updated", {
      type: "task:updated",
      data: task,
      timestamp: new Date().toISOString(),
    });
  },

  taskAssigned(userId: string, task: any) {
    getIO().to("user:" + userId).emit("task:assigned", {
      type: "task:assigned",
      data: task,
      timestamp: new Date().toISOString(),
    });
  },

  commentAdded(projectId: string, taskId: string, comment: any) {
    getIO().to("project:" + projectId).emit("comment:created", {
      type: "comment:created",
      data: { ...comment, taskId },
      timestamp: new Date().toISOString(),
    });
  },
};
\`\`\`

## Integration in Task Service

\`\`\`typescript
// services/task.service.ts
import { notificationService } from "./notification.service";

async create(projectId: string, data: CreateTaskInput, userId: string) {
  const task = await prisma.task.create({
    data: { ...data, projectId },
    include: { assignee: { select: { id: true, name: true } } },
  });

  // Notify project members
  notificationService.taskCreated(projectId, task);

  // Notify assignee directly
  if (task.assigneeId && task.assigneeId !== userId) {
    notificationService.taskAssigned(task.assigneeId, task);
  }

  return task;
},
\`\`\`

> 💡 Call notification methods AFTER the database operation succeeds — don't emit events for operations that might fail.
`,

"a87a4944-4195-4bdf-968b-75d7165a4ae2": `# Task: Add Real-Time Task Notifications

Wire up Socket.io notifications for task events!

## Your Task

Integrate real-time notifications into the TaskFlow API so project members see instant updates.

> 💡 **Hint:** Create a notification service that wraps Socket.io's emit calls, then call it from your task service after successful DB operations.

## Requirements

- Set up Socket.io with Express (shared HTTP server)
- Authenticate socket connections (verify JWT from handshake)
- Join/leave project rooms on connect/disconnect
- Emit events when:
  - Task is created → notify project room
  - Task is updated → notify project room
  - Task is assigned → notify assignee directly
  - Task status changes to "done" → notify project room
  - Comment is added → notify project room
- Client-side: listen for events and update UI
- Handle multiple tabs (same user, multiple sockets)

## What You'll Practice

- Socket.io setup and authentication
- Room-based broadcasting
- Event-driven architecture
`,

"70dbdffc-7166-46ee-b64f-148ee2766c85": `# How Live Collaboration Works

Live collaboration means multiple users see each other's actions in real-time — who's online, who's typing, who's viewing the same task.

## Presence System

\`\`\`
Online indicators: Show who's currently viewing a project
Typing indicators: Show who's typing a comment
Viewing indicators: Show who's looking at the same task

Implementation:
  User opens project → emit "presence:join"
  User leaves project → emit "presence:leave"
  Server tracks active users per project
  Broadcasts presence changes to room
\`\`\`

## Activity Feed

\`\`\`
Activity feed = persistent log of all project events:
  [10:32] Alice created task "Design login page"
  [10:35] Bob commented on "Design login page"
  [10:40] Alice assigned "Setup CI" to Charlie
  [11:00] Charlie moved "Setup CI" to In Progress

Stored in database + broadcast via Socket.io
  → New events appear instantly for online users
  → Offline users see them when they reconnect
\`\`\`

## Data Model

\`\`\`prisma
model Activity {
  id        String   @id @default(uuid())
  type      String   // "task.created", "comment.added", etc.
  data      Json     // { taskId, taskTitle, changes, ... }
  userId    String
  projectId String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])

  @@index([projectId, createdAt])
}
\`\`\`

> 💡 Store activities in the database AND emit via Socket.io. The database provides history; Socket.io provides instant delivery.
`,

"3a47a3ea-e4ba-4ac2-bbf6-0d930f04c5d3": `# Live Activity Feed in Code

Building a real-time activity feed for TaskFlow.

## Activity Service

\`\`\`typescript
// services/activity.service.ts
import { getIO } from "../socket";

export const activityService = {
  async log(params: {
    type: string;
    data: any;
    userId: string;
    projectId: string;
  }) {
    // Save to database
    const activity = await prisma.activity.create({
      data: {
        type: params.type,
        data: params.data,
        userId: params.userId,
        projectId: params.projectId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Broadcast via Socket.io
    getIO().to("project:" + params.projectId).emit("activity:new", activity);

    return activity;
  },

  async getProjectFeed(projectId: string, cursor?: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: {
        projectId,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      data: activities,
      nextCursor: activities.length === limit
        ? activities[activities.length - 1].createdAt.toISOString()
        : null,
    };
  },
};
\`\`\`

## Integration in Services

\`\`\`typescript
// In task.service.ts
async create(projectId: string, data: CreateTaskInput, userId: string) {
  const task = await prisma.task.create({ data: { ...data, projectId } });

  await activityService.log({
    type: "task.created",
    data: { taskId: task.id, taskTitle: task.title },
    userId,
    projectId,
  });

  return task;
},

async update(id: string, data: UpdateTaskInput, userId: string) {
  const old = await prisma.task.findUnique({ where: { id } });
  const task = await prisma.task.update({ where: { id }, data });

  const changes = Object.entries(data)
    .filter(([key, val]) => old && (old as any)[key] !== val)
    .map(([key, val]) => ({ field: key, from: (old as any)[key], to: val }));

  await activityService.log({
    type: "task.updated",
    data: { taskId: task.id, taskTitle: task.title, changes },
    userId,
    projectId: task.projectId,
  });

  return task;
},
\`\`\`

> 💡 Use cursor-based pagination for activity feeds — new items constantly appear at the top, making offset pagination unreliable.
`,

"b2e2e2a1-9478-466f-83ec-7ecafcd2f9f7": `# Task: Build a Live Activity Feed

Implement a full activity feed with real-time updates!

## Your Task

Build an activity tracking system that logs all project events and delivers them in real-time.

> 💡 **Hint:** Log activities in the database for history AND emit them via Socket.io for real-time delivery. Use cursor-based pagination for the feed API.

## Requirements

- Activity model: type, data (JSON), userId, projectId, createdAt
- Log activities for: task created, task updated, task status changed, task assigned, comment added, member joined/left
- GET /api/v1/projects/:id/activity — paginated feed (cursor-based)
- Real-time: emit "activity:new" to project room when activity is logged
- Include user info (name, avatar) in each activity
- Track changes: for updates, store what changed (field, oldValue, newValue)
- Presence: track which users are currently viewing each project
- Emit "presence:update" when users join/leave project rooms

## What You'll Practice

- Activity logging patterns
- Cursor-based pagination
- Real-time broadcasting
- Presence tracking
`,

// ── Module 10: Caching & Queues (9 lessons) ──
"6bebad85-6fa0-4f4e-8433-481ab88b0e9d": `# How Caching Works in Backend APIs

Caching stores frequently accessed data in fast storage (Redis/memory) to avoid repeated database queries.

## The Caching Problem

\`\`\`
Without caching:
  Request 1: GET /projects/abc → DB query (50ms)
  Request 2: GET /projects/abc → DB query (50ms)  ← Same data!
  Request 3: GET /projects/abc → DB query (50ms)  ← Same data!
  100 requests = 100 DB queries = 5000ms total

With caching:
  Request 1: GET /projects/abc → DB query (50ms) → Cache result
  Request 2: GET /projects/abc → Cache hit (1ms)  ← Instant!
  Request 3: GET /projects/abc → Cache hit (1ms)  ← Instant!
  100 requests = 1 DB query + 99 cache hits = 149ms total
\`\`\`

## Cache Strategies

\`\`\`
Cache-Aside (Lazy Loading):
  1. Check cache → miss
  2. Query database
  3. Store in cache
  4. Return data
  Best for: Read-heavy data

Write-Through:
  1. Write to cache AND database
  2. Cache is always up-to-date
  Best for: Data you write and read frequently

Write-Behind:
  1. Write to cache only
  2. Async write to database later
  Best for: High-write scenarios (not for critical data)
\`\`\`

## Cache Invalidation

\`\`\`
"There are only two hard things in computer science:
 cache invalidation and naming things."

Strategies:
  TTL (Time-To-Live): Auto-expire after N seconds
  Event-based: Invalidate when data changes
  Version-based: Include version in cache key

  Best practice: Combine TTL + event-based
  → TTL prevents stale data if you miss an event
  → Events keep data fresh for most operations
\`\`\`

> 💡 Cache data that is read often but changes rarely. Project details? Great candidate. User's auth token? Not a good candidate.
`,

"2aedf9b0-5078-4dfa-9ec1-87c6d0844404": `# Redis Caching in Code

Implementing a Redis cache layer for TaskFlow.

## Setup

\`\`\`bash
npm install ioredis
\`\`\`

\`\`\`typescript
// lib/redis.ts
import Redis from "ioredis";
import { config } from "../config";

export const redis = new Redis(config.redisUrl);

redis.on("error", (err) => console.error("Redis error:", err));
redis.on("connect", () => console.log("Redis connected"));
\`\`\`

## Cache Service

\`\`\`typescript
// services/cache.service.ts
import { redis } from "../lib/redis";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, data: any, ttlSeconds = 300): Promise<void> {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  },
};

// Usage in project service
async findById(id: string) {
  // Check cache first
  const cacheKey = "project:" + id;
  const cached = await cache.get<Project>(cacheKey);
  if (cached) return cached;

  // Cache miss — query database
  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true, _count: { select: { tasks: true } } },
  });
  if (!project) throw new NotFoundError("Project");

  // Store in cache (5 minute TTL)
  await cache.set(cacheKey, project, 300);

  return project;
},

// Invalidate on update
async update(id: string, data: any) {
  const project = await prisma.project.update({ where: { id }, data });
  await cache.del("project:" + id);           // Clear specific cache
  await cache.delPattern("projects:list:*");   // Clear list caches
  return project;
},
\`\`\`

> 💡 Always invalidate the cache when data changes. Forgetting to invalidate is the #1 caching bug — users see stale data.
`,

"9c592d22-9c64-496d-8347-f1051b21661a": `# Task: Add Redis Caching to TaskFlow

Implement caching for frequently accessed data!

## Your Task

Add a Redis cache layer to reduce database load for common queries.

> 💡 **Hint:** Use a cache-aside pattern: check cache first, query DB on miss, store result. Invalidate on writes.

## Requirements

- Set up Redis connection (ioredis)
- Build a generic cache service (get, set, del, delPattern)
- Cache these operations:
  - Project by ID (TTL: 5 minutes)
  - Project list per user (TTL: 2 minutes)
  - Task by ID (TTL: 5 minutes)
  - User profile (TTL: 10 minutes)
- Invalidate cache when data changes:
  - Project updated → clear project:\${id} + project lists
  - Task created/updated → clear task:\${id} + project's task list
  - User updated → clear user:\${id}
- Add cache headers to HTTP responses (ETag, Cache-Control)
- Log cache hits/misses for monitoring

## What You'll Practice

- Redis operations
- Cache-aside pattern
- Cache invalidation strategies
`,

"18b017f1-8431-4d19-bafc-d892806e735a": `# How Background Jobs & Queues Work

Job queues let you defer time-consuming tasks to run in the background — keeping API responses fast.

## The Problem

\`\`\`
Without queue (blocking):
  POST /tasks → Create task (5ms)
                → Send email (800ms)    ← SLOW!
                → Log activity (10ms)
                → Generate PDF (2000ms) ← VERY SLOW!
                → Return response       → 2815ms total 😱

With queue (non-blocking):
  POST /tasks → Create task (5ms)
              → Add email job to queue (2ms)
              → Add PDF job to queue (2ms)
              → Return response          → 19ms total 🚀

  Background workers process jobs:
  Worker 1 → Send email (800ms)
  Worker 2 → Generate PDF (2000ms)
\`\`\`

## Queue Concepts

\`\`\`
Producer: Adds jobs to the queue
  → Your API handlers/services

Queue: Stores pending jobs (Redis)
  → FIFO by default, priority supported

Worker: Processes jobs from the queue
  → Separate process or thread

Job States:
  waiting → active → completed
                   → failed (→ retry → completed/failed)
\`\`\`

## When to Use Queues

| Queue ✅ | Direct ❌ |
|---|---|
| Sending emails | Creating a DB record |
| Generating reports/PDFs | Simple CRUD |
| Image processing | Cache operations |
| External API calls | Simple calculations |
| Data imports/exports | Auth checks |
| Scheduled tasks | Validation |

> 💡 If an operation takes more than 100ms and the user doesn't need the result immediately, put it in a queue.
`,

"2cbb79c2-51ae-4764-af66-a98e64aa2f64": `# BullMQ in Code — Job Queue Setup

BullMQ is the most popular job queue for Node.js, backed by Redis.

## Installation

\`\`\`bash
npm install bullmq
\`\`\`

## Queue Setup

\`\`\`typescript
// queues/email.queue.ts
import { Queue, Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import { emailService } from "../services/email.service";

// Create queue
export const emailQueue = new Queue("email", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000, age: 24 * 3600 }, // Keep last 1000 completed
    removeOnFail: { count: 5000 },
  },
});

// Create worker
const emailWorker = new Worker(
  "email",
  async (job: Job) => {
    const { to, template, data } = job.data;
    console.log("Processing email job: " + job.id + " → " + to);

    await emailService.send(to, template, data);

    console.log("Email sent: " + job.id);
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 emails at a time
  }
);

// Event handlers
emailWorker.on("completed", (job) => {
  console.log("Email job completed: " + job.id);
});

emailWorker.on("failed", (job, err) => {
  console.error("Email job failed: " + (job ? job.id : "unknown") + " — " + err.message);
});
\`\`\`

## Adding Jobs

\`\`\`typescript
// In your service layer:
import { emailQueue } from "../queues/email.queue";

// Add a job
await emailQueue.add("welcome-email", {
  to: user.email,
  template: "welcome",
  data: { name: user.name, loginUrl: "https://taskflow.dev/login" },
});

// Add with priority (lower = higher priority)
await emailQueue.add("password-reset", {
  to: user.email,
  template: "passwordReset",
  data: { resetUrl },
}, { priority: 1 }); // Processed before other emails

// Add with delay
await emailQueue.add("follow-up", {
  to: user.email,
  template: "followUp",
  data: {},
}, { delay: 24 * 60 * 60 * 1000 }); // 24 hours later
\`\`\`

> 💡 Set \`concurrency: 5\` on the worker to process multiple jobs in parallel. Without it, jobs are processed one at a time.
`,

"59c44376-4f37-4017-a9d0-98296f8e23e9": `# Task: Add Email Jobs to a Queue

Move email sending from synchronous to background jobs!

## Your Task

Replace direct email sending with BullMQ jobs so API responses aren't slowed down.

> 💡 **Hint:** Create an email queue, add jobs from services, create a worker that processes them. Don't forget retry logic for failures.

## Requirements

- Create BullMQ email queue with Redis connection
- Add email worker with:
  - Concurrency: 5 (process 5 emails simultaneously)
  - Retry: 3 attempts with exponential backoff (2s, 4s, 8s)
  - Remove completed jobs after 24 hours
- Replace all direct emailService.send() calls with queue.add()
- Job types: welcome, passwordReset, taskAssigned, dailyDigest
- Priority: password reset = 1 (highest), others = default
- Delayed jobs: follow-up emails after 24 hours
- Add a /admin/queues endpoint to monitor queue status (job counts)
- Log job completion and failures

## What You'll Practice

- BullMQ queue and worker setup
- Job retry strategies
- Queue monitoring
`,

"bb679b3d-3e83-4582-9670-766a57c665fa": `# How Scheduled Tasks & Cron Jobs Work

Cron jobs run tasks on a schedule — daily reports, cleanup, reminders.

## Cron Expressions

\`\`\`
 ┌───────── minute (0-59)
 │ ┌─────── hour (0-23)
 │ │ ┌───── day of month (1-31)
 │ │ │ ┌─── month (1-12)
 │ │ │ │ ┌─ day of week (0-7, 0 and 7 = Sunday)
 │ │ │ │ │
 * * * * *

Examples:
  "0 9 * * *"     → Every day at 9:00 AM
  "*/5 * * * *"   → Every 5 minutes
  "0 0 * * 0"     → Every Sunday at midnight
  "0 8 * * 1-5"   → Weekdays at 8:00 AM
  "0 0 1 * *"     → First day of every month
\`\`\`

## Options in Node.js

\`\`\`
1. node-cron (in-process)
   Pro: Simple, no external deps
   Con: Stops when server stops, no distributed lock

2. BullMQ Repeatable Jobs
   Pro: Redis-backed, survives restarts, distributed
   Con: Requires Redis

3. OS crontab
   Pro: System-level, reliable
   Con: Not portable, hard to manage in containers

4. Cloud schedulers (AWS EventBridge, Cloud Scheduler)
   Pro: Managed, reliable, serverless
   Con: Vendor lock-in, cost
\`\`\`

## Scheduled Tasks for TaskFlow

| Task | Schedule | Purpose |
|---|---|---|
| Daily digest email | 8:00 AM daily | Summary of yesterday's activity |
| Overdue task check | Every hour | Flag overdue tasks |
| Cleanup old sessions | Midnight daily | Remove expired tokens |
| Weekly report | Monday 9:00 AM | Project progress report |
| DB backup | Daily 2:00 AM | Automated backup |

> 💡 For production, use BullMQ repeatable jobs over node-cron. They survive server restarts and work correctly in multi-instance deployments.
`,

"6fa4d48b-e395-49c8-ad1c-0c9b22064f76": `# Cron Jobs in Code — Scheduled Maintenance

Implementing scheduled tasks with BullMQ repeatable jobs.

## BullMQ Repeatable Jobs

\`\`\`typescript
// queues/scheduled.queue.ts
import { Queue, Worker, Job } from "bullmq";
import { redis } from "../lib/redis";

export const scheduledQueue = new Queue("scheduled", { connection: redis });

// Add repeatable jobs on startup
export async function setupScheduledJobs() {
  // Daily digest email at 8:00 AM
  await scheduledQueue.add(
    "daily-digest",
    {},
    { repeat: { pattern: "0 8 * * *" } }
  );

  // Check overdue tasks every hour
  await scheduledQueue.add(
    "check-overdue",
    {},
    { repeat: { pattern: "0 * * * *" } }
  );

  // Clean up expired sessions daily at midnight
  await scheduledQueue.add(
    "cleanup-sessions",
    {},
    { repeat: { pattern: "0 0 * * *" } }
  );

  console.log("Scheduled jobs registered");
}

// Worker to process scheduled jobs
const scheduledWorker = new Worker(
  "scheduled",
  async (job: Job) => {
    switch (job.name) {
      case "daily-digest":
        await processDailyDigest();
        break;
      case "check-overdue":
        await checkOverdueTasks();
        break;
      case "cleanup-sessions":
        await cleanupExpiredSessions();
        break;
      default:
        console.log("Unknown job: " + job.name);
    }
  },
  { connection: redis }
);

async function processDailyDigest() {
  const users = await prisma.user.findMany({
    where: { emailNotifications: true },
  });

  for (const user of users) {
    const activities = await prisma.activity.findMany({
      where: {
        project: { members: { some: { userId: user.id } } },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (activities.length > 0) {
      await emailQueue.add("daily-digest-email", {
        to: user.email,
        template: "dailyDigest",
        data: { name: user.name, activities },
      });
    }
  }
}

async function checkOverdueTasks() {
  const overdue = await prisma.task.updateMany({
    where: {
      dueDate: { lt: new Date() },
      status: { not: "DONE" },
      isOverdue: false,
    },
    data: { isOverdue: true },
  });
  console.log("Marked " + overdue.count + " tasks as overdue");
}

async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  console.log("Cleaned up " + result.count + " expired sessions");
}
\`\`\`

> 💡 BullMQ repeatable jobs use Redis to ensure the job runs exactly once, even with multiple server instances. No duplicate daily digests!
`,

"31b01e7e-27d1-46eb-9317-652e9a32f7a2": `# Task: Add a Daily Summary Job

Build a scheduled job that sends daily activity summaries!

## Your Task

Create a daily digest system that collects each user's project activity and sends a summary email.

> 💡 **Hint:** Use BullMQ repeatable jobs to trigger the digest, then add individual email jobs to the email queue for each user.

## Requirements

- Register a "daily-digest" repeatable job (8:00 AM daily)
- For each user with notifications enabled:
  - Query last 24h of activity across their projects
  - Group activities by project
  - Add personalized email job to email queue
- Register an "overdue-check" repeatable job (every hour)
  - Find tasks past their due date that aren't marked overdue
  - Mark them as overdue
  - Notify task owner via notification service
- Register a "cleanup" repeatable job (midnight daily)
  - Delete expired sessions
  - Delete unverified accounts older than 7 days
  - Archive completed tasks older than 90 days
- Add /admin/scheduled endpoint to list all repeatable jobs
- Handle errors gracefully — one user's failure shouldn't stop others

## What You'll Practice

- Scheduled job patterns
- Batch processing
- Error isolation in loops
`,
};

async function main() {
  console.log("Updating Node.js Express — Modules 9-10...");
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
