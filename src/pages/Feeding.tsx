import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeedingSchedules, type FeedingSchedule } from '@/hooks/useFeedingSchedules';
import { useNotifications } from '@/hooks/useNotifications';
import useProfile from '@/hooks/useProfile';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FeedingScheduleForm } from '@/components/FeedingScheduleForm';
import { FeedingScheduleCard } from '@/components/FeedingScheduleCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Calendar, Clock, AlertTriangle, Bell, BellOff, Loader2 } from 'lucide-react';

const Feeding = () => {
  const { user, loading } = useAuth();
  const { 
    schedules, 
    records,
    loading: schedulesLoading, 
    getUpcomingFeedings,
    getOverdueFeedings,
    deleteSchedule,
    recordFeeding 
  } = useFeedingSchedules();
  const { 
    permission, 
    requestPermission, 
    scheduleFeedingReminders 
  } = useNotifications();
  const { profile, updateNotificationPreference } = useProfile();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FeedingSchedule | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Schedule notifications for upcoming feedings
    if (schedules.length > 0 && permission.granted && profile?.notification_feeding) {
      const schedulesWithAnimalNames = schedules
        .filter(s => s.is_active && s.next_feeding_date)
        .map(s => ({
          id: s.id,
          animal_name: s.animals?.name || 'Unknown Animal',
          feed_type: s.feed_type,
          quantity: s.quantity,
          next_feeding_date: s.next_feeding_date!
        }));

      scheduleFeedingReminders(schedulesWithAnimalNames);
    }
  }, [schedules, permission.granted, profile?.notification_feeding, scheduleFeedingReminders]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingFeedings = getUpcomingFeedings();
  const overdueFeedings = getOverdueFeedings();
  const activeSchedules = schedules.filter(s => s.is_active);
  const recentRecords = records.slice(0, 10);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowForm(true);
  };

  const handleEditSchedule = (schedule: FeedingSchedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    await deleteSchedule(id);
  };

  const handleMarkFed = async (schedule: FeedingSchedule) => {
    try {
      await recordFeeding({
        animal_id: schedule.animal_id,
        schedule_id: schedule.id,
        feed_type: schedule.feed_type,
        quantity: schedule.quantity,
        fed_at: new Date().toISOString(),
        notes: 'Fed as scheduled'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleNotificationToggle = async () => {
    if (!profile) return;

    const currentlyEnabled = profile.notification_feeding && permission.granted;
    
    if (!currentlyEnabled) {
      // Enable notifications: first request browser permission, then update profile
      const browserPermissionGranted = await requestPermission();
      if (browserPermissionGranted) {
        await updateNotificationPreference('notification_feeding', true);
      }
    } else {
      // Disable feeding notifications in profile (keep browser permission as is)
      await updateNotificationPreference('notification_feeding', false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">Feeding Schedules</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationToggle}
              className={
                profile?.notification_feeding && permission.granted 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-muted-foreground hover:text-foreground'
              }
              title={
                profile?.notification_feeding && permission.granted
                  ? 'Feeding notifications enabled'
                  : 'Enable feeding notifications'
              }
            >
              {profile?.notification_feeding && permission.granted ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" onClick={handleAddSchedule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSchedules.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeSchedules.length === 0 ? 'No active schedules' : `${activeSchedules.length} schedule${activeSchedules.length > 1 ? 's' : ''} active`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Feedings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingFeedings.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingFeedings.length === 0 ? 'No upcoming feedings' : 'Next 2 hours'}
              </p>
            </CardContent>
          </Card>

          <Card className={overdueFeedings.length > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Feedings</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${overdueFeedings.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueFeedings.length > 0 ? 'text-red-600' : ''}`}>
                {overdueFeedings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {overdueFeedings.length === 0 ? 'All up to date' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Feedings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                {recentRecords.length === 0 ? 'No recent feedings' : 'Last 10 records'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feeding Schedules Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Schedules</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueFeedings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingFeedings.length})</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {schedulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : activeSchedules.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Feeding Schedules</CardTitle>
                  <CardDescription>
                    Create your first feeding schedule to start tracking animal nutrition.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleAddSchedule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSchedules.map((schedule) => (
                  <FeedingScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={handleEditSchedule}
                    onDelete={handleDeleteSchedule}
                    onMarkFed={handleMarkFed}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {overdueFeedings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Overdue Feedings</CardTitle>
                  <CardDescription>
                    All your feeding schedules are up to date!
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overdueFeedings.map((schedule) => (
                  <FeedingScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={handleEditSchedule}
                    onDelete={handleDeleteSchedule}
                    onMarkFed={handleMarkFed}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingFeedings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Upcoming Feedings</CardTitle>
                  <CardDescription>
                    No feedings scheduled for the next 2 hours.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingFeedings.map((schedule) => (
                  <FeedingScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={handleEditSchedule}
                    onDelete={handleDeleteSchedule}
                    onMarkFed={handleMarkFed}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            {recentRecords.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Feeding Records</CardTitle>
                  <CardDescription>
                    Feeding records will appear here once you start recording feedings.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{record.animals?.name || 'Unknown Animal'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {record.quantity}kg of {record.feed_type}
                          </p>
                          {record.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(record.fed_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.fed_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />

      {/* Add/Edit Schedule Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <FeedingScheduleForm schedule={editingSchedule || undefined} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feeding;