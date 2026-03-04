import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function lessonProgressQueryKey(userId: string) {
  return ["lessonProgress", userId] as const;
}

async function fetchLessonProgressCount(userId: string) {
  const { data } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("user_id", userId);
  return data?.length || 0;
}

export function useLessonProgressQuery(userId: string | undefined) {
  return useQuery({
    queryKey: lessonProgressQueryKey(userId!),
    queryFn: () => fetchLessonProgressCount(userId!),
    enabled: !!userId,
  });
}
