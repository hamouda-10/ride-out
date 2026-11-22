import React from 'react';
import { ShoppingBag, X, ArrowUpRight, Gauge, Wrench, Compass, Layers } from 'lucide-react';
import { HERO_SLIDES } from '../data/catalog';

export type PageId =
  | 'home'
  | 'motorcycles'
  | 'products'
  | 'compare'
  | 'engineering'
  | 'contact';

interface TopNavAndDrawerProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onJumpToHeroSlide: (idx: number) => void;
}

const NAV_ITEMS: { id: PageId; label: string; subtitle: string }[] = [
  { id: 'home', label: 'Showroom', subtitle: 'Paint carousel & complete overview' },
  { id: 'motorcycles', label: 'Motorcycles', subtitle: '6 models · 268 to 342 km/h' },
  { id: 'products', label: 'All Products', subtitle: 'Helmets, leathers, exhausts & brakes' },
  { id: 'compare', label: 'Speed Lab', subtitle: 'Compare speeds, gears & capabilities' },
  { id: 'engineering', label: 'Engineering', subtitle: 'Wind tunnel & dyno facility' },
  { id: 'contact', label: 'Contact & Ride', subtitle: 'Book a private track or road session' },
];

export const StickyTopBar: React.FC<{
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenDrawer: () => void;
}> = ({ activePage, onNavigate, cartCount, onOpenCart, onOpenDrawer }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 text-[#1d222b]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open navigation menu"
            className="md:hidden w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <svg viewBox="0 0 12 10" className="w-3.5 h-3" fill="none" aria-hidden="true">
              <path d="M0 1.2h12M0 5h12M0 8.8h12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-lg font-medium tracking-[0.025em] text-[#1d222b] whitespace-nowrap shrink-0 hover:opacity-75 transition-opacity"
          >
            HalvenMotos<sup className="text-[0.7em] ml-0.5">®</sup>
          </button>
        </div>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary pages"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4b4f57]"
        >
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#1d222b] text-[#1d222b]'
                    : 'border-transparent hover:text-[#1d222b] hover:border-neutral-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action + Bag */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag (${cartCount} items)`}
            className="h-10 px-4 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-[#1d222b] flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            <span className="tabular-nums font-semibold">({cartCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="h-10 px-5 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium tracking-[0.02em] whitespace-nowrap shrink-0 transition-colors"
          >
            Book Test Ride
          </button>
        </div>
      </div>
    </header>
  );
};

export const NavigationDrawer: React.FC<TopNavAndDrawerProps> = ({
  activePage,
  onNavigate,
  drawerOpen,
  onCloseDrawer,
  cartCount,
  onOpenCart,
  onJumpToHeroSlide,
}) => {
  if (!drawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="HalvenMotos Navigation"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onCloseDrawer}
      />

      <aside className="relative z-10 w-full max-w-md bg-white text-[#1d222b] h-full flex flex-col justify-between p-6 sm:p-8 overflow-y-auto shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
            <span className="text-xl font-medium tracking-[0.025em]">
              HalvenMotos<sup className="text-[0.7em]">®</sup>
            </span>
            <button
              type="button"
              onClick={onCloseDrawer}
              aria-label="Close menu"
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[#4b4f57] mb-3">
              Pages & Experience
            </p>
            <ul className="divide-y divide-neutral-100">
              {NAV_ITEMS.map((item, idx) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseDrawer();
                    }}
                    className={`w-full py-3.5 px-2 flex items-center justify-between text-left transition-colors rounded-lg hover:bg-neutral-50 ${
                      activePage === item.id ? 'bg-neutral-50' : ''
                    }`}
                  >
                    <div>
                      <div className="text-base font-medium text-[#1d222b] flex items-center gap-2">
                        <span className="text-xs text-[#4b4f57] tabular-nums">
                          0{idx + 1}.
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <p className="text-xs text-[#4b4f57] mt-0.5">{item.subtitle}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#4b4f57]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs font-medium uppercase tracking-wider text-[#4b4f57] mb-3">
              Hero Paint Selector
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    onNavigate('home');
                    onJumpToHeroSlide(idx);
                    onCloseDrawer();
                  }}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: slide.hex }}
                    />
                    <span className="text-xs font-semibold truncate">{slide.paintName}</span>
                  </div>
                  <div className="text-[11px] text-[#4b4f57] mt-1 tabular-nums">
                    {slide.modelName.replace('HalvenMotos ', '')} · {slide.topSpeed}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-neutral-200 space-y-3">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => {
                onCloseDrawer();
                onOpenCart();
              }}
              className="h-11 px-4 rounded-full border border-neutral-300 font-medium flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag ({cartCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('contact');
                onCloseDrawer();
              }}
              className="h-11 px-4 rounded-full bg-[#1d222b] text-white font-medium flex items-center justify-center hover:bg-neutral-800 transition-colors"
            >
              Contact Now
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#4b4f57] pt-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" /> Up to 342 km/h
            </span>
            <span className="flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" /> Bespoke Builds
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> 6 Models
            </span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Global Delivery
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
