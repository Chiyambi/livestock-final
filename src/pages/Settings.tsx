import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import ProfileEditDialog from '@/components/ProfileEditDialog';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import { User, Bell, Shield, Info, LogOut, Edit, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const { profile, updateNotificationPreference, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNotificationToggle = async (
    type: 'notification_feeding' | 'notification_vaccination' | 'notification_health_reports',
    enabled: boolean
  ) => {
    await updateNotificationPreference(type, enabled);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            {profileLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading profile...</span>
              </div>
            ) : (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.username || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.phone_number || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <ProfileEditDialog />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Feeding Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when it's time to feed your animals
                </p>
              </div>
              <Switch 
                checked={profile?.notification_feeding ?? true}
                onCheckedChange={(enabled) => handleNotificationToggle('notification_feeding', enabled)}
                disabled={profileLoading}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Vaccination Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for upcoming vaccinations
                </p>
              </div>
              <Switch 
                checked={profile?.notification_vaccination ?? true}
                onCheckedChange={(enabled) => handleNotificationToggle('notification_vaccination', enabled)}
                disabled={profileLoading}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Health Reports</p>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of animal health status
                </p>
              </div>
              <Switch 
                checked={profile?.notification_health_reports ?? false}
                onCheckedChange={(enabled) => handleNotificationToggle('notification_health_reports', enabled)}
                disabled={profileLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChangePasswordDialog />
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              About
            </CardTitle>
            <CardDescription>
              Application information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="text-muted-foreground">1.0.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;