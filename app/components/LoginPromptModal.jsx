import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { X, LogIn, Heart, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoginPromptModal = ({ isOpen, onClose, mode = 'wishlist', destination = null, onLoginSuccess }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isCheckout = mode === 'checkout';
  
  // Determine where to go after login
  const targetPath = destination || (isCheckout ? '/checkout' : '/wishlist');

  const handleSignIn = () => {
    onClose();
    // Navigate to login with the return path in state
    navigate('/login', { state: { from: { pathname: targetPath } } });
    
    // If a callback is provided (for inline login flows), call it
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-md p-6 md:p-8 relative shadow-2xl border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4">
              {isCheckout ? (
                <ShoppingCart className="w-8 h-8 text-[#D4AF37]" />
              ) : (
                <Lock className="w-8 h-8 text-[#D4AF37]" />
              )}
            </div>
            <h3 className="text-2xl font-bold font-oswald uppercase mb-2">
              {isCheckout ? 'Account Optional' : 'Sign In Required'}
            </h3>
            <p className="text-gray-500 font-inter">
              {isCheckout 
                ? "You can check out faster if you sign in, or continue as a guest."
                : "Please sign in to access this feature and save your preferences."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleSignIn}
              className="w-full h-12 bg-black text-white hover:bg-[#D4AF37] hover:text-black font-oswald uppercase tracking-widest text-lg"
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
            
            {isCheckout ? (
              <Button 
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50 font-oswald uppercase tracking-widest"
              >
                Continue as Guest
              </Button>
            ) : (
               <div className="text-center">
                 <p className="text-sm text-gray-400">
                   Don't have an account? <span onClick={() => { onClose(); navigate('/signup'); }} className="underline cursor-pointer hover:text-black">Sign up</span>
                 </p>
               </div>
            )}
            
            {!isCheckout && (
              <Button 
                variant="ghost"
                onClick={onClose}
                className="w-full h-10 text-gray-400 hover:text-black hover:bg-transparent font-inter text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginPromptModal;