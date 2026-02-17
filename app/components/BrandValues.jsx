import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Zap, Truck, RefreshCw } from 'lucide-react';

const BrandValues = () => {
  const values = [
    {
      icon: Shirt,
      title: "PREMIUM MATERIALS",
      description: "Engineered fabrics that define durability and comfort."
    },
    {
      icon: Zap,
      title: "PERFECT FIT",
      description: "Anatomically designed patterns for superior movement."
    },
    {
      icon: Truck,
      title: "EXPRESS SHIPPING",
      description: "Your essentials, delivered with speed and precision."
    },
    {
      icon: RefreshCw,
      title: "HASSLE-FREE RETURNS",
      description: "30-day returns. Your satisfaction is non-negotiable."
    }
  ];

  return (
    <section className="py-24 px-6 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black font-oswald uppercase tracking-tight mb-4">
            THE STANDARD
          </h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto"></div>
        </motion.div>

        {/* Updated grid for responsive 2-column layout on mobile and 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 group hover:bg-gray-50 transition-colors duration-300 border-l-2 border-[#D4AF37]"
              >
                <div className="mb-6">
                  <Icon className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-oswald uppercase tracking-wide">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-inter font-light">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandValues;