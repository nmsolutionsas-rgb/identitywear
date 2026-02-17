import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Search, ShoppingBag, User, Menu, LogOut, Package, LogIn, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProtectedNavigation } from '@/hooks/useAuthenticatedNavigation';
import { useScrollToProducts } from '@/hooks/useScrollToProducts';
import ShoppingCart from '@/components/ShoppingCart';
import LoginPromptModal from '@/components/LoginPromptModal';
import './Header.css';

const GymHeader = () => {
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToProducts = useScrollToProducts();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use the new custom hook for protected navigation
  const { 
    navigateIfAuthenticated, 
    showLoginModal, 
    setShowLoginModal, 
    closeModal,
    intendedDestination 
  } = useProtectedNavigation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = linkName => {
    setIsMobileMenuOpen(false);
    toast({
      title: `Navigating to ${linkName}`,
      description: "🚧 This feature isn't implemented yet!"
    });
  };

  const handleLogout = async () => {
    try {
      clearCart();
      await signOut();
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Error",
        description: "There was a problem logging you out.",
        variant: "destructive"
      });
    }
  };

  // Protected navigation & Scroll logic for Wishlist
  const handleWishlistClick = (e) => {
    e.preventDefault();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    if (!isAuthenticated) {
      navigateIfAuthenticated('/wishlist');
      return;
    }

    if (location.pathname === '/wishlist') {
      const wishlistGrid = document.getElementById('wishlist-grid');
      if (wishlistGrid) {
        const headerOffset = 100;
        const elementPosition = wishlistGrid.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      navigate('/wishlist');
      setTimeout(() => {
        const wishlistGrid = document.getElementById('wishlist-grid');
        if (wishlistGrid) {
          const headerOffset = 100;
          const elementPosition = wishlistGrid.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 300);
    }
  };

  // Protected navigation & Scroll logic for Order History
  const handleOrderHistoryClick = (e) => {
    e.preventDefault();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    if (!isAuthenticated) {
      navigateIfAuthenticated('/order-history');
      return;
    }

    if (location.pathname === '/order-history') {
      const ordersSection = document.getElementById('orders-section');
      if (ordersSection) {
        const headerOffset = 100;
        const elementPosition = ordersSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      // Navigate and pass state to trigger scroll on page load
      navigate('/order-history', { state: { scrollToOrders: true } });
    }
  };

  const handleShopAllClick = (e) => {
    setIsMobileMenuOpen(false);
    scrollToProducts(e);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return <>
    <header className="header-wrapper z-40 relative h-screen min-h-[700px]">
      <div className="header-bg-image absolute inset-0 -z-10">
        <img src="https://horizons-cdn.hostinger.com/7102730f-d8f4-4a1f-aa75-55ee52ed33af/0c56eccf-5010-4011-9c56-05ffed06e861-kOvlS.png" alt="Fitness Model" className="model-full-bg w-full h-full object-cover" />
        <div className="header-dim-overlay absolute inset-0 bg-black/30"></div>
        <div className="header-diagonal-shape"></div>
      </div>

      <nav className={`header-nav fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'nav-sticky bg-black/95 py-2 shadow-lg' : 'py-4 md:py-6'}`}>
        <div className="flex items-center justify-between px-6 md:px-12 w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link to="/" onClick={handleLogoClick}>
              <img src="https://coral-sardine-494926.hostingersite.com/wp-content/uploads/2026/01/Adobe-Express-file.png" alt="Logo" className="h-8 md:h-10 object-contain" />
            </Link>
          </div>

          <ul className="nav-links hidden md:flex gap-8 text-white uppercase font-oswald tracking-widest text-sm">
            <li className="cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => handleNavClick('Men')}>Men</li>
            <li className="cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => handleNavClick('Women')}>Women</li>
            <Link to="/products" className="hover:text-[#D4AF37] transition-colors" onClick={handleShopAllClick}>Shop All</Link>
            <li className="text-red-500 cursor-pointer hover:text-red-400 transition-colors" onClick={() => handleNavClick('Sale')}>Sale</li>
          </ul>

          <div className="flex items-center gap-4 text-white">
            <Search className="w-6 h-6 cursor-pointer hover:text-[#D4AF37] transition-colors" />

            {/* Wishlist Icon */}
            <div 
              onClick={handleWishlistClick} 
              className="relative cursor-pointer hover:text-[#D4AF37] transition-colors"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-black font-bold">{wishlistCount}</span>}
            </div>

            <div className="relative group">
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-[#D4AF37] transition-colors py-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="w-6 h-6" />
                {isAuthenticated && (
                  <span className="text-xs font-bold hidden md:inline-block max-w-[100px] truncate">
                    {currentUser?.email?.split('@')[0]}
                  </span>
                )}
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white text-black shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold truncate" title={currentUser?.email}>{currentUser?.email}</p>
                      </div>
                      <button
                        onClick={handleWishlistClick}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors text-left"
                      >
                        <Heart className="w-4 h-4" /> My Wishlist
                      </button>
                      <button
                        onClick={handleOrderHistoryClick}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors text-left"
                      >
                        <Package className="w-4 h-4" /> Order History
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" /> Login / Sign Up
                    </Link>
                  )}
                </div>
              )}

              {isUserMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
              )}
            </div>

            <div className="relative cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-black font-bold">{totalItems}</span>}
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-end mb-8">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-8 w-8" />
            </Button>
          </div>

          <div className="flex flex-col gap-6 text-white text-xl font-oswald uppercase tracking-widest text-center">
            {isAuthenticated && (
              <div className="text-sm font-inter normal-case text-gray-400 mb-4 pb-4 border-b border-gray-800">
                Hi, {currentUser?.email}
              </div>
            )}

            <Link to="/products" onClick={handleShopAllClick}>Shop All</Link>
            <span onClick={() => handleNavClick('Men')}>Men</span>
            <span onClick={() => handleNavClick('Women')}>Women</span>

            {isAuthenticated ? (
              <>
                <button onClick={handleWishlistClick} className="text-[#D4AF37] uppercase">My Wishlist</button>
                <button onClick={handleOrderHistoryClick} className="text-white uppercase">My Orders</button>
                <button onClick={handleLogout} className="text-red-500 uppercase">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-black py-3 px-6 font-bold mt-4">Login / Sign Up</Link>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full px-6 md:px-16 pb-16 md:pb-24 z-20">
        <div className="text-wrapper max-w-xl text-left animate-in fade-in slide-in-from-left-10 duration-1000">
          <span className="hero-subtitle-small text-[#D4AF37] text-sm md:text-base tracking-[0.4em] uppercase font-bold mb-4 block"></span>

          <p className="hero-description text-white text-lg md:text-2xl leading-relaxed mb-10 font-medium drop-shadow-lg">
            Crush your resolutions with gear engineered for performance.
            Experience the perfect fusion of street style and athletic functionality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" onClick={scrollToProducts}>
              <Button size="lg" className="bg-white text-black hover:bg-[#D4AF37] hover:text-white px-12 py-8 text-lg font-bold rounded-none uppercase tracking-widest transition-all duration-300 shadow-xl">
                Shop Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>

    <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    
    <LoginPromptModal 
      isOpen={showLoginModal} 
      onClose={closeModal} 
      destination={intendedDestination}
    />
  </>;
};
export default GymHeader;