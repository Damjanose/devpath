import { useState, useMemo, isValidElement, type ReactElement, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useLessonQuery } from "@/hooks/queries/useLessonQuery";
import { useCourseQuery } from "@/hooks/queries/useCourseQuery";
import { useCourseProgressQuery } from "@/hooks/queries/useCourseProgressQuery";
import { useCompleteLessonMutation } from "@/hooks/mutations/useCompleteLessonMutation";

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  points_reward: number;
  sort_order: number;
  content?: string;
  module?: {
    id: string;
    title: string;
    course_id: string;
  };
}

function getCodeLanguage(child: ReactElement<{ className?: string }>) {
  const className = child.props.className || "";
  const match = /language-([\w-]+)/.exec(className);
  return match?.[1]?.toUpperCase() ?? "CODE";
}

function renderCodeBlock(children: ReactNode) {
  const firstChild = Array.isArray(children) ? children[0] : children;
  if (!isValidElement(firstChild)) {
    return <pre>{children}</pre>;
  }

  const codeChild = firstChild as ReactElement<{ className?: string; children?: ReactNode }>;
  const language = getCodeLanguage(codeChild);

  return (
    <div className="not-prose my-5 overflow-hidden rounded-lg border border-border bg-secondary/30">
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2 text-xs font-mono text-muted-foreground">
        <span>{language}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code className={codeChild.props.className}>{codeChild.props.children}</code>
      </pre>
    </div>
  );
}

export default function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);

  const { data: lessonData } = useLessonQuery(id);
  const lesson = lessonData as unknown as Lesson | null;

  const courseId = lesson?.module?.course_id;
  const { data: courseData } = useCourseQuery(courseId);
  const { data: progressData } = useCourseProgressQuery(
    user?.email ?? undefined,
    courseId
  );

  const completedLessonIds = useMemo(
    () => new Set(progressData?.completed_lesson_ids || []),
    [progressData]
  );
  const completed = lesson ? completedLessonIds.has(lesson.id) : false;

  const nextLessonId = useMemo(() => {
    if (!courseData || !lesson) return null;
    const modules = (courseData as any).modules || [];
    const allLessons: Array<{ id: string; moduleOrder: number; lessonOrder: number }> = [];
    modules.forEach((mod: any, modIndex: number) => {
      mod.lessons?.forEach((les: any) => {
        allLessons.push({
          id: les.id,
          moduleOrder: modIndex,
          lessonOrder: les.sort_order || 0,
        });
      });
    });
    allLessons.sort((a, b) => {
      if (a.moduleOrder !== b.moduleOrder) return a.moduleOrder - b.moduleOrder;
      return a.lessonOrder - b.lessonOrder;
    });
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1].id;
    }
    return null;
  }, [courseData, lesson]);

  const completeLessonMutation = useCompleteLessonMutation();

  async function handleComplete() {
    if (!user || !lesson || completed) return;
    setCompleting(true);
    try {
      if (user.email) {
        try {
          const apiResult = await completeLessonMutation.mutateAsync({
            lessonId: lesson.id,
            email: user.email,
            courseId,
          });
          if (apiResult) {
            const alreadyCompleted = !!(apiResult as any).already_completed;
            const pointsEarned = Number((apiResult as any).points_earned || lesson.points_reward);
            toast({
              title: alreadyCompleted ? "Already completed" : `+${pointsEarned} XP!`,
              description: alreadyCompleted ? "This lesson was already completed." : "Lesson completed!",
            });
            return;
          }
        } catch (apiErr) {
          console.debug("API completion failed, trying Supabase fallback:", apiErr);
        }
      }

      const { error: progressInsertError } = await supabase.from("lesson_progress").insert({
        user_id: user.id,
        lesson_id: lesson.id,
        points_earned: lesson.points_reward,
      });
      if (progressInsertError) throw progressInsertError;

      const { data: profile } = await supabase.from("profiles").select("total_points, level").eq("user_id", user.id).maybeSingle();
      if (profile) {
        const newPoints = profile.total_points + lesson.points_reward;
        const newLevel = Math.floor(newPoints / 500) + 1;
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ total_points: newPoints, level: newLevel })
          .eq("user_id", user.id);
        if (profileUpdateError) throw profileUpdateError;
      }

      const courseIdVal = lesson.module?.course_id;
      if (courseIdVal) {
        const courseModules = await supabase.from("modules").select("id").eq("course_id", courseIdVal);
        const allModuleIds = courseModules.data?.map((moduleRow) => moduleRow.id) || [];

        const { data: courseLessons } = await supabase.from("lessons").select("id").in("module_id", allModuleIds);
        const { data: completedLessons } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);

        const totalLessons = courseLessons?.length || 1;
        const completedInCourse = completedLessons?.filter((completedLesson) => courseLessons?.some((courseLesson) => courseLesson.id === completedLesson.lesson_id)).length || 0;
        const progress = (completedInCourse / totalLessons) * 100;

        const { error: enrollmentUpdateError } = await supabase
          .from("enrollments")
          .update({
            progress_percentage: progress,
            completed_at: progress >= 100 ? new Date().toISOString() : null,
          })
          .eq("user_id", user.id)
          .eq("course_id", courseIdVal);

        if (enrollmentUpdateError) throw enrollmentUpdateError;
      }

      toast({ title: `+${lesson.points_reward} XP!`, description: "Lesson completed!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCompleting(false);
    }
  }

  function handleNextLesson() {
    if (nextLessonId) {
      navigate(`/lessons/${nextLessonId}`);
    } else {
      if (lesson?.module?.course_id) {
        navigate(`/courses/${lesson.module.course_id}`);
      } else {
        navigate(-1);
      }
    }
  }

  if (!lesson) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground font-mono animate-pulse-neon">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
            <span className="flex items-center gap-1 text-sm font-mono text-gold"><Zap className="h-4 w-4" />{lesson.points_reward} XP</span>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="prose prose-invert prose-green max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-foreground/90 prose-th:text-foreground prose-td:text-foreground/90 prose-hr:border-border">
              {lesson.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: ({ children }) => renderCodeBlock(children),
                  }}
                >
                  {lesson.content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">No content available yet.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {completed ? (
              <>
                <div className="flex items-center gap-2 text-primary font-mono">
                  <CheckCircle2 className="h-5 w-5" /> Completed
                </div>
                <Button variant="hero" onClick={handleNextLesson}>
                  {nextLessonId ? (
                    <>
                      Next Lesson <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    "Back to Course"
                  )}
                </Button>
              </>
            ) : (
              <Button variant="hero" onClick={handleComplete} disabled={completing}>
                {completing ? "Completing..." : "Mark as Complete"}
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
