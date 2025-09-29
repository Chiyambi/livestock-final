import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useNotifications } from '@/hooks/useNotifications';
import { Calendar, Clock, X, Syringe } from 'lucide-react';

interface VaccinationFormProps {
  onClose: () => void;
  vaccination?: {
    id: string;
    animal_id: string;
    vaccine_name: string;
    scheduled_date: string;
    notes?: string;
  };
}

export function VaccinationForm({ onClose, vaccination }: VaccinationFormProps) {
  const { animals } = useAnimals();
  const { createVaccination, updateVaccination } = useVaccinations();
  const { scheduleNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    animal_id: vaccination?.animal_id || '',
    vaccine_name: vaccination?.vaccine_name || '',
    scheduled_date: vaccination?.scheduled_date ? vaccination.scheduled_date.slice(0, 16) : '',
    notes: vaccination?.notes || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animal_id || !formData.vaccine_name || !formData.scheduled_date) {
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledDate = new Date(formData.scheduled_date).toISOString();
      
      if (vaccination) {
        await updateVaccination(vaccination.id, {
          ...formData,
          scheduled_date: scheduledDate
        });
      } else {
        const result = await createVaccination({
          ...formData,
          scheduled_date: scheduledDate
        });
        
        if (result) {
          // Schedule notification for 1 day before vaccination
          const reminderTime = new Date(formData.scheduled_date);
          reminderTime.setDate(reminderTime.getDate() - 1);
          
          const animalName = animals.find(a => a.id === formData.animal_id)?.name || 'Unknown Animal';
          
          scheduleNotification(
            'Vaccination Reminder',
            `${animalName} has a ${formData.vaccine_name} vaccination scheduled for tomorrow`,
            reminderTime,
            `vaccination-${result.id}`
          );
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving vaccination:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Syringe className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{vaccination ? 'Edit Vaccination' : 'Schedule Vaccination'}</CardTitle>
            <CardDescription>
              {vaccination ? 'Update vaccination details' : 'Schedule a new vaccination for your animal'}
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animal_id">Select Animal *</Label>
            <Select value={formData.animal_id} onValueChange={(value) => setFormData(prev => ({ ...prev, animal_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} - {animal.species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccine_name">Vaccine Name *</Label>
            <Input
              id="vaccine_name"
              type="text"
              placeholder="e.g., Rabies, DHPP, Foot & Mouth"
              value={formData.vaccine_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vaccine_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date & Time *</Label>
            <div className="relative">
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the vaccination..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (vaccination ? 'Update Vaccination' : 'Schedule Vaccination')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}