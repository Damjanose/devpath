import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { XPBar } from "@/components/XPBar";
import { CourseCard } from "@/components/CourseCard";
import { BadgeCard } from "@/components/BadgeCard";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Zap, Target } from "lucide-react";
import { Footer } from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [enrollments, setEnrollments] = useState<(Tables<"enrollments"> & { courses: Tables<"courses"> | null })[]>([]);
  const [badges, setBadges] = useState<(Tables<"user_badges"> & { badges: Tables<"badges"> | null })[]>([]);
  const [stats, setStats] = useState({ lessonsCompleted: 0, coursesEnrolled: 0 });

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    const [profileRes, enrollRes, badgeRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
      supabase.from("enrollments").select("*, courses(*)").eq("user_id", user!.id),
      supabase.from("user_badges").select("*, badges(*)").eq("user_id", user!.id),
      supabase.from("lesson_progress").select("id").eq("user_id", user!.id),
    ]);
    setProfile(profileRes.data);
    setEnrollments((enrollRes.data as any) || []);
    setBadges((badgeRes.data as any) || []);
    setStats({
      lessonsCompleted: progressRes.data?.length || 0,
      coursesEnrolled: enrollRes.data?.length || 0,
    });
  }

  const level = profile?.level || 1;
  const totalPoints = profile?.total_points || 0;
  const xpForNextLevel = level * 500;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{profile?.display_name || "Developer"}</span>
          </h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </motion.div>

        <XPBar current={totalPoints % xpForNextLevel} max={xpForNextLevel} level={level} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Total XP", value: totalPoints, color: "text-primary" },
            { icon: Trophy, label: "Level", value: level, color: "text-gold" },
            { icon: BookOpen, label: "Courses", value: stats.coursesEnrolled, color: "text-cyber-blue" },
            { icon: Target, label: "Lessons Done", value: stats.lessonsCompleted, color: "text-cyber-purple" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
          {enrollments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No courses yet. <a href="/courses" className="text-primary hover:underline">Browse courses</a></p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrollments.map((e) => e.courses && (
                <CourseCard
                  key={e.id}
                  id={e.courses.id}
                  title={e.courses.title}
                  description={e.courses.description}
                  difficulty={e.courses.difficulty}
                  pointsReward={e.courses.points_reward}
                  progress={e.progress_percentage}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Badges</h2>
          {badges.length === 0 ? (
            <p className="text-muted-foreground text-sm">Complete lessons and courses to earn badges!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {badges.map((ub) => ub.badges && (
                <BadgeCard key={ub.id} name={ub.badges.name} description={ub.badges.description} tier={ub.badges.tier} earned />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
