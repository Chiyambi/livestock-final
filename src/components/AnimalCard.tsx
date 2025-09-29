import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Trash2, Calendar, Weight } from 'lucide-react';
import { type Animal } from '@/hooks/useAnimals';

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onView: (animal: Animal) => void;
}

const healthStatusColors = {
  healthy: 'bg-green-100 text-green-800',
  sick: 'bg-red-100 text-red-800',
  injured: 'bg-orange-100 text-orange-800',
  recovering: 'bg-blue-100 text-blue-800',
};

const speciesColors = {
  cattle: 'bg-amber-100 text-amber-800',
  goats: 'bg-green-100 text-green-800',
  chickens: 'bg-yellow-100 text-yellow-800',
  pigs: 'bg-pink-100 text-pink-800',
};

export function AnimalCard({ animal, onEdit, onDelete, onView }: AnimalCardProps) {
  const formatAge = (months: number) => {
    if (months < 12) {
      return `${months} months`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 
      ? `${years}y ${remainingMonths}m`
      : `${years} year${years > 1 ? 's' : ''}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={animal.photo_url || ''} alt={animal.name} />
              <AvatarFallback className="text-sm font-medium">
                {animal.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg" onClick={() => onView(animal)}>
                {animal.name}
              </h3>
              <Badge variant="secondary" className={speciesColors[animal.species]}>
                {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(animal)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Animal</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {animal.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(animal.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent onClick={() => onView(animal)}>
        <div className="space-y-2">
          {animal.breed && (
            <p className="text-sm text-muted-foreground">
              Breed: {animal.breed}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {animal.age && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatAge(animal.age)}
              </div>
            )}
            {animal.weight && (
              <div className="flex items-center gap-1">
                <Weight className="h-3 w-3" />
                {animal.weight} kg
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary" className={healthStatusColors[animal.health_status]}>
              {animal.health_status.charAt(0).toUpperCase() + animal.health_status.slice(1)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Added {new Date(animal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}