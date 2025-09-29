import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vaccination } from '@/hooks/useVaccinations';
import { Calendar, Clock, Syringe, CheckCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface VaccinationCardProps {
  vaccination: Vaccination;
  onEdit: () => void;
  onDelete: () => void;
  onMarkCompleted: () => void;
}

export function VaccinationCard({ 
  vaccination, 
  onEdit, 
  onDelete, 
  onMarkCompleted 
}: VaccinationCardProps) {
  const getStatusIcon = () => {
    switch (vaccination.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusVariant = () => {
    switch (vaccination.status) {
      case 'completed':
        return 'default' as const;
      case 'overdue':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp');
  };

  const isOverdue = vaccination.status === 'overdue';
  const isCompleted = vaccination.status === 'completed';

  return (
    <Card className={`w-full transition-colors ${
      isOverdue ? 'border-destructive bg-destructive/5' : 
      isCompleted ? 'border-green-200 bg-green-50/50' : 
      'hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Syringe className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">{vaccination.vaccine_name}</h3>
              <p className="text-sm text-muted-foreground">{vaccination.animal_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge variant={getStatusVariant()}>
              {vaccination.status.charAt(0).toUpperCase() + vaccination.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {isCompleted ? 'Completed:' : 'Scheduled:'}
            </span>
            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
              {formatDate(isCompleted && vaccination.completed_date ? 
                vaccination.completed_date : 
                vaccination.scheduled_date
              )}
            </span>
          </div>
          
          {vaccination.notes && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              <span className="font-medium">Notes:</span> {vaccination.notes}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkCompleted}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}