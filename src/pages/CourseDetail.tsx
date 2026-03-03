import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchCourse, enrollCourse, fetchEnrollmentsByEmail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

interface Lesson {
  id: string;
  title: string;
  sort_order: number;
  estimated_minutes: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  points_reward: number;
  modules?: Module[];
}

interface Enrollment {
  id?: string;
  course_id: string;
  progress_percentage: number;
  [key: string]: unknown;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadCompletedLessons = useCallback(async () => {
    if (!user) return;
    try {
      const progressRes = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);
      setCompletedLessons(new Set(progressRes.data?.map((p) => p.lesson_id) || []));
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  }, [user]);

  const loadCourse = useCallback(async () => {
    // Fetch course + modules + lessons from Express API
    const courseData = await fetchCourse(id!);
    if (courseData) {
      setCourse(courseData as unknown as Course);
      setModules((courseData.modules as unknown as Module[]) || []);
    }

    // Enrollment from cache or API
    if (user) {
      // Check localStorage first for guest enrollments
      const cacheKey = `enrollments_${user.email}`;
      const cachedEnrollments = JSON.parse(localStorage.getItem(cacheKey) || "[]") as Enrollment[];
      const cachedCourseEnrollment = cachedEnrollments.find((e) => e.course_id === id);
      
      if (cachedCourseEnrollment) {
        setEnrollment(cachedCourseEnrollment);
      } else {
        // Fetch from API using email (works for all users)
        try {
          const enrollments = await fetchEnrollmentsByEmail(user.email!);
          const courseEnrollment = enrollments.find((e) => (e as Enrollment).course_id === id) as Enrollment | undefined;
          if (courseEnrollment) {
            setEnrollment(courseEnrollment);
            // Cache it
            cachedEnrollments.push(courseEnrollment);
            localStorage.setItem(cacheKey, JSON.stringify(cachedEnrollments));
          }
        } catch (err) {
          console.debug("Could not fetch enrollments from API:", err);
        }
      }
      
      // Progress via Supabase (user-specific data)
      await loadCompletedLessons();
    }
    setLoading(false);
  }, [id, user, loadCompletedLessons]);

  useEffect(() => {
    if (id) loadCourse();
  }, [id, loadCourse]);

  // Reload completed lessons when page becomes visible (e.g., after navigating back from a lesson)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCompletedLessons();
      }
    };

    const handleFocus = () => {
      loadCompletedLessons();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadCompletedLessons]);

  async function handleEnroll() {
    if (!user) { navigate("/login"); return; }
    try {
      const enrollmentData = await enrollCourse(id!, user.email!);
      
      // Store enrollment in localStorage for offline access
      const cacheKey = `enrollments_${user.email}`;
      const cachedEnrollments = JSON.parse(localStorage.getItem(cacheKey) || "[]") as Enrollment[];
      
      // Convert camelCase from API to snake_case for consistency
      const enrollmentWithCourseId: Enrollment = {
        ...(enrollmentData as Enrollment),
        course_id: id!,
        progress_percentage: 0,
      };
      
      // Avoid duplicates
      const filtered = cachedEnrollments.filter((e) => e.course_id !== id);
      filtered.push(enrollmentWithCourseId);
      localStorage.setItem(cacheKey, JSON.stringify(filtered));
      
      // Update state immediately
      setEnrollment(enrollmentWithCourseId);
      
      toast({ title: "Enrolled!", description: "You've been enrolled in this course." });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to enroll", variant: "destructive" });
    }
  }

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground font-mono animate-pulse-neon">Loading...</div></div>;
  if (!course) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground">Course not found</div></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-8 max-w-4xl space-y-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
          <h1 className="text-4xl font-bold text-foreground">{course.title}</h1>
          {course.description && <p className="text-lg text-muted-foreground">{course.description}</p>}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-gold font-mono"><Zap className="h-4 w-4" />{course.points_reward} XP</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
          </div>

          {!enrollment ? (
            <Button variant="hero" size="lg" onClick={handleEnroll}>Enroll Now</Button>
          ) : (
            <div className="text-sm text-primary font-mono">✓ Enrolled — {Math.round(enrollment.progress_percentage || 0)}% complete</div>
          )}
        </motion.div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Curriculum</h2>
          {modules.map((mod, mi) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.05 }} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{mod.title}</h3>
                {mod.description && <p className="text-sm text-muted-foreground">{mod.description}</p>}
              </div>
              <div className="divide-y divide-border">
                {mod.lessons.sort((a, b) => a.sort_order - b.sort_order).map((lesson) => {
                  const completed = completedLessons.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      to={enrollment ? `/lessons/${lesson.id}` : "#"}
                      className={`flex items-center justify-between p-3 px-4 text-sm transition-colors ${
                        enrollment ? "hover:bg-secondary cursor-pointer" : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                        <span className={completed ? "text-muted-foreground line-through" : "text-foreground"}>{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-mono">{lesson.estimated_minutes}m</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
