import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const platformStatsQueryKey = ["platformStats"] as const;

async function fetchPlatformStats() {
  const [profiles, courses, badges, lessons] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("user_badges").select("id", { count: "exact", head: true }),
    supabase.from("lesson_progress").select("id", { count: "exact", head: true }),
  ]);

  return [
    { value: `${profiles.count || 0}+`, label: "Active Learners" },
    { value: `${courses.count || 0}+`, label: "Courses Available" },
    { value: `${badges.count || 0}+`, label: "Badges Earned" },
    { value: `${lessons.count || 0}+`, label: "Lessons Completed" },
  ];
}

export function usePlatformStatsQuery(enabled: boolean) {
  return useQuery({
    queryKey: platformStatsQueryKey,
    queryFn: fetchPlatformStats,
    enabled,
  });
}
