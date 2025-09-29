import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVaccinations } from '@/hooks/useVaccinations';
import { BottomNavigation } from '@/components/BottomNavigation';
import { VaccinationForm } from '@/components/VaccinationForm';
import { VaccinationCard } from '@/components/VaccinationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Syringe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Vaccination = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { 
    vaccinations,
    pendingVaccinations, 
    completedVaccinations, 
    overdueVaccinations, 
    dueSoonVaccinations,
    loading: vaccinationsLoading,
    markAsCompleted,
    deleteVaccination
  } = useVaccinations();
  
  const [showForm, setShowForm] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleEdit = (vaccination: any) => {
    setEditingVaccination(vaccination);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vaccination?')) {
      await deleteVaccination(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVaccination(null);
  };

  if (loading || !user) {
    return null;
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background p-4">
        <VaccinationForm 
          onClose={handleCloseForm}
          vaccination={editingVaccination}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">Vaccinations</h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Vaccination
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueSoonVaccinations.length}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingVaccinations.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedVaccinations.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vaccinations.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Vaccination Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {vaccinationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingVaccinations.length > 0 ? (
              pendingVaccinations.map((vaccination) => (
                <VaccinationCard
                  key={vaccination.id}
                  vaccination={vaccination}
                  onEdit={() => handleEdit(vaccination)}
                  onDelete={() => handleDelete(vaccination.id)}
                  onMarkCompleted={() => markAsCompleted(vaccination.id)}
                />
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Vaccinations</CardTitle>
                  <CardDescription>
                    Schedule vaccinations to keep your animals healthy and prevent diseases.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule First Vaccination
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedVaccinations.length > 0 ? (
              completedVaccinations.map((vaccination) => (
                <VaccinationCard
                  key={vaccination.id}
                  vaccination={vaccination}
                  onEdit={() => handleEdit(vaccination)}
                  onDelete={() => handleDelete(vaccination.id)}
                  onMarkCompleted={() => {}}
                />
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Completed Vaccinations</CardTitle>
                  <CardDescription>
                    Your vaccination history will appear here to help track animal health records.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Complete some vaccinations to see history
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {overdueVaccinations.length > 0 ? (
              overdueVaccinations.map((vaccination) => (
                <VaccinationCard
                  key={vaccination.id}
                  vaccination={vaccination}
                  onEdit={() => handleEdit(vaccination)}
                  onDelete={() => handleDelete(vaccination.id)}
                  onMarkCompleted={() => markAsCompleted(vaccination.id)}
                />
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Overdue Vaccinations</CardTitle>
                  <CardDescription>
                    Great! All your scheduled vaccinations are up to date.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
                    <span className="text-lg font-medium text-green-700">All caught up!</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Vaccination;