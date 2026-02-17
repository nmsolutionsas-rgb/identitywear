import React, { useRef, Suspense } from 'react';
import { Await, Link } from 'react-router';
import { Image, Money, CartForm } from '@shopify/hydrogen';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Product carousel that displays Shopify products from server-side loader.
 * @param {{products: Promise<RecommendedProductsQuery | null>}}
 */
const ProductCarousel = ({ products }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile ? window.innerWidth * 0.85 : 352;

      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="pc-section px-4 sm:px-6 md:px-8 py-10 md:py-14">
      <div className="pc-header flex-col md:flex-row gap-4 md:gap-0 items-start md:items-end mb-6">
        <div className="pc-title-stack">
          <span className="pc-overline">Latest Drop</span>
          <h2 className="pc-main-title">New In</h2>
        </div>
        <div className="pc-nav-buttons hidden md:flex">
          <button
            className="pc-nav-btn touch-target"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="pc-nav-btn touch-target"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="pc-loader-container">
            <div className="animate-spin text-black w-10 h-10">⟳</div>
          </div>
        }
      >
        <Await resolve={products}>
          {(response) => {
            if (!response) return null;
            const productNodes = response.products.nodes;

            return (
              <div
                className="pc-carousel-track flex overflow-x-auto gap-2 sm:gap-4 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                ref={scrollRef}
              >
                {productNodes.map((product) => {
                  const variant = product.selectedOrFirstAvailableVariant;
                  const price = variant?.price;
                  const image = variant?.image || product.featuredImage;

                  return (
                    <div
                      key={product.id}
                      className="pc-card group min-w-[85vw] sm:min-w-[320px] md:min-w-[350px] snap-center"
                    >
                      <div className="pc-image-container aspect-[3/4] relative overflow-hidden bg-gray-100">
                        <Link
                          to={`/products/${product.handle}`}
                          className="pc-image-link block w-full h-full"
                          prefetch="intent"
                        >
                          {image && (
                            <Image
                              data={image}
                              aspectRatio="3/4"
                              sizes="(min-width: 768px) 350px, 85vw"
                              className="pc-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          )}
                        </Link>

                        {/* Quick Add drawer */}
                        <div className="pc-drawer absolute bottom-0 left-0 right-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                          <div className="pc-drawer-content p-4">
                            {variant?.availableForSale && (
                              <CartForm
                                route="/cart"
                                action={CartForm.ACTIONS.LinesAdd}
                                inputs={{
                                  lines: [
                                    {
                                      merchandiseId: variant.id,
                                      quantity: 1,
                                    },
                                  ],
                                }}
                              >
                                <button
                                  type="submit"
                                  className="pc-drawer-details-btn w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-[#e4202c] transition-colors"
                                >
                                  ADD TO BAG
                                </button>
                              </CartForm>
                            )}
                            <Link
                              to={`/products/${product.handle}`}
                              className="pc-drawer-details-btn w-full py-3 bg-transparent border border-black text-black font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors block text-center mt-2"
                              prefetch="intent"
                            >
                              VIEW PRODUCT
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="pc-info">
                        <div className="pc-text-box">
                          <h3 className="pc-product-name">{product.title}</h3>
                          <span className="pc-product-category">
                            Performance Collection
                          </span>
                        </div>
                        <span className="pc-product-price">
                          {price && <Money data={price} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }}
        </Await>
      </Suspense>

      <div className="flex md:hidden gap-4 justify-end mt-4">
        <button
          className="p-3 border border-gray-200 rounded-none touch-target"
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="p-3 border border-gray-200 rounded-none touch-target"
          onClick={() => scroll('right')}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default ProductCarousel;