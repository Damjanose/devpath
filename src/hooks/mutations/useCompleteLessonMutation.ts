import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeLessonByEmail } from "@/lib/api";

export function useCompleteLessonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      email,
    }: {
      lessonId: string;
      email: string;
      courseId?: string;
    }) => completeLessonByEmail(lessonId, email),
    onSuccess: (_data, variables) => {
      // Invalidate progress for the course
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ["courseProgress", variables.email, variables.courseId],
        });
      }
      // Invalidate enrollments (progress_percentage may have changed)
      queryClient.invalidateQueries({
        queryKey: ["enrollments", variables.email],
      });
      // Invalidate profile (XP/level may have changed)
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Invalidate user badges
      queryClient.invalidateQueries({ queryKey: ["userBadges"] });
      // Invalidate lesson progress count
      queryClient.invalidateQueries({ queryKey: ["lessonProgress"] });
    },
  });
}
