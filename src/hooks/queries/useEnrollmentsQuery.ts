import { useQuery } from "@tanstack/react-query";
import { fetchEnrollmentsByEmail } from "@/lib/api";

export function enrollmentsQueryKey(email: string) {
  return ["enrollments", email] as const;
}

export function useEnrollmentsQuery(email: string | undefined) {
  return useQuery({
    queryKey: enrollmentsQueryKey(email!),
    queryFn: () => fetchEnrollmentsByEmail(email!),
    enabled: !!email,
  });
}
