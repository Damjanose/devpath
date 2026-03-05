-- Fix: re-run reset with TRUNCATE (previous migration timed out on DELETE)
TRUNCATE lesson_progress, user_badges, enrollments;
UPDATE profiles SET total_points = 0, level = 1;
