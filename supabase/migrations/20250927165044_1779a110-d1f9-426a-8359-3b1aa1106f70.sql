-- Create vaccinations table
CREATE TABLE public.vaccinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  vaccine_name TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own vaccinations" 
ON public.vaccinations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vaccinations" 
ON public.vaccinations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccinations" 
ON public.vaccinations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccinations" 
ON public.vaccinations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vaccinations_updated_at
BEFORE UPDATE ON public.vaccinations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update vaccination status to overdue
CREATE OR REPLACE FUNCTION public.update_overdue_vaccinations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.vaccinations
  SET status = 'overdue'
  WHERE status = 'scheduled' 
    AND scheduled_date < now() - INTERVAL '1 day';
END;
$$;