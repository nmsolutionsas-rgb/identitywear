import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { formatToNOK } from '@/lib/currency';

const PaymentMethodSelector = ({ 
  paymentMethods, 
  selectedMethod, 
  onSelect,
  error 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-oswald uppercase mb-4">Payment Method</h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {paymentMethods.filter(pm => pm.enabled).map((method) => (
          <div 
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`
              relative flex items-center p-4 cursor-pointer border transition-all duration-200
              ${selectedMethod === method.id 
                ? 'border-black bg-gray-50 ring-1 ring-black' 
                : 'border-gray-200 hover:border-gray-300 bg-white'}
            `}
          >
            <div className={`
              w-4 h-4 rounded-full border mr-4 flex items-center justify-center
              ${selectedMethod === method.id ? 'border-black' : 'border-gray-300'}
            `}>
              {selectedMethod === method.id && (
                <div className="w-2 h-2 rounded-full bg-black" />
              )}
            </div>
            
            <div className="flex-1 flex items-center gap-3">
              {method.id === 'credit_card' ? (
                <CreditCard className="h-5 w-5 text-gray-600" />
              ) : method.id === 'paypal' ? (
                <Wallet className="h-5 w-5 text-blue-600" />
              ) : (
                <CreditCard className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-bold text-sm uppercase">{method.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Payment Forms */}
      {selectedMethod === 'credit_card' && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Card Number</label>
                 <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 border border-gray-300 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full p-3 border border-gray-300 text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">CVC</label>
                    <input type="text" placeholder="123" className="w-full p-3 border border-gray-300 text-sm" />
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {selectedMethod === 'paypal' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm animate-in fade-in slide-in-from-top-2">
           <p>You will be redirected to PayPal to complete your purchase securely.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;