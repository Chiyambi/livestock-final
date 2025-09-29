-- Fix search_path security issue for the function
CREATE OR REPLACE FUNCTION public.calculate_next_feeding_date(
  p_frequency TEXT,
  p_feeding_time TIME,
  p_days_of_week TEXT[] DEFAULT NULL
) RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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