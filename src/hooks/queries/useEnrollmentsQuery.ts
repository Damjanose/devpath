import { useQuery } from "@tanstack/react-query";
import { fetchEnrollmentsByEmail } from "@/lib/api";

export function enrollmentsQueryKey(userId: string) {
  return ["enrollments", userId] as const;
}

export function useEnrollmentsQuery(userId: string | undefined, email?: string | null) {
  return useQuery({
    queryKey: enrollmentsQueryKey(userId!),
    queryFn: () => fetchEnrollmentsByEmail(email!),
    enabled: !!userId && !!email,
  });
}
