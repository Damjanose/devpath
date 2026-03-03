import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function Courses() {
  const [courses, setCourses] = useState<Tables<"courses">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Course Catalog</h1>
          <p className="text-muted-foreground">Level up your developer skills</p>
        </motion.div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground font-mono animate-pulse-neon">Loading courses...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  difficulty={course.difficulty}
                  pointsReward={course.points_reward}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
