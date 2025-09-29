import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { type FeedingSchedule } from '@/hooks/useFeedingSchedules';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface FeedingScheduleCardProps {
  schedule: FeedingSchedule;
  onEdit: (schedule: FeedingSchedule) => void;
  onDelete: (id: string) => void;
  onMarkFed: (schedule: FeedingSchedule) => void;
}

const frequencyColors = {
  daily: 'bg-green-100 text-green-800',
  weekly: 'bg-blue-100 text-blue-800',
  'bi-weekly': 'bg-purple-100 text-purple-800',
  monthly: 'bg-orange-100 text-orange-800',
};

export function FeedingScheduleCard({ 
  schedule, 
  onEdit, 
  onDelete, 
  onMarkFed 
}: FeedingScheduleCardProps) {
  const isOverdue = schedule.next_feeding_date && isPast(new Date(schedule.next_feeding_date));
  const nextFeedingTime = schedule.next_feeding_date ? new Date(schedule.next_feeding_date) : null;

  const formatFeedingTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return format(time, 'h:mm a');
  };

  const formatDaysOfWeek = (days?: string[]) => {
    if (!days || days.length === 0) return '';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ');
  };

  return (
    <Card className={`hover:shadow-md transition-shadow group ${
      isOverdue ? 'border-red-200 bg-red-50' : 
      !schedule.is_active ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">
              {schedule.animals?.name || 'Unknown Animal'}
            </h3>
            {isOverdue && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {!schedule.is_active && (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onMarkFed(schedule)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Fed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(schedule)}>
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
                    <AlertDialogTitle>Delete Feeding Schedule</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this feeding schedule for {schedule.animals?.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(schedule.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Feed Type:</span>
              <p className="font-medium">{schedule.feed_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>
              <p className="font-medium">{schedule.quantity} kg</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Time:</span>
              <p className="font-medium">{formatFeedingTime(schedule.feeding_time)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <Badge variant="secondary" className={frequencyColors[schedule.frequency]}>
                {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
              </Badge>
            </div>
          </div>

          {schedule.frequency === 'weekly' && schedule.days_of_week && schedule.days_of_week.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Days:</span>
              <p className="font-medium">{formatDaysOfWeek(schedule.days_of_week)}</p>
            </div>
          )}

          {nextFeedingTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Next feeding:</span>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {format(nextFeedingTime, 'MMM d, h:mm a')}
                  <span className="text-xs ml-1">
                    ({formatDistanceToNow(nextFeedingTime, { addSuffix: true })})
                  </span>
                </p>
              </div>
            </div>
          )}

          {schedule.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes:</span>
              <p className="font-medium text-sm mt-1">{schedule.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => onMarkFed(schedule)}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Fed
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}