import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { CheckCircle, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmailConfirmationPage = () => {
  return (
    <>
      
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50 px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative"
        >
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-900 via-[#D4AF37] to-gray-900" />

          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6 rounded-full bg-green-50 p-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-4 font-oswald uppercase tracking-wide"
            >
              Email Confirmed!
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8 font-inter leading-relaxed"
            >
              Thanks for confirming your E-mail - your account has been successfully created. You can now access all features of identitywear.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4 w-full"
            >
              <Link to="/login" className="w-full">
                <Button className="w-full bg-black hover:bg-gray-800 text-white font-bold py-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg uppercase tracking-wider font-oswald text-base flex items-center justify-center gap-2 group">
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Go to Login
                </Button>
              </Link>
              
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full bg-white border-2 border-gray-200 hover:border-[#D4AF37] hover:bg-gray-50 text-gray-900 font-bold py-6 rounded-xl transition-all duration-300 uppercase tracking-wider font-oswald text-base flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Go to Home
                </Button>
              </Link>
            </motion.div>
          </div>
          
          {/* Decorative bottom shape */}
          <div className="h-2 bg-gray-50 w-full mt-2" />
        </motion.div>
      </div>
    </>
  );
};

export default EmailConfirmationPage;