import React from 'react';
import { Link } from 'react-router';

const categories = [
  { name: 'Active wear', handle: 'active-wear' },
  { name: 'Pants', handle: 'pants' },
  { name: 'Thermal Leggings', handle: 'thermal-leggings' },
  { name: 'Shorts', handle: 'shorts' },
  { name: 'Tracksuit', handle: 'tracksuits' },
  { name: 'T Shirts', handle: 't-shirts' },
  { name: 'Leggins', handle: 'leggings' },
  { name: 'Hoodies', handle: 'hoodies' },
];

const SplitBanner = () => {
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
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.handle}
                  className="cvh-item"
                  to={`/collections/${cat.handle}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="cvh-row cvh-row-middle">
              {categories.slice(3, 5).map((cat) => (
                <Link
                  key={cat.handle}
                  className="cvh-item"
                  to={`/collections/${cat.handle}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="cvh-row cvh-row-bottom">
              {categories.slice(5).map((cat) => (
                <Link
                  key={cat.handle}
                  className="cvh-item"
                  to={`/collections/${cat.handle}`}
                >
                  {cat.name}
                </Link>
              ))}
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