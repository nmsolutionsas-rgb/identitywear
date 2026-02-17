import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const CustomerReviews = () => {
  const reviews = [
    {
      name: "MARCUS CHEN",
      rating: 5,
      text: "Best hoodie I've ever owned. The quality is unmatched and it fits perfectly. Worth every penny.",
      role: "Verified Buyer"
    },
    {
      name: "SARAH WILLIAMS",
      rating: 5,
      text: "Finally found a brand that understands both style and comfort. The fabric is incredible.",
      role: "Verified Buyer"
    },
    {
      name: "DAVID THOMPSON",
      rating: 5,
      text: "I've recommended identitywear to all my friends. The attention to detail sets them apart.",
      role: "Verified Buyer"
    },
    {
      name: "JESSICA RODRIGUEZ",
      rating: 5,
      text: "These hoodies are my go-to for everything. Versatile, premium, and built to last.",
      role: "Verified Buyer"
    }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black font-oswald uppercase tracking-tight mb-4">
            COMMUNITY VOICES
          </h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto"></div>
        </motion.div>

        {/* Updated grid for responsive 2-column layout on mobile and desktop */}
        <div className="grid grid-cols-2 gap-8"> 
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-100 p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              
              <div className="flex gap-1 mb-4 md:mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              
              <p className="text-sm md:text-xl text-black mb-4 md:mb-8 leading-relaxed font-oswald font-light italic">
                "{review.text}"
              </p>
              
              <div className="flex flex-col">
                <span className="font-bold text-black font-oswald tracking-wider text-xs md:text-base">{review.name}</span>
                <span className="text-xxs md:text-xs text-[#D4AF37] font-inter uppercase tracking-widest font-semibold mt-1">{review.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;