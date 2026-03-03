// API helper for Express backend
import { supabase } from "@/integrations/supabase/client";

const API_BASE = "/api";

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
  const res = await fetch(`${API_BASE}/courses`);
  if (!res.ok) return [];
  const json = await res.json();
  const courses = json.data || [];
  return courses.map(toSnakeCase) as Record<string, unknown>[];
}

export async function fetchCourse(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${API_BASE}/courses/${id}`);
  if (res.ok) {
    const json = await res.json();
    return toSnakeCase(json.data) as Record<string, unknown>;
  }

  const { data } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const normalizedModules = (data.modules || []).map((module) => ({
    ...module,
    lessons: [...(module.lessons || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  }));

  normalizedModules.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return {
    ...data,
    modules: normalizedModules,
  } as unknown as Record<string, unknown>;
}

export async function fetchLesson(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${API_BASE}/lessons/${id}`);
  if (!res.ok) return null;
  const json = await res.json();
  return toSnakeCase(json.data) as Record<string, unknown>;
}

export async function enrollCourse(courseId: string, email: string): Promise<Record<string, unknown> | null> {
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
  const res = await fetch(`${API_BASE}/enrollments/my`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  const json = await res.json();
  const enrollments = json.data || [];
  return enrollments.map(toSnakeCase) as Record<string, unknown>[];
}

export async function fetchEnrollmentsByEmail(email: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${API_BASE}/enrollments/by-email?email=${encodeURIComponent(email)}`);
  if (!res.ok) return [];
  const json = await res.json();
  const enrollments = json.data || [];
  return enrollments.map(toSnakeCase) as Record<string, unknown>[];
}
