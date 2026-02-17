import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi';
import { formatToNOK } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Loader2, ArrowLeft, CheckCircle, Minus, Plus, XCircle, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import LoginPromptModal from '@/components/LoginPromptModal';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { addToCart } = useCart();
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = useCallback(async () => {
    if (product && selectedVariant) {
      const availableQuantity = selectedVariant.inventory_quantity;
      try {
        await addToCart(product, selectedVariant, quantity, availableQuantity);
        toast({
          title: "Added to Cart!",
          description: `${quantity} x ${product.title} (${selectedVariant.title}) added.`
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! Something went wrong.",
          description: error.message
        });
      }
    }
  }, [product, selectedVariant, quantity, addToCart, toast]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!product) return;

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

  const handleQuantityChange = useCallback(amount => {
    setQuantity(prevQuantity => {
      const newQuantity = prevQuantity + amount;
      if (newQuantity < 1) return 1;
      return newQuantity;
    });
  }, []);

  const handlePrevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  }, [product?.images?.length]);

  const handleNextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
    }
  }, [product?.images?.length]);

  const handleVariantSelect = useCallback(variant => {
    setSelectedVariant(variant);
    if (variant.image_url && product?.images?.length > 0) {
      const imageIndex = product.images.findIndex(image => image.url === variant.image_url);
      if (imageIndex !== -1) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [product?.images]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await getProduct(id);
        try {
          const quantitiesResponse = await getProductQuantities({
            fields: 'inventory_quantity',
            product_ids: [fetchedProduct.id]
          });
          const variantQuantityMap = new Map();
          quantitiesResponse.variants.forEach(variant => {
            variantQuantityMap.set(variant.id, variant.inventory_quantity);
          });
          const productWithQuantities = {
            ...fetchedProduct,
            variants: fetchedProduct.variants.map(variant => ({
              ...variant,
              inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
            }))
          };
          setProduct(productWithQuantities);
          if (productWithQuantities.variants && productWithQuantities.variants.length > 0) {
            setSelectedVariant(productWithQuantities.variants[0]);
          }
        } catch (quantityError) {
          throw quantityError;
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh] bg-white">
        <Loader2 className="h-16 w-16 text-black animate-spin" />
      </div>;
  }

  if (error || !product) {
    return <div className="max-w-5xl mx-auto py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-black hover:text-[#D4AF37] transition-colors mb-6 font-oswald uppercase font-bold tracking-wide">
          <ArrowLeft size={16} />
          Go back
        </Link>
        <div className="text-center text-red-600 p-8 border border-red-100 bg-red-50 rounded-none">
          <XCircle className="mx-auto h-16 w-16 mb-4" />
          <p className="mb-6 font-inter">Error loading product: {error}</p>
        </div>
      </div>;
  }

  // Format prices to NOK
  const price = selectedVariant?.sale_price_in_cents ? formatToNOK(selectedVariant.sale_price_in_cents) : formatToNOK(selectedVariant?.price_in_cents);
  const originalPrice = selectedVariant?.sale_price_in_cents ? formatToNOK(selectedVariant.price_in_cents) : null;

  const availableStock = selectedVariant ? selectedVariant.inventory_quantity : 0;
  const isStockManaged = selectedVariant?.manage_inventory ?? false;
  const canAddToCart = !isStockManaged || quantity <= availableStock;
  const currentImage = product.images[currentImageIndex];
  const hasMultipleImages = product.images.length > 1;
  const inWishlist = isInWishlist(product.id);

  return (
    <>
      
      <div className="max-w-7xl mx-auto py-6 md:py-12 px-4 sm:px-6 bg-white min-h-screen">
        <Link to="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D4AF37] transition-colors mb-4 md:mb-8 font-oswald uppercase tracking-wider text-sm font-bold touch-target">
          <ArrowLeft size={16} />
          Back to Store
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="relative"
          >
            <div className="relative overflow-hidden bg-gray-50 aspect-[3/4] md:h-[600px] w-full border border-gray-100 group">
              <img src={!currentImage?.url ? placeholderImage : currentImage.url} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

              {hasMultipleImages && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#D4AF37] text-black hover:text-white p-3 transition-colors shadow-sm touch-target rounded-full md:rounded-none" aria-label="Previous image">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#D4AF37] text-black hover:text-white p-3 transition-colors shadow-sm touch-target rounded-full md:rounded-none" aria-label="Next image">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {product.ribbon_text && <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1.5 uppercase tracking-widest shadow-md">
                  {product.ribbon_text}
                </div>}
            </div>

            {hasMultipleImages && <div className="flex gap-4 mt-4 md:mt-6 overflow-x-auto pb-2 scrollbar-hide px-1">
                {product.images.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden border transition-all duration-300 ${index === currentImageIndex ? 'border-[#D4AF37] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={!image.url ? placeholderImage : image.url} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>)}
              </div>}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }} 
            className="flex flex-col"
          >
            <div className="flex justify-between items-start">
              <h1 className="text-3xl md:text-5xl font-bold text-black mb-2 md:mb-3 font-oswald uppercase tracking-tight leading-tight">{product.title}</h1>
              {/* Wishlist Button - Protected */}
              <button 
                onClick={handleToggleWishlist}
                className="p-3 rounded-full hover:bg-gray-50 transition-colors"
                title={isAuthenticated ? "Add to Wishlist" : "Sign in to add to Wishlist"}
              >
                <Heart size={28} className={inWishlist ? "fill-red-500 text-red-500" : "text-black"} />
              </button>
            </div>
            
            <p className="text-base md:text-xl text-gray-500 mb-6 font-inter font-light">{product.subtitle}</p>

            <div className="flex items-baseline gap-4 mb-6 md:mb-8 border-b border-gray-100 pb-6 md:pb-8">
              <span className="text-2xl md:text-3xl font-bold text-black font-oswald">{price}</span>
              {selectedVariant?.sale_price_in_cents && <span className="text-lg md:text-xl text-gray-400 line-through font-oswald">{originalPrice}</span>}
            </div>

            <div className="prose prose-sm md:prose-lg text-gray-600 mb-8 font-inter font-light" dangerouslySetInnerHTML={{
            __html: product.description
          }} />

            {product.variants.length > 1 && <div className="mb-6 md:mb-8">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-3 font-oswald">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(variant => <button key={variant.id} onClick={() => handleVariantSelect(variant)} className={`min-w-[44px] min-h-[44px] px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 font-oswald border ${selectedVariant?.id === variant.id ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}>
                      {variant.title}
                    </button>)}
                </div>
              </div>}

            <div className="mb-8">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-3 font-oswald">Quantity</h3>
              <div className="inline-flex items-center border border-gray-200 h-14 w-40">
                <button onClick={() => handleQuantityChange(-1)} className="w-14 h-full flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:bg-gray-50 transition-colors touch-target">
                  <Minus size={18} />
                </button>
                <span className="flex-1 text-center text-lg text-black font-bold font-oswald">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="w-14 h-full flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:bg-gray-50 transition-colors touch-target">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={handleAddToCart} className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold py-7 h-14 text-lg uppercase tracking-widest rounded-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-oswald shadow-sm hover:shadow-md" disabled={!canAddToCart || !product.purchasable}>
                <ShoppingCart className="mr-3 h-5 w-5" /> Add to Cart
              </Button>

              {isStockManaged && canAddToCart && product.purchasable && <p className="text-sm text-green-600 mt-4 flex items-center gap-2 font-inter font-medium">
                  <CheckCircle size={16} /> {availableStock} in stock - Ready to ship
                </p>}

              {isStockManaged && !canAddToCart && product.purchasable && <p className="text-sm text-[#D4AF37] mt-4 flex items-center gap-2 font-inter font-medium">
                  <XCircle size={16} /> Low stock warning: Only {availableStock} left.
                </p>}

              {!product.purchasable && <p className="text-sm text-red-500 mt-4 flex items-center gap-2 font-inter font-medium">
                    <XCircle size={16} /> Currently unavailable
                  </p>}
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4">
               <div className="text-center">
                 <div className="text-[#D4AF37] mb-2 flex justify-center"><CheckCircle size={24} /></div>
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-black font-oswald">Premium Quality</p>
               </div>
               <div className="text-center">
                 <div className="text-[#D4AF37] mb-2 flex justify-center"><CheckCircle size={24} /></div>
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-black font-oswald">Fast Shipping</p>
               </div>
               <div className="text-center">
                 <div className="text-[#D4AF37] mb-2 flex justify-center"><CheckCircle size={24} /></div>
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-black font-oswald">Secure Checkout</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
export default ProductDetailPage;