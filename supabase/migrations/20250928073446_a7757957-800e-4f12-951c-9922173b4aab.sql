-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN notification_feeding BOOLEAN DEFAULT true,
ADD COLUMN notification_vaccination BOOLEAN DEFAULT true,
ADD COLUMN notification_health_reports BOOLEAN DEFAULT false;