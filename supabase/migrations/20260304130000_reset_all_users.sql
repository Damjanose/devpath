-- Reset ALL users: clear enrollments, progress, badges, and reset profile XP
TRUNCATE lesson_progress, user_badges, enrollments;
UPDATE profiles SET total_points = 0, level = 1;
