-- Create storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public) VALUES ('animal-photos', 'animal-photos', true);

-- Create animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cattle', 'goats', 'chickens', 'pigs')),
  breed TEXT,
  age INTEGER,
  weight DECIMAL(10,2),
  photo_url TEXT,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'sick', 'injured', 'recovering')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own animals" 
ON public.animals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own animals" 
ON public.animals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals" 
ON public.animals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals" 
ON public.animals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_animals_updated_at
BEFORE UPDATE ON public.animals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for animal photos
CREATE POLICY "Animal photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animal-photos');

CREATE POLICY "Users can upload their own animal photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own animal photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animal photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);