import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const adminStatsQueryKey = ["adminStats"] as const;

async function fetchAdminStats() {
  const [c, b, p, e] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("badges").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
  ]);
  return {
    courses: c.count || 0,
    badges: b.count || 0,
    users: p.count || 0,
    enrollments: e.count || 0,
  };
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: adminStatsQueryKey,
    queryFn: fetchAdminStats,
  });
}
