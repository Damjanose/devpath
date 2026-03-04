-- Reset ALL users: clear enrollments, progress, badges, and reset profile XP
-- Run via: supabase db execute --file scripts/reset-all-users.sql

BEGIN;

DELETE FROM lesson_progress;
DELETE FROM user_badges;
DELETE FROM enrollments;
UPDATE profiles SET total_points = 0, level = 1;

COMMIT;
