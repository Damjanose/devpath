import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const adminBadgesQueryKey = ["adminBadges"] as const;

async function fetchAdminBadges(): Promise<Tables<"badges">[]> {
  const { data } = await supabase
    .from("badges")
    .select("*")
    .order("condition_value");
  return data || [];
}

export function useAdminBadgesQuery() {
  return useQuery({
    queryKey: adminBadgesQueryKey,
    queryFn: fetchAdminBadges,
  });
}
