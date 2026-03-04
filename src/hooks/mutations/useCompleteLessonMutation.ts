import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CompleteLessonVars {
  lessonId: string;
  userId: string;
  courseId?: string;
  pointsReward: number;
}

interface CompleteLessonResult {
  alreadyCompleted: boolean;
  pointsEarned: number;
  progress: number;
}

async function completeLessonSupabase(
  vars: CompleteLessonVars
): Promise<CompleteLessonResult> {
  const { lessonId, userId, courseId, pointsReward } = vars;

  // 1. Check if already completed
  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing) {
    return { alreadyCompleted: true, pointsEarned: 0, progress: 0 };
  }

  // 2. Insert lesson progress
  const { error: insertErr } = await supabase
    .from("lesson_progress")
    .insert({ user_id: userId, lesson_id: lessonId, points_earned: pointsReward });
  if (insertErr) throw new Error(insertErr.message);

  // 3. Update profile points/level
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_points, level")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile) {
    const newPoints = profile.total_points + pointsReward;
    const newLevel = Math.floor(newPoints / 500) + 1;
    await supabase
      .from("profiles")
      .update({ total_points: newPoints, level: newLevel })
      .eq("user_id", userId);
  }

  // 4. Update course enrollment progress
  let progress = 0;
  if (courseId) {
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);
    const moduleIds = modules?.map((m) => m.id) || [];

    if (moduleIds.length > 0) {
      const [{ data: courseLessons }, { data: userProgress }] = await Promise.all([
        supabase.from("lessons").select("id").in("module_id", moduleIds),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId),
      ]);

      const lessonIdSet = new Set(courseLessons?.map((l) => l.id) || []);
      const totalLessons = lessonIdSet.size || 1;
      const completedInCourse = (userProgress || []).filter((p) =>
        lessonIdSet.has(p.lesson_id)
      ).length;
      progress = (completedInCourse / totalLessons) * 100;

      await supabase
        .from("enrollments")
        .update({
          progress_percentage: progress,
          completed_at: progress >= 100 ? new Date().toISOString() : null,
        })
        .eq("user_id", userId)
        .eq("course_id", courseId);
    }
  }

  return { alreadyCompleted: false, pointsEarned: pointsReward, progress };
}

export function useCompleteLessonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: CompleteLessonVars) => completeLessonSupabase(vars),
    onSuccess: (_data, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ["courseProgress", variables.userId, variables.courseId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["enrollments", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userBadges"] });
      queryClient.invalidateQueries({ queryKey: ["lessonProgress"] });
    },
  });
}
