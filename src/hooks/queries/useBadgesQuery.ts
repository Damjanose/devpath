import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function userBadgesQueryKey(userId: string) {
  return ["userBadges", userId] as const;
}

async function fetchUserBadges(userId: string) {
  const { data } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", userId);
  return data || [];
}

export function useBadgesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userBadgesQueryKey(userId!),
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
  });
}
