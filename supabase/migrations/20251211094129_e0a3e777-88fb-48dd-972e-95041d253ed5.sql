-- Add unique constraint for upsert to work correctly
ALTER TABLE public.learning_progress 
ADD CONSTRAINT learning_progress_user_topic_unique UNIQUE (user_id, topic);