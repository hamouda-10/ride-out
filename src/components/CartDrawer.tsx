import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [deliveryMethod, setDeliveryMethod] = useState<'enclosed' | 'showroom'>('enclosed');
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  if (!open) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.05) : 0;
  const shipping = items.length === 0 ? 0 : deliveryMethod === 'enclosed' ? 350 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === 'RIDE2026') {
      setPromoApplied(true);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.includes('@') || !customerPhone.trim()) {
      setFormError('Please enter your name, valid email address, and phone number.');
      return;
    }
    if (deliveryMethod === 'enclosed' && !customerAddress.trim()) {
      setFormError('Please enter a delivery street address for enclosed transport.');
      return;
    }
    setFormError('');
    setOrderNumber(`HM-${Math.floor(10000 + Math.random() * 89999)}`);
    setStep('confirmed');
    onClearCart();
  };

  const handleClose = () => {
    if (step === 'confirmed') setStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="fixed inset-0 bg-black/55 backdrop-blur-xs" onClick={handleClose} />

      <aside className="relative z-10 w-full max-w-md bg-white text-[#1d222b] h-full flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold">
              {step === 'bag'
                ? 'Your HalvenMotos Bag'
                : step === 'checkout'
                  ? 'Reservation & Delivery'
                  : 'Order Confirmed'}
            </h2>
            {step === 'bag' && (
              <p className="text-xs text-[#4b4f57] tabular-nums">
                {items.reduce((a, b) => a + b.quantity, 0)} item(s) selected
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close shopping bag"
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'confirmed' ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
              <h3 className="text-xl font-semibold">Order {orderNumber} Confirmed</h3>
              <p className="text-sm text-[#4b4f57] leading-relaxed">
                Thank you, {customerName}. Your HalvenMotos build and equipment allocation is
                scheduled. Dispatch updates will be sent to {customerEmail}.
              </p>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#4b4f57]">Method</span>
                  <span className="font-semibold">
                    {deliveryMethod === 'enclosed'
                      ? 'White-Glove Enclosed Transport'
                      : 'Flagship Atelier Pickup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4b4f57]">Status</span>
                  <span className="font-semibold">Preparing Dispatch</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 h-11 px-6 rounded-full bg-[#1d222b] text-white text-xs font-medium"
              >
                Return to Showroom
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-medium text-[#1d222b]">Your bag is currently empty.</p>
              <p className="text-xs text-[#4b4f57]">
                Configure a HalvenMotos motorcycle or add titanium hardware and rider gear from
                the store.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 h-10 px-5 rounded-full bg-[#1d222b] text-white text-xs font-medium"
              >
                Explore Products
              </button>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-neutral-200 flex gap-3.5 items-center"
                >
                  <div className="w-20 h-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-[#4b4f57]">HM</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate">{item.name}</h4>
                    <p className="text-[11px] text-[#4b4f57] truncate mt-0.5">{item.subtitle}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold tabular-nums">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 rounded-md border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium tabular-nums w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 rounded-md border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="w-7 h-7 rounded-md text-neutral-400 hover:text-rose-600 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code */}
              <div className="pt-3 border-t border-neutral-200">
                <label className="block text-[11px] font-medium text-[#4b4f57] mb-1.5">
                  Promo Code (try RIDE2026 for 5% off)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="RIDE2026"
                    className="flex-1 h-9 px-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-[#1d222b]"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="h-9 px-4 rounded-lg border border-neutral-300 text-xs font-medium hover:bg-neutral-50"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form id="hm-checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <span className="block text-xs font-semibold mb-2">Delivery Option</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('enclosed')}
                    className={`p-3 rounded-xl border text-left text-xs ${
                      deliveryMethod === 'enclosed'
                        ? 'border-[#1d222b] bg-neutral-50 font-semibold'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div>Enclosed Van</div>
                    <div className="text-[11px] text-[#4b4f57] font-normal mt-0.5">$350 insured</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('showroom')}
                    className={`p-3 rounded-xl border text-left text-xs ${
                      deliveryMethod === 'showroom'
                        ? 'border-[#1d222b] bg-neutral-50 font-semibold'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div>Atelier Pickup</div>
                    <div className="text-[11px] text-[#4b4f57] font-normal mt-0.5">Free</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-[#1d222b]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-[#1d222b]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-[#1d222b]"
                />
              </div>
              {deliveryMethod === 'enclosed' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="740 Circuit Blvd, Suite 4, Zurich"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-[#1d222b]"
                  />
                </div>
              )}

              {formError && <p className="text-xs text-rose-600">{formError}</p>}
            </form>
          )}
        </div>

        {/* Footer totals */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-neutral-200 bg-neutral-50 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#4b4f57]">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal.toLocaleString()}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount (RIDE2026)</span>
                  <span className="tabular-nums">−${discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#4b4f57]">
                <span>Delivery</span>
                <span className="tabular-nums">
                  {shipping === 0 ? 'Free' : `$${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span className="tabular-nums">${total.toLocaleString()}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full h-11 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Reservation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="h-11 px-4 rounded-full border border-neutral-300 bg-white text-xs font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="hm-checkout-form"
                  className="flex-1 h-11 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium"
                >
                  Confirm Order (${total.toLocaleString()})
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
