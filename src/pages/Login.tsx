import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import sprintIqLogo from '@/assets/sprint-iq-logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (isDemo: boolean) => {
    setError('');
    const success = login(username, password, isDemo);
    
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Use username: test and password: test.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <img src={sprintIqLogo} alt="Sprint IQ" className="h-32 w-auto mx-auto" />
            <p className="text-muted-foreground">AI-assisted Sprint Planning & PBR</p>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md space-y-1">
            <p><strong>Username:</strong> test, <strong>Password:</strong> test for backend connection</p>
            <p><strong>Login as Demo</strong> (without username and password) for working mockup</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => handleLogin(false)}
              >
                Login (Real Mode)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleLogin(true)}
              >
                Login as Demo (Mock Mode)
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
