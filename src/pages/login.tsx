import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Alert from '@/components/Alert';

const LoginPage = () => {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Registration
        if (!email || !password || !name || !confirmPassword) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        const { error: signUpError } = await signUp(email, password, name);
        
        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }
        
        // Registration successful, show login with message
        setIsRegistering(false);
        setPassword('');
        setError('');
        alert('Registration successful! Please check your email and then log in.');
      } else {
        // Login
        if (!email || !password) {
          setError('Please enter both email and password');
          setIsLoading(false);
          return;
        }
        
        const { error: signInError } = await signIn(email, password);
        
        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
          return;
        }
        
        // Successful login, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          CIA System
        </h1>
        <h2 className="mt-3 text-center text-xl font-medium text-gray-900">
          {isRegistering ? 'Create an account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <Alert message={error} type="error" onClose={() => setError('')} />}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <Input
                id="name"
                name="name"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            
            <Input
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {isRegistering && (
              <Input
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
            
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading 
                  ? 'Processing...' 
                  : isRegistering 
                    ? 'Register' 
                    : 'Sign In'
                }
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isRegistering ? 'Already have an account?' : 'New to CIA?'}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isRegistering ? 'Sign in instead' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
