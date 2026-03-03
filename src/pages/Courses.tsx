import { useEffect, useState } from "react";
import { fetchCourses } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const FILTER_OPTIONS = ["All Categories", "Beginner", "Intermediate", "Advanced"] as const;

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("All Categories");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const data = await fetchCourses();
    setCourses(data);
    setLoading(false);
  }

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficulty === "All Categories" || c.difficulty === difficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-8 space-y-6 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Browse Courses</h1>
          <p className="text-muted-foreground">
            Find your next skill to master. Every lesson earns you XP.
          </p>
        </motion.div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt}
                size="sm"
                variant={difficulty === opt ? "hero" : "outline"}
                onClick={() => setDifficulty(opt)}
                className="text-xs"
              >
                {opt}
              </Button>
            ))}
          </div>
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
      <Footer />
    </div>
  );
}
