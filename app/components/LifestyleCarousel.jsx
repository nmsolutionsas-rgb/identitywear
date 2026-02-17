import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import './CategoryVideoHero.css';

const SplitBanner = () => {
  const { toast } = useToast();

  const handleCategoryClick = (category) => {
    toast({
      title: `Browsing ${category}`,
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <section className="cvh-section">
      
      {/* WRAPPER: Holds the Video and the Categories together */}
      <div className="cvh-main-wrapper">
        <div className="cvh-video-container">
          <video
            className="cvh-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="https://coral-sardine-494926.hostingersite.com/wp-content/uploads/2026/01/IMG_5447-1.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="cvh-overlay"></div>

        <div className="cvh-content">
          <div className="cvh-rows">
            <div className="cvh-row cvh-row-top">
              <span className="cvh-item" onClick={() => handleCategoryClick('Active wear')}>Active wear</span>
              <span className="cvh-item" onClick={() => handleCategoryClick('Pants')}>Pants</span>
              <span className="cvh-item" onClick={() => handleCategoryClick('Thermal Leggings')}>Thermal Leggings</span>
            </div>

            <div className="cvh-row cvh-row-middle">
              <span className="cvh-item" onClick={() => handleCategoryClick('Shorts')}>Shorts</span>
              <span className="cvh-item" onClick={() => handleCategoryClick('Tracksuit')}>Tracksuit</span>
            </div>

            <div className="cvh-row cvh-row-bottom">
              <span className="cvh-item" onClick={() => handleCategoryClick('T Shirts')}>T Shirts</span>
              <span className="cvh-item" onClick={() => handleCategoryClick('Leggins')}>Leggins</span>
              <span className="cvh-item" onClick={() => handleCategoryClick('Hoodies')}>Hoodies</span>
            </div>
          </div>
        </div>
      </div>
      {/* END WRAPPER */}

      {/* The Bottom Bar sits OUTSIDE the wrapper, creating the cut effect */}
      <div className="cvh-bottom-bar">
        <div className="cvh-bottom-inner">
          <span>FREE SHIPPING ON ORDERS OVER $150</span>
          <span>•</span>
          <span>WORLDWIDE DELIVERY</span>
          <span>•</span>
          <span>PREMIUM QUALITY GUARANTEED</span>
          <span>•</span>
          <span>EASY 30-DAY RETURNS</span>
          <span>•</span>
          <span>SECURE CHECKOUT</span>
        </div>
      </div>
    </section>
  );
};

export default SplitBanner;