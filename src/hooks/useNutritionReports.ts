import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import jsPDF from 'jspdf';

export interface WeightRecord {
  id: string;
  animal_id: string;
  weight: number;
  recorded_at: string;
  notes?: string;
  animal_name?: string;
}

export interface FeedingReport {
  feed_type: string;
  total_quantity: number;
  feeding_count: number;
  animals_fed: number;
}

export interface GrowthData {
  animal_id: string;
  animal_name: string;
  weights: Array<{
    weight: number;
    date: string;
  }>;
  weight_gain: number;
  growth_rate: number;
}

export interface HealthSummary {
  total_animals: number;
  healthy_animals: number;
  animals_needing_attention: number;
  completed_vaccinations: number;
  pending_vaccinations: number;
}

const useNutritionReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedingReports, setFeedingReports] = useState<FeedingReport[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeedingReports = async (timePeriod: string = 'last-30-days', animalType: string = 'all') => {
    if (!user) return;

    try {
      setLoading(true);
      const days = getDateRange(timePeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('feeding_records')
        .select(`
          feed_type,
          quantity,
          animal_id,
          animals (name, species)
        `)
        .eq('user_id', user.id)
        .gte('fed_at', startDate.toISOString());

      if (animalType !== 'all') {
        query = query.eq('animals.species', animalType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by feed type
      const feedingMap = new Map<string, { quantity: number; count: number; animals: Set<string> }>();
      
      data?.forEach((record) => {
        const existing = feedingMap.get(record.feed_type) || { quantity: 0, count: 0, animals: new Set() };
        existing.quantity += Number(record.quantity);
        existing.count += 1;
        existing.animals.add(record.animal_id);
        feedingMap.set(record.feed_type, existing);
      });

      const reports: FeedingReport[] = Array.from(feedingMap.entries()).map(([feed_type, stats]) => ({
        feed_type,
        total_quantity: stats.quantity,
        feeding_count: stats.count,
        animals_fed: stats.animals.size,
      }));

      setFeedingReports(reports);
    } catch (error) {
      console.error('Error fetching feeding reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthData = async (timePeriod: string = 'last-30-days', animalType: string = 'all') => {
    if (!user) return;

    try {
      setLoading(true);
      const days = getDateRange(timePeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('weight_records')
        .select(`
          animal_id,
          weight,
          recorded_at,
          animals (name, species)
        `)
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (animalType !== 'all') {
        query = query.eq('animals.species', animalType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by animal and calculate growth
      const animalMap = new Map<string, { name: string; weights: Array<{ weight: number; date: string }> }>();
      
      data?.forEach((record: any) => {
        const existing = animalMap.get(record.animal_id) || { 
          name: record.animals?.name || 'Unknown', 
          weights: [] 
        };
        existing.weights.push({
          weight: Number(record.weight),
          date: record.recorded_at,
        });
        animalMap.set(record.animal_id, existing);
      });

      const growthData: GrowthData[] = Array.from(animalMap.entries())
        .map(([animal_id, data]) => {
          const weights = data.weights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const weightGain = weights.length > 1 ? weights[weights.length - 1].weight - weights[0].weight : 0;
          const daysDiff = weights.length > 1 
            ? (new Date(weights[weights.length - 1].date).getTime() - new Date(weights[0].date).getTime()) / (1000 * 60 * 60 * 24)
            : 1;
          const growthRate = weightGain / Math.max(daysDiff, 1);

          return {
            animal_id,
            animal_name: data.name,
            weights,
            weight_gain: weightGain,
            growth_rate: growthRate,
          };
        })
        .filter(animal => animal.weights.length > 0);

      setGrowthData(growthData);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthSummary = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get animals count and health status
      const { data: animals, error: animalsError } = await supabase
        .from('animals')
        .select('health_status')
        .eq('user_id', user.id);

      if (animalsError) throw animalsError;

      // Get vaccination data
      const { data: vaccinations, error: vaccinationsError } = await supabase
        .from('vaccinations')
        .select('status')
        .eq('user_id', user.id);

      if (vaccinationsError) throw vaccinationsError;

      const totalAnimals = animals?.length || 0;
      const healthyAnimals = animals?.filter(a => a.health_status === 'healthy').length || 0;
      const animalsNeedingAttention = totalAnimals - healthyAnimals;
      const completedVaccinations = vaccinations?.filter(v => v.status === 'completed').length || 0;
      const pendingVaccinations = vaccinations?.filter(v => v.status === 'scheduled').length || 0;

      setHealthSummary({
        total_animals: totalAnimals,
        healthy_animals: healthyAnimals,
        animals_needing_attention: animalsNeedingAttention,
        completed_vaccinations: completedVaccinations,
        pending_vaccinations: pendingVaccinations,
      });
    } catch (error) {
      console.error('Error fetching health summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWeightRecord = async (animalId: string, weight: number, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert({
          user_id: user.id,
          animal_id: animalId,
          weight,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding weight record:', error);
      throw error;
    }
  };

  const exportToPDF = async (data: any) => {
    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      let y = 20;
      
      // Title
      pdf.setFontSize(16);
      pdf.text('Livestock Nutrition Report', 20, y);
      y += 20;
      
      // Date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, y);
      y += 20;
      
      // Feeding Reports
      if (data.feedingReports && data.feedingReports.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Feeding Summary', 20, y);
        y += 10;
        
        data.feedingReports.forEach((report: any) => {
          if (y > pageHeight - 30) {
            pdf.addPage();
            y = 20;
          }
          pdf.setFontSize(10);
          pdf.text(`Feed Type: ${report.feed_type}`, 25, y);
          y += 7;
          pdf.text(`Total Quantity: ${report.total_quantity} kg`, 25, y);
          y += 7;
          pdf.text(`Feeding Count: ${report.feeding_count}`, 25, y);
          y += 7;
          pdf.text(`Animals Fed: ${report.animals_fed}`, 25, y);
          y += 12;
        });
      }
      
      // Growth Data
      if (data.growthData && data.growthData.length > 0) {
        y += 10;
        if (y > pageHeight - 30) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFontSize(14);
        pdf.text('Growth Summary', 20, y);
        y += 10;
        
        data.growthData.forEach((growth: any) => {
          if (y > pageHeight - 30) {
            pdf.addPage();
            y = 20;
          }
          pdf.setFontSize(10);
          pdf.text(`Animal: ${growth.animal_name}`, 25, y);
          y += 7;
          pdf.text(`Weight Gain: ${growth.weight_gain.toFixed(2)} kg`, 25, y);
          y += 7;
          pdf.text(`Growth Rate: ${growth.growth_rate.toFixed(3)} kg/day`, 25, y);
          y += 12;
        });
      }
      
      // Health Summary
      if (data.healthSummary) {
        y += 10;
        if (y > pageHeight - 30) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFontSize(14);
        pdf.text('Health Summary', 20, y);
        y += 10;
        
        pdf.setFontSize(10);
        pdf.text(`Total Animals: ${data.healthSummary.total_animals}`, 25, y);
        y += 7;
        pdf.text(`Healthy Animals: ${data.healthSummary.healthy_animals}`, 25, y);
        y += 7;
        pdf.text(`Animals Needing Attention: ${data.healthSummary.animals_needing_attention}`, 25, y);
        y += 7;
        pdf.text(`Pending Vaccinations: ${data.healthSummary.pending_vaccinations}`, 25, y);
        y += 7;
        pdf.text(`Completed Vaccinations: ${data.healthSummary.completed_vaccinations}`, 25, y);
      }
      
      // Save the PDF
      const fileName = `nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF exported successfully",
        description: "Your nutrition report has been downloaded as a PDF."
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF report.",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = async (data: any[]) => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "Please select a report type with available data.",
          variant: "destructive"
        });
        return;
      }
      
      // Clean and flatten the data for CSV
      const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle different data types and escape quotes
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${value}"`;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `nutrition-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "CSV exported successfully",
        description: "Your nutrition report has been downloaded as a CSV file."
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the CSV report.",
        variant: "destructive"
      });
    }
  };

  const getDateRange = (period: string): number => {
    switch (period) {
      case 'last-7-days': return 7;
      case 'last-30-days': return 30;
      case 'last-90-days': return 90;
      case 'last-year': return 365;
      default: return 30;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeedingReports();
      fetchGrowthData();
      fetchHealthSummary();
    }
  }, [user]);

  return {
    feedingReports,
    growthData,
    healthSummary,
    weightRecords,
    loading,
    fetchFeedingReports,
    fetchGrowthData,
    fetchHealthSummary,
    addWeightRecord,
    exportToPDF,
    exportToCSV,
  };
};

export default useNutritionReports;