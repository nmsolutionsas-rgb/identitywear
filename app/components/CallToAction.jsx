import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const CallToAction = () => {
  return (
    <section className="py-24 px-6 bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold text-black font-oswald uppercase tracking-tighter mb-6"
        >
          ELEVATE YOUR <span className="text-[#D4AF37]">IDENTITY</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 font-inter font-light max-w-2xl mx-auto mb-12"
        >
          Don't settle for ordinary. Join the movement of individuals who demand excellence in every layer.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/products" className="inline-block group">
            <button className="bg-[#D4AF37] text-black px-10 py-4 font-oswald font-bold text-lg uppercase tracking-widest hover:bg-[#c5a028] transition-all duration-300 flex items-center gap-3">
              Shop The Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;