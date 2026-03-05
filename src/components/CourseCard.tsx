import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string | null;
  difficulty: string;
  pointsReward: number;
  progress?: number;
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-primary/20 text-primary border-primary/30",
  intermediate: "bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30",
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

export function CourseCard({ id, title, description, difficulty, pointsReward, progress }: CourseCardProps) {
  return (
    <Link to={`/courses/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:box-glow"
      >
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className={difficultyColor[difficulty]}>
            {difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-xs font-mono text-gold">
            <Zap className="h-3 w-3" /> {pointsReward} XP
          </span>
        </div>

        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>
        )}

        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full gradient-neon transition-all progress-bar"
                style={{ "--progress-width": `${progress}%` } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Course</span>
        </div>
      </motion.div>
    </Link>
  );
}
