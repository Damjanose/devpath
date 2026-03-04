import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollCourse } from "@/lib/api";
import { enrollmentsQueryKey } from "../queries/useEnrollmentsQuery";

export function useEnrollCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, email }: { courseId: string; email: string }) =>
      enrollCourse(courseId, email),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentsQueryKey(variables.email),
      });
    },
  });
}
