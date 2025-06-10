import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UserProfileSetupProps {
  onComplete: () => void;
}

export default function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');
  const [preferences, setPreferences] = useState('');
  const { toast } = useToast();

  const initializeMutation = useMutation({
    mutationFn: async (data: { name: string; interests: string; preferences: string }) => {
      return apiRequest('/api/user/initialize', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your personalized AI companion is ready to chat with you!"
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: "Could not create your profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }
    
    initializeMutation.mutate({
      name: name.trim(),
      interests: interests.trim(),
      preferences: preferences.trim()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome to Reflectibot
          </CardTitle>
          <CardDescription>
            Let's personalize your AI companion experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="interests">Your Interests</Label>
              <Textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., technology, music, cooking, sports..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            
            <div>
              <Label htmlFor="preferences">Chat Preferences</Label>
              <Textarea
                id="preferences"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g., casual conversation, technical details, encouraging tone..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={initializeMutation.isPending}
            >
              {initializeMutation.isPending ? 'Setting up...' : 'Start Chatting'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}