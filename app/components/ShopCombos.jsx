import React, { Suspense } from 'react';
import { Await, Link } from 'react-router';
import { Image, Money, CartForm } from '@shopify/hydrogen';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

/**
 * Shop combos / "Shop the Style" section using Shopify products from server-side loader.
 * @param {{products: Promise<RecommendedProductsQuery | null>}}
 */
const ShopTheStyle = ({ products }) => {
  return (
    <section className="shop-style-section py-10 md:py-14 px-4 md:px-8">
      <div className="sts-container">
        <div className="sts-header">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/55 mb-1">
            Curated Outfits
          </p>
          <h2 className="sts-title">Shop The Style</h2>
          <p className="sts-subtitle">
            Get the complete look with our curated outfit selections.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-10 w-10 text-black animate-spin" />
            </div>
          }
        >
          <Await resolve={products}>
            {(response) => {
              if (!response) return null;
              // Take the last 3 products for the "Shop the Style" section
              const productNodes = response.products.nodes.slice(-3);
              if (productNodes.length === 0) return null;

              return (
                <div className="sts-grid flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="sts-main-image-wrapper relative w-full aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden"
                  >
                    {productNodes[0]?.featuredImage && (
                      <Image
                        data={productNodes[0].featuredImage}
                        className="sts-main-image w-full h-full object-cover"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                    )}
                    <div className="sts-main-overlay">
                      <h3 className="sts-main-title">URBAN NOMAD COLLECTION</h3>
                      <p className="sts-main-description">
                        The perfect balance of comfort and style for the modern
                        city explorer.
                      </p>
                    </div>
                  </motion.div>

                  <div className="sts-product-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {productNodes.map((product, index) => {
                      const variant =
                        product.selectedOrFirstAvailableVariant;
                      const isAvailable = variant?.availableForSale;
                      const price = variant?.price;

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="sts-product-card group relative bg-white border border-gray-100 hover:border-gray-200 p-4 flex flex-col sm:flex-row lg:flex-row gap-4 transition-all hover:shadow-md"
                        >
                          <Link
                            to={`/products/${product.handle}`}
                            className="sts-product-image-wrapper block w-full sm:w-28 lg:w-32 aspect-[3/4] sm:aspect-square flex-shrink-0 bg-gray-50 overflow-hidden"
                            prefetch="intent"
                          >
                            {product.featuredImage && (
                              <Image
                                data={product.featuredImage}
                                className={`sts-product-image w-full h-full object-cover transition-transform group-hover:scale-105 ${!isAvailable ? 'opacity-50 grayscale' : ''}`}
                                sizes="128px"
                              />
                            )}
                          </Link>

                          <div className="sts-product-details flex-1 flex flex-col justify-between">
                            <div>
                              <div className="sts-product-header flex justify-between items-start mb-2">
                                <Link
                                  to={`/products/${product.handle}`}
                                  className="block flex-1 pr-4"
                                  prefetch="intent"
                                >
                                  <h4 className="sts-product-name">
                                    {product.title}
                                  </h4>
                                </Link>
                              </div>

                              <p className="sts-product-price text-gray-900 font-bold mb-2">
                                {price && <Money data={price} />}
                              </p>

                              {!isAvailable && (
                                <div className="mb-2 inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                  OUT OF STOCK
                                </div>
                              )}
                            </div>

                            {isAvailable && variant ? (
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
                                  className="mt-4 w-full py-3 px-4 flex items-center justify-between text-sm font-bold uppercase tracking-[0.14em] transition-colors font-oswald bg-[#15171b] text-white hover:bg-[#e4202c] hover:text-white"
                                >
                                  <span>ADD TO BAG</span>
                                  <ArrowRight size={16} />
                                </button>
                              </CartForm>
                            ) : (
                              <Link
                                to={`/products/${product.handle}`}
                                className="mt-4 w-full py-3 px-4 flex items-center justify-between text-sm font-bold uppercase tracking-[0.14em] transition-colors font-oswald bg-[#f3f4f6] text-black/35"
                              >
                                <span>VIEW PRODUCT</span>
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
};

export default ShopTheStyle;