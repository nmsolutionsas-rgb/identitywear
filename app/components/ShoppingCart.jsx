import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, ArrowRight, Loader2, UserCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router';
import { formatToNOK } from '@/lib/currency';
import { supabase } from '@/lib/customSupabaseClient';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotals } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [updatingItems, setUpdatingItems] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Default shipping cost for quick checkout (99 NOK)
  const DEFAULT_SHIPPING_NOK = 99;

  const handleRemove = (productTitle, variantId) => {
    setUpdatingItems(prev => ({ ...prev, [variantId]: 'deleting' }));
    setTimeout(() => {
      removeFromCart(variantId);
      setUpdatingItems(prev => {
        const newState = { ...prev };
        delete newState[variantId];
        return newState;
      });
      
      toast({
        title: "Item Removed",
        description: `${productTitle} was removed from your cart.`,
      });
    }, 300);
  };

  const handleUpdateQuantity = (productTitle, variantId, newQuantity, availableStock) => {
    if (newQuantity < 1) return;
    if (availableStock && newQuantity > availableStock) return;

    setUpdatingItems(prev => ({ ...prev, [variantId]: 'updating' }));

    setTimeout(() => {
      updateQuantity(variantId, newQuantity);
      setUpdatingItems(prev => {
        const newState = { ...prev };
        delete newState[variantId];
        return newState;
      });
    }, 300);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Prepare items for the edge function
      const items = cartItems.map(item => ({
        product_id: item.product.id,
        variant_id: item.variant.id,
        product_title: item.product.title,
        product_image: item.product.image,
        quantity: item.quantity,
        // Calculate price in normal currency units (not cents) as the edge function multiplies by 100
        price: (item.variant.sale_price_in_cents || item.variant.price_in_cents) / 100
      }));

      // Pass DEFAULT_SHIPPING_NOK to ensure shipping is included in Stripe session
      // Pass calculated tax amount (MVA fee) to ensure it is included as a line item
      const { data, error } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          items,
          successUrl: window.location.origin + '/checkout-success',
          cancelUrl: window.location.origin + '/products', 
          customerEmail: user?.email,
          shippingRate: DEFAULT_SHIPPING_NOK,
          taxAmount: cartTotals.tax / 100
        }
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was a problem initiating checkout. Please try again.",
        variant: "destructive"
      });
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[60] flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full md:w-[450px] bg-white h-full shadow-lg flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white z-10">
              <h2 className="text-2xl font-bold font-oswald uppercase flex items-center gap-2">
                Your Cart <span className="text-sm font-normal text-gray-500 normal-case">({cartItems.length} items)</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingCartIcon size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold font-oswald uppercase mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mb-8 max-w-[250px]">Looks like you haven't added any gear to your cart yet.</p>
                  <Link to="/products">
                    <Button onClick={() => setIsCartOpen(false)} className="bg-black text-white hover:bg-[#D4AF37] hover:text-black font-oswald uppercase tracking-widest px-8 py-6 h-auto text-lg transition-all duration-300">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.variant.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                      className="flex gap-4 p-4 bg-white border border-gray-100 shadow-sm relative overflow-hidden group"
                    >
                      {/* Loading Overlay */}
                      {updatingItems[item.variant.id] && (
                         <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                           <Loader2 className="h-6 w-6 animate-spin text-black" />
                         </div>
                      )}

                      {/* Product Image */}
                      <div className="w-24 h-28 flex-shrink-0 bg-gray-100 overflow-hidden relative">
                        <img 
                          src={item.product.image} 
                          alt={item.product.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${item.product.id}`} onClick={() => setIsCartOpen(false)}>
                            <h3 className="text-sm font-bold font-oswald uppercase line-clamp-1 hover:text-[#D4AF37] transition-colors mb-1">
                              {item.product.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 font-medium mb-1">{item.variant.title}</p>
                          <p className="text-sm font-bold text-black">
                             {formatToNOK(item.variant.sale_price_in_cents || item.variant.price_in_cents)}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 bg-white">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.title, item.variant.id, item.quantity - 1, item.variant.inventory_quantity)}
                              disabled={item.quantity <= 1 || updatingItems[item.variant.id]}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="w-8 text-center text-sm font-bold border-x border-gray-100 h-8 flex items-center justify-center">
                               {item.quantity}
                            </div>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.title, item.variant.id, item.quantity + 1, item.variant.inventory_quantity)}
                              disabled={(item.variant.manage_inventory && item.quantity >= item.variant.inventory_quantity) || updatingItems[item.variant.id]}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleRemove(item.product.title, item.variant.id)}
                            disabled={updatingItems[item.variant.id]}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                 <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium font-mono">{formatToNOK(cartTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>MVA fee (25%)</span>
                      <span className="font-medium font-mono">{formatToNOK(cartTotals.tax)}</span>
                    </div>
                    {/* Display estimated shipping in cart summary for clarity */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Estimated Shipping</span>
                      <span className="font-medium font-mono">{formatToNOK(DEFAULT_SHIPPING_NOK * 100)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between items-center text-xl font-bold font-oswald uppercase">
                      <span>Total</span>
                      <span>{formatToNOK(cartTotals.total + (DEFAULT_SHIPPING_NOK * 100))}</span>
                    </div>
                 </div>
                 
                {!isAuthenticated && (
                   <div className="mb-4 text-center">
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <UserCircle className="h-3 w-3" /> You can checkout as a guest - no account needed!
                      </p>
                   </div>
                )}
                 
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleCheckout} 
                    disabled={isCheckingOut}
                    className="w-full bg-black text-white hover:bg-[#D4AF37] hover:text-black font-bold py-4 h-14 text-lg uppercase tracking-widest font-oswald transition-all duration-300 shadow-lg group relative"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                      </span>
                    ) : (
                      <>
                        Quick Checkout <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-400 mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;