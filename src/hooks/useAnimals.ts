import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Animal {
  id: string;
  user_id: string;
  name: string;
  species: 'cattle' | 'goats' | 'chickens' | 'pigs';
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_status: 'healthy' | 'sick' | 'injured' | 'recovering';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnimals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data as Animal[] || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const addAnimal = async (animalData: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setAnimals(prev => [data as Animal, ...prev]);
      toast.success('Animal added successfully');
      return data;
    } catch (error) {
      console.error('Error adding animal:', error);
      toast.error('Failed to add animal');
      throw error;
    }
  };

  const updateAnimal = async (id: string, updates: Partial<Animal>) => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAnimals(prev => prev.map(animal => 
        animal.id === id ? data as Animal : animal
      ));
      toast.success('Animal updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Failed to update animal');
      throw error;
    }
  };

  const deleteAnimal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnimals(prev => prev.filter(animal => animal.id !== id));
      toast.success('Animal deleted successfully');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
      throw error;
    }
  };

  const uploadPhoto = async (file: File, animalId?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${animalId || Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('animal-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      throw error;
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [user]);

  const getAnimalsBySpecies = (species: string) => {
    return animals.filter(animal => animal.species === species);
  };

  const getAnimalCounts = () => {
    return {
      total: animals.length,
      cattle: getAnimalsBySpecies('cattle').length,
      goats: getAnimalsBySpecies('goats').length,
      chickens: getAnimalsBySpecies('chickens').length,
      pigs: getAnimalsBySpecies('pigs').length,
    };
  };

  return {
    animals,
    loading,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    uploadPhoto,
    getAnimalsBySpecies,
    getAnimalCounts,
    refetch: fetchAnimals,
  };
};