import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="container mx-auto px-4 text-center">
        <motion.p
          className='text-xs md:text-sm text-black font-oswald uppercase tracking-widest font-medium'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-[#D4AF37] mr-2">●</span> 
          Premium Streetwear Collection 2026
          <span className="text-[#D4AF37] ml-2">●</span>
        </motion.p>
      </div>
    </div>
  );
};

export default WelcomeMessage;