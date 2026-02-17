import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Loader2, Heart } from 'lucide-react';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';
import { formatToNOK } from '@/lib/currency';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router';
import LoginPromptModal from '@/components/LoginPromptModal';
import './ProductCarousel.css';

const ProductCarousel = () => {
  const { toast } = useToast();
  const scrollRef = useRef(null);
  const { addToCart } = useCart();
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProducts({ limit: 8 });
      const productIds = response.products.map(p => p.id);
      const quantitiesResponse = await getProductQuantities({
        fields: 'inventory_quantity',
        product_ids: productIds
      });

      const variantQuantityMap = new Map();
      quantitiesResponse.variants.forEach(v => variantQuantityMap.set(v.id, v.inventory_quantity));

      const finalProducts = response.products.map(product => ({
        ...product,
        variants: product.variants.map(v => ({
          ...v,
          inventory_quantity: variantQuantityMap.get(v.id) ?? v.inventory_quantity
        }))
      }));
      setProducts(finalProducts);
    } catch (err) {
      console.error("Unable to load latest drops.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleQuickAdd = async (e, product, variant) => {
    e.preventDefault();
    e.stopPropagation();

    // Guests can add to cart now, no auth check needed here
    if (variant.manage_inventory && variant.inventory_quantity <= 0) {
      toast({ title: "Out of Stock", variant: "destructive" });
      return;
    }
    try {
      await addToCart(product, variant, 1, variant.inventory_quantity);
      toast({
        title: "Added to Bag",
        description: `${product.title} (${variant.title}) added successfully.`
      });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const defaultVariant = product.variants[0];
    const price = defaultVariant.sale_price_in_cents || defaultVariant.price_in_cents || 0;

    if (isInWishlist(product.id)) {
      const success = await removeItem(product.id);
      if (success) {
        toast({ title: "Removed from Wishlist" });
      }
    } else {
      const success = await addItem(product.id, product.title, product.thumbnail || product.image, price);
      if (success) {
        toast({ title: "Added to Wishlist" });
      }
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile ? window.innerWidth * 0.85 : 352;

      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div className="pc-loader-container">
      <Loader2 className="animate-spin text-black w-10 h-10" />
    </div>
  );

  return (
    <>
      <section className="pc-section px-4 sm:px-6 md:px-8 py-10 md:py-14">
        <div className="pc-header flex-col md:flex-row gap-4 md:gap-0 items-start md:items-end mb-6">
          <div className="pc-title-stack">
            <span className="pc-overline">Latest Drop</span>
            <h2 className="pc-main-title">New In</h2>
          </div>
          <div className="pc-nav-buttons hidden md:flex">
            <button className="pc-nav-btn touch-target" onClick={() => scroll('left')}>
              <ChevronLeft size={22} />
            </button>
            <button className="pc-nav-btn touch-target" onClick={() => scroll('right')}>
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div
          className="pc-carousel-track flex overflow-x-auto gap-2 sm:gap-4 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          ref={scrollRef}
        >
          {products.map(product => {
            const defaultVariant = product.variants[0];
            const displayPrice = defaultVariant.sale_price_in_cents
              ? formatToNOK(defaultVariant.sale_price_in_cents)
              : formatToNOK(defaultVariant.price_in_cents);
            const inWishlist = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                className="pc-card group min-w-[85vw] sm:min-w-[320px] md:min-w-[350px] snap-center"
              >
                <div className="pc-image-container aspect-[3/4] relative overflow-hidden bg-gray-100">
                  {defaultVariant.sale_price_in_cents && (
                    <span className="pc-sale-tag">Sale</span>
                  )}

                  {/* Wishlist Button - Triggers Login Prompt if not auth */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className="absolute top-2 right-2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-black transition-colors shadow-sm"
                  >
                    <Heart size={18} className={inWishlist ? "fill-[#e4202c] text-[#e4202c]" : "text-black"} />
                  </button>

                  <Link to={`/product/${product.id}`} className="pc-image-link block w-full h-full">
                    <img
                      src={product.thumbnail || product.image}
                      alt={product.title}
                      className="pc-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  <div className="pc-drawer absolute bottom-0 left-0 right-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                    <div className="pc-drawer-content p-4">
                      <span className="pc-drawer-label block text-xs font-bold uppercase tracking-wider mb-2 text-center text-gray-500">Quick Add</span>
                      <div className="pc-size-grid flex flex-wrap gap-2 justify-center mb-3">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            disabled={v.inventory_quantity <= 0}
                            onClick={(e) => handleQuickAdd(e, product, v)}
                            className={`pc-drawer-size-btn h-10 min-w-[40px] px-2 text-xs font-bold border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${v.inventory_quantity <= 0 ? 'out-of-stock line-through bg-gray-50' : ''}`}
                          >
                            {v.title.includes('/') ? v.title.split('/')[0].trim() : v.title}
                          </button>
                        ))}
                      </div>
                      <button
                        className="pc-drawer-details-btn w-full py-3 bg-transparent border border-black text-black font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        VIEW PRODUCT
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pc-info">
                  <div className="pc-text-box">
                    <h3 className="pc-product-name">{product.title}</h3>
                    <span className="pc-product-category">{product.subtitle || 'Performance Collection'}</span>
                  </div>
                  <span className="pc-product-price">{displayPrice}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex md:hidden gap-4 justify-end mt-4">
          <button className="p-3 border border-gray-200 rounded-none touch-target" onClick={() => scroll('left')}>
            <ChevronLeft size={20} />
          </button>
          <button className="p-3 border border-gray-200 rounded-none touch-target" onClick={() => scroll('right')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default ProductCarousel;