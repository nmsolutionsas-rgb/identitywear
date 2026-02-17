import {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  LogOut,
  Package,
  LogIn,
  X,
  Heart,
  ChevronDown,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useToast} from '@/components/ui/use-toast';
import {useCart} from '@/hooks/useCart';
import {useWishlist} from '@/hooks/useWishlist';
import {useAuth} from '@/contexts/SupabaseAuthContext';
import {useProtectedNavigation} from '@/hooks/useAuthenticatedNavigation';
import ShoppingCart from '@/components/ShoppingCart';
import LoginPromptModal from '@/components/LoginPromptModal';

const CATEGORY_MENU = {
  Women: [
    {label: 'Leggings', query: 'style=leggings'},
    {label: 'Sports Bras', query: 'style=sports-bra'},
    {label: 'Tops', query: 'style=tops'},
    {label: 'Shorts', query: 'style=shorts'},
    {label: 'Hoodies', query: 'style=hoodie'},
  ],
  Men: [
    {label: 'Gym Shirts', query: 'style=gym-shirt'},
    {label: 'Tank Tops', query: 'style=tank'},
    {label: 'Joggers', query: 'style=jogger'},
    {label: 'Shorts', query: 'style=shorts'},
    {label: 'Outerwear', query: 'style=outerwear'},
  ],
  Accessories: [
    {label: 'Bags', query: 'style=bag'},
    {label: 'Caps', query: 'style=cap'},
    {label: 'Socks', query: 'style=socks'},
    {label: 'Water Bottles', query: 'style=bottle'},
    {label: 'Training Gear', query: 'activity=lifting'},
  ],
};

const PROMO_LINKS = [
  {label: 'Student Discount', href: '/products?promo=student'},
  {label: 'Newsletter Signup', href: '/products?promo=newsletter'},
  {label: 'Free Shipping Over $75', href: '/products?promo=shipping'},
  {label: 'Refer a Friend', href: '/products?promo=referral'},
];

const ANNOUNCEMENTS = [
  'New in red. Drop just landed.',
  'Free shipping in the US for orders over $75.',
  'Student discount now available on selected collections.',
];

const GymHeader = () => {
  const {toast} = useToast();
  const {cartItems, clearCart} = useCart();
  const {wishlistCount} = useWishlist();
  const {currentUser, signOut, isAuthenticated} = useAuth();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMobileSection, setOpenMobileSection] = useState('Women');

  const {
    navigateIfAuthenticated,
    showLoginModal,
    closeModal,
    intendedDestination,
  } = useProtectedNavigation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    const rotateAnnouncement = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(rotateAnnouncement);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const displayName = useMemo(() => {
    if (!currentUser?.email) return 'Account';
    return currentUser.email.split('@')[0];
  }, [currentUser]);

  const closeMenus = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setActiveCategory('');
  };

  const goToProducts = (query = '') => {
    closeMenus();
    navigate(query ? `/products?${query}` : '/products');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    goToProducts(term ? `search=${encodeURIComponent(term)}` : '');
  };

  const handleLogout = async () => {
    try {
      clearCart();
      await signOut();
      setIsUserMenuOpen(false);
      navigate('/');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch {
      toast({
        title: 'Logout error',
        description: 'There was a problem logging you out.',
        variant: 'destructive',
      });
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigateIfAuthenticated('/wishlist');
      return;
    }
    closeMenus();
    navigate('/wishlist');
  };

  const handleOrderHistoryClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigateIfAuthenticated('/order-history');
      return;
    }
    closeMenus();
    navigate('/order-history');
  };

  const openCategory = (category) => {
    setActiveCategory(category);
  };

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="bg-[#13161c] text-white text-[11px] tracking-wide hidden md:block">
          <div className="mx-auto max-w-[1700px] px-6 lg:px-10 h-10 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-[11px] uppercase">
              <MapPin size={14} className="text-[#1967ff]" />
              <span className="text-white/80">Store:</span>
              <select
                className="bg-transparent border border-white/20 px-2 py-1 text-[11px] uppercase tracking-wider"
                defaultValue="United States"
                aria-label="Store selector"
              >
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Norway</option>
                <option>Germany</option>
              </select>
            </label>

            <div className="flex items-center gap-4 text-[11px] uppercase">
              {PROMO_LINKS.map((link) => (
                <Link key={link.label} to={link.href} className="hover:text-[#e4202c] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={`bg-white border-b transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
          <div className="mx-auto max-w-[1700px] px-4 md:px-6 lg:px-10">
            <div className="h-14 md:h-12 border-b border-black/10 flex items-center justify-center overflow-hidden">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-black/75 animate-in fade-in duration-500">
                {ANNOUNCEMENTS[announcementIndex]}
              </p>
            </div>

            <div className="h-[74px] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-black hover:bg-black/5"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>

              <nav className="hidden md:flex items-center gap-1 lg:gap-2" role="navigation" aria-label="Main categories">
                {Object.keys(CATEGORY_MENU).map((category) => (
                  <div
                    key={category}
                    className="relative"
                    onMouseEnter={() => openCategory(category)}
                    onMouseLeave={() => setActiveCategory('')}
                  >
                    <button
                      className="px-3 lg:px-4 h-10 text-sm uppercase tracking-[0.16em] font-bold hover:bg-[#15171b] hover:text-white transition-colors inline-flex items-center gap-1"
                      onClick={() => goToProducts()}
                    >
                      {category}
                      <ChevronDown size={14} />
                    </button>

                    {activeCategory === category && (
                      <div className="absolute top-full left-0 mt-1 w-[340px] border border-black/10 bg-white shadow-xl p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-black/50 mb-3">Shop {category}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORY_MENU[category].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => goToProducts(item.query)}
                              className="h-10 px-3 text-left text-sm uppercase tracking-wide border border-black/10 hover:border-black hover:bg-black hover:text-white transition-colors"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <Link to="/" className="shrink-0" onClick={closeMenus}>
                <span className="text-2xl md:text-[34px] leading-none font-black tracking-tight text-[#15171b] font-oswald">
                  IDENTITYWEAR
                </span>
              </Link>

              <div className="flex items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
                  <Search size={18} className="absolute left-3 text-black/55" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="What are you looking for today?"
                    className="h-11 w-[280px] lg:w-[340px] border border-black/15 bg-[#f3f4f6] pl-10 pr-3 text-sm focus:outline-none focus:border-black"
                  />
                </form>

                <button
                  className="md:hidden touch-target text-black hover:text-[#e4202c]"
                  onClick={() => goToProducts(searchTerm ? `search=${encodeURIComponent(searchTerm)}` : '')}
                  aria-label="Open search"
                >
                  <Search size={22} />
                </button>

                <div className="relative">
                  <button
                    className="touch-target text-black hover:text-[#e4202c] transition-colors"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-label="Account menu"
                  >
                    <User size={21} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 border border-black/10 bg-white shadow-xl z-20">
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-black/10">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-black/55">Signed in</p>
                            <p className="text-sm font-bold truncate">{displayName}</p>
                          </div>
                          <button
                            onClick={handleWishlistClick}
                            className="w-full h-11 px-4 text-left text-sm uppercase tracking-wide hover:bg-black hover:text-white"
                          >
                            Wishlist
                          </button>
                          <button
                            onClick={handleOrderHistoryClick}
                            className="w-full h-11 px-4 text-left text-sm uppercase tracking-wide hover:bg-black hover:text-white"
                          >
                            Orders
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full h-11 px-4 text-left text-sm uppercase tracking-wide text-[#e4202c] hover:bg-[#e4202c] hover:text-white"
                          >
                            <LogOut className="inline-block mr-2 h-4 w-4" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={closeMenus}
                            className="h-11 px-4 text-sm uppercase tracking-wide hover:bg-black hover:text-white flex items-center"
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            onClick={closeMenus}
                            className="h-11 px-4 text-sm uppercase tracking-wide hover:bg-black hover:text-white flex items-center"
                          >
                            Register
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleWishlistClick}
                  className="touch-target relative text-black hover:text-[#e4202c] transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart size={21} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#e4202c] text-white text-[10px] min-w-4 h-4 px-1 rounded-full inline-flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  className="touch-target relative text-black hover:text-[#e4202c] transition-colors"
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Cart"
                >
                  <ShoppingBag size={21} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#15171b] text-white text-[10px] min-w-4 h-4 px-1 rounded-full inline-flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isUserMenuOpen && (
          <button
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsUserMenuOpen(false)}
            aria-label="Close account menu"
          />
        )}
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60">
          <button
            className="absolute inset-0 z-0"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          />
          <div
            className="absolute left-0 top-0 z-10 h-full w-[86vw] max-w-sm bg-white border-r border-black/10 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-black font-oswald">Menu</p>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={22} />
              </Button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mb-5">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/55" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products"
                  className="h-11 w-full border border-black/15 bg-[#f3f4f6] pl-10 pr-3 text-sm"
                />
              </div>
            </form>

            <div className="space-y-2">
              {Object.keys(CATEGORY_MENU).map((category) => (
                <div key={category} className="border border-black/10">
                  <button
                    className="w-full px-4 h-12 flex items-center justify-between text-left uppercase tracking-wide font-bold"
                    onClick={() => setOpenMobileSection((prev) => (prev === category ? '' : category))}
                  >
                    {category}
                    <ChevronDown size={18} className={`${openMobileSection === category ? 'rotate-180' : ''} transition-transform`} />
                  </button>
                  {openMobileSection === category && (
                    <div className="px-3 pb-3 space-y-1">
                      {CATEGORY_MENU[category].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => goToProducts(item.query)}
                          className="w-full h-10 px-3 border border-black/10 text-left text-sm uppercase tracking-wide hover:bg-black hover:text-white"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={handleWishlistClick}
                className="w-full h-11 px-4 border border-black/10 flex items-center justify-between uppercase tracking-wide"
              >
                Wishlist
                <ChevronRight size={16} />
              </button>
              <button
                onClick={handleOrderHistoryClick}
                className="w-full h-11 px-4 border border-black/10 flex items-center justify-between uppercase tracking-wide"
              >
                Orders
                <Package size={16} />
              </button>
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="w-full h-11 px-4 border border-black/10 flex items-center justify-between uppercase tracking-wide"
                  >
                    Login
                    <LogIn size={16} />
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenus}
                    className="w-full h-11 px-4 bg-[#15171b] text-white flex items-center justify-between uppercase tracking-wide"
                  >
                    Register
                    <ChevronRight size={16} />
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full h-11 px-4 border border-[#e4202c] text-[#e4202c] flex items-center justify-between uppercase tracking-wide"
                >
                  Logout
                  <LogOut size={16} />
                </button>
              )}
            </div>

            <div className="mt-6 border-t border-black/10 pt-4 space-y-2">
              {PROMO_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenus}
                  className="block text-xs uppercase tracking-[0.12em] text-black/65 hover:text-[#e4202c]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={closeModal}
        destination={intendedDestination}
      />
    </>
  );
};

export default GymHeader;
