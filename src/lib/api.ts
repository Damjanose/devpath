// API helper for Express backend
import { supabase } from "@/integrations/supabase/client";

function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    return "/api";
  }

  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_BASE = getApiBase();

export interface ApiCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  difficulty: string;
  pointsReward: number;
  isPublished: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { modules: number; enrollments: number };
}

export interface ApiModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  lessons: ApiLesson[];
}

export interface ApiLesson {
  id: string;
  moduleId: string;
  title: string;
  content: string | null;
  contentType: string;
  pointsReward: number;
  sortOrder: number;
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCourseDetail extends ApiCourse {
  modules: ApiModule[];
}

// Convert camelCase API response to snake_case to match existing frontend types
function toSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== "object") return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(value);
  }
  return result;
}

export async function fetchCourses(): Promise<Record<string, unknown>[]> {
  // Try Supabase first
  const { data: sbCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (sbCourses && sbCourses.length > 0) {
    return sbCourses as unknown as Record<string, unknown>[];
  }

  // Fallback to Express API (data may live in local Postgres)
  const res = await fetch(`${API_BASE}/courses`);
  if (!res.ok) return [];
  const json = await res.json();
  const courses = json.data || json;
  return (Array.isArray(courses) ? courses : []).map((c: unknown) => toSnakeCase(c)) as Record<string, unknown>[];
}

export async function fetchCourse(id: string): Promise<Record<string, unknown> | null> {
  // Try Supabase first
  const { data } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("id", id)
    .maybeSingle();

  if (data) {
    const normalizedModules = (data.modules || []).map((module: Record<string, unknown>) => ({
      ...module,
      lessons: [...((module.lessons as unknown[]) || [])].sort(
        (a, b) => ((a as Record<string, number>).sort_order || 0) - ((b as Record<string, number>).sort_order || 0)
      ),
    }));
    normalizedModules.sort(
      (a, b) => ((a as unknown as Record<string, number>).sort_order || 0) - ((b as unknown as Record<string, number>).sort_order || 0)
    );
    return { ...data, modules: normalizedModules } as unknown as Record<string, unknown>;
  }

  // Fallback to Express API
  const res = await fetch(`${API_BASE}/courses/${id}`);
  if (!res.ok) return null;
  const json = await res.json();
  return toSnakeCase(json.data || json) as Record<string, unknown>;
}

export async function fetchLesson(id: string): Promise<Record<string, unknown> | null> {
  // Try Supabase first
  const { data } = await supabase
    .from("lessons")
    .select("*, module:modules(id, title, course_id)")
    .eq("id", id)
    .maybeSingle();

  if (data) return data as unknown as Record<string, unknown>;

  // Fallback to Express API
  const res = await fetch(`${API_BASE}/lessons/${id}`);
  if (!res.ok) return null;
  const json = await res.json();
  return toSnakeCase(json.data || json) as Record<string, unknown>;
}

export async function enrollCourse(courseId: string, email: string): Promise<Record<string, unknown> | null> {
  // Get user by email from Supabase auth — look up in profiles via user table
  // Use the Express API as it handles user creation for guests
  const res = await fetch(`${API_BASE}/enrollments/guest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courseId, email }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Failed to enroll");
  }
  const json = await res.json();
  return toSnakeCase(json.data) as Record<string, unknown>;
}

export async function fetchMyEnrollments(): Promise<Record<string, unknown>[]> {
  // Use Express API — enrollment data lives in local Postgres
  const res = await fetch(`${API_BASE}/enrollments/my`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  const json = await res.json();
  const enrollments = json.data || json;
  return (Array.isArray(enrollments) ? enrollments : []).map((e: unknown) => toSnakeCase(e)) as Record<string, unknown>[];
}

export async function fetchEnrollmentsByEmail(email: string): Promise<Record<string, unknown>[]> {
  // Use Express API — enrollment data lives in local Postgres
  const res = await fetch(`${API_BASE}/enrollments/by-email?email=${encodeURIComponent(email)}`);
  if (!res.ok) return [];
  const json = await res.json();
  const enrollments = json.data || json;
  return (Array.isArray(enrollments) ? enrollments : []).map((e: unknown) => toSnakeCase(e)) as Record<string, unknown>[];
}

export async function fetchCourseProgressByEmail(email: string, courseId: string): Promise<{ completed_lesson_ids: string[]; progress_percentage: number }> {
  // Use Express API — progress data lives in local Postgres
  const res = await fetch(`${API_BASE}/enrollments/progress-by-email?email=${encodeURIComponent(email)}&courseId=${encodeURIComponent(courseId)}`);
  if (!res.ok) return { completed_lesson_ids: [], progress_percentage: 0 };
  const json = await res.json();
  const d = json.data || json;
  return {
    completed_lesson_ids: d.completedLessonIds || d.completed_lesson_ids || [],
    progress_percentage: Number(d.progressPercentage ?? d.progress_percentage ?? 0),
  };
}

export async function completeLessonByEmail(lessonId: string, email: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${API_BASE}/lessons/${lessonId}/complete-by-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to complete lesson");
  }

  const json = await res.json();
  return toSnakeCase(json.data) as Record<string, unknown>;
}
