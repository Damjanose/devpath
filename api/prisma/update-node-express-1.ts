import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const updates: Record<string, string> = {
// ── Module 0: Node.js Fundamentals (12 lessons) ──
"44849fcc-e95f-483c-ae5c-cda7d6e42bd3": `# Course Overview & What You'll Build

Welcome to Node.js & Express — Backend Mastery! In this course, you'll build **TaskFlow**, a full-featured project management API from scratch.

## What is TaskFlow?

TaskFlow is a RESTful API that lets teams manage projects, tasks, and collaboration. By the end of this course, you'll have built:

\`\`\`
TaskFlow API Features:
├── User authentication (JWT + bcrypt)
├── Projects CRUD with team membership
├── Tasks with assignments, priorities, due dates
├── Comments on tasks
├── File uploads (avatars, attachments)
├── Real-time notifications (Socket.io)
├── Email notifications (password reset)
├── Redis caching for performance
├── Background jobs (email queue)
├── Full test suite (unit + integration + E2E)
└── Docker deployment with CI/CD
\`\`\`

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| TypeScript | Type safety |
| Express.js | Web framework |
| PostgreSQL | Database |
| Prisma | ORM |
| JWT + bcrypt | Authentication |
| Socket.io | Real-time |
| Redis | Caching |
| Vitest | Testing |
| Docker | Deployment |

> 💡 Each module builds on the previous one. By the end, TaskFlow will be a production-ready API you can put in your portfolio.
`,

"d861e8c5-e6f2-4d1b-868e-acdc537199e0": `# What Is Node.js & How It Works

Node.js is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript outside the browser — on servers, command lines, and IoT devices.

## How Node.js Works

\`\`\`
Traditional Server (Thread-based):
Request 1 ──→ Thread 1 ──→ [DB Query... waiting...] ──→ Response
Request 2 ──→ Thread 2 ──→ [File Read... waiting...] ──→ Response
Request 3 ──→ Thread 3 ──→ [API Call... waiting...] ──→ Response
(Each request blocks a thread)

Node.js (Event Loop):
Request 1 ──→ Event Loop ──→ DB Query (async) ──→ Callback ──→ Response
Request 2 ──→ Event Loop ──→ File Read (async) ──→ Callback ──→ Response
Request 3 ──→ Event Loop ──→ API Call (async) ──→ Callback ──→ Response
(Single thread handles all requests, never blocks)
\`\`\`

## The Event Loop

\`\`\`
   ┌───────────────────────────┐
┌──▶│       timers (setTimeout) │
│  └──────────┬────────────────┘
│  ┌──────────▼────────────────┐
│  │     pending callbacks     │
│  └──────────┬────────────────┘
│  ┌──────────▼────────────────┐
│  │         poll (I/O)        │
│  └──────────┬────────────────┘
│  ┌──────────▼────────────────┐
│  │       check (setImmediate)│
│  └──────────┬────────────────┘
│  ┌──────────▼────────────────┐
│  │      close callbacks      │
│  └──────────┬────────────────┘
└─────────────┘
\`\`\`

## Key Concepts

| Concept | Description |
|---|---|
| Non-blocking I/O | Operations don't wait — they use callbacks/promises |
| Single-threaded | One main thread + worker pool for heavy tasks |
| Event-driven | Everything is events: requests, file reads, timers |
| V8 Engine | Same JavaScript engine as Chrome, incredibly fast |

> 💡 Node.js excels at I/O-heavy tasks (web servers, APIs, real-time apps) but struggles with CPU-heavy tasks (video encoding, ML). Use worker threads for CPU-intensive work.
`,

"d9091230-8fa7-40a1-9a8e-ef910bb9fe72": `# Node.js in Code — Your First Script

Let's write Node.js code and understand the runtime differences from browser JavaScript.

## Hello World

\`\`\`typescript
// hello.ts
console.log("Hello from Node.js!");
console.log("Node version:", process.version);
console.log("Platform:", process.platform);
console.log("Current directory:", process.cwd());
\`\`\`

## process — The Global Object

\`\`\`typescript
// process-demo.ts

// Environment variables
console.log("NODE_ENV:", process.env.NODE_ENV);

// Command line arguments
// Run: npx tsx process-demo.ts hello world
console.log("Arguments:", process.argv.slice(2)); // ["hello", "world"]

// Exit codes
process.on("exit", (code) => {
  console.log("Process exiting with code:", code);
});

// Unhandled errors
process.on("uncaughtException", (error) => {
  console.error("Unhandled error:", error.message);
  process.exit(1);
});

// Memory usage
const mem = process.memoryUsage();
console.log("Memory:", {
  heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + "MB",
  heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + "MB",
});
\`\`\`

## Async/Await in Node.js

\`\`\`typescript
// async-demo.ts
async function fetchData() {
  console.log("Start");
  
  // Simulate async operation
  const result = await new Promise<string>((resolve) => {
    setTimeout(() => resolve("Data loaded!"), 1000);
  });
  
  console.log(result);
  console.log("End");
}

fetchData();
console.log("This runs BEFORE 'Data loaded!' — async is non-blocking!");
\`\`\`

> 💡 In Node.js, \`process\` replaces \`window\` as the global context. It gives you access to environment, arguments, memory, and process lifecycle — things browsers don't expose.
`,

"778efd68-361f-4f91-b545-5407862762f6": `# How Node.js Modules Work

Modules are the building blocks of Node.js applications. Every file is a module with its own scope.

## Module Systems

\`\`\`
CommonJS (CJS) — The Original:
const express = require("express");
module.exports = { myFunction };

ES Modules (ESM) — The Standard:
import express from "express";
export { myFunction };
\`\`\`

## ESM vs CommonJS

| Feature | CommonJS | ES Modules |
|---|---|---|
| Syntax | require() / module.exports | import / export |
| Loading | Synchronous | Async (can be tree-shaken) |
| Usage | Legacy Node.js | Modern Node.js + TypeScript |
| File ext | .js, .cjs | .mjs, .js (with type: module) |
| This course | ❌ | ✅ We use ESM |

## How Module Resolution Works

\`\`\`
import { UserService } from "./services/user.service";

Node.js resolution order:
1. Check exact path: ./services/user.service.ts
2. Check with extensions: .ts, .js, .json
3. Check as directory: ./services/user.service/index.ts
4. Check node_modules: node_modules/user.service
5. Check parent node_modules: ../node_modules/user.service
\`\`\`

## Module Scope

\`\`\`typescript
// Each file has its OWN scope
// counter.ts
let count = 0; // Private to this module

export function increment() { return ++count; }
export function getCount() { return count; }

// app.ts
import { increment, getCount } from "./counter";
increment(); // 1
increment(); // 2 — state persists within module lifetime
\`\`\`

> 💡 Modules are cached after the first import. If two files import the same module, they share the same instance. This is why singletons work naturally in Node.js.
`,

"752d1352-f849-4113-9a02-fe5abdba4a03": `# Modules in Code — import, export, barrel files

Practical module patterns for organizing a Node.js project.

## Named vs Default Exports

\`\`\`typescript
// Named exports — prefer these (explicit, refactor-friendly)
// utils.ts
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Import specific functions
import { formatDate, slugify } from "./utils";
\`\`\`

\`\`\`typescript
// Default exports — use for main class/function per file
// UserService.ts
export default class UserService {
  async findById(id: string) { /* ... */ }
}

// Import with any name
import UserService from "./UserService";
\`\`\`

## Barrel Files (index.ts)

\`\`\`typescript
// services/user.service.ts
export class UserService { /* ... */ }

// services/project.service.ts
export class ProjectService { /* ... */ }

// services/task.service.ts
export class TaskService { /* ... */ }

// services/index.ts — barrel file re-exports everything
export { UserService } from "./user.service";
export { ProjectService } from "./project.service";
export { TaskService } from "./task.service";

// Now import from the folder:
import { UserService, ProjectService, TaskService } from "./services";
\`\`\`

## Type-Only Imports

\`\`\`typescript
// types.ts
export interface User { id: string; name: string; email: string; }
export interface Project { id: string; title: string; ownerId: string; }

// service.ts — import types separately (removed at compile time)
import type { User, Project } from "./types";
\`\`\`

> 💡 Barrel files (\`index.ts\`) let you import from a folder instead of individual files. But be careful — they can cause circular dependencies in large projects.
`,

"ab45dfb2-ef6b-420e-8d77-64266c7a8e43": `# Task: Create a Modular Calculator

Build a modular calculator using proper module patterns!

## Your Task

Create a calculator that's split across multiple modules, demonstrating imports, exports, and barrel files.

> 💡 **Hint:** Each operation should be a separate module, re-exported through a barrel file.

## Requirements

- Implement \`add(a, b)\`, \`subtract(a, b)\`, \`multiply(a, b)\`, \`divide(a, b)\` as separate named exports
- \`divide\` should throw an error for division by zero
- Implement \`calculate(expression)\` that parses a string like "5 + 3" and returns the result
- Support chained operations: \`calculateChain([5, "+", 3, "*", 2])\` → 16
- Implement \`history\` module that tracks all calculations with timestamps

## What You'll Practice

- Named exports and imports
- Module scope and state
- Error handling across module boundaries
`,

"a08caf33-6cae-4434-9d41-d1d8f6ae6f83": `# How the File System Works in Node.js

The \`fs\` module provides APIs to interact with the file system — reading, writing, watching, and streaming files.

## Three API Styles

\`\`\`typescript
import fs from "fs";
import { readFile } from "fs/promises"; // Promise-based (preferred)

// 1. Callback (original) — DON'T use this
fs.readFile("file.txt", "utf-8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 2. Promise-based (modern) — USE this
const data = await readFile("file.txt", "utf-8");
console.log(data);

// 3. Sync (blocking) — ONLY for scripts/CLIs
const dataSync = fs.readFileSync("file.txt", "utf-8");
\`\`\`

## Common Operations

| Operation | Method |
|---|---|
| Read file | readFile(path, encoding) |
| Write file | writeFile(path, content) |
| Append to file | appendFile(path, content) |
| Delete file | unlink(path) |
| Check exists | access(path) |
| Create dir | mkdir(path, { recursive: true }) |
| List dir | readdir(path) |
| File info | stat(path) |
| Copy file | copyFile(src, dest) |
| Rename/Move | rename(oldPath, newPath) |

## When to Use Each Style

\`\`\`
Callbacks → Never (legacy code only)
Promises  → Always in server code (non-blocking)
Sync      → CLI tools, config loading at startup
\`\`\`

> 💡 Always use \`fs/promises\` in server code. Sync methods block the entire event loop — one slow file read could freeze all other requests.
`,

"72380bb2-79f8-477b-8cf6-983db436102b": `# File System in Code — Read, Write, Stream

Complete file system examples for common patterns.

## Reading and Writing JSON

\`\`\`typescript
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface Config {
  port: number;
  dbUrl: string;
  logLevel: string;
}

async function loadConfig(filePath: string): Promise<Config> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function saveConfig(filePath: string, config: Config): Promise<void> {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(filePath, JSON.stringify(config, null, 2));
}
\`\`\`

## Streaming Large Files

\`\`\`typescript
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";

// Stream a large file (doesn't load entire file into memory)
async function compressFile(input: string, output: string) {
  await pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output)
  );
  console.log("Compressed:", input, "→", output);
}

// Read file line by line (memory efficient)
import { createInterface } from "readline";

async function processLines(filePath: string) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes("ERROR")) {
      console.log("Line " + lineCount + ":", line);
    }
  }
}
\`\`\`

> 💡 For files larger than ~50MB, always use streams. \`readFile\` loads the entire file into memory, while streams process it in chunks.
`,

"05d8fe0f-cd72-4de0-8a02-8d8a663c8deb": `# How Events & the EventEmitter Work

The EventEmitter is the foundation of Node.js — HTTP servers, streams, and most built-in modules extend it.

## Core Concept

\`\`\`
Pub/Sub Pattern:
  Publisher: emitter.emit("event", data)
  Subscriber: emitter.on("event", handler)

  emitter.on("order:created", notifyUser)
  emitter.on("order:created", updateInventory)
  emitter.on("order:created", sendReceipt)
  
  emitter.emit("order:created", orderData)
  // All three handlers fire!
\`\`\`

## Built-in EventEmitter Usage

\`\`\`typescript
import { EventEmitter } from "events";

// HTTP Server is an EventEmitter
const server = http.createServer();
server.on("request", (req, res) => { /* handle request */ });
server.on("error", (err) => { /* handle error */ });
server.on("listening", () => { console.log("Server started"); });

// Streams are EventEmitters
const stream = fs.createReadStream("file.txt");
stream.on("data", (chunk) => { /* process chunk */ });
stream.on("end", () => { /* done */ });
stream.on("error", (err) => { /* handle error */ });
\`\`\`

## EventEmitter Methods

| Method | Description |
|---|---|
| .on(event, fn) | Add listener (persistent) |
| .once(event, fn) | Add listener (fires once) |
| .emit(event, ...args) | Trigger event |
| .off(event, fn) | Remove specific listener |
| .removeAllListeners(event) | Remove all listeners for event |
| .listenerCount(event) | Count listeners |

> 💡 Always add error listeners! An unhandled 'error' event crashes the process. Use \`emitter.on("error", handler)\` on every emitter.
`,

"7fd1b909-9dff-4371-ae9f-c78e5de0e678": `# EventEmitter in Code — Custom Events

Building a custom event system for application-level events.

## Custom Event Bus

\`\`\`typescript
import { EventEmitter } from "events";

// Type-safe event bus
interface AppEvents {
  "user:registered": { userId: string; email: string };
  "task:created": { taskId: string; projectId: string; assigneeId: string };
  "task:completed": { taskId: string; completedBy: string };
}

class TypedEventEmitter<T extends Record<string, any>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    this.emitter.on(event as string, handler);
    return this;
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    this.emitter.emit(event as string, data);
    return this;
  }

  off<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    this.emitter.off(event as string, handler);
    return this;
  }
}

// Usage
const events = new TypedEventEmitter<AppEvents>();

// Register handlers
events.on("user:registered", async ({ userId, email }) => {
  console.log("Send welcome email to:", email);
});

events.on("task:completed", async ({ taskId, completedBy }) => {
  console.log("Task " + taskId + " completed by " + completedBy);
});

// Emit events
events.emit("user:registered", { userId: "u1", email: "test@example.com" });
events.emit("task:completed", { taskId: "t1", completedBy: "u1" });
\`\`\`

## Error Handling in Events

\`\`\`typescript
// Always handle errors
events.on("error", (err) => {
  console.error("Event error:", err);
});

// Max listeners warning (default: 10)
events.emitter.setMaxListeners(20);
\`\`\`

> 💡 A typed event emitter gives you autocomplete and type checking for event names and payloads — catching typos and wrong data shapes at compile time.
`,

"5243e7d8-6fe1-419e-b990-ad46b3b57a71": `# How Built-in Modules Work — path, os, url

Node.js ships with many useful modules that require no installation.

## path Module

\`\`\`typescript
import path from "path";

path.join("src", "controllers", "auth.ts");
// → "src/controllers/auth.ts" (Unix)
// → "src\\\\controllers\\\\auth.ts" (Windows)

path.resolve("src", "controllers");
// → "/Users/you/project/src/controllers" (absolute)

path.dirname("/app/src/index.ts");    // → "/app/src"
path.basename("/app/src/index.ts");   // → "index.ts"
path.extname("/app/src/index.ts");    // → ".ts"

path.parse("/app/src/index.ts");
// → { root: "/", dir: "/app/src", base: "index.ts", ext: ".ts", name: "index" }
\`\`\`

## os Module

\`\`\`typescript
import os from "os";

os.platform();   // "darwin" (macOS), "linux", "win32"
os.arch();       // "x64", "arm64"
os.cpus().length; // Number of CPU cores
os.totalmem();   // Total RAM in bytes
os.freemem();    // Free RAM
os.homedir();    // "/Users/you"
os.tmpdir();     // "/tmp"
os.hostname();   // "your-machine.local"
\`\`\`

## url & querystring

\`\`\`typescript
const url = new URL("https://api.example.com/users?page=2&limit=10");
url.pathname;     // "/users"
url.searchParams.get("page");  // "2"
url.searchParams.set("sort", "name");
url.toString();   // "https://api.example.com/users?page=2&limit=10&sort=name"
\`\`\`

> 💡 Always use \`path.join()\` instead of string concatenation for file paths. It handles OS-specific separators automatically — your code works on macOS, Linux, AND Windows.
`,

"cfdfb1f7-fd29-490a-b268-6033e8684fad": `# Built-in Modules in Code

Practical examples combining multiple built-in modules.

## Project Initializer Script

\`\`\`typescript
import { mkdir, writeFile, access } from "fs/promises";
import path from "path";
import os from "os";

interface ProjectConfig {
  name: string;
  description: string;
  author: string;
}

async function initProject(config: ProjectConfig) {
  const projectDir = path.join(process.cwd(), config.name);

  // Check if directory exists
  try {
    await access(projectDir);
    throw new Error("Directory already exists: " + config.name);
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
  }

  // Create directory structure
  const dirs = ["src", "src/controllers", "src/services", "src/types", "tests"];
  for (const dir of dirs) {
    await mkdir(path.join(projectDir, dir), { recursive: true });
  }

  // Generate package.json
  const packageJson = {
    name: config.name,
    version: "1.0.0",
    description: config.description,
    author: config.author,
    type: "module",
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
      test: "vitest",
    },
  };
  await writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Generate main file
  const mainContent = [
    'console.log("' + config.name + ' started on", process.platform);',
    'console.log("Node", process.version);',
    'console.log("CPUs:", ' + os.cpus().length + ");",
  ].join("\\n");
  await writeFile(path.join(projectDir, "src/index.ts"), mainContent);

  console.log("Project created:", projectDir);
  console.log("  Directories:", dirs.join(", "));
}

// Run it
initProject({
  name: "taskflow-api",
  description: "Project management REST API",
  author: os.userInfo().username,
});
\`\`\`

> 💡 The \`ENOENT\` error code means "Error NO ENTry" — the file or directory doesn't exist. Checking for this specific code lets you distinguish "not found" from other errors.
`,

// ── Module 1: TypeScript for Backend Development (9 lessons) ──
"6ff99001-db9c-45e4-baa5-e26f92025071": `# Why TypeScript for Backend

TypeScript adds static types to JavaScript, catching bugs at compile time instead of in production.

## The Problem TypeScript Solves

\`\`\`typescript
// JavaScript — bugs hide until runtime
function createUser(data) {
  // What shape is data? No way to know.
  // data.nmae — typo! No error until runtime.
  // data.age — is it a number or string? Who knows.
  return db.insert(data);
}

// TypeScript — bugs caught at compile time
interface CreateUserInput {
  name: string;
  email: string;
  age: number;
}

function createUser(data: CreateUserInput) {
  // data.nmae ← ❌ Compile error: "nmae" doesn't exist
  // data.age is guaranteed to be a number ✓
  return db.insert(data);
}
\`\`\`

## Backend-Specific Benefits

| Benefit | Example |
|---|---|
| API contract enforcement | Request/response types match |
| Database type safety | Prisma generates types from schema |
| Refactoring confidence | Rename a field → see all affected files |
| Better autocomplete | IDE knows every property and method |
| Self-documenting | Types ARE the documentation |

## TypeScript for Node.js Stack

\`\`\`
Your Code (.ts) → TypeScript Compiler → JavaScript (.js) → Node.js Runtime
                  (type checking)       (types removed)    (runs the code)
\`\`\`

> 💡 TypeScript doesn't make your code run differently — it only adds compile-time checks. The runtime behavior is identical to JavaScript.
`,

"17f76326-d9b9-4bce-b570-34e7f146e340": `# TypeScript Setup in Code — tsconfig for Node

Setting up TypeScript for a Node.js backend project.

## tsconfig.json for Backend

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
\`\`\`

## Key Settings Explained

| Setting | Value | Why |
|---|---|---|
| target | ES2022 | Modern JS features (top-level await) |
| module | ESNext | ES modules (import/export) |
| strict | true | Enable all strict checks |
| outDir | dist | Compiled JS output directory |
| sourceMap | true | Debug TypeScript in production errors |
| paths | @/* | Import aliases: @/services/user |

## Development Tooling

\`\`\`json
// package.json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  }
}
\`\`\`

\`\`\`bash
# tsx — TypeScript execution (no compilation step)
npm install -D tsx

# Run directly during development
npx tsx src/index.ts

# Watch mode — auto-restart on changes
npx tsx watch src/index.ts
\`\`\`

> 💡 Use \`tsx\` for development (instant execution, no build step) and \`tsc\` + \`node\` for production (compiled, faster startup).
`,

"1a1a4201-cd59-4342-86f1-cfbcbdd2f36f": `# How TypeScript Types Work for APIs

TypeScript types for backend APIs ensure your request handlers, services, and database queries are all type-safe.

## Request & Response Types

\`\`\`typescript
// types/api.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Usage
type UserResponse = ApiResponse<User>;
type UsersResponse = PaginatedResponse<User>;
\`\`\`

## Request Body Types

\`\`\`typescript
// types/user.ts
interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

interface UpdateUserBody {
  name?: string;
  email?: string;
  bio?: string;
}

// Query params
interface ListUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
  sort?: "name" | "createdAt" | "reputation";
  order?: "asc" | "desc";
}
\`\`\`

## Generic Handler Type

\`\`\`typescript
import { Request, Response } from "express";

// Type-safe request handler
type TypedHandler<Body = any, Query = any, Params = any> = (
  req: Request<Params, any, Body, Query>,
  res: Response
) => Promise<void>;

// Usage
const createUser: TypedHandler<CreateUserBody> = async (req, res) => {
  const { name, email, password } = req.body; // Fully typed!
  // ...
};
\`\`\`

> 💡 Generic types like \`ApiResponse<T>\` let you define the response shape once and reuse it everywhere — \`ApiResponse<User>\`, \`ApiResponse<Project>\`, \`ApiResponse<Task>\`.
`,

"ed18f576-c2bc-4cfd-a0c4-09feb2913594": `# TypeScript Types in Code — API Patterns

Complete type definitions for a real API project.

## Domain Types

\`\`\`typescript
// types/models.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: "active" | "archived" | "completed";
  ownerId: string;
  members: ProjectMember[];
  createdAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
  createdAt: Date;
}
\`\`\`

## Error Types

\`\`\`typescript
// types/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, resource + " with id " + id + " not found", "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(public errors: { field: string; message: string }[]) {
    super(400, "Validation failed", "VALIDATION_ERROR");
  }
}
\`\`\`

> 💡 Custom error classes with status codes let your error handler middleware automatically set the right HTTP status — no manual \`res.status()\` needed.
`,

"93f84f70-16b6-409d-9cb0-e7bf4d2d1fa6": `# Task: Type the TaskFlow Data Models

Define the complete type system for TaskFlow!

## Your Task

Create TypeScript types that model the entire TaskFlow domain — users, projects, tasks, and their relationships.

> 💡 **Hint:** Start with the entity types, then derive input/output types using utility types like Pick, Omit, and Partial.

## Requirements

- Define \`User\` type with: id, name, email, passwordHash, role (user|admin), avatar?, bio?, createdAt, updatedAt
- Define \`Project\` type with: id, title, description, status (active|archived|completed), ownerId, createdAt
- Define \`Task\` type with: id, title, description?, status (todo|in_progress|review|done), priority (low|medium|high|urgent), projectId, assigneeId?, dueDate?, tags (string[]), createdAt
- Derive \`CreateUserInput\` from User (omit id, dates, hash) + add password field
- Derive \`UpdateUserInput\` as Partial of editable User fields
- Derive \`PublicUser\` that excludes passwordHash
- Create \`ApiResponse<T>\` and \`PaginatedResponse<T>\` generic types

## What You'll Practice

- Interface composition
- Utility types (Pick, Omit, Partial)
- Generic type patterns
`,

"3889fd67-ea13-4e48-9ecb-beed25482346": `# How Utility Types Help Backend Code

TypeScript utility types transform existing types — creating variations without duplication.

## The Most Useful Utility Types

\`\`\`typescript
// Original type
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: Date;
}

// Partial<T> — all properties optional
type UpdateUserInput = Partial<Pick<User, "name" | "email" | "role">>;
// { name?: string; email?: string; role?: "user" | "admin"; }

// Omit<T, K> — remove properties
type PublicUser = Omit<User, "passwordHash">;
// { id, name, email, role, createdAt } — no passwordHash!

// Pick<T, K> — select properties
type UserCredentials = Pick<User, "email" | "passwordHash">;
// { email: string; passwordHash: string; }

// Required<T> — all properties required
type CompleteProfile = Required<Pick<User, "name" | "email" | "role">>;
\`\`\`

## Record Type for Maps

\`\`\`typescript
// Map of permission names to boolean
type Permissions = Record<"read" | "write" | "delete" | "admin", boolean>;

// Map of status to configuration
const statusConfig: Record<Task["status"], { label: string; color: string }> = {
  todo: { label: "To Do", color: "gray" },
  in_progress: { label: "In Progress", color: "blue" },
  review: { label: "In Review", color: "yellow" },
  done: { label: "Done", color: "green" },
};
\`\`\`

## Discriminated Unions for Events

\`\`\`typescript
type AppEvent =
  | { type: "user:created"; payload: { userId: string } }
  | { type: "task:assigned"; payload: { taskId: string; assigneeId: string } }
  | { type: "project:archived"; payload: { projectId: string } };

function handleEvent(event: AppEvent) {
  switch (event.type) {
    case "user:created":
      // TypeScript knows payload is { userId: string } here
      console.log("User created:", event.payload.userId);
      break;
    case "task:assigned":
      // Knows payload is { taskId, assigneeId }
      console.log("Task assigned:", event.payload.taskId);
      break;
  }
}
\`\`\`

> 💡 Discriminated unions (tagged unions) let TypeScript narrow the payload type based on the \`type\` field. This is the safest pattern for handling multiple event types.
`,

"9a070f11-9bdc-476c-b125-61f205da67ac": `# Utility Types in Code — DTOs & Transformations

Using utility types to create Data Transfer Objects for your API.

## DTO Pattern

\`\`\`typescript
// models/user.ts — Database model (full)
interface UserModel {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  avatar: string | null;
  bio: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// dto/user.dto.ts — API-facing types
export type UserDTO = Omit<UserModel, "passwordHash">;

export type CreateUserDTO = Pick<UserModel, "name" | "email"> & {
  password: string; // raw password, not hash
};

export type UpdateUserDTO = Partial<Pick<UserModel, "name" | "avatar" | "bio">>;

export type LoginDTO = Pick<UserModel, "email"> & {
  password: string;
};

// Transform function
export function toUserDTO(user: UserModel): UserDTO {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

// Usage in controller
const user = await userService.findById(id);
res.json({ success: true, data: toUserDTO(user) });
// passwordHash is NEVER sent to the client
\`\`\`

## Generic Service Type

\`\`\`typescript
// A generic CRUD service interface
interface CrudService<T, CreateDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findMany(query: QueryOptions): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implement for each model
class UserService implements CrudService<UserDTO, CreateUserDTO, UpdateUserDTO> {
  async findById(id: string): Promise<UserDTO | null> { /* ... */ }
  async findMany(query: QueryOptions): Promise<UserDTO[]> { /* ... */ }
  async create(data: CreateUserDTO): Promise<UserDTO> { /* ... */ }
  async update(id: string, data: UpdateUserDTO): Promise<UserDTO> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
}
\`\`\`

> 💡 DTOs act as a security boundary — they ensure sensitive fields (passwords, internal IDs) never accidentally leak to the API response.
`,

"c70a5828-cd48-4f7c-99d1-00348f2e7f3a": `# How ts-node-dev & Build Tooling Work

Development and production require different tooling. Here's the complete Node.js TypeScript build pipeline.

## Development vs Production

\`\`\`
Development:
  Source (.ts) → tsx/ts-node-dev → Execute directly (no build step)
  ✅ Fast iteration
  ✅ Auto-restart on changes
  ❌ Slower startup (compilation on each run)

Production:
  Source (.ts) → tsc → JavaScript (.js) → node → Execute
  ✅ Fast startup (pre-compiled)
  ✅ Smaller deployment (no TS compiler needed)
  ✅ Source maps for debugging
\`\`\`

## Tool Comparison

| Tool | Purpose | Speed |
|---|---|---|
| tsx | Execute TS directly, watch mode | Fast (esbuild) |
| ts-node | Execute TS directly | Slow (tsc) |
| ts-node-dev | ts-node + auto-restart | Slow |
| tsc | Compile to JS (production) | N/A |
| esbuild | Bundle + compile (advanced) | Very fast |

## Build Script

\`\`\`json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/index.js",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  }
}
\`\`\`

## Path Aliases in Production

\`\`\`bash
# Problem: tsc doesn't resolve path aliases in output
# Fix: use tsc-alias or tsconfig-paths

npm install -D tsc-alias

# Build command becomes:
tsc && tsc-alias
# tsc compiles TS → JS, tsc-alias rewrites @/ imports to relative paths
\`\`\`

> 💡 \`tsx\` uses esbuild under the hood, making it 10-100x faster than \`ts-node\` for development. Always use \`tsx watch\` for local development.
`,

"09b1e8b6-69a7-4d77-a18f-3097ee1fbd59": `# Task: Set Up the TaskFlow Project with TypeScript

Initialize the TaskFlow project from scratch!

## Your Task

Set up a complete TypeScript Node.js project with proper configuration, scripts, and folder structure.

> 💡 **Hint:** A well-organized project structure saves hours of refactoring later. Plan the directories based on the features you'll build.

## Requirements

- Initialize a Node.js project with \`type: "module"\` in package.json
- Configure tsconfig.json with strict mode, ES2022 target, path aliases (@/*)
- Create the folder structure: src/ (controllers, services, types, middleware, routes, lib)
- Implement a main entry point (src/index.ts) that logs startup info
- Create a typed config module that reads from environment variables with defaults
- Set up dev (tsx watch), build (tsc), and start (node dist) scripts
- Add a .env.example file documenting all expected environment variables

## What You'll Practice

- Project initialization and configuration
- TypeScript strict mode setup
- Environment-based configuration
`,

// ── Module 2: HTTP & Building a Server from Scratch (10 lessons) ──
"07f4770b-9f26-4ce1-ac2a-ddcd404c6df8": `# How HTTP Works

HTTP (Hypertext Transfer Protocol) is the foundation of all web communication. Understanding it is essential for building APIs.

## The Request-Response Cycle

\`\`\`
Client (Browser/App)              Server (Node.js)
       │                                │
       │── HTTP Request ──────────────▶│
       │   Method: POST                 │
       │   URL: /api/users              │
       │   Headers: Content-Type: JSON  │
       │   Body: { name: "Alice" }      │
       │                                │
       │◀─── HTTP Response ────────────│
       │   Status: 201 Created          │
       │   Headers: Content-Type: JSON  │
       │   Body: { id: "1", name: ... } │
\`\`\`

## HTTP Methods

| Method | Purpose | Body? | Idempotent? |
|---|---|---|---|
| GET | Read data | No | Yes |
| POST | Create data | Yes | No |
| PUT | Replace data | Yes | Yes |
| PATCH | Partial update | Yes | Yes |
| DELETE | Remove data | Optional | Yes |

## HTTP Status Codes

| Range | Category | Common Codes |
|---|---|---|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved, 304 Not Modified |
| 4xx | Client Error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| 5xx | Server Error | 500 Internal Error, 503 Service Unavailable |

> 💡 Idempotent means sending the same request multiple times produces the same result. PUT is idempotent (same data replaces), POST is not (creates duplicates).
`,

"1f54c575-2ba8-47a3-b2e0-846c75ce2c17": `# HTTP Server in Code — Node's http Module

Building an HTTP server from scratch using only Node.js built-in modules.

## Basic Server

\`\`\`typescript
import http from "http";

const server = http.createServer((req, res) => {
  // Request info
  console.log(req.method, req.url);
  console.log("Headers:", req.headers);

  // Set response headers
  res.setHeader("Content-Type", "application/json");

  // Route handling
  if (req.method === "GET" && req.url === "/") {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Hello World!" }));
  } else if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
\`\`\`

## Reading Request Body

\`\`\`typescript
async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString();
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on("error", reject);
  });
}

// Usage
if (req.method === "POST" && req.url === "/api/users") {
  const body = await parseBody(req);
  console.log("Received:", body);
  res.statusCode = 201;
  res.end(JSON.stringify({ id: "1", ...body }));
}
\`\`\`

> 💡 The raw Node.js HTTP module requires manual body parsing, routing, and header management. This is why frameworks like Express exist — they handle all this boilerplate.
`,

"78561ebf-e2b6-4eb0-af60-8f2754c328d4": `# How Routing Works at a Low Level

Before Express, you need to understand how routing works under the hood — it's just URL matching and method checking.

## URL Parsing

\`\`\`
URL: /api/projects/abc123/tasks?status=active&sort=dueDate

pathname: /api/projects/abc123/tasks
params:   { projectId: "abc123" }
query:    { status: "active", sort: "dueDate" }
\`\`\`

## Manual Router

\`\`\`typescript
type Handler = (req: http.IncomingMessage, res: http.ServerResponse, params: Record<string, string>) => void;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

class Router {
  private routes: Route[] = [];

  add(method: string, path: string, handler: Handler) {
    // Convert /projects/:id/tasks to regex
    const paramNames: string[] = [];
    const pattern = path.replace(/:([a-zA-Z]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    this.routes.push({
      method,
      pattern: new RegExp("^" + pattern + "$"),
      paramNames,
      handler,
    });
  }

  resolve(method: string, url: string): { handler: Handler; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = url.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { handler: route.handler, params };
      }
    }
    return null;
  }
}
\`\`\`

> 💡 Express routing works exactly like this under the hood — converting path patterns to regexes and matching against incoming URLs. Understanding this makes Express intuitive.
`,

"07afa3df-e720-4f58-8d2a-1fed9aa1ef7c": `# Basic Router in Code — Without Express

Complete implementation of a basic HTTP router using only Node.js builtins.

## Full Router Implementation

\`\`\`typescript
import http from "http";

type RouteHandler = (
  req: http.IncomingMessage & { params: Record<string, string>; query: Record<string, string>; body: any },
  res: http.ServerResponse
) => Promise<void> | void;

interface Route {
  method: string;
  regex: RegExp;
  keys: string[];
  handler: RouteHandler;
}

const routes: Route[] = [];

function addRoute(method: string, path: string, handler: RouteHandler) {
  const keys: string[] = [];
  const regex = new RegExp(
    "^" + path.replace(/:([\\w]+)/g, (_, key) => { keys.push(key); return "([\\\\w-]+)"; }) + "$"
  );
  routes.push({ method, regex, keys, handler });
}

// Convenience methods
const get = (path: string, handler: RouteHandler) => addRoute("GET", path, handler);
const post = (path: string, handler: RouteHandler) => addRoute("POST", path, handler);
const put = (path: string, handler: RouteHandler) => addRoute("PUT", path, handler);
const del = (path: string, handler: RouteHandler) => addRoute("DELETE", path, handler);

// Define routes
get("/api/projects", (req, res) => {
  res.end(JSON.stringify([{ id: "1", title: "TaskFlow" }]));
});

get("/api/projects/:id", (req, res) => {
  res.end(JSON.stringify({ id: req.params.id, title: "Project " + req.params.id }));
});

post("/api/projects", async (req, res) => {
  res.statusCode = 201;
  res.end(JSON.stringify({ id: "new", ...req.body }));
});

// Server
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const url = new URL(req.url || "/", "http://localhost");

  for (const route of routes) {
    if (route.method !== req.method) continue;
    const match = url.pathname.match(route.regex);
    if (match) {
      const params: Record<string, string> = {};
      route.keys.forEach((key, i) => { params[key] = match[i + 1]; });
      const query = Object.fromEntries(url.searchParams);
      Object.assign(req, { params, query, body: await parseBody(req) });
      return route.handler(req as any, res);
    }
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, () => console.log("Server on :3000"));
\`\`\`

> 💡 Building a router from scratch shows you that Express is not magic — it's an organized version of regex matching and request augmentation.
`,

"0cb408c4-0eb3-40d1-8165-bef84f2d77d6": `# Task: Build a Todo API with Raw Node.js

Build a complete CRUD API without any framework!

## Your Task

Create a Todo API using only Node.js built-in modules (http, url) — no Express, no dependencies.

> 💡 **Hint:** You'll need to implement routing, body parsing, and response helpers manually.

## Requirements

- GET /api/todos — list all todos (support ?status=completed filter)
- POST /api/todos — create a todo (body: { title, description? })
- GET /api/todos/:id — get a single todo
- PATCH /api/todos/:id — update a todo (partial body)
- DELETE /api/todos/:id — delete a todo
- Return proper status codes: 200, 201, 204, 400, 404
- Return JSON responses with Content-Type header
- Store todos in memory (array)
- Generate UUIDs for IDs

## What You'll Practice

- Raw HTTP server creation
- URL parsing and routing
- Request body parsing
- Proper REST conventions
`,

"ff4b40ca-4340-40bf-a8bb-8a6fc05785c2": `# How JSON APIs Work

JSON (JavaScript Object Notation) is the standard data format for REST APIs. Understanding its conventions is essential.

## JSON API Conventions

\`\`\`typescript
// Success response
{
  "success": true,
  "data": { "id": "1", "title": "TaskFlow" },
  "message": "Project created successfully"
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "name", "message": "Name is required" }
    ]
  }
}

// List response with pagination
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
\`\`\`

## Content-Type & Accept Headers

\`\`\`
Request:
  Content-Type: application/json  ← "I'm sending JSON"
  Accept: application/json        ← "I want JSON back"

Response:
  Content-Type: application/json  ← "Here's JSON"
\`\`\`

## JSON Serialization Gotchas

\`\`\`typescript
// Dates become strings
JSON.stringify(new Date())  // "2024-03-15T10:30:00.000Z"

// undefined is removed
JSON.stringify({ a: 1, b: undefined })  // {"a":1}

// BigInt throws
JSON.stringify(BigInt(9999))  // TypeError!

// Circular references throw
const obj: any = {};
obj.self = obj;
JSON.stringify(obj)  // TypeError: circular structure
\`\`\`

> 💡 Always return consistent response shapes. Frontend developers can rely on \`response.success\` to check if the request worked, regardless of which endpoint they called.
`,

"94a4ec9b-db99-4822-bc66-56402bd7e24a": `# JSON API Patterns in Code

Building consistent JSON response helpers for your API.

## Response Helper Functions

\`\`\`typescript
import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string) {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function sendError(res: Response, statusCode: number, message: string, code?: string, details?: any) {
  res.status(statusCode).json({
    success: false,
    error: {
      code: code || "ERROR",
      message,
      ...(details && { details }),
    },
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; pageSize: number; total: number }
) {
  res.status(200).json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.pageSize),
    },
  });
}

// Usage in controller
export async function getProjects(req: Request, res: Response) {
  const projects = await projectService.findMany(req.query);
  sendPaginated(res, projects, { page: 1, pageSize: 20, total: 156 });
}

export async function createProject(req: Request, res: Response) {
  const project = await projectService.create(req.body);
  sendSuccess(res, project, 201, "Project created");
}
\`\`\`

> 💡 Response helpers enforce a consistent API contract. Every endpoint returns the same shape, making your API predictable and easy to consume.
`,

"b21e8969-2373-4950-8444-4d8863651cbd": `# How Environment Variables Work

Environment variables configure your app without hardcoding values — different values for development, testing, and production.

## Why Environment Variables?

\`\`\`
❌ Hardcoded values:
const DB_URL = "postgresql://admin:password123@localhost:5432/taskflow";
// Password in source code!
// Can't change without code change!
// Same value in dev and prod!

✅ Environment variables:
const DB_URL = process.env.DATABASE_URL;
// Password stays secret
// Change without redeploying
// Different values per environment
\`\`\`

## .env Files

\`\`\`bash
# .env.development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/taskflow_dev
JWT_SECRET=dev-secret-not-secure
LOG_LEVEL=debug

# .env.production
PORT=8080
DATABASE_URL=postgresql://prod-host:5432/taskflow
JWT_SECRET=super-secure-random-string-256-bits
LOG_LEVEL=warn

# .env.test
PORT=3001
DATABASE_URL=postgresql://localhost:5432/taskflow_test
JWT_SECRET=test-secret
LOG_LEVEL=silent
\`\`\`

## Loading with dotenv

\`\`\`typescript
import dotenv from "dotenv";

// Load .env file into process.env
dotenv.config(); // Reads .env by default

// Or specify path
dotenv.config({ path: ".env." + process.env.NODE_ENV });
\`\`\`

## Security Rules

| Rule | Example |
|---|---|
| Never commit .env files | Add .env to .gitignore |
| DO commit .env.example | Template with empty values |
| Different secrets per env | Dev JWT_SECRET ≠ Prod JWT_SECRET |
| Validate at startup | Crash immediately if required vars missing |

> 💡 \`.env\` files should NEVER be committed to git. Instead, commit a \`.env.example\` with empty values as documentation.
`,

"b34d9d83-cd92-4be7-a37b-b342c3600e85": `# Environment Variables in Code

Building a robust configuration module with validation.

## Type-Safe Config Module

\`\`\`typescript
// src/config.ts
import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing required environment variable: " + name);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  port: parseInt(optionalEnv("PORT", "3000"), 10),
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  jwt: {
    secret: requireEnv("JWT_SECRET"),
    expiresIn: optionalEnv("JWT_EXPIRES_IN", "7d"),
  },
  cors: {
    origin: optionalEnv("CORS_ORIGIN", "http://localhost:5173"),
  },
  redis: {
    url: optionalEnv("REDIS_URL", "redis://localhost:6379"),
  },
  email: {
    host: optionalEnv("SMTP_HOST", "smtp.mailtrap.io"),
    port: parseInt(optionalEnv("SMTP_PORT", "587"), 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  isDev: optionalEnv("NODE_ENV", "development") === "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;

// Validate at startup
console.log("Config loaded for:", config.nodeEnv);
console.log("  Port:", config.port);
console.log("  Database:", config.database.url.substring(0, 20) + "...");
\`\`\`

## .env.example

\`\`\`bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

# Auth
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
\`\`\`

> 💡 The \`requireEnv\` function crashes the app immediately at startup if a critical variable is missing — much better than failing silently later during a database query.
`,

"58bb82f0-ebf0-40d0-8316-33cf220295ab": `# Task: Add Config Management to TaskFlow

Build a robust configuration system!

## Your Task

Create a configuration module that validates environment variables, provides typed access, and fails fast on missing required values.

> 💡 **Hint:** Validate ALL environment variables at startup, not when they're first used. List all missing vars in one error.

## Requirements

- Create a config module that reads all env vars at import time
- Separate required vs optional env vars (optional has defaults)
- Validate types: PORT must be a valid integer, DATABASE_URL must start with postgresql://
- Create a \`validateConfig()\` function that checks all vars and returns \`{ valid, errors }\` with ALL missing/invalid vars (not just the first one)
- Support three environments: development (defaults), production (strict), test (isolated)
- Export a frozen config object (Object.freeze)
- Create .env.example with all supported variables documented

## What You'll Practice

- Environment-based configuration
- Startup validation patterns
- Type-safe config objects
`,
};

async function main() {
  console.log("Updating Node.js Express — Modules 0-2...");
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
