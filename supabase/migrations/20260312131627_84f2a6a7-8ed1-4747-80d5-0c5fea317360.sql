
-- Green credits table
CREATE TABLE public.green_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  waste_type TEXT NOT NULL,
  detection_id UUID REFERENCES public.detection_history(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.green_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all credits" ON public.green_credits
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own credits" ON public.green_credits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
  gc.user_id,
  p.full_name,
  SUM(gc.credits) as total_credits,
  COUNT(gc.id) as total_disposals,
  RANK() OVER (ORDER BY SUM(gc.credits) DESC) as rank
FROM public.green_credits gc
LEFT JOIN public.profiles p ON p.user_id = gc.user_id
GROUP BY gc.user_id, p.full_name;

-- Enable realtime for green_credits
ALTER PUBLICATION supabase_realtime ADD TABLE public.green_credits;
