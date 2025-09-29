-- Create feeding_schedules table
CREATE TABLE public.feeding_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  feed_type TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  feeding_time TIME NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly')),
  days_of_week TEXT[], -- For weekly schedules: ['monday', 'tuesday', etc.]
  next_feeding_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own feeding schedules" 
ON public.feeding_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feeding schedules" 
ON public.feeding_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeding schedules" 
ON public.feeding_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeding schedules" 
ON public.feeding_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feeding_schedules_updated_at
BEFORE UPDATE ON public.feeding_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create feeding_records table to track completed feedings
CREATE TABLE public.feeding_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.feeding_schedules(id) ON DELETE SET NULL,
  feed_type TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  fed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for feeding_records
ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;

-- Create policies for feeding_records
CREATE POLICY "Users can view their own feeding records" 
ON public.feeding_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feeding records" 
ON public.feeding_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeding records" 
ON public.feeding_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeding records" 
ON public.feeding_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to calculate next feeding date
CREATE OR REPLACE FUNCTION public.calculate_next_feeding_date(
  p_frequency TEXT,
  p_feeding_time TIME,
  p_days_of_week TEXT[] DEFAULT NULL
) RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  next_date TIMESTAMP WITH TIME ZONE;
  today_date DATE;
  now_time TIME;
BEGIN
  today_date := CURRENT_DATE;
  now_time := CURRENT_TIME;
  
  CASE p_frequency
    WHEN 'daily' THEN
      IF now_time < p_feeding_time THEN
        next_date := today_date::TIMESTAMP + p_feeding_time::INTERVAL;
      ELSE
        next_date := (today_date + INTERVAL '1 day')::TIMESTAMP + p_feeding_time::INTERVAL;
      END IF;
    
    WHEN 'weekly' THEN
      next_date := (today_date + INTERVAL '1 day')::TIMESTAMP + p_feeding_time::INTERVAL;
    
    WHEN 'bi-weekly' THEN
      next_date := (today_date + INTERVAL '14 days')::TIMESTAMP + p_feeding_time::INTERVAL;
    
    WHEN 'monthly' THEN
      next_date := (today_date + INTERVAL '1 month')::TIMESTAMP + p_feeding_time::INTERVAL;
    
    ELSE
      next_date := (today_date + INTERVAL '1 day')::TIMESTAMP + p_feeding_time::INTERVAL;
  END CASE;
  
  RETURN next_date;
END;
$$;