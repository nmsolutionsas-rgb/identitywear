import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useCheckout = () => {
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Norway',
    phone: ''
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const updateShippingAddress = useCallback((field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    console.log('[Checkout] Validating form...');
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip'];

    requiredFields.forEach(field => {
      if (!shippingAddress[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (shippingAddress.email && !/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!shippingMethod) {
      newErrors.shippingMethod = 'Please select a shipping method';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[Checkout] Form validation result:', isValid, newErrors);
    return isValid;
  }, [shippingAddress, shippingMethod, paymentMethod]);

  const calculateTotals = useCallback((cartItems, shippingOption) => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant.sale_price_in_cents || item.variant.price_in_cents || 0;
      return sum + (price * item.quantity);
    }, 0);

    const shipping = shippingOption ? shippingOption.price : 0;
    
    // Tax calculation: (Subtotal + Shipping) * 0.25
    // Note: This logic assumes prices are tax-exclusive. 
    // If prices are tax-inclusive, this logic might need adjustment based on business rules.
    const tax = Math.round((subtotal) * 0.25); 

    const total = subtotal + shipping + tax;

    console.log('[Checkout] Totals calculated:', { subtotal, shipping, tax, total });
    return { subtotal, shipping, tax, total };
  }, []);

  const validateCheckoutParams = useCallback((items, successUrl, cancelUrl) => {
    if (!items || items.length === 0) {
      return { isValid: false, error: 'Cart is empty' };
    }
    if (!successUrl || !cancelUrl) {
      return { isValid: false, error: 'Missing redirect URLs' };
    }
    return { isValid: true };
  }, []);

  const storeStripeSession = useCallback((sessionId) => {
    try {
      localStorage.setItem('stripe_session_id', sessionId);
      console.log('[Checkout] Stored session ID:', sessionId);
    } catch (e) {
      console.warn('Could not store session ID');
    }
  }, []);

  const clearStripeSession = useCallback(() => {
    localStorage.removeItem('stripe_session_id');
  }, []);

  return {
    shippingAddress,
    setShippingAddress,
    updateShippingAddress,
    shippingMethod,
    setShippingMethod,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    setIsProcessing,
    errors,
    setErrors,
    validateForm,
    calculateTotals,
    validateCheckoutParams,
    storeStripeSession,
    clearStripeSession
  };
};