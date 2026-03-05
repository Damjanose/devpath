import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeLessonByEmail } from "@/lib/api";

interface CompleteLessonVars {
  lessonId: string;
  userId: string;
  courseId?: string;
  pointsReward: number;
  email: string;
}

interface CompleteLessonResult {
  alreadyCompleted: boolean;
  pointsEarned: number;
  progress: number;
}

async function completeLessonViaApi(
  vars: CompleteLessonVars
): Promise<CompleteLessonResult> {
  const result = await completeLessonByEmail(vars.lessonId, vars.email);

  if (!result) {
    return { alreadyCompleted: false, pointsEarned: 0, progress: 0 };
  }

  return {
    alreadyCompleted: (result.already_completed as boolean) ?? false,
    pointsEarned: (result.points_earned as number) ?? vars.pointsReward,
    progress: (result.progress as number) ?? 0,
  };
}

export function useCompleteLessonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: CompleteLessonVars) => completeLessonViaApi(vars),
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
