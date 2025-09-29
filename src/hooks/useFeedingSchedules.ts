import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FeedingSchedule {
  id: string;
  user_id: string;
  animal_id: string;
  feed_type: string;
  quantity: number;
  feeding_time: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  days_of_week?: string[];
  next_feeding_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  animals?: {
    id: string;
    name: string;
    species: string;
  };
}

export interface FeedingRecord {
  id: string;
  user_id: string;
  animal_id: string;
  schedule_id?: string;
  feed_type: string;
  quantity: number;
  fed_at: string;
  notes?: string;
  created_at: string;
  animals?: {
    id: string;
    name: string;
    species: string;
  };
}

export const useFeedingSchedules = () => {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [records, setRecords] = useState<FeedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feeding_schedules')
        .select(`
          *,
          animals (
            id,
            name,
            species
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data as FeedingSchedule[] || []);
    } catch (error) {
      console.error('Error fetching feeding schedules:', error);
      toast.error('Failed to load feeding schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_records')
        .select(`
          *,
          animals (
            id,
            name,
            species
          )
        `)
        .eq('user_id', user.id)
        .order('fed_at', { ascending: false })
        .limit(50); // Get last 50 records

      if (error) throw error;
      setRecords(data as FeedingRecord[] || []);
    } catch (error) {
      console.error('Error fetching feeding records:', error);
      toast.error('Failed to load feeding records');
    }
  };

  const addSchedule = async (scheduleData: Omit<FeedingSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'animals'>) => {
    if (!user) return;

    try {
      // Calculate next feeding date
      const nextFeedingDate = await calculateNextFeedingDate(
        scheduleData.frequency,
        scheduleData.feeding_time,
        scheduleData.days_of_week
      );

      const { data, error } = await supabase
        .from('feeding_schedules')
        .insert([{
          ...scheduleData,
          user_id: user.id,
          next_feeding_date: nextFeedingDate
        }])
        .select(`
          *,
          animals (
            id,
            name,
            species
          )
        `)
        .single();

      if (error) throw error;
      
      setSchedules(prev => [data as FeedingSchedule, ...prev]);
      toast.success('Feeding schedule created successfully');
      return data;
    } catch (error) {
      console.error('Error adding feeding schedule:', error);
      toast.error('Failed to create feeding schedule');
      throw error;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<FeedingSchedule>) => {
    try {
      // Recalculate next feeding date if time or frequency changed
      let nextFeedingDate = updates.next_feeding_date;
      if (updates.frequency || updates.feeding_time) {
        const schedule = schedules.find(s => s.id === id);
        if (schedule) {
          nextFeedingDate = await calculateNextFeedingDate(
            updates.frequency || schedule.frequency,
            updates.feeding_time || schedule.feeding_time,
            updates.days_of_week || schedule.days_of_week
          );
        }
      }

      const { data, error } = await supabase
        .from('feeding_schedules')
        .update({ ...updates, next_feeding_date: nextFeedingDate })
        .eq('id', id)
        .select(`
          *,
          animals (
            id,
            name,
            species
          )
        `)
        .single();

      if (error) throw error;

      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? data as FeedingSchedule : schedule
      ));
      toast.success('Feeding schedule updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating feeding schedule:', error);
      toast.error('Failed to update feeding schedule');
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feeding_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast.success('Feeding schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting feeding schedule:', error);
      toast.error('Failed to delete feeding schedule');
      throw error;
    }
  };

  const recordFeeding = async (recordData: Omit<FeedingRecord, 'id' | 'user_id' | 'created_at' | 'animals'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_records')
        .insert([{
          ...recordData,
          user_id: user.id
        }])
        .select(`
          *,
          animals (
            id,
            name,
            species
          )
        `)
        .single();

      if (error) throw error;
      
      setRecords(prev => [data as FeedingRecord, ...prev]);
      toast.success('Feeding recorded successfully');

      // Update next feeding date for the schedule if applicable
      if (recordData.schedule_id) {
        const schedule = schedules.find(s => s.id === recordData.schedule_id);
        if (schedule) {
          const nextFeedingDate = await calculateNextFeedingDate(
            schedule.frequency,
            schedule.feeding_time,
            schedule.days_of_week
          );
          
          await supabase
            .from('feeding_schedules')
            .update({ next_feeding_date: nextFeedingDate })
            .eq('id', recordData.schedule_id);
        }
      }

      return data;
    } catch (error) {
      console.error('Error recording feeding:', error);
      toast.error('Failed to record feeding');
      throw error;
    }
  };

  const calculateNextFeedingDate = async (
    frequency: string,
    feedingTime: string,
    daysOfWeek?: string[]
  ): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_next_feeding_date', {
          p_frequency: frequency,
          p_feeding_time: feedingTime,
          p_days_of_week: daysOfWeek
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating next feeding date:', error);
      // Fallback calculation
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return tomorrow.toISOString();
    }
  };

  const getUpcomingFeedings = () => {
    const now = new Date();
    const upcomingWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Next 2 hours

    return schedules.filter(schedule => {
      if (!schedule.is_active || !schedule.next_feeding_date) return false;
      const nextFeeding = new Date(schedule.next_feeding_date);
      return nextFeeding <= upcomingWindow && nextFeeding > now;
    });
  };

  const getOverdueFeedings = () => {
    const now = new Date();
    
    return schedules.filter(schedule => {
      if (!schedule.is_active || !schedule.next_feeding_date) return false;
      const nextFeeding = new Date(schedule.next_feeding_date);
      return nextFeeding <= now;
    });
  };

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchRecords();
    }
  }, [user]);

  return {
    schedules,
    records,
    loading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    recordFeeding,
    getUpcomingFeedings,
    getOverdueFeedings,
    refetch: () => {
      fetchSchedules();
      fetchRecords();
    },
  };
};