import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    // Scroll to the form section when component mounts to ensure it is in view
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass the name in the user_metadata options
      const { error } = await signUp(email, password, {
        data: {
          name: name
        }
      });
      
      if (!error) {
        // Redirect to login or home, usually user needs to confirm email depending on supabase settings
        // Assuming auto-confirm or allow login for this demo flow, or redirect to login
        navigate('/');
      } else {
        setErrorMsg(error.message);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred');
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black font-oswald uppercase">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600 font-inter">
              Join the movement. Define your identity.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-none text-sm font-inter">
              {errorMsg}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="relative block w-full border border-gray-300 px-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-base font-inter appearance-none rounded-none"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full border border-gray-300 px-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-base font-inter appearance-none rounded-none"
                  placeholder="Email address"
                />
              </div>
              
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full border border-gray-300 px-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-base font-inter appearance-none rounded-none pr-12"
                  placeholder="Password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative block w-full border border-gray-300 px-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-base font-inter appearance-none rounded-none pr-12"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center bg-black py-3 md:py-4 px-4 text-sm md:text-base font-bold text-white hover:bg-[#D4AF37] hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black uppercase tracking-widest rounded-none transition-colors font-oswald h-12 md:h-14"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
              </Button>
            </div>
          </form>
          
          <div className="text-center">
             <p className="text-sm text-gray-600 font-inter">
               Already have an account?{' '}
               <Link to="/login" className="font-bold text-black hover:text-[#D4AF37] uppercase tracking-wider font-oswald transition-colors p-2 inline-block">
                 Sign in
               </Link>
             </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;