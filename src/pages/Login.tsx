import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, User, Shield, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!loginForm.email || !loginForm.password) {
        throw new Error('Please enter both email and password');
      }

      const user = await authService.login(loginForm.email, loginForm.password);
      
      toast({
        title: 'Welcome back!',
        description: `Login successful. Welcome ${user.name}!`,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!registerForm.name || !registerForm.email || !registerForm.password) {
        throw new Error('Please fill in all fields');
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (registerForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const user = await authService.register(registerForm.email, registerForm.password, registerForm.name);
      
      toast({
        title: 'Account Created!',
        description: `Welcome ${user.name}! You can now login.`,
      });
      
      // Clear form and switch to login tab
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-entry/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-lg relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Entry Tracker
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Secure access to tracking system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Create an account or login to access the entry tracking system
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;