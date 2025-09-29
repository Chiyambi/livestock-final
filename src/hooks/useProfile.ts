import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  phone_number: string;
  notification_feeding: boolean;
  notification_vaccination: boolean;
  notification_health_reports: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  username?: string;
  phone_number?: string;
  notification_feeding?: boolean;
  notification_vaccination?: boolean;
  notification_health_reports?: boolean;
}

const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          await createProfile();
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: user.user_metadata?.username || '',
          phone_number: user.user_metadata?.phone_number || '',
          notification_feeding: true,
          notification_vaccination: true,
          notification_health_reports: false,
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPreference = async (
    type: 'notification_feeding' | 'notification_vaccination' | 'notification_health_reports',
    enabled: boolean
  ) => {
    if (!user || !profile) return;

    try {
      const updates = { [type]: enabled };
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating notification preference:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preference.",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    updateNotificationPreference,
    refetchProfile: fetchProfile,
  };
};

export default useProfile;