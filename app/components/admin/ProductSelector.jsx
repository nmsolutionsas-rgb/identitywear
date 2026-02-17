import React, { useState, useEffect } from 'react';
import { Search, Check, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/api/EcommerceApi';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductSelector({ onProductSelect, selectedProducts = [] }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      onProductSelect([...selectedProducts, product]);
    }
  };

  const handleRemoveProduct = (productId) => {
    onProductSelect(selectedProducts.filter(p => p.id !== productId));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <ScrollArea className="h-96 border border-gray-200 rounded-lg p-4">
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => handleSelectProduct(product)}
              >
                <img
                  src={product.image || placeholderImage}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.title}</p>
                  <p className="text-xs text-gray-500">${(product.price / 100).toFixed(2)}</p>
                </div>
                {selectedProducts.find(p => p.id === product.id) && (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Selected Products ({selectedProducts.length})</h3>
          <div className="space-y-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={product.image || placeholderImage}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">${(product.price / 100).toFixed(2)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}