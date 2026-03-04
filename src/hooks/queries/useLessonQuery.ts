import { useQuery } from "@tanstack/react-query";
import { fetchLesson } from "@/lib/api";

export function lessonQueryKey(id: string) {
  return ["lesson", id] as const;
}

export function useLessonQuery(id: string | undefined) {
  return useQuery({
    queryKey: lessonQueryKey(id!),
    queryFn: () => fetchLesson(id!),
    enabled: !!id,
  });
}
