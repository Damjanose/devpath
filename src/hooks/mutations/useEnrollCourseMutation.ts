import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollCourse } from "@/lib/api";
import { enrollmentsQueryKey } from "../queries/useEnrollmentsQuery";

export function useEnrollCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, email }: { userId: string; courseId: string; email?: string }) => {
      if (!email) throw new Error("Email is required for enrollment");
      return enrollCourse(courseId, email);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentsQueryKey(variables.userId),
      });
    },
  });
}
