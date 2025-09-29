import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Vaccination {
  id: string;
  user_id: string;
  animal_id: string;
  vaccine_name: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'completed' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
  animal_name?: string;
}

export const useVaccinations = () => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaccinations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: vaccinationData, error: fetchError } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Fetch animal names separately
      const { data: animalsData } = await supabase
        .from('animals')
        .select('id, name')
        .eq('user_id', user.id);

      const animalsMap = new Map(animalsData?.map(animal => [animal.id, animal.name]) || []);

      const vaccinationsWithAnimalNames = vaccinationData?.map(vaccination => ({
        ...vaccination,
        status: vaccination.status as 'scheduled' | 'completed' | 'overdue',
        animal_name: animalsMap.get(vaccination.animal_id) || 'Unknown Animal'
      })) || [];

      setVaccinations(vaccinationsWithAnimalNames);
    } catch (err) {
      console.error('Error fetching vaccinations:', err);
      setError('Failed to load vaccinations');
      toast.error('Failed to load vaccinations');
    } finally {
      setLoading(false);
    }
  };

  const createVaccination = async (vaccinationData: {
    animal_id: string;
    vaccine_name: string;
    scheduled_date: string;
    notes?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create vaccinations');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .insert([
          {
            ...vaccinationData,
            user_id: user.id,
            status: 'scheduled'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Vaccination scheduled successfully');
      await fetchVaccinations();
      return data;
    } catch (err) {
      console.error('Error creating vaccination:', err);
      toast.error('Failed to schedule vaccination');
      return null;
    }
  };

  const updateVaccination = async (id: string, updates: Partial<Vaccination>) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Vaccination updated successfully');
      await fetchVaccinations();
      return true;
    } catch (err) {
      console.error('Error updating vaccination:', err);
      toast.error('Failed to update vaccination');
      return false;
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Vaccination marked as completed');
      await fetchVaccinations();
      return true;
    } catch (err) {
      console.error('Error completing vaccination:', err);
      toast.error('Failed to mark vaccination as completed');
      return false;
    }
  };

  const deleteVaccination = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Vaccination deleted successfully');
      await fetchVaccinations();
      return true;
    } catch (err) {
      console.error('Error deleting vaccination:', err);
      toast.error('Failed to delete vaccination');
      return false;
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [user]);

  const pendingVaccinations = vaccinations.filter(v => v.status === 'scheduled');
  const completedVaccinations = vaccinations.filter(v => v.status === 'completed');
  const overdueVaccinations = vaccinations.filter(v => v.status === 'overdue');
  const dueSoonVaccinations = vaccinations.filter(v => {
    if (v.status !== 'scheduled') return false;
    const scheduledDate = new Date(v.scheduled_date);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    return scheduledDate >= now && scheduledDate <= sevenDaysFromNow;
  });

  return {
    vaccinations,
    pendingVaccinations,
    completedVaccinations,
    overdueVaccinations,
    dueSoonVaccinations,
    loading,
    error,
    createVaccination,
    updateVaccination,
    markAsCompleted,
    deleteVaccination,
    refetch: fetchVaccinations
  };
};