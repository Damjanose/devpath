import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function profileQueryKey(userId: string) {
  return ["profile", userId] as const;
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export function useProfileQuery(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKey(userId!),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}
