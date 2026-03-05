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
import { CodingChallenge } from "@/components/CodingChallenge";

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  points_reward: number;
  sort_order: number;
  content?: string;
  content_type?: string;
  starter_code?: string;
  test_code?: string;
  solution_code?: string;
  language?: string;
  hints?: string[];
  bonus_points?: number;
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

/**
 * Normalises quiz content from two seed formats into the shape QuizSection expects:
 *   { question: string; options: string[]; correctAnswer: number; explanation?: string }[]
 *
 * Format A (seed.ts / seed-course1.ts): content is a JSON array that already matches.
 * Format B (seed-new-courses.ts): content is a JSON object
 *   { title, passingScore, questions: [{ id, question, options: [{id,text}], correctAnswer: "a", explanation }] }
 */
function normalizeQuizQuestions(raw?: string) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const letterToIndex: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 };

    // Extract the array of questions
    const questions: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.questions)
        ? parsed.questions
        : [];

    return questions.map((q: any) => ({
      question: q.question ?? "",
      options: Array.isArray(q.options)
        ? q.options.map((o: any) => (typeof o === "string" ? o : o?.text ?? String(o)))
        : [],
      correctAnswer:
        typeof q.correctAnswer === "number"
          ? q.correctAnswer
          : letterToIndex[String(q.correctAnswer).toLowerCase()] ?? 0,
      explanation: q.explanation,
    }));
  } catch {
    return [];
  }
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
    courseId,
    user?.email
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
        email: user.email!,
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
            {lesson.content_type === 'coding_challenge' ? (
              // Render Coding Challenge
              <CodingChallenge
                description={lesson.content}
                starterCode={lesson.starter_code}
                testCode={lesson.test_code}
                solutionCode={lesson.solution_code}
                language={lesson.language}
                hints={lesson.hints}
                bonusPoints={lesson.bonus_points}
                pointsReward={lesson.points_reward}
                onPass={() => {
                  if (!completed) handleComplete();
                }}
              />
            ) : lesson.content_type === 'quiz' ? (
              // Render Quiz Section
              <QuizSection 
                questions={normalizeQuizQuestions(lesson.content)}
                onComplete={(score) => {
                  // Auto-complete quiz if passing score (70%+)
                  const questions = normalizeQuizQuestions(lesson.content);
                  const percentage = Math.round((score / questions.length) * 100);
                  if (percentage >= 70 && !completed) {
                    handleComplete();
                  }
                }}
                pointsReward={lesson.points_reward}
                onContinue={handleNextLesson}
              />
            ) : (
              // Render Regular Content with enhanced markdown
              <div className="prose prose-invert prose-green max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-foreground/90 prose-th:text-foreground prose-td:text-foreground/90 prose-hr:border-border">
                {lesson.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      pre: ({ children }) => renderCodeBlock(children),
                      blockquote: ({ children }) => (
                        <div className="not-prose my-4 flex gap-3 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                          <span className="text-primary text-lg leading-none">💡</span>
                          <div className="text-sm text-foreground/90 [&>p]:m-0">{children}</div>
                        </div>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-8 mb-3 flex items-center gap-2">
                          <span className="inline-block w-1 h-6 rounded-full bg-primary" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-4 space-y-2 list-none pl-0">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-4 space-y-2 list-decimal pl-5">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2 pl-0">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/70" />
                          <span>{children}</span>
                        </li>
                      ),
                      hr: () => (
                        <hr className="my-8 border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      ),
                      table: ({ children }) => (
                        <div className="my-5 overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">{children}</table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="bg-secondary/50 px-4 py-2 text-left font-semibold text-foreground">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="border-t border-border px-4 py-2 text-foreground/90">{children}</td>
                      ),
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
            ) : lesson.content_type === 'quiz' || lesson.content_type === 'coding_challenge' ? (
              // Quiz & coding challenge lessons are completed automatically
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
