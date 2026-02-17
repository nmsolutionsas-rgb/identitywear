import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Scroll to the form section when component mounts to ensure it is in view
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      // Trim email to remove accidental whitespace
      const cleanEmail = email.trim();
      
      // Calling useAuth().login() as requested
      const { error } = await login(cleanEmail, password);
      
      if (!error) {
        // Successful login
        // Form reset not strictly necessary due to redirect, but good practice
        setEmail('');
        setPassword('');
        navigate(from, { replace: true });
      } else {
        // Handle specific Supabase auth errors if needed, 
        // though useAuth already triggers a toast.
        console.error("Login error:", error);
        
        if (error.message === 'Invalid login credentials') {
          setErrorMsg('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Please confirm your email address before signing in.');
        } else {
          setErrorMsg(error.message || 'Failed to sign in. Please try again.');
        }
        
        // Clear password to allow retry
        setPassword('');
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setErrorMsg('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      
      <div 
        ref={formRef}
        className="min-h-[80vh] flex flex-col justify-center items-center bg-white px-4 py-8 md:py-12 relative"
      >
        <Link to="/" className="absolute top-6 left-4 md:top-24 md:left-8 flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors font-oswald touch-target z-10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
        </Link>

        <div className="w-full max-w-sm space-y-8 mt-16 md:mt-0">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black font-oswald uppercase">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600 font-inter">
              Sign in to manage your orders and account
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-none text-sm font-inter animate-in fade-in slide-in-from-top-2">
              {errorMsg}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full border border-gray-300 px-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-base font-inter appearance-none rounded-none disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Email address"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full border border-gray-300 px-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-base font-inter appearance-none rounded-none pr-12 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center bg-black py-3 md:py-4 px-4 text-sm md:text-base font-bold text-white hover:bg-[#D4AF37] hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black uppercase tracking-widest rounded-none transition-colors font-oswald h-12 md:h-14 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
              </Button>
            </div>
          </form>
          
          <div className="text-center">
             <p className="text-sm text-gray-600 font-inter">
               Don't have an account?{' '}
               <Link to="/signup" className="font-bold text-black hover:text-[#D4AF37] uppercase tracking-wider font-oswald transition-colors p-2 inline-block">
                 Sign up
               </Link>
             </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;