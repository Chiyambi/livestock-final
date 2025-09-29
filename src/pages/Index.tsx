import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png'; // <-- make sure this path points to your logo

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl">
        <div className="mx-auto mb-8">
          <img 
            src={logo} 
            alt="App Logo" 
            className="h-20 w-20 object-contain mx-auto" 
          />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Livestock Health Tracker
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Healthy Animals, Thriving Farmers
        </p>
        <p className="mb-8 text-base text-muted-foreground max-w-lg mx-auto">
          Revolutionize your livestock management with our comprehensive digital solution for monitoring animal health, tracking feeding schedules, and managing vaccinations.
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/auth')}
          className="text-lg px-8 py-6"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
