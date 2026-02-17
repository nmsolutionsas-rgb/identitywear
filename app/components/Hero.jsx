import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Hero = () => {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "Modern minimalist gym interior with sleek equipment",
    "Urban streetwear aesthetic with concrete textures",
    "Athletic performance training studio environment",
    "Contemporary workout space with natural lighting"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleShopClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <section className="relative w-full h-[100dvh] md:h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gray-900"
        >
          <img 
            className="w-full h-full object-cover"
            alt={`Background slide ${currentSlide + 1}`}
            src="https://images.unsplash.com/photo-1691527385266-62295bbcabb1" 
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-8 text-center safe-padding-bottom">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight mb-4 md:mb-6 font-oswald uppercase"
        >
          identitywear
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-200 max-w-xs sm:max-w-md md:max-w-2xl mb-8 md:mb-10 font-light font-inter leading-relaxed"
        >
          Where performance meets identity. Premium streetwear engineered for those who demand excellence in every detail.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full sm:w-auto"
        >
          <Button
            onClick={handleShopClick}
            size="lg"
            className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 px-8 sm:px-12 py-6 sm:py-6 text-base sm:text-lg font-medium transition-all duration-300 sm:hover:scale-105 font-oswald uppercase tracking-wider"
          >
            Shop Now
          </Button>
        </motion.div>

        <div className="absolute bottom-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50 w-1.5 md:w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;