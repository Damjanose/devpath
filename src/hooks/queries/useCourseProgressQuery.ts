import { useQuery } from "@tanstack/react-query";
import { fetchCourseProgressByEmail } from "@/lib/api";

export function courseProgressQueryKey(userId: string, courseId: string) {
  return ["courseProgress", userId, courseId] as const;
}

export function useCourseProgressQuery(
  userId: string | undefined,
  courseId: string | undefined,
  email?: string | null
) {
  return useQuery({
    queryKey: courseProgressQueryKey(userId!, courseId!),
    queryFn: () => fetchCourseProgressByEmail(email!, courseId!),
    enabled: !!userId && !!courseId && !!email,
  });
}
