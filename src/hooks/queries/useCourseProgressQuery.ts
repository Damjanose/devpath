import { useQuery } from "@tanstack/react-query";
import { fetchCourseProgressByEmail } from "@/lib/api";

export function courseProgressQueryKey(email: string, courseId: string) {
  return ["courseProgress", email, courseId] as const;
}

export function useCourseProgressQuery(
  email: string | undefined,
  courseId: string | undefined
) {
  return useQuery({
    queryKey: courseProgressQueryKey(email!, courseId!),
    queryFn: () => fetchCourseProgressByEmail(email!, courseId!),
    enabled: !!email && !!courseId,
  });
}
