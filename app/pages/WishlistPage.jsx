import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingCart, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { formatToNOK } from '@/lib/currency';

const WishlistPage = () => {
  const { wishlistItems, isLoading, removeItem, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const handleRemove = async (productId) => {
    const success = await removeItem(productId);
    if (success) {
      toast({
        title: "Item removed",
        description: "The item has been removed from your wishlist.",
      });
    }
  };

  const handleAddToCart = async (item) => {
    // Note: Since we only store basic info in wishlist, we might need to fetch full product details
    // for complex variants. For simplicity, we'll redirect to product page if complex, 
    // or we can't easily add directly without selecting size.
    // So safest bet for clothing store is redirecting to product page.
    navigate(`/product/${item.product_id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-black" />
        <p className="text-gray-500 font-oswald uppercase tracking-widest">Loading Wishlist...</p>
      </div>
    );
  }

  return (
    <>

      <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen" id="wishlist-grid">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold font-oswald uppercase mb-4">My Wishlist</h1>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <Heart className="h-16 w-16 text-gray-300 mb-6" />
            <h2 className="text-xl font-bold font-oswald uppercase mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md text-center">
              Items you love will appear here. Save them now and shop them later!
            </p>
            <Link to="/products">
              <Button className="h-12 px-8 bg-black text-white hover:bg-[#D4AF37] hover:text-black font-oswald uppercase tracking-widest">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group bg-white border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img 
                      src={item.product_image || "https://via.placeholder.com/400x500"} 
                      alt={item.product_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button 
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-[#D4AF37] hover:bg-black hover:text-[#D4AF37] text-black font-bold uppercase tracking-widest shadow-lg rounded-none h-12 font-oswald"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" /> View Product
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="text-lg font-bold font-oswald uppercase truncate hover:text-[#D4AF37] transition-colors mb-1">
                        {item.product_name}
                      </h3>
                    </Link>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {formatToNOK(item.product_price)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;