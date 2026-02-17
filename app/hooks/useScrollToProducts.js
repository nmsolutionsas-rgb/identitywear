import { useNavigate, useLocation } from 'react-router';
import { useCallback } from 'react';

export const useScrollToProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToProducts = useCallback((e) => {
    // Prevent default link behavior if event is passed
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const isProductsPage = location.pathname === '/products';

    const performScroll = () => {
      const productsSection = document.getElementById('products-grid');
      if (productsSection) {
        // Header height offset (approximate for fixed header)
        const headerOffset = 100; 
        const elementPosition = productsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    if (isProductsPage) {
      performScroll();
    } else {
      navigate('/products');
      // Small delay to allow new page to mount and DOM to be ready
      setTimeout(performScroll, 200);
    }
  }, [location.pathname, navigate]);

  return scrollToProducts;
};