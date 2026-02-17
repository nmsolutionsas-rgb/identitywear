import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone, CreditCard } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
             <Link to="/">
               <img src="https://coral-sardine-494926.hostingersite.com/wp-content/uploads/2026/01/Adobe-Express-file.png" alt="identitywear" className="h-8 md:h-10 object-contain brightness-0 invert" />
             </Link>
             <p className="text-gray-400 text-sm leading-relaxed font-inter max-w-xs">
               Crush your resolutions with gear engineered for performance. Experience the perfect fusion of street style and athletic functionality.
             </p>
             <div className="flex gap-4 pt-2">
               <SocialIcon icon={<Facebook size={18} />} href="#" label="Facebook" />
               <SocialIcon icon={<Instagram size={18} />} href="#" label="Instagram" />
               <SocialIcon icon={<Twitter size={18} />} href="#" label="Twitter" />
               <SocialIcon icon={<Linkedin size={18} />} href="#" label="LinkedIn" />
             </div>
          </div>

          {/* Info Section */}
          <div>
            <h3 className="text-lg font-bold font-oswald uppercase tracking-widest mb-6 text-[#D4AF37]">Info</h3>
            <ul className="space-y-3 font-inter text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Terms & Conditions</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold font-oswald uppercase tracking-widest mb-6 text-[#D4AF37]">Contact Us</h3>
            <ul className="space-y-4 font-inter text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                   <Mail size={14} />
                </div>
                <a href="mailto:identitywearcontact@gmail.com" className="hover:text-white transition-colors">identitywearcontact@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs font-inter text-center md:text-left">
            &copy; {new Date().getFullYear()} identitywear. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
               <div className="h-6 px-2 bg-white rounded flex items-center justify-center text-[10px] font-bold text-blue-800">VISA</div>
               <div className="h-6 px-2 bg-white rounded flex items-center justify-center text-[10px] font-bold text-red-600">MC</div>
               <div className="h-6 px-2 bg-white rounded flex items-center justify-center text-[10px] font-bold text-blue-600">AMEX</div>
               <div className="h-6 px-2 bg-white rounded flex items-center justify-center text-[10px] font-bold text-black">VIPPS</div>
            </div>
          </div>
        </div>

        {/* New bottom section for web development contact */}
        <div className="pt-8 mt-8 border-t border-gray-900 text-center">
          <p className="text-gray-600 text-xl font-inter">
            Crafted by
          </p>
          <a href="https://nordicms.eu" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img src="https://i.ibb.co/rGdfC4xJ/Nordic-logo-svart-bakgrunn.jpg" alt="Nordic Logo" className="h-16 object-contain mx-auto" />
          </a>
        </div>
      </div>
    </footer>;
};
const SocialIcon = ({
  icon,
  href,
  label
}) => <a href={href} aria-label={label} className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-black hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/20">
    {icon}
  </a>;
export default Footer;