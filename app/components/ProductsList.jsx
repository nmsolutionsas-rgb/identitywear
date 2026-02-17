import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, RefreshCw, Eye, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';
import { formatToNOK } from '@/lib/currency';
import LoginPromptModal from '@/components/LoginPromptModal';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index, onToggleWishlist }) => {
  const { addToCart } = useCart();
  const { isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  
  const displayPrice = useMemo(() => 
    hasSale ? formatToNOK(displayVariant.sale_price_in_cents) : formatToNOK(displayVariant.price_in_cents), 
    [displayVariant, hasSale]
  );
  const originalPrice = useMemo(() => 
    hasSale ? formatToNOK(displayVariant.price_in_cents) : null, 
    [displayVariant, hasSale]
  );

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }

    const defaultVariant = product.variants[0];

    try {
      await addToCart(product, defaultVariant, 1, defaultVariant.inventory_quantity);
      toast({
        title: "Added to Cart!",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [product, addToCart, toast, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`} className="group block h-full flex flex-col">
        <div className="bg-white overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300 relative">
          <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
            <img
              src={product.image || placeholderImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
            
            {product.ribbon_text && (
              <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#D4AF37] text-black text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-widest z-10">
                {product.ribbon_text}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={(e) => onToggleWishlist(e, product)}
              className="absolute top-2 right-2 md:top-3 md:right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-black transition-colors shadow-sm"
            >
              <Heart size={18} className={inWishlist ? "fill-red-500 text-red-500" : "text-black"} />
            </button>

            {/* Price Tag */}
            <div className="absolute bottom-16 right-2 md:top-auto md:bottom-3 md:right-3 bg-white/90 backdrop-blur-sm text-black text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 uppercase tracking-wide shadow-sm flex items-center gap-2 pointer-events-none">
              {hasSale && (
                <span className="line-through text-gray-400">{originalPrice}</span>
              )}
              <span className="text-black font-oswald">{displayPrice}</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-0 md:p-4 transform md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
               <Button 
                onClick={handleAddToCart} 
                className="w-full bg-[#D4AF37] hover:bg-black hover:text-[#D4AF37] text-black font-bold uppercase tracking-widest shadow-lg rounded-none h-12 font-oswald transition-colors md:block hidden"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> 
                {product.variants.length > 1 ? 'Select Option' : 'Add to Cart'}
              </Button>
            </div>
          </div>
          
          <div className="p-3 md:p-5 text-center flex-1">
            <h3 className="text-sm md:text-lg font-bold text-black font-oswald uppercase truncate group-hover:text-[#D4AF37] transition-colors mb-1">{product.title}</h3>
            <p className="text-xs md:text-sm text-gray-500 font-inter font-light truncate">
              {product.subtitle || 'Premium Collection'}
            </p>
          </div>
          
          <div className="px-3 pb-3 md:hidden">
             <Button 
                onClick={handleAddToCart} 
                className="w-full bg-black text-white hover:bg-[#D4AF37] hover:text-black font-bold uppercase tracking-widest rounded-none h-10 text-xs font-oswald"
              >
                {product.variants.length > 1 ? 'Select' : 'Add to Cart'}
              </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addItem, removeItem, isInWishlist } = useWishlist();

  const ITEMS_PER_PAGE = 12;
  const INITIAL_OFFSET = 8; 

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = INITIAL_OFFSET + (currentPage - 1) * ITEMS_PER_PAGE;

      const productsResponse = await getProducts({ 
        limit: ITEMS_PER_PAGE,
        offset: offset
      });

      if (productsResponse.products.length === 0) {
        setProducts([]);
        return;
      }

      const productIds = productsResponse.products.map(product => product.id);

      const quantitiesResponse = await getProductQuantities({
        fields: 'inventory_quantity',
        product_ids: productIds
      });

      const variantQuantityMap = new Map();
      quantitiesResponse.variants.forEach(variant => {
        variantQuantityMap.set(variant.id, variant.inventory_quantity);
      });

      const productsWithQuantities = productsResponse.products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
          ...variant,
          inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
        }))
      }));

      setProducts(productsWithQuantities);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      toast({
        title: "Error loading products",
        description: err.message || 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      // Auto-scroll when page changes (but not on initial load if navigated from elsewhere)
      if (currentPage > 1) {
        const gridElement = document.getElementById('products-grid');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [currentPage, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

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
        toast({ title: "Removed from Wishlist" });
      }
    } else {
      const success = await addItem(product.id, product.title, product.image || product.thumbnail, price);
      if (success) {
        toast({ title: "Added to Wishlist" });
      }
    }
  };

  return (
    <>
      
      {/* 
        This wrapper with ID "products-grid" is ALWAYS rendered.
        This allows the useScrollToProducts hook to find the target element
        immediately after navigation, even while data is still loading.
      */}
      <div className="py-12 md:py-16 bg-white min-h-screen" id="products-grid">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 px-4"
        >
          <span className="text-[#D4AF37] font-oswald font-bold tracking-widest uppercase text-xs md:text-sm mb-3 block">Premium Streetwear</span>
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 font-oswald uppercase tracking-tight">
            Shop The Collection
          </h1>
          <div className="w-16 md:w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto font-inter font-light">
            Discover our complete range of engineered apparel. Designed for performance, styled for identity.
          </p>
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading && products.length === 0 ? (
             <div className="flex flex-col justify-center items-center h-[40vh]">
              <Loader2 className="h-16 w-16 text-black animate-spin mb-4" />
              <p className="text-gray-500 text-lg font-oswald uppercase tracking-wide">Loading Collection...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-[40vh] text-center px-4">
              <div className="bg-red-50 p-8 border border-red-100 max-w-md w-full">
                <p className="text-red-600 mb-4 text-lg font-bold font-oswald uppercase">⚠️ Error loading products</p>
                <p className="text-gray-600 mb-6 font-inter">{error}</p>
                <Button 
                  onClick={fetchProducts}
                  className="bg-black text-white hover:bg-[#D4AF37] hover:text-black font-oswald uppercase tracking-widest rounded-none w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center bg-white px-4">
              <div className="p-8 max-w-md w-full">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-900 text-2xl font-bold font-oswald uppercase mb-2">No Products Found</p>
                <p className="text-gray-500 font-inter">Try checking back later for new drops!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
                {products.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>

              <div className="flex justify-center items-center gap-4 mt-16 pb-8">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={currentPage === 1 || loading}
                  onClick={handlePrevPage}
                  className="font-oswald uppercase tracking-widest border-black hover:bg-black hover:text-white transition-colors"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                <span className="font-oswald font-bold text-lg min-w-[3ch] text-center">
                  {currentPage}
                </span>

                <Button
                  variant="outline"
                  size="lg"
                  disabled={products.length < ITEMS_PER_PAGE || loading}
                  onClick={handleNextPage}
                  className="font-oswald uppercase tracking-widest border-black hover:bg-black hover:text-white transition-colors"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <LoginPromptModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        mode="wishlist"
      />
    </>
  );
};

export default ProductsList;