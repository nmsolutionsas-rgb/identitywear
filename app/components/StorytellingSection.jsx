import React from 'react';
import { motion } from 'framer-motion';
const StorytellingSection = () => {
  return <section className="w-full py-24 bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-[#D4AF37]"></div>
              <img src="https://horizons-cdn.hostinger.com/7102730f-d8f4-4a1f-aa75-55ee52ed33af/identitywear-back-history-of-hoodies-GNlgU.webp" alt="Fashion Model" className="w-full h-auto object-cover grayscale contrast-125" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-[#D4AF37]"></div>
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="w-full md:w-1/2">
            <span className="text-[#D4AF37] font-oswald font-bold tracking-widest uppercase mb-4 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-6xl font-bold text-black font-oswald uppercase leading-none mb-8">
              More Than Apparel.<br />It's Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-600">Identity.</span>
            </h2>
            <div className="w-20 h-1 bg-[#D4AF37] mb-8"></div>
            <p className="text-lg text-gray-700 font-inter leading-relaxed font-light mb-6">
              Every stitch, every fiber, every detail is crafted with purpose. We don't just make hoodies—we create armor for the modern individual who refuses to compromise on quality, comfort, or style.
            </p>
            <p className="text-lg text-gray-700 font-inter leading-relaxed font-light">
              Born from the streets, refined for the elite. Welcome to the new standard of streetwear.
            </p>
          </motion.div>

        </div>
      </div>
    </section>;
};
export default StorytellingSection;