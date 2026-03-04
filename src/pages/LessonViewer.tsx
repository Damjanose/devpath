import { useState, useMemo, isValidElement, type ReactElement, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import confetti from "canvas-confetti";
import { QuizSection } from "@/components/QuizSection";

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  points_reward: number;
  sort_order: number;
  content?: string;
  content_type?: string;
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
    user?.id ?? undefined,
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

  // Celebration animation
  function celebrateCompletion() {
    // Fire confetti from multiple angles
    const duration = 1500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Fire from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      // Fire from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }

  async function handleComplete() {
    if (!user || !lesson || completed) return;
    setCompleting(true);
    try {
      const result = await completeLessonMutation.mutateAsync({
        lessonId: lesson.id,
        userId: user.id,
        courseId,
        pointsReward: lesson.points_reward,
      });

      if (result.alreadyCompleted) {
        toast({
          title: "Already completed",
          description: "This lesson was already completed.",
        });
      } else {
        celebrateCompletion();
        toast({
          title: `+${result.pointsEarned} XP!`,
          description: "Lesson completed! 🎉",
        });
        setTimeout(() => {
          handleNextLesson();
        }, 3000);
      }
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
        <Button variant="ghost" size="sm" onClick={() => {
          if (lesson?.module?.course_id) {
            navigate(`/courses/${lesson.module.course_id}`);
          } else {
            navigate('/courses');
          }
        }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Curriculum
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
            <span className="flex items-center gap-1 text-sm font-mono text-gold"><Zap className="h-4 w-4" />{lesson.points_reward} XP</span>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            {lesson.content_type === 'quiz' ? (
              // Render Quiz Section
              <QuizSection 
                questions={lesson.content ? JSON.parse(lesson.content) : []}
                onComplete={(score) => {
                  // Auto-complete quiz if passing score (70%+)
                  const questions = lesson.content ? JSON.parse(lesson.content) : [];
                  const percentage = Math.round((score / questions.length) * 100);
                  if (percentage >= 70 && !completed) {
                    handleComplete();
                  }
                }}
                pointsReward={lesson.points_reward}
              />
            ) : (
              // Render Regular Content
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
            )}
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
            ) : lesson.content_type === 'quiz' ? (
              // Quiz lessons are completed automatically when passing
              null
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
