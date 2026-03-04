import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/api";

export const coursesQueryKey = ["courses"] as const;

export function useCoursesQuery() {
  return useQuery({
    queryKey: coursesQueryKey,
    queryFn: fetchCourses,
  });
}
