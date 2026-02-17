import React from 'react';
import { formatToNOK } from '@/lib/currency';

const OrderSummary = ({
  cartItems,
  totals,
  companyDetails
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-none border border-gray-200 sticky top-4">
      <h2 className="text-xl font-bold font-oswald uppercase mb-6">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {cartItems.map((item) => (
          <div key={item.variant.id} className="flex gap-4 bg-white p-3 border border-gray-100">
            <div className="w-16 h-20 bg-gray-100 flex-shrink-0">
              <img
                src={item.product.image}
                alt={item.product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold font-oswald uppercase line-clamp-1">{item.product.title}</h3>
                <p className="text-xs text-gray-500">{item.variant.title}</p>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-sm font-bold">
                  {formatToNOK(item.variant.sale_price_in_cents || item.variant.price_in_cents)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-bold">{formatToNOK(totals.subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-bold">
            {totals.shipping === 0 ? 'Free' : formatToNOK(totals.shipping)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">MVA fee ({Math.round((totals.taxRate || 0) * 100)}%)</span>
          <span className="font-bold">
            {formatToNOK(totals.tax)}
          </span>
        </div>

        <div className="flex justify-between text-lg font-bold font-oswald border-t border-gray-200 pt-3 mt-2">
          <span>Total</span>
          <span>{formatToNOK(totals.total)}</span>
        </div>
      </div>

      {/* Company Details */}
      {companyDetails && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 font-inter">
          <p className="font-bold text-gray-900 mb-1">Merchant Details:</p>
          <p>{companyDetails.name}</p>
          <p>{companyDetails.address}</p>
          <p>{companyDetails.email}</p>
          <p>{companyDetails.phone}</p>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;