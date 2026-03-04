import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ModuleWithLessons = Tables<"modules"> & {
  lessons: Tables<"lessons">[];
};

export function courseEditorQueryKey(courseId: string) {
  return ["courseEditor", courseId] as const;
}

async function fetchCourseEditorData(courseId: string) {
  const [courseRes, modulesRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
    supabase
      .from("modules")
      .select("*, lessons(*)")
      .eq("course_id", courseId)
      .order("sort_order"),
  ]);

  const modules = (modulesRes.data as ModuleWithLessons[]) || [];
  modules.forEach((m) =>
    m.lessons.sort((a, b) => a.sort_order - b.sort_order)
  );

  return {
    course: courseRes.data,
    modules,
  };
}

export function useCourseEditorQuery(courseId: string | undefined) {
  return useQuery({
    queryKey: courseEditorQueryKey(courseId!),
    queryFn: () => fetchCourseEditorData(courseId!),
    enabled: !!courseId,
  });
}
