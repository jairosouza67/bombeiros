-- Create mindful_music table
CREATE TABLE IF NOT EXISTS public.mindful_music (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  video_url TEXT NOT NULL,
  release_timestamp TIMESTAMP WITH TIME ZONE,
  release_time TIME WITHOUT TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mindful_music ENABLE ROW LEVEL SECURITY;

-- Create policies for mindful_music
CREATE POLICY "Anyone can view mindful music"
  ON public.mindful_music
  FOR SELECT
  USING (true);

CREATE POLICY "Key users can insert mindful music"
  ON public.mindful_music
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'key_user'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Key users can update mindful music"
  ON public.mindful_music
  FOR UPDATE
  USING (has_role(auth.uid(), 'key_user'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Key users can delete mindful music"
  ON public.mindful_music
  FOR DELETE
  USING (has_role(auth.uid(), 'key_user'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

-- Create music_progress table
CREATE TABLE IF NOT EXISTS public.music_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  music_id UUID NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for music_progress
CREATE POLICY "Users can view own music progress"
  ON public.music_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own music progress"
  ON public.music_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own music progress"
  ON public.music_progress
  FOR UPDATE
  USING (auth.uid() = user_id);