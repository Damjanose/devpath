import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { enrollmentsQueryKey } from "../queries/useEnrollmentsQuery";

async function enrollCourseSupabase(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId })
    .select("*, courses(*)")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("Already enrolled in this course");
    throw new Error(error.message || "Failed to enroll");
  }
  return data;
}

export function useEnrollCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string; email?: string }) =>
      enrollCourseSupabase(userId, courseId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentsQueryKey(variables.userId),
      });
    },
  });
}
