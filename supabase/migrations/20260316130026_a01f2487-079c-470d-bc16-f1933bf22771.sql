
-- Create trigger on auth.users for new user signup (creates profile + assigns 'user' role)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger on profiles for admin assignment
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_assignment();

-- Allow authenticated users to insert notifications (for detection alerts)
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view all profiles (for leaderboard names)
CREATE POLICY "Users can view all profiles for leaderboard"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
