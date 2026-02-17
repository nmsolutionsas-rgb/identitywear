import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Truck, ShieldCheck, User, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatToNOK } from '@/lib/currency';

import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';

const CheckoutPage = () => {
  const { user, currentUser, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [storeSettings, setStoreSettings] = useState(null);
  const [taxRate, setTaxRate] = useState(0); // Default to 0, will be updated from settings
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Shipping Address State
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    country: 'NO'
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);

  // Dynamic Shipping State
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);

  const activeUser = currentUser || user;

  const {
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    setIsProcessing,
    errors,
    storeStripeSession
  } = useCheckout();

  // Redirect empty cart
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/products');
    }
  }, [cartItems, navigate]);

  // Pre-fill email
  useEffect(() => {
    if (activeUser?.email) {
      setEmail(activeUser.email);
    }
  }, [activeUser]);

  // Fetch Settings (Tax Rate & Company Details)
  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('online_store_settings').select('*').single();
        if (mounted && data) {
          setStoreSettings(data);
          // Set tax rate if available, default to 0 if not (or handle logic accordingly)
          // Ensure it's a number. If stored as 25 (%), convert to 0.25
          if (data.tax_rate !== undefined && data.tax_rate !== null) {
            setTaxRate(Number(data.tax_rate) / 100); 
          }
        }
      } catch (err) {
        // Silent fail, use defaults
        console.error("Failed to fetch store settings:", err);
      } finally {
        if (mounted) setIsLoadingSettings(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  // Handle Shipping Address Change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Validate Address and Fetch Options
  useEffect(() => {
    const fetchShipping = async () => {
      const { country, zip, city, address } = shippingAddress;
      
      // Basic check before hitting API
      if (!country || !zip || zip.length < 4 || !city || !address) return;

      setIsValidatingAddress(true);
      setAddressErrors({});

      try {
        // 1. Validate Address
        const { data: validationData, error: valError } = await supabase.functions.invoke('validate-shipping-address', {
          body: { country, postcode: zip, city, address }
        });

        if (valError || !validationData?.isValid) {
          if (validationData?.errors) {
            console.warn("Address validation failed:", validationData.errors);
          }
          setIsValidatingAddress(false);
          return;
        }

        // 2. Fetch Options
        setIsLoadingShipping(true);
        const cartWeight = cartItems.reduce((acc, item) => acc + (item.variant.weight || 1000) * item.quantity, 0);
        
        const { data: shippingData, error: shipError } = await supabase.functions.invoke('fetch-shipping-options', {
          body: {
            country,
            postcode: zip,
            weight: cartWeight,
            length: 30, width: 20, height: 10 
          }
        });

        if (shipError) throw shipError;

        if (shippingData?.options) {
          setShippingOptions(shippingData.options);
          
          // Select first option by default or maintain selection if still valid
          if (shippingData.options.length > 0) {
             const stillExists = selectedShippingId && shippingData.options.find(o => o.id === selectedShippingId);
             if (!stillExists) {
               const defaultOption = shippingData.options[0];
               setSelectedShippingId(defaultOption.id);
               setSelectedShippingOption(defaultOption);
             } else {
               // Update the object reference
               setSelectedShippingOption(stillExists);
             }
          }
        }

      } catch (error) {
        console.error("Error fetching shipping:", error);
        // Fallback
        const fallback = { id: 'flat_fallback', name: 'Standard Shipping', price: 99, estimatedDeliveryDays: '3-5 days' };
        setShippingOptions([fallback]);
        setSelectedShippingId(fallback.id);
        setSelectedShippingOption(fallback);
      } finally {
        setIsValidatingAddress(false);
        setIsLoadingShipping(false);
      }
    };

    const timeoutId = setTimeout(fetchShipping, 1000);
    return () => clearTimeout(timeoutId);
  }, [shippingAddress.zip, shippingAddress.country, shippingAddress.city, shippingAddress.address, cartItems]);

  // Update selected option object when ID changes
  useEffect(() => {
    if (selectedShippingId && shippingOptions.length > 0) {
      const option = shippingOptions.find(o => o.id === selectedShippingId);
      setSelectedShippingOption(option || null);
    }
  }, [selectedShippingId, shippingOptions]);

  // Calculate Totals Locally including Tax (MVA Fee)
  const calculateLocalTotals = (items, shippingOption, currentTaxRate) => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant.sale_price_in_cents || item.variant.price_in_cents || 0;
      return sum + (price * item.quantity);
    }, 0);

    const shippingPriceNOK = shippingOption ? shippingOption.price : 0;
    const shippingInCents = Math.round(shippingPriceNOK * 100);

    const preTaxTotal = subtotal + shippingInCents;
    
    // Calculate tax/MVA fee amount: (subtotal + shipping_cost) * tax_rate
    const taxAmount = Math.round(preTaxTotal * currentTaxRate);

    // Total = Subtotal + Shipping + MVA Fee
    const total = preTaxTotal + taxAmount;

    return {
      subtotal,
      shipping: shippingInCents,
      tax: taxAmount,
      total,
      taxRate: currentTaxRate
    };
  };

  const totals = calculateLocalTotals(cartItems, selectedShippingOption, taxRate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      toast({ title: "Validation Error", description: "Valid email required.", variant: "destructive" });
      return;
    }
    
    if (!selectedShippingOption) {
      toast({ title: "Shipping Required", description: "Please select a shipping method.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const currentTotals = calculateLocalTotals(cartItems, selectedShippingOption, taxRate);

      const orderPayload = {
        user_id: activeUser?.id || null, 
        total_amount: Math.round(currentTotals.total),
        shipping_cost: Math.round(currentTotals.shipping),
        shipping_method_id: selectedShippingOption.id,
        shipping_method_name: selectedShippingOption.name.replace(/\s*\(fallback\)\s*/gi, ''),
        tax_amount: Math.round(currentTotals.tax),
        currency: 'NOK',
        status: 'pending',
        payment_method: paymentMethod || 'stripe',
        created_at: new Date().toISOString(),
        shipping_address: { 
          email,
          ...shippingAddress
        }
      };

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_title: item.product.title,
        variant_id: item.variant.id,
        variant_title: item.variant.title,
        quantity: item.quantity,
        price_at_purchase: item.variant.sale_price_in_cents || item.variant.price_in_cents || 0
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      const successUrl = `${window.location.origin}/checkout-success?order_id=${orderData.id}`;
      const cancelUrl = `${window.location.origin}/checkout?canceled=true`;

      // Pass the selected shipping cost and MVA fee amount to the session creation
      const shippingRateMainUnit = currentTotals.shipping / 100;
      const taxAmountMainUnit = currentTotals.tax / 100;

      const { data: sessionData, error: functionError } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          items: cartItems.map(item => ({
             ...item,
             price: (item.variant.sale_price_in_cents || item.variant.price_in_cents) / 100,
             product_title: item.product.title,
             product_image: item.product.image,
             product_id: item.product.id,
             variant_id: item.variant.id
          })),
          successUrl,
          cancelUrl,
          orderId: orderData.id,
          customerEmail: email,
          shippingRate: shippingRateMainUnit,
          taxAmount: taxAmountMainUnit 
        }
      });

      if (functionError) throw functionError;
      if (!sessionData?.checkoutUrl) throw new Error("Invalid response from payment provider");

      storeStripeSession(sessionData.sessionId);
      window.location.href = sessionData.checkoutUrl;

    } catch (err) {
      console.error("Checkout failed:", err);
      toast({
        title: "Checkout Failed",
        description: err.message || "Could not initialize payment.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (isLoadingSettings) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold font-oswald uppercase">Checkout</h1>
           {!isAuthenticated && (
              <Link to="/login" className="text-sm font-bold underline hover:text-[#D4AF37]">
                Already have an account? Sign in
              </Link>
           )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Forms */}
          <div className="flex-1 space-y-8">
            
            {/* Contact Info */}
            <section className="bg-white p-6 border border-gray-200 shadow-sm">
               <h2 className="text-xl font-bold font-oswald uppercase mb-4 flex items-center gap-2">
                 <User className="h-5 w-5" /> Contact Information
               </h2>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-gray-500">Email Address *</label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={isAuthenticated}
                   placeholder="For order confirmation and receipt"
                   className={`w-full p-3 border ${emailError ? 'border-red-500' : 'border-gray-300'} text-sm rounded-none`}
                 />
                 {emailError && <span className="text-xs text-red-500">{emailError}</span>}
               </div>
            </section>

             {/* Shipping Address Form */}
             <section className="bg-white p-6 border border-gray-200 shadow-sm">
               <h2 className="text-xl font-bold font-oswald uppercase mb-6 flex items-center gap-2">
                 <MapPin className="h-5 w-5" /> Shipping Address
               </h2>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">First Name *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 text-sm rounded-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 text-sm rounded-none"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Address *</label>
                    <input 
                      type="text" 
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 text-sm rounded-none"
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Postal Code *</label>
                    <input 
                      type="text" 
                      name="zip"
                      value={shippingAddress.zip}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 text-sm rounded-none"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">City *</label>
                    <input 
                      type="text" 
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 text-sm rounded-none"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Country *</label>
                    <select 
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      className="w-full p-3 border border-gray-300 text-sm rounded-none bg-white"
                    >
                      <option value="NO">Norway</option>
                      <option value="SE">Sweden</option>
                      <option value="DK">Denmark</option>
                      <option value="DE">Germany</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
               </div>
            </section>

            {/* Shipping Method - Dynamic */}
            <section className="bg-white p-6 border border-gray-200 shadow-sm relative">
               <h2 className="text-xl font-bold font-oswald uppercase mb-6 flex items-center gap-2">
                 <Truck className="h-5 w-5" /> Shipping Method
               </h2>
               
               {isValidatingAddress && (
                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying address...
                 </div>
               )}

               {isLoadingShipping ? (
                 <div className="space-y-3">
                   <div className="h-16 bg-gray-100 animate-pulse rounded-none"></div>
                   <div className="h-16 bg-gray-100 animate-pulse rounded-none"></div>
                 </div>
               ) : shippingOptions.length > 0 ? (
                 <div className="space-y-3">
                   {shippingOptions.map((option) => (
                     <div 
                       key={option.id}
                       onClick={() => {
                         setSelectedShippingId(option.id);
                         setSelectedShippingOption(option);
                       }}
                       className={`flex justify-between items-center p-4 border cursor-pointer transition-all ${selectedShippingId === option.id ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedShippingId === option.id ? 'border-black' : 'border-gray-300'}`}>
                           {selectedShippingId === option.id && <div className="w-2 h-2 rounded-full bg-black" />}
                         </div>
                         <div>
                           <p className="font-bold text-sm uppercase">
                             {option.name.replace(/\s*\(fallback\)\s*/gi, '')}
                           </p>
                           <p className="text-xs text-gray-500">{option.estimatedDeliveryDays}</p>
                         </div>
                       </div>
                       <span className="font-bold text-sm">{option.price === 0 ? 'FREE' : formatToNOK(option.price * 100)}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Please enter your shipping address above to see available delivery options.</p>
                 </div>
               )}
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 border border-gray-200 shadow-sm">
               <PaymentMethodSelector 
                 paymentMethods={storeSettings?.payment_methods || []}
                 selectedMethod={paymentMethod}
                 onSelect={setPaymentMethod}
                 error={errors.paymentMethod}
               />
            </section>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/products')}
                className="w-full md:w-auto h-12 md:h-14 px-8 border-black text-black font-oswald uppercase tracking-widest hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Cart
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isProcessing || !selectedShippingOption || isLoadingShipping || isValidatingAddress}
                className="flex-1 h-12 md:h-14 bg-black text-white font-oswald uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Pay {formatToNOK(totals.total)} <ShieldCheck className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <OrderSummary 
              cartItems={cartItems}
              totals={totals}
              companyDetails={storeSettings?.company_details}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;