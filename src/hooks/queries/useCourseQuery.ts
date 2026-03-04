import { useQuery } from "@tanstack/react-query";
import { fetchCourse } from "@/lib/api";

export function courseQueryKey(id: string) {
  return ["course", id] as const;
}

export function useCourseQuery(id: string | undefined) {
  return useQuery({
    queryKey: courseQueryKey(id!),
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
  });
}
