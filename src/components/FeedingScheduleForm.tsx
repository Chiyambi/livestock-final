import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X } from 'lucide-react';
import { useAnimals } from '@/hooks/useAnimals';
import { useFeedingSchedules, type FeedingSchedule } from '@/hooks/useFeedingSchedules';
import { toast } from 'sonner';

interface FeedingScheduleFormProps {
  schedule?: FeedingSchedule;
  onClose?: () => void;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const FEED_TYPES = [
  'Hay',
  'Grass',
  'Corn',
  'Barley',
  'Wheat',
  'Oats',
  'Soybean meal',
  'Alfalfa',
  'Silage',
  'Pellets',
  'Mixed feed',
  'Supplements',
  'Other'
];

export function FeedingScheduleForm({ schedule, onClose }: FeedingScheduleFormProps) {
  const { animals } = useAnimals();
  const { addSchedule, updateSchedule } = useFeedingSchedules();

  const [formData, setFormData] = useState({
    animal_id: schedule?.animal_id || '',
    feed_type: schedule?.feed_type || '',
    quantity: schedule?.quantity?.toString() || '',
    feeding_time: schedule?.feeding_time || '',
    frequency: schedule?.frequency || 'daily',
    days_of_week: schedule?.days_of_week || [],
    is_active: schedule?.is_active ?? true,
    notes: schedule?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animal_id || !formData.feed_type || !formData.quantity || !formData.feeding_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.frequency === 'weekly' && formData.days_of_week.length === 0) {
      toast.error('Please select at least one day for weekly feeding');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduleData = {
        animal_id: formData.animal_id,
        feed_type: formData.feed_type,
        quantity: parseFloat(formData.quantity),
        feeding_time: formData.feeding_time,
        frequency: formData.frequency as FeedingSchedule['frequency'],
        days_of_week: formData.frequency === 'weekly' ? formData.days_of_week : null,
        is_active: formData.is_active,
        notes: formData.notes || null,
      };

      if (schedule) {
        await updateSchedule(schedule.id, scheduleData);
      } else {
        await addSchedule(scheduleData);
      }

      onClose?.();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">
            {schedule ? 'Edit Feeding Schedule' : 'New Feeding Schedule'}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {schedule ? 'Edit Schedule Details' : 'Schedule Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="animal_id">Animal *</Label>
                  <Select value={formData.animal_id} onValueChange={(value) => handleInputChange('animal_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feed_type">Feed Type *</Label>
                  <Select value={formData.feed_type} onValueChange={(value) => handleInputChange('feed_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEED_TYPES.map((feedType) => (
                        <SelectItem key={feedType} value={feedType}>
                          {feedType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity in kg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="feeding_time">Feeding Time *</Label>
                  <Input
                    id="feeding_time"
                    type="time"
                    value={formData.feeding_time}
                    onChange={(e) => handleInputChange('feeding_time', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
                  />
                  <Label htmlFor="is_active">Active Schedule</Label>
                </div>
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <Label className="text-base font-medium">Days of Week</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.id}
                          checked={formData.days_of_week.includes(day.id)}
                          onCheckedChange={() => handleDayToggle(day.id)}
                        />
                        <Label htmlFor={day.id} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this feeding schedule"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Schedule'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}