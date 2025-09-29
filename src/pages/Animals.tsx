import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnimals, type Animal } from '@/hooks/useAnimals';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AnimalForm } from '@/components/AnimalForm';
import { AnimalCard } from '@/components/AnimalCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Beef, Rabbit, Bird, Ham, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Animals = () => {
  const { user, loading } = useAuth();
  const { 
    animals, 
    loading: animalsLoading, 
    getAnimalsBySpecies, 
    getAnimalCounts,
    deleteAnimal 
  } = useAnimals();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const animalCounts = getAnimalCounts();
  const animalCategories = [
    { id: 'cattle', name: 'Cattle', icon: Beef, count: animalCounts.cattle, color: 'bg-amber-100 text-amber-800' },
    { id: 'goats', name: 'Goats', icon: Rabbit, count: animalCounts.goats, color: 'bg-green-100 text-green-800' },
    { id: 'chickens', name: 'Chickens', icon: Bird, count: animalCounts.chickens, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'pigs', name: 'Pigs', icon: Ham, count: animalCounts.pigs, color: 'bg-pink-100 text-pink-800' },
  ];

  const filteredAnimals = animals.filter(animal => 
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAnimal = () => {
    setEditingAnimal(null);
    setShowForm(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setShowForm(true);
  };

  const handleViewAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
  };

  const handleDeleteAnimal = async (id: string) => {
    await deleteAnimal(id);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAnimal(null);
  };

  const renderAnimalsGrid = (animalsToShow: Animal[]) => {
    if (animalsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (animalsToShow.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Animals Found</CardTitle>
            <CardDescription>
              {searchTerm 
                ? "No animals match your search criteria."
                : "Start building your livestock inventory by adding your first animal."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleAddAnimal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Animal
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {animalsToShow.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            onEdit={handleEditAnimal}
            onDelete={handleDeleteAnimal}
            onView={handleViewAnimal}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">Animals</h1>
          <Button size="sm" onClick={handleAddAnimal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Animal
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search animals..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Animal Categories */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="cattle">Cattle</TabsTrigger>
            <TabsTrigger value="goats">Goats</TabsTrigger>
            <TabsTrigger value="chickens">Chickens</TabsTrigger>
            <TabsTrigger value="pigs">Pigs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {animalCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{category.count}</div>
                      <Badge variant="secondary" className={category.color}>
                        {category.count === 0 ? 'No animals added' : `${category.count} animal${category.count > 1 ? 's' : ''}`}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {renderAnimalsGrid(filteredAnimals)}
          </TabsContent>

          {/* Individual Category Tabs */}
          {animalCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {renderAnimalsGrid(getAnimalsBySpecies(category.id).filter(animal => 
                animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                animal.breed?.toLowerCase().includes(searchTerm.toLowerCase())
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <BottomNavigation />

      {/* Add/Edit Animal Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <AnimalForm animal={editingAnimal || undefined} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      {/* Animal Details Dialog */}
      <Dialog open={!!selectedAnimal} onOpenChange={() => setSelectedAnimal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAnimal?.name}</DialogTitle>
          </DialogHeader>
          {selectedAnimal && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  {selectedAnimal.photo_url ? (
                    <img 
                      src={selectedAnimal.photo_url} 
                      alt={selectedAnimal.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold">
                      {selectedAnimal.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedAnimal.name}</h3>
                  <Badge className="capitalize">{selectedAnimal.species}</Badge>
                </div>
              </div>
              
              <div className="grid gap-2 text-sm">
                {selectedAnimal.breed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breed:</span>
                    <span>{selectedAnimal.breed}</span>
                  </div>
                )}
                {selectedAnimal.age && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>{selectedAnimal.age} months</span>
                  </div>
                )}
                {selectedAnimal.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{selectedAnimal.weight} kg</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health Status:</span>
                  <Badge variant="secondary" className="capitalize">
                    {selectedAnimal.health_status}
                  </Badge>
                </div>
                {selectedAnimal.notes && (
                  <div>
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1 text-sm">{selectedAnimal.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    setSelectedAnimal(null);
                    handleEditAnimal(selectedAnimal);
                  }}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAnimal(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Animals;