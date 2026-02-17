import React, { useRef } from 'react';
// Make sure you have these icons or similar ones
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const products = [
  {
    id: 1,
    name: "Stealth Tech Hoodie",
    category: "Men's Performance",
    price: "$89.00",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    alt: "Man wearing black performance hoodie in urban setting",
    tag: "New Drop",
    colors: ["#18181b", "#52525b", "#27272a"]
  },
  {
    id: 2,
    name: "Core Seamless Leggings",
    category: "Women's Training",
    price: "$65.00",
    image: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd",
    alt: "Woman stretching in seamless gym leggings",
    tag: "Best Seller",
    colors: ["#7c2d12", "#000000", "#1e3a8a"]
  },
  {
    id: 3,
    name: "Vapor Lightweight Tee",
    category: "Men's Training",
    price: "$45.00",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820",
    alt: "Athletic man wearing fitted t-shirt",
    tag: null,
    colors: ["#ffffff", "#000000", "#dc2626"]
  },
  {
    id: 4,
    name: "Aero Impact Bra",
    category: "Women's Support",
    price: "$55.00",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f",
    alt: "Fitness model wearing high support sports bra",
    tag: "Trending",
    colors: ["#000000", "#ec4899", "#8b5cf6"]
  },
  {
    id: 5,
    name: "Phantom Joggers",
    category: "Men's Lifestyle",
    price: "$75.00",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3",
    alt: "Person wearing tapered athletic joggers",
    tag: null,
    colors: ["#18181b", "#71717a"]
  },
  {
    id: 6,
    name: "Velocity Shorts 5\"",
    category: "Women's Running",
    price: "$48.00",
    image: "https://images.unsplash.com/photo-1548663505-6a004e743443",
    alt: "Runner wearing athletic shorts",
    tag: "New Color",
    colors: ["#2563eb", "#000000", "#f43f5e"]
  },
  {
    id: 7,
    name: "Titan Pump Cover",
    category: "Unisex Oversized",
    price: "$55.00",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
    alt: "Man wearing oversized black gym t-shirt",
    tag: null,
    colors: ["#000000", "#ffffff"]
  },
  {
    id: 8,
    name: "Zero-G Windbreaker",
    category: "Outerwear",
    price: "$110.00",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
    alt: "Person wearing reflective athletic windbreaker",
    tag: "Limited",
    colors: ["#1f2937", "#9ca3af"]
  }
];

const ProductCarousel = () => {
  const { toast } = useToast();
  const scrollRef = useRef(null);

  const handleAddToCart = (productName, size = null) => {
    toast({
      title: "Added to Cart",
      description: `${productName} ${size ? `(Size: ${size})` : ''} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleColorSelect = (e, colorName) => {
    e.stopPropagation();
    // Logic to switch image would go here
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340; // Approx card width + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="pc-section">
      <div className="pc-header">
        <h2 className="pc-title">Latest Drops</h2>

        {/* Navigation Buttons */}
        <div className="pc-nav-buttons">
          <button onClick={() => scroll('left')} className="pc-nav-btn" aria-label="Scroll left">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scroll('right')} className="pc-nav-btn" aria-label="Scroll right">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Changed class from pc-grid to pc-carousel-track */}
      <div className="pc-carousel-track" ref={scrollRef}>
        {products.map((product) => (
          <div key={product.id} className="pc-card">
            <div className="pc-image-container">
              {product.tag && <span className="pc-tag">{product.tag}</span>}
              <img
                src={product.image}
                alt={product.alt}
                className="pc-image"
                loading="lazy"
              />

              {/* Interactive Overlay */}
              <div className="pc-overlay">
                <div className="pc-options">
                  <span className="pc-label">Select Size</span>
                  <div className="pc-sizes">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        className="pc-size-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.name, size);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <span className="pc-label">Available Colors</span>
                  <div className="pc-colors">
                    {product.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="pc-color-btn"
                        style={{ backgroundColor: color }}
                        onClick={(e) => handleColorSelect(e, color)}
                        title={`Select color option ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    className="pc-add-btn flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.name, 'M');
                    }}
                  >
                    <ShoppingCart size={18} />
                    Quick Add
                  </button>
                </div>
              </div>
            </div>

            <div className="pc-info">
              <div className="pc-text-content">
                <h3 className="pc-name">{product.name}</h3>
                <span className="pc-category">{product.category}</span>
              </div>
              <span className="pc-price">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;