-- Clear all course-related data from Supabase
-- The app will now fall back to the Express API for course data

-- Disable triggers temporarily to avoid FK issues
SET session_replication_role = 'replica';

TRUNCATE TABLE public.lessons CASCADE;
TRUNCATE TABLE public.modules CASCADE;
TRUNCATE TABLE public.courses CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';
