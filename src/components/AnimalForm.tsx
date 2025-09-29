import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, X } from 'lucide-react';
import { useAnimals, type Animal } from '@/hooks/useAnimals';
import { toast } from 'sonner';

interface AnimalFormProps {
  animal?: Animal;
  onClose?: () => void;
}

export function AnimalForm({ animal, onClose }: AnimalFormProps) {
  const navigate = useNavigate();
  const { addAnimal, updateAnimal, uploadPhoto } = useAnimals();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: animal?.name || '',
    species: animal?.species || '',
    breed: animal?.breed || '',
    age: animal?.age?.toString() || '',
    weight: animal?.weight?.toString() || '',
    health_status: animal?.health_status || 'healthy',
    notes: animal?.notes || '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(animal?.photo_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.species) {
      toast.error('Name and species are required');
      return;
    }

    setIsSubmitting(true);

    try {
      let photo_url = animal?.photo_url || '';

      // Upload photo if a new one was selected
      if (photoFile) {
        photo_url = await uploadPhoto(photoFile, animal?.id);
      }

      const animalData = {
        name: formData.name,
        species: formData.species as Animal['species'],
        breed: formData.breed || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        health_status: formData.health_status as Animal['health_status'],
        notes: formData.notes || null,
        photo_url: photo_url || null,
      };

      if (animal) {
        await updateAnimal(animal.id, animalData);
      } else {
        await addAnimal(animalData);
      }

      onClose ? onClose() : navigate('/animals');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose ? onClose() : navigate('/animals');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">
            {animal ? 'Edit Animal' : 'Add New Animal'}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{animal ? 'Edit Animal Details' : 'Animal Information'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview} alt="Animal photo" />
                  <AvatarFallback>
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {photoPreview ? 'Change Photo' : 'Add Photo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Animal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter animal name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="species">Species *</Label>
                  <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cattle">Cattle</SelectItem>
                      <SelectItem value="goats">Goats</SelectItem>
                      <SelectItem value="chickens">Chickens</SelectItem>
                      <SelectItem value="pigs">Pigs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    placeholder="Enter breed"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age (months)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter age in months"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Enter weight in kg"
                  />
                </div>

                <div>
                  <Label htmlFor="health_status">Health Status</Label>
                  <Select value={formData.health_status} onValueChange={(value) => handleInputChange('health_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="injured">Injured</SelectItem>
                      <SelectItem value="recovering">Recovering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes about the animal"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Animal'}
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