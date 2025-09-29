import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnimals } from '@/hooks/useAnimals';
import { useFeedingSchedules } from '@/hooks/useFeedingSchedules';
import { useVaccinations } from '@/hooks/useVaccinations';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, Syringe, BarChart3, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { profile } from 'console';
import { string } from 'zod';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { getAnimalCounts } = useAnimals();
  const { 
    schedules, 
    loading: feedingLoading,
    getUpcomingFeedings 
  } = useFeedingSchedules();
  const { 
    vaccinations,
    pendingVaccinations, 
    dueSoonVaccinations, 
    overdueVaccinations,
    loading: vaccinationLoading 
  } = useVaccinations();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const animalCounts = getAnimalCounts();
  const upcomingFeedings = getUpcomingFeedings ? getUpcomingFeedings().slice(0, 5) : [];
  const upcomingVaccinations = [...dueSoonVaccinations, ...pendingVaccinations].slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-xl font-bold text-foreground">Livestock Health Tracker</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
             Welcome back, Farmer
          </h2>
          <p className="text-muted-foreground">
            Manage your livestock health and nutrition with ease.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{animalCounts.total}</div>
              <p className="text-xs text-muted-foreground">
                {animalCounts.total === 0 ? 'No animals added yet' : `${animalCounts.total} animal${animalCounts.total > 1 ? 's' : ''} registered`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feeding Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                {schedules.length === 0 ? 'No schedules created' : `${schedules.length} active schedule${schedules.length > 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vaccinations</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingVaccinations.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingVaccinations.length === 0 ? 'No vaccinations scheduled' : `${pendingVaccinations.length} pending vaccination${pendingVaccinations.length > 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No reports generated</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with managing your livestock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/animals')}
              >
                <Users className="mr-2 h-4 w-4" />
                Add New Animal
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/feeding')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Create Feeding Schedule
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/vaccination')}
              >
                <Syringe className="mr-2 h-4 w-4" />
                Schedule Vaccination
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Vaccinations</span>
                {dueSoonVaccinations.length > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {dueSoonVaccinations.length} due soon
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Vaccinations scheduled for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vaccinationLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : upcomingVaccinations.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {upcomingVaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {vaccination.status === 'overdue' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Syringe className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {vaccination.vaccine_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vaccination.animal_name || 'Unknown Animal'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(vaccination.scheduled_date), 'MMM d')}
                        </p>
                        <Badge 
                          variant={vaccination.status === 'overdue' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {vaccination.status === 'overdue' ? 'Overdue' : 'Scheduled'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming vaccinations</p>
                  </div>
                </div>
              )}
              {upcomingVaccinations.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate('/vaccination')}
                >
                  View All Vaccinations
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Feeding Schedule</span>
                {upcomingFeedings.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {upcomingFeedings.length} upcoming
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Feeding schedules for today and upcoming feeds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedingLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : upcomingFeedings.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {upcomingFeedings.map((feeding) => (
                    <div key={feeding.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {feeding.animals?.name || 'Unknown Animal'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feeding.quantity}kg of {feeding.feed_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {feeding.next_feeding_date ? 
                              format(new Date(feeding.next_feeding_date), 'MMM d, h:mm a') : 
                              'Not scheduled'
                            }
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {feeding.frequency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No feeding schedules created</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/feeding')}
                    >
                      Create First Schedule
                    </Button>
                  </div>
                </div>
              )}
              {upcomingFeedings.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate('/feeding')}
                >
                  View All Feeding Schedules
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;