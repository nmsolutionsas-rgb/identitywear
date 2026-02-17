import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ShoppingCart, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';
import { formatToNOK } from '@/lib/currency';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import LoginPromptModal from '@/components/LoginPromptModal';

const ShopTheStyle = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addItem, removeItem, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productsResponse = await getProducts({
        limit: 3,
        offset: 7
      });

      if (productsResponse.products.length === 0) {
        setProducts([]);
        return;
      }

      const productIds = productsResponse.products.map(p => p.id);

      const quantitiesResponse = await getProductQuantities({
        fields: 'inventory_quantity',
        product_ids: productIds
      });

      const variantQuantityMap = new Map();
      quantitiesResponse.variants.forEach(variant => {
        variantQuantityMap.set(variant.id, variant.inventory_quantity);
      });

      const productsWithQuantities = productsResponse.products.map(product => {
        const variants = product.variants.map(variant => ({
          ...variant,
          inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
        }));
        return { ...product, variants };
      });

      setProducts(productsWithQuantities);

    } catch (err) {
      console.error("Failed to fetch shop combos:", err);
      setError("Failed to load curated styles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleWishlist = async (e, product) => {
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
        toast({ title: "Removed from wishlist" });
      }
    } else {
      const success = await addItem(product.id, product.title, product.image || product.thumbnail, price);
      if (success) {
        toast({ title: "Added to wishlist" });
      }
    }
  };

  const handleAddToCart = async (product) => {
    if (!product.variants || product.variants.length === 0) return;

    if (product.variants.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }

    const variant = product.variants[0];
    const maxStock = variant.inventory_quantity;

    if (maxStock <= 0 && variant.manage_inventory) {
      toast({
        title: "Out of Stock",
        description: "This item is currently unavailable.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addToCart(product, variant, 1, maxStock);
      toast({
        title: "Added to Cart! 🛒",
        description: `${product.title} has been added to your cart.`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCI yeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

  if (loading) {
    return (
      <section className="shop-style-section flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-black animate-spin" />
          <p className="text-black/55 text-sm uppercase tracking-wide">Curating styles...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shop-style-section flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4 font-medium">{error}</p>
          <Button onClick={fetchProducts} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      <section className="shop-style-section py-10 md:py-14 px-4 md:px-8">
        <div className="sts-container">
          <div className="sts-header">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/55 mb-1">Curated Outfits</p>
            <h2 className="sts-title">Shop The Style</h2>
            <p className="sts-subtitle">Get the complete look with our curated outfit selections.</p>
          </div>

          <div className="sts-grid flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="sts-main-image-wrapper relative w-full aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden"
            >
              <img
                alt="Model wearing curated Identity outfit"
                className="sts-main-image w-full h-full object-cover"
                src="https://coral-sardine-494926.hostingersite.com/wp-content/uploads/2026/01/a8e126b2-f3c5-4f36-abc2-ded487f5d1ee.png"
              />
              <div className="sts-main-overlay">
                <h3 className="sts-main-title">URBAN NOMAD COLLECTION</h3>
                <p className="sts-main-description">The perfect balance of comfort and style for the modern city explorer.</p>
              </div>
            </motion.div>

            <div className="sts-product-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {products.map((product, index) => {
                const defaultVariant = product.variants[0];
                const hasStock = !defaultVariant.manage_inventory || defaultVariant.inventory_quantity > 0;
                const price = formatToNOK(defaultVariant.sale_price_in_cents || defaultVariant.price_in_cents);
                const inWishlist = isInWishlist(product.id);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="sts-product-card group relative bg-white border border-gray-100 hover:border-gray-200 p-4 flex flex-col sm:flex-row lg:flex-row gap-4 transition-all hover:shadow-md"
                  >
                    <Link to={`/product/${product.id}`} className="sts-product-image-wrapper block w-full sm:w-28 lg:w-32 aspect-[3/4] sm:aspect-square flex-shrink-0 bg-gray-50 overflow-hidden">
                      <img
                        alt={product.title}
                        className={`sts-product-image w-full h-full object-cover transition-transform group-hover:scale-105 ${!hasStock ? 'opacity-50 grayscale' : ''}`}
                        src={product.image || placeholderImage}
                      />
                    </Link>

                    <div className="sts-product-details flex-1 flex flex-col justify-between">
                      <div>
                        <div className="sts-product-header flex justify-between items-start mb-2">
                          <Link to={`/product/${product.id}`} className="block flex-1 pr-4">
                            <h4 className="sts-product-name">
                              {product.title}
                            </h4>
                          </Link>
                          <button
                            onClick={(e) => handleToggleWishlist(e, product)}
                            className="sts-wishlist-btn p-2 -mt-2 -mr-2 touch-target hover:bg-gray-50 rounded-full"
                          >
                            <Heart
                              size={20}
                              className={inWishlist ? 'fill-[#e4202c] text-[#e4202c]' : 'text-black/35'}
                            />
                          </button>
                        </div>

                        <p className="sts-product-price text-gray-900 font-bold mb-2">{price}</p>

                        {!hasStock ? (
                          <div className="mb-2 inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                            OUT OF STOCK
                          </div>
                        ) : (
                          <div className="sts-sizes min-h-[20px]">
                            {product.variants.length > 1 && (
                              <span className="text-xs text-gray-500 font-medium">
                                {product.variants.length} Options
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!hasStock}
                        className={`mt-4 w-full py-3 px-4 flex items-center justify-between text-sm font-bold uppercase tracking-[0.14em] transition-colors font-oswald ${!hasStock
                          ? 'bg-[#f3f4f6] text-black/35 cursor-not-allowed'
                          : 'bg-[#15171b] text-white hover:bg-[#e4202c] hover:text-white'
                          }`}
                      >
                        <span>
                          {product.variants.length > 1 ? 'SELECT OPTIONS' : 'ADD TO BAG'}
                        </span>
                        {hasStock && <ArrowRight size={16} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default ShopTheStyle;