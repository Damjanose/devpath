import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function courseProgressQueryKey(userId: string, courseId: string) {
  return ["courseProgress", userId, courseId] as const;
}

async function fetchCourseProgress(
  userId: string,
  courseId: string
): Promise<{ completed_lesson_ids: string[]; progress_percentage: number }> {
  // Get enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("progress_percentage")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  // Get all module IDs for this course
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  const moduleIds = modules?.map((m) => m.id) || [];

  if (moduleIds.length === 0) {
    return { completed_lesson_ids: [], progress_percentage: 0 };
  }

  // Get all lesson IDs in these modules
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds);
  const lessonIds = new Set(lessons?.map((l) => l.id) || []);

  // Get completed lesson progress for this user
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);

  const completedLessonIds = (progress || [])
    .map((p) => p.lesson_id)
    .filter((id) => lessonIds.has(id));

  return {
    completed_lesson_ids: completedLessonIds,
    progress_percentage: enrollment?.progress_percentage ?? 0,
  };
}

export function useCourseProgressQuery(
  userId: string | undefined,
  courseId: string | undefined
) {
  return useQuery({
    queryKey: courseProgressQueryKey(userId!, courseId!),
    queryFn: () => fetchCourseProgress(userId!, courseId!),
    enabled: !!userId && !!courseId,
  });
}
