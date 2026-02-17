import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link, useLocation } from 'react-router';
import { Loader2, Package, ShoppingBag, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatToNOK } from '@/lib/currency';

const OrderHistoryPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        setError("User not authenticated.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Handle auto-scroll when requested via navigation state
  useEffect(() => {
    if (!loading && location.state?.scrollToOrders) {
      const timer = setTimeout(() => {
        const section = document.getElementById('orders-section');
        if (section) {
          const headerOffset = 100;
          const elementPosition = section.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link to="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <>

      <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen" id="orders-section">
        <h1 className="text-3xl md:text-5xl font-bold font-oswald uppercase mb-8 text-center">My Order History</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-6" />
            <h2 className="text-xl font-bold font-oswald uppercase mb-2">No orders yet!</h2>
            <p className="text-gray-500 mb-8 max-w-md text-center">
              It looks like you haven't placed any orders. Start shopping now!
            </p>
            <Link to="/products">
              <Button className="h-12 px-8 bg-black text-white hover:bg-[#D4AF37] hover:text-black font-oswald uppercase tracking-widest">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 shadow-sm p-6 rounded-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-100 mb-4">
                  <div>
                    <h2 className="text-lg font-bold font-oswald uppercase mb-1">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0 flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                    {order.shipping_method_name && (
                       <span className="text-xs text-gray-500 flex items-center gap-1">
                         <Truck className="h-3 w-3" /> {order.shipping_method_name}
                       </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="w-16 h-20 bg-gray-100 flex-shrink-0">
                        {/* Placeholder for product image */}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          Img
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm uppercase">{item.product_title}</p>
                        <p className="text-xs text-gray-500">{item.variant_title} x {item.quantity}</p>
                        <p className="text-sm font-bold mt-1">{formatToNOK(item.price_at_purchase * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">{formatToNOK(order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold">{order.shipping_cost === 0 ? 'Free' : formatToNOK(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-bold">{formatToNOK(order.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold font-oswald pt-3 border-t border-gray-200 mt-3">
                    <span>Total</span>
                    <span>{formatToNOK(order.total_amount)}</span>
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <Link to={`/order-confirmation?order_id=${order.id}`}>
                    <Button variant="outline" className="font-oswald uppercase tracking-widest text-black border-black hover:bg-black hover:text-white">
                      View Order Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistoryPage;