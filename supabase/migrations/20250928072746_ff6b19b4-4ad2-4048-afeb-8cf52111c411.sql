-- Create weight_records table for tracking animal weight changes over time
CREATE TABLE public.weight_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  weight NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own weight records" 
ON public.weight_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight records" 
ON public.weight_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight records" 
ON public.weight_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight records" 
ON public.weight_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_weight_records_animal_id ON public.weight_records(animal_id);
CREATE INDEX idx_weight_records_recorded_at ON public.weight_records(recorded_at);