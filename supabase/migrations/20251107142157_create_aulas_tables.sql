-- Create aulas table (independent from lessons)
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  mindful_video_url TEXT NOT NULL,
  duration INTEGER,
  release_time TIME WITHOUT TIME ZONE NOT NULL,
  release_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create aulas_progress table (independent from progress)
CREATE TABLE public.aulas_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aula_id UUID NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  mindful_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, aula_id)
);

-- Enable RLS
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aulas (public read)
CREATE POLICY "Anyone can view aulas"
  ON public.aulas FOR SELECT
  USING (true);

-- RLS Policies for aulas_progress
CREATE POLICY "Users can view own aulas progress"
  ON public.aulas_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own aulas progress"
  ON public.aulas_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own aulas progress"
  ON public.aulas_progress FOR UPDATE
  USING (auth.uid() = user_id);