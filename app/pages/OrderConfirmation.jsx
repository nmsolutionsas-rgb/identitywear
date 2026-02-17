import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { CheckCircle, Package, Truck, Calendar, MapPin, ArrowRight, Loader2, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatToNOK } from '@/lib/currency';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link to="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-10 text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-oswald uppercase mb-2">Thank you for your order!</h1>
          <p className="text-gray-500 mb-6">We've received your order and will begin processing it right away.</p>
          
          <div className="flex flex-col gap-2 items-center">
            <div className="inline-block bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
              <span className="text-sm font-bold uppercase text-gray-500 mr-2">Order Number:</span>
              <span className="text-lg font-bold font-mono">#{order.id.slice(0, 8)}</span>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold uppercase ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
               <CreditCard className="h-4 w-4" />
               Payment Status: {order.status}
            </div>

            {currentUser && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Linked to account: <span className="font-bold">{currentUser.email}</span></span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 border border-gray-200">
             <h3 className="text-lg font-bold font-oswald uppercase mb-4 flex items-center gap-2">
               <MapPin className="h-5 w-5" /> Shipping Address
             </h3>
             <div className="text-sm text-gray-600 font-inter leading-relaxed">
               {order.shipping_address && (
                 <>
                    <p className="font-bold text-black">{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.zip}</p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.email && <p className="mt-2 text-gray-400 text-xs">{order.shipping_address.email}</p>}
                 </>
               )}
             </div>
          </div>
          <div className="bg-gray-50 p-6 border border-gray-200">
             <h3 className="text-lg font-bold font-oswald uppercase mb-4 flex items-center gap-2">
               <Truck className="h-5 w-5" /> Delivery Info
             </h3>
             <div className="text-sm text-gray-600 font-inter space-y-3">
               <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Shipping Method</p>
                  <p className="font-bold text-black uppercase">{order.shipping_method_name || order.payment_method || 'Standard'} Shipping</p>
                  <p className="text-xs text-gray-500">{order.shipping_method_id ? 'Calculated via Bring/Posten' : 'Standard Rate'}</p>
               </div>
               <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Order Date</p>
                  <p className="font-bold text-black">{new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 md:p-8">
          <h3 className="text-lg font-bold font-oswald uppercase mb-6 flex items-center gap-2">
            <Package className="h-5 w-5" /> Order Details
          </h3>
          
          <div className="space-y-4 mb-6">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-bold text-sm uppercase">{item.product_title}</p>
                  <p className="text-xs text-gray-500">{item.variant_title} x {item.quantity}</p>
                </div>
                <div className="font-bold text-sm">
                  {formatToNOK(item.price_at_purchase * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">{formatToNOK(order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-bold">{(order.shipping_cost || 0) === 0 ? 'Free' : formatToNOK(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="font-bold">{formatToNOK(order.tax_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold font-oswald pt-4 border-t border-gray-200 mt-4">
              <span>Total Paid</span>
              <span>{formatToNOK(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-4">
           <Link to="/products">
             <Button variant="outline" className="h-12 px-8 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white">
               Continue Shopping
             </Button>
           </Link>
           <Link to="/order-history">
             <Button className="h-12 px-8 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black">
               View Order History
             </Button>
           </Link>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;