import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function enrollmentsQueryKey(userId: string) {
  return ["enrollments", userId] as const;
}

async function fetchEnrollments(userId: string) {
  const { data } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!data) return [];

  // Filter out enrollments whose course was deleted or is no longer published
  const valid = data.filter(
    (e) => e.courses && (e.courses as any).is_published === true
  );

  // Clean up orphaned/unpublished enrollments in the background (best-effort)
  const orphanIds = data
    .filter((e) => !e.courses || (e.courses as any).is_published !== true)
    .map((e) => e.id);

  if (orphanIds.length > 0) {
    supabase
      .from("enrollments")
      .delete()
      .in("id", orphanIds)
      .then(() => {}); // fire-and-forget; may fail if DELETE policy not yet applied
  }

  return valid;
}

export function useEnrollmentsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: enrollmentsQueryKey(userId!),
    queryFn: () => fetchEnrollments(userId!),
    enabled: !!userId,
  });
}
