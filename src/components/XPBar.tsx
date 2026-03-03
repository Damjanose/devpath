import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  className?: string;
}

export function XPBar({ current, max, level, className = "" }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>Level {level}</span>
        <span>{current} / {max} XP</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden border border-border">
        <motion.div
          className="h-full rounded-full gradient-neon"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
