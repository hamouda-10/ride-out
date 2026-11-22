import React, { useState } from 'react';
import { STORE_PRODUCTS, StoreProduct } from '../data/catalog';
import { Search, ShoppingBag, Heart, Eye, X, Check } from 'lucide-react';

interface StoreCatalogProps {
  onAddProductToCart: (item: {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    image: string;
  }) => void;
}

const PRODUCT_CATEGORIES = [
  'All Products',
  'Helmets & Protection',
  'Riding Apparel',
  'Exhaust & Engine',
  'Brakes & Suspension',
  'Electronics & Telemetry',
  'Track & Maintenance',
] as const;

export const StoreCatalog: React.FC<StoreCatalogProps> = ({ onAddProductToCart }) => {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof PRODUCT_CATEGORIES)[number]>('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filteredProducts = STORE_PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'All Products' || p.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.specHighlight.toLowerCase().includes(q);
    return matchCat && matchQuery;
  }).sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0;
  });

  const getVariant = (p: StoreProduct) => selectedVariants[p.id] ?? p.variants[0];

  const handleAdd = (p: StoreProduct) => {
    const variant = getVariant(p);
    onAddProductToCart({
      id: `${p.id}-${variant}`,
      name: p.name,
      subtitle: `${p.category} · ${variant}`,
      price: p.price,
      image: p.image,
    });
    setAddedIds((prev) => ({ ...prev, [p.id]: true }));
    window.setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <section
      id="store-catalog"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-white text-[#1d222b] border-t border-neutral-200"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <p className="text-xs font-medium text-[#4b4f57] uppercase tracking-wider">
              02. Factory Parts & Rider Equipment
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2 text-balance">
              Complete Gear, Titanium Hardware & Track Store
            </h2>
            <p className="text-sm sm:text-base text-[#4b4f57] mt-2 max-w-2xl">
              FIM-homologated forged carbon helmets, armored leather suits, Grade-5 titanium
              exhausts, carbon-ceramic brakes, and 50 Hz pit telemetry modules.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#4b4f57] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search helmets, titanium, brakes..."
                aria-label="Search store products"
                className="h-10 pl-10 pr-4 w-full sm:w-64 rounded-full border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#1d222b]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'featured', label: 'Featured' },
                { id: 'price-asc', label: '$ Low' },
                { id: 'price-desc', label: '$ High' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortOrder(opt.id as typeof sortOrder)}
                  className={`h-10 px-3.5 rounded-full text-xs font-medium border transition-colors ${
                    sortOrder === opt.id
                      ? 'bg-[#1d222b] text-white border-[#1d222b]'
                      : 'bg-white text-[#1d222b] border-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-10 px-4 rounded-full text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1d222b] text-white border-[#1d222b]'
                  : 'bg-white text-[#4b4f57] border-neutral-200 hover:text-[#1d222b] hover:border-neutral-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="mt-12 p-12 rounded-2xl border border-neutral-200 bg-neutral-50 text-center">
            <p className="text-sm font-medium text-[#1d222b]">
              No products match "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Products');
              }}
              className="mt-4 h-10 px-5 rounded-full bg-[#1d222b] text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const activeVar = getVariant(product);
              const isWished = wishlist.includes(product.id);
              const justAdded = addedIds[product.id];

              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={isWished ? 'Remove from saved' : 'Save product'}
                          className={`w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-xs transition-colors ${
                            isWished ? 'text-rose-600' : 'text-[#1d222b] hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          aria-label={`Quick view ${product.name}`}
                          className="w-9 h-9 rounded-full bg-white/95 text-[#1d222b] flex items-center justify-center shadow-xs hover:bg-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="text-xs text-[#4b4f57] flex items-center gap-1.5">
                        <span>{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.weight}</span>
                      </div>

                      <div className="mt-1.5 flex items-baseline justify-between gap-3">
                        <h3 className="text-base font-semibold text-[#1d222b] leading-snug">
                          {product.name}
                        </h3>
                        <span className="text-base font-semibold tabular-nums shrink-0">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#4b4f57] mt-1.5">{product.specHighlight}</p>

                      {/* Variant Selector Buttons */}
                      <div className="mt-4">
                        <div className="text-[11px] text-[#4b4f57] mb-1.5">Select Option:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.variants.map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                setSelectedVariants((prev) => ({ ...prev, [product.id]: v }))
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                                activeVar === v
                                  ? 'bg-[#1d222b] text-white border-[#1d222b]'
                                  : 'bg-neutral-50 text-[#1d222b] border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      className="flex-1 h-10 px-4 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      {justAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added to Bag
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(product)}
                      className="h-10 px-4 rounded-full border border-neutral-300 hover:bg-neutral-50 text-xs font-medium transition-colors"
                    >
                      Specs
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={quickViewProduct.name}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setQuickViewProduct(null)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white text-[#1d222b] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div>
                <div className="text-xs text-[#4b4f57]">
                  {quickViewProduct.category} · SKU {quickViewProduct.sku}
                </div>
                <h3 className="text-lg font-semibold">{quickViewProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                aria-label="Close product specs"
                className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-xs text-[#4b4f57] leading-relaxed">
                    {quickViewProduct.description}
                  </p>
                  <dl className="mt-4 divide-y divide-neutral-100 text-xs">
                    <div className="py-2 flex justify-between">
                      <dt className="text-[#4b4f57]">Fitment</dt>
                      <dd className="font-medium text-right">{quickViewProduct.fitment}</dd>
                    </div>
                    {quickViewProduct.specs.map((sp) => (
                      <div key={sp.label} className="py-2 flex justify-between">
                        <dt className="text-[#4b4f57]">{sp.label}</dt>
                        <dd className="font-semibold tabular-nums text-right">{sp.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-neutral-200">
                  <span className="text-xl font-semibold tabular-nums">
                    ${quickViewProduct.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleAdd(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="h-10 px-5 rounded-full bg-[#1d222b] text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Add to Bag ({getVariant(quickViewProduct)})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
