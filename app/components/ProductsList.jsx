import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router';
import {motion} from 'framer-motion';
import {Heart, Loader2, RefreshCw, SlidersHorizontal} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useWishlist} from '@/hooks/useWishlist';
import {useAuth} from '@/contexts/SupabaseAuthContext';
import {useToast} from '@/components/ui/use-toast';
import {getProducts, getProductQuantities} from '@/api/EcommerceApi';
import {formatToNOK} from '@/lib/currency';
import LoginPromptModal from '@/components/LoginPromptModal';

const sizeOptions = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', '3xl'];
const colorOptions = ['black', 'white', 'gray', 'red', 'blue', 'green', 'pink', 'burgundy', 'navy', 'brown', 'beige'];
const styleOptions = ['leggings', 'sports bra', 'shorts', 'hoodie', 'tank', 'gym shirt', 'seamless', 'athleisure', 'performance'];
const activityOptions = ['lifting', 'running', 'hiit', 'pilates', 'rest day'];

const colorTokens = {
  black: '#1f1f1f',
  white: '#efefef',
  gray: '#8e939c',
  grey: '#8e939c',
  red: '#b81924',
  blue: '#244ecf',
  green: '#3f6d4b',
  pink: '#d583b4',
  burgundy: '#6c1f2d',
  navy: '#233449',
  brown: '#7f5f44',
  beige: '#d6c8b4',
};

const subcategoryCards = [
  {
    title: 'High-Waisted Leggings',
    query: 'style=leggings',
    image:
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Scrunch Butt Leggings',
    query: 'style=seamless',
    image:
      'https://images.unsplash.com/photo-1521805103424-d8f8430e893e?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Gym Shirts',
    query: 'style=gym-shirt',
    image:
      'https://images.unsplash.com/photo-1584863231364-2edc166de576?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Tank Tops',
    query: 'style=tank',
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80',
  },
];

const normalize = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const collectProductText = (product) => {
  const variantTitles = product.variants?.map((variant) => variant.title).join(' ') || '';
  const optionValues =
    product.options
      ?.flatMap((option) => option.values || [])
      .map((value) => value.value)
      .join(' ') || '';

  return normalize(`${product.title} ${product.subtitle || ''} ${variantTitles} ${optionValues}`);
};

const extractColorNames = (product) => {
  const text = collectProductText(product);
  return colorOptions.filter((color) => text.includes(color)).slice(0, 4);
};

const productPriceValue = (product) => {
  const variant = product.variants?.[0];
  return variant?.sale_price_in_cents || variant?.price_in_cents || 0;
};

const FilterGroup = ({title, options, selected, onToggle}) => {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-black/45 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`h-8 px-3 text-[11px] uppercase tracking-[0.12em] border transition-colors ${
                active
                  ? 'bg-[#15171b] text-white border-[#15171b]'
                  : 'bg-white border-black/15 hover:border-black hover:bg-black hover:text-white'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ProductCard = ({product, index, onToggleWishlist, inWishlist}) => {
  const hoverImage = product.images?.[1]?.url;
  const colors = extractColorNames(product);
  const price = formatToNOK(productPriceValue(product));

  return (
    <motion.article
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.35, delay: Math.min(index * 0.03, 0.32)}}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block border border-black/10 bg-white hover:border-black transition-colors">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ebedf2]">
          {(product.ribbon_text || index % 5 === 0) && (
            <span className="absolute top-3 left-3 z-20 px-2.5 py-1 border border-black/20 text-[10px] uppercase tracking-[0.14em] bg-white/90 font-bold">
              {product.ribbon_text || 'New & Improved'}
            </span>
          )}

          <button
            onClick={(e) => onToggleWishlist(e, product)}
            className="absolute top-3 right-3 z-20 h-9 w-9 border border-black/20 bg-white/90 inline-flex items-center justify-center hover:bg-black hover:text-white transition-colors"
            aria-label="Toggle wishlist"
          >
            <Heart size={16} className={inWishlist ? 'fill-[#e4202c] text-[#e4202c]' : ''} />
          </button>

          <img
            src={product.image || product.images?.[0]?.url}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          <img
            src={hoverImage || product.image || product.images?.[0]?.url}
            alt={`${product.title} alternate`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>

        <div className="p-3.5">
          <h3 className="font-oswald text-xl leading-tight truncate">{product.title}</h3>
          <p className="text-xs uppercase tracking-[0.12em] text-black/55 mt-1 truncate">
            {product.subtitle || 'Performance Collection'}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="font-bold text-[15px]">{price}</p>
            <div className="flex gap-1.5">
              {colors.map((color) => (
                <span
                  key={`${product.id}-${color}`}
                  title={color}
                  className="h-3.5 w-3.5 border border-black/15"
                  style={{backgroundColor: colorTokens[color]}}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

const ProductsList = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(normalize(params.get('sort') || 'featured'));
  const [searchTerm, setSearchTerm] = useState(normalize(params.get('search') || ''));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState(() => {
    const style = normalize(params.get('size') || '');
    return style ? [style] : [];
  });
  const [selectedColors, setSelectedColors] = useState(() => {
    const color = normalize(params.get('color') || '');
    return color ? [color] : [];
  });
  const [selectedStyles, setSelectedStyles] = useState(() => {
    const style = normalize(params.get('style') || params.get('collection') || '');
    return style ? [style] : [];
  });
  const [selectedActivities, setSelectedActivities] = useState(() => {
    const activity = normalize(params.get('activity') || '');
    return activity ? [activity] : [];
  });

  const {toast} = useToast();
  const {isAuthenticated} = useAuth();
  const {addItem, removeItem, isInWishlist} = useWishlist();

  const toggleValue = (setter) => (value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedStyles([]);
    setSelectedActivities([]);
    setSearchTerm('');
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts({limit: 72});
      const ids = response.products.map((product) => product.id);
      const quantities = ids.length
        ? await getProductQuantities({
            fields: 'inventory_quantity',
            product_ids: ids,
          })
        : {variants: []};

      const quantityMap = new Map();
      quantities.variants.forEach((variant) => {
        quantityMap.set(variant.id, variant.inventory_quantity);
      });

      const mergedProducts = response.products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          inventory_quantity: quantityMap.get(variant.id) ?? variant.inventory_quantity,
        })),
      }));

      setProducts(mergedProducts);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      toast({
        title: 'Error loading products',
        description: err.message || 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const search = normalize(searchTerm);

    const withFilters = products.filter((product) => {
      const text = collectProductText(product);
      const sizeText = normalize(product.variants?.map((variant) => variant.title).join(' ') || '');

      const searchMatch = !search || text.includes(search);
      const colorMatch = selectedColors.length === 0 || selectedColors.some((color) => text.includes(normalize(color)));
      const styleMatch = selectedStyles.length === 0 || selectedStyles.some((style) => text.includes(normalize(style)));
      const activityMatch =
        selectedActivities.length === 0 || selectedActivities.some((activity) => text.includes(normalize(activity)));
      const sizeMatch = selectedSizes.length === 0 || selectedSizes.some((size) => sizeText.includes(normalize(size)));

      return searchMatch && colorMatch && styleMatch && activityMatch && sizeMatch;
    });

    const sorted = [...withFilters];
    switch (sortBy) {
      case 'price asc':
      case 'price-low-high':
        sorted.sort((a, b) => productPriceValue(a) - productPriceValue(b));
        break;
      case 'price desc':
      case 'price-high-low':
        sorted.sort((a, b) => productPriceValue(b) - productPriceValue(a));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
        break;
      case 'name':
      case 'name-a-z':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [products, searchTerm, selectedColors, selectedStyles, selectedActivities, selectedSizes, sortBy]);

  const onToggleWishlist = useCallback(
    async (event, product) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }

      const variant = product.variants?.[0];
      const price = variant?.sale_price_in_cents || variant?.price_in_cents || 0;

      if (isInWishlist(product.id)) {
        const success = await removeItem(product.id);
        if (success) toast({title: 'Removed from wishlist'});
      } else {
        const success = await addItem(product.id, product.title, product.image || product.thumbnail, price);
        if (success) toast({title: 'Added to wishlist'});
      }
    },
    [addItem, isAuthenticated, isInWishlist, removeItem, toast],
  );

  return (
    <>
      <div className="identity-shell min-h-screen" id="products-grid">
        <section className="border-b border-black/10 bg-[#e8ebf0]">
          <div className="mx-auto max-w-[1700px] px-4 md:px-6 lg:px-10 py-10 md:py-12">
            <p className="text-[11px] uppercase tracking-[0.24em] text-black/55 mb-2">Women · Men · Accessories</p>
            <h1 className="text-5xl md:text-7xl leading-[0.88]">Shop All</h1>
            <p className="text-sm md:text-base text-black/70 mt-3 max-w-2xl">
              Filter by size, color, style, and training activity to find activewear, athleisure, and functional
              performance gear.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
              {subcategoryCards.map((card) => (
                <Link key={card.title} to={`/products?${card.query}`} className="group block border border-black/10 bg-white overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <h2 className="absolute bottom-3 left-3 text-white text-2xl md:text-3xl leading-none">{card.title}</h2>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 bg-white">
          <div className="mx-auto max-w-[1700px] px-4 md:px-6 lg:px-10 py-4 md:py-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products"
                    className="h-11 w-full border border-black/15 bg-[#f2f4f8] px-3 text-sm"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(normalize(event.target.value))}
                  className="h-11 border border-black/15 bg-[#f2f4f8] px-3 text-sm min-w-[180px] uppercase tracking-[0.08em]"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name A-Z</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className="h-11 border-black/20 uppercase tracking-[0.1em]"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>

                <Button variant="ghost" onClick={clearFilters} className="h-11 uppercase tracking-[0.1em]">
                  Clear
                </Button>
              </div>

              {filterOpen && (
                <div className="grid gap-4 border border-black/10 bg-[#f8f9fb] p-4 md:grid-cols-2 xl:grid-cols-4">
                  <FilterGroup title="Size" options={sizeOptions} selected={selectedSizes} onToggle={toggleValue(setSelectedSizes)} />
                  <FilterGroup title="Color" options={colorOptions} selected={selectedColors} onToggle={toggleValue(setSelectedColors)} />
                  <FilterGroup title="Style" options={styleOptions} selected={selectedStyles} onToggle={toggleValue(setSelectedStyles)} />
                  <FilterGroup
                    title="Activity"
                    options={activityOptions}
                    selected={selectedActivities}
                    onToggle={toggleValue(setSelectedActivities)}
                  />
                </div>
              )}

              <p className="text-xs uppercase tracking-[0.14em] text-black/55">
                Showing {filteredProducts.length} products
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1700px] px-4 md:px-6 lg:px-10 py-8 md:py-10">
          {loading ? (
            <div className="h-[42vh] flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-black mb-3" />
              <p className="text-xs uppercase tracking-[0.16em] text-black/55">Loading Collection</p>
            </div>
          ) : error ? (
            <div className="h-[42vh] flex items-center justify-center">
              <div className="border border-red-200 bg-red-50 p-8 text-center max-w-md w-full">
                <p className="text-[#b1101c] uppercase tracking-[0.14em] text-sm mb-3">Unable to load products</p>
                <p className="text-sm text-black/70 mb-5">{error}</p>
                <Button onClick={fetchProducts} className="bg-black text-white hover:bg-[#e4202c] uppercase tracking-[0.12em]">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-[36vh] flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-oswald">No products matched your filters</p>
                <Button onClick={clearFilters} className="mt-4 bg-black text-white hover:bg-[#e4202c] uppercase tracking-[0.12em]">
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onToggleWishlist={onToggleWishlist}
                  inWishlist={isInWishlist(product.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} mode="wishlist" />
    </>
  );
};

export default ProductsList;
