-- Allow users to delete their own enrollments (e.g. orphaned/unpublished courses)
CREATE POLICY "Users can delete own enrollment"
  ON public.enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to delete their own lesson progress (cleanup for removed courses)
CREATE POLICY "Users can delete own progress"
  ON public.lesson_progress FOR DELETE
  USING (auth.uid() = user_id);
