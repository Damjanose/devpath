import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const adminCoursesQueryKey = ["adminCourses"] as const;

async function fetchAdminCourses(): Promise<Tables<"courses">[]> {
  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export function useAdminCoursesQuery() {
  return useQuery({
    queryKey: adminCoursesQueryKey,
    queryFn: fetchAdminCourses,
  });
}
