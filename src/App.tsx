import { useCallback, useState } from 'react';
import { ALL_MOTORCYCLES, HERO_SLIDES, MotorcycleSpec } from './data/catalog';
import { HeroCarousel } from './components/HeroCarousel';
import { NavigationDrawer, PageId, StickyTopBar } from './components/TopNavAndDrawer';
import { BikeFleetSection } from './components/BikeFleetSection';
import { StoreCatalog } from './components/StoreCatalog';
import { CompareLab } from './components/CompareLab';
import {
  ContactBookingSection,
  EngineeringSection,
  SiteFooter,
} from './components/EngineeringContactSection';
import { BikeDetailModal } from './components/BikeDetailModal';
import { CartDrawer, CartItem } from './components/CartDrawer';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bikePreviews, setBikePreviews] = useState<string[]>([]);
  const [modalBike, setModalBike] = useState<MotorcycleSpec | null>(null);
  const [jumpSlideIdx, setJumpSlideIdx] = useState<number | null>(null);
  const [preselectedContactModel, setPreselectedContactModel] = useState<string>(
    HERO_SLIDES[0].modelName
  );
  const [comparePreselect, setComparePreselect] = useState<string[] | undefined>(undefined);

  const handleBikePreviewsReady = useCallback((urls: string[]) => {
    setBikePreviews(urls);
  }, []);

  const handleNavigate = useCallback((page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAddToCart = useCallback(
    (item: { id: string; name: string; subtitle: string; price: number; image: string }) => {
      setCartItems((prev) => {
        const existing = prev.find((p) => p.id === item.id);
        if (existing) {
          return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    },
    []
  );

  const handleQuickAddBike = useCallback(
    (bike: MotorcycleSpec) => {
      handleAddToCart({
        id: `${bike.id}-factory`,
        name: bike.modelName,
        subtitle: `${bike.paintName} · Factory Spec (${bike.topSpeed})`,
        price: bike.price,
        image: bikePreviews[bike.slideIndex] || '',
      });
      setCartOpen(true);
    },
    [bikePreviews, handleAddToCart]
  );

  const handleUpdateCartQty = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleRemoveCartItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleBookTestRide = useCallback((modelName: string) => {
    setPreselectedContactModel(modelName);
    setActivePage('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCompareBike = useCallback((bikeId: string) => {
    const others = ALL_MOTORCYCLES.filter((b) => b.id !== bikeId)
      .slice(0, 2)
      .map((b) => b.id);
    setComparePreselect([bikeId, ...others]);
    setActivePage('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-[#1d222b]">
      {/* Exact WebGL Hero on Home view */}
      {activePage === 'home' && (
        <HeroCarousel
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenContact={() => handleBookTestRide(HERO_SLIDES[0].modelName)}
          onViewSpecs={(bike) => setModalBike(bike)}
          onBikePreviewsReady={handleBikePreviewsReady}
          jumpToSlideIndex={jumpSlideIdx}
        />
      )}

      {/* Sticky 3-Zone Top Bar for Multi-Page & Scrolled Storefront */}
      <StickyTopBar
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Page Content */}
      {activePage === 'home' && (
        <div>
          <BikeFleetSection
            bikePreviews={bikePreviews}
            onConfigureBike={(bike) => setModalBike(bike)}
            onQuickAddBike={handleQuickAddBike}
            onCompareBike={handleCompareBike}
            onBookTestRide={handleBookTestRide}
          />
          <StoreCatalog onAddProductToCart={handleAddToCart} />
          <CompareLab
            bikePreviews={bikePreviews}
            initialSelectedIds={comparePreselect}
            onSelectBike={(bike) => setModalBike(bike)}
          />
          <EngineeringSection onNavigate={handleNavigate} />
          <ContactBookingSection preselectedModel={preselectedContactModel} />
        </div>
      )}

      {activePage === 'motorcycles' && (
        <BikeFleetSection
          bikePreviews={bikePreviews}
          onConfigureBike={(bike) => setModalBike(bike)}
          onQuickAddBike={handleQuickAddBike}
          onCompareBike={handleCompareBike}
          onBookTestRide={handleBookTestRide}
        />
      )}

      {activePage === 'products' && <StoreCatalog onAddProductToCart={handleAddToCart} />}

      {activePage === 'compare' && (
        <CompareLab
          key={comparePreselect?.join('-') ?? 'default-compare'}
          bikePreviews={bikePreviews}
          initialSelectedIds={comparePreselect}
          onSelectBike={(bike) => setModalBike(bike)}
        />
      )}

      {activePage === 'engineering' && <EngineeringSection onNavigate={handleNavigate} />}

      {activePage === 'contact' && (
        <ContactBookingSection preselectedModel={preselectedContactModel} />
      )}

      <SiteFooter onNavigate={handleNavigate} />

      {/* Navigation Drawer */}
      <NavigationDrawer
        activePage={activePage}
        onNavigate={handleNavigate}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        onOpenDrawer={() => setDrawerOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onJumpToHeroSlide={(idx) => {
          setJumpSlideIdx(null);
          window.setTimeout(() => setJumpSlideIdx(idx), 0);
        }}
      />

      {/* Motorcycle Spec & Configurator Modal */}
      <BikeDetailModal
        key={modalBike?.id ?? 'closed'}
        bike={modalBike}
        bikePreviews={bikePreviews}
        onClose={() => setModalBike(null)}
        onAddConfiguredToCart={(item) => {
          handleAddToCart(item);
          setCartOpen(true);
        }}
        onBookTestRide={handleBookTestRide}
        onCompareBike={handleCompareBike}
      />

      {/* Shopping Bag & Checkout Drawer */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}
