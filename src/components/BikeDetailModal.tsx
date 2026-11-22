import React, { useState } from 'react';
import { X, Check, Gauge, Zap, Shield, ArrowRight } from 'lucide-react';
import { HERO_SLIDES, MotorcycleSpec } from '../data/catalog';

interface BikeDetailModalProps {
  bike: MotorcycleSpec | null;
  bikePreviews: string[];
  onClose: () => void;
  onAddConfiguredToCart: (item: {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    image: string;
  }) => void;
  onBookTestRide: (bikeName: string) => void;
  onCompareBike: (bikeId: string) => void;
}

const AERO_PACKAGES = [
  { id: 'std', label: 'Factory Satin Trim', deltaPrice: 0, deltaSpeed: 0, deltaWeight: 0 },
  { id: 'carbon', label: 'Carbon Aero Winglet Pack', deltaPrice: 3200, deltaSpeed: 4, deltaWeight: -4 },
  { id: 'ti-race', label: 'Full Titanium + Race ECU', deltaPrice: 4800, deltaSpeed: 9, deltaWeight: -7 },
];

const BRAKE_OPTIONS = [
  { id: 'oem', label: 'Radial Monoblock ABS Pro', deltaPrice: 0 },
  { id: 'ceramic', label: '340 mm Carbon-Ceramic Kit', deltaPrice: 2900 },
];

const TELEMETRY_OPTIONS = [
  { id: 'base', label: 'Standard TFT Cockpit', deltaPrice: 0 },
  { id: 'gps', label: '50 Hz GPS Pit Telemetry Box', deltaPrice: 890 },
];

export const BikeDetailModal: React.FC<BikeDetailModalProps> = ({
  bike,
  bikePreviews,
  onClose,
  onAddConfiguredToCart,
  onBookTestRide,
  onCompareBike,
}) => {
  const [selectedPaintIdx, setSelectedPaintIdx] = useState<number>(bike?.slideIndex ?? 0);
  const [aeroId, setAeroId] = useState('std');
  const [brakeId, setBrakeId] = useState('oem');
  const [telId, setTelId] = useState('base');
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!bike) return null;

  const aero = AERO_PACKAGES.find((a) => a.id === aeroId) ?? AERO_PACKAGES[0];
  const brake = BRAKE_OPTIONS.find((b) => b.id === brakeId) ?? BRAKE_OPTIONS[0];
  const tel = TELEMETRY_OPTIONS.find((t) => t.id === telId) ?? TELEMETRY_OPTIONS[0];

  const paintObj = HERO_SLIDES[selectedPaintIdx] ?? HERO_SLIDES[bike.slideIndex];
  const finalPrice = bike.price + aero.deltaPrice + brake.deltaPrice + tel.deltaPrice;
  const finalSpeed = bike.topSpeedNum + aero.deltaSpeed;
  const finalWeight = bike.dryWeightKg + aero.deltaWeight;
  const previewSrc = bikePreviews[selectedPaintIdx] || bikePreviews[bike.slideIndex] || '';

  const handleAdd = () => {
    onAddConfiguredToCart({
      id: `${bike.id}-${selectedPaintIdx}-${aeroId}-${brakeId}-${telId}`,
      name: bike.modelName,
      subtitle: `${paintObj.paintName} · ${aero.label} · ${brake.label}`,
      price: finalPrice,
      image: previewSrc,
    });
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${bike.modelName} Specifications and Configurator`}
    >
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl bg-white text-[#1d222b] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div>
            <div className="text-xs text-[#4b4f57] font-medium">
              {bike.category} · {bike.engineLayout} · {bike.horsepower} HP
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d222b]">
              {bike.modelName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configurator"
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left visual & telemetry */}
          <div className="lg:col-span-6 space-y-6">
            <div
              className="rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]"
              style={{
                background: `linear-gradient(180deg, ${paintObj.hex} 0%, #f5f5f7 100%)`,
              }}
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${bike.modelName} in ${paintObj.paintName}`}
                  className="w-full max-w-[440px] h-auto object-contain drop-shadow-md"
                />
              ) : (
                <div className="h-44 flex items-center justify-center text-white font-medium">
                  {bike.modelName}
                </div>
              )}
              <div className="mt-3 text-xs font-medium text-[#1d222b] bg-white/90 px-3 py-1.5 rounded-lg">
                Paint: {paintObj.paintName}
              </div>
            </div>

            {/* Speed & Mechanical Key Figures */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[11px] text-[#4b4f57] flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" /> Top Speed
                </div>
                <div className="text-lg font-semibold tabular-nums mt-1">{finalSpeed} km/h</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[11px] text-[#4b4f57] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 0–100 km/h
                </div>
                <div className="text-lg font-semibold tabular-nums mt-1">{bike.acceleration}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[11px] text-[#4b4f57] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Dry Weight
                </div>
                <div className="text-lg font-semibold tabular-nums mt-1">{finalWeight} kg</div>
              </div>
            </div>

            {/* Distinct Capabilities */}
            <div>
              <h3 className="text-sm font-semibold text-[#1d222b] mb-2.5">
                Unique Model Capabilities
              </h3>
              <ul className="space-y-2 text-sm text-[#4b4f57]">
                {bike.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#1d222b] shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full mechanical sheet */}
            <div className="border-t border-neutral-200 pt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <div>
                <span className="text-[#4b4f57]">0–200 km/h</span>
                <div className="font-semibold tabular-nums">{bike.zeroToTwoHundred}</div>
              </div>
              <div>
                <span className="text-[#4b4f57]">Peak Torque</span>
                <div className="font-semibold tabular-nums">{bike.torqueNm} Nm</div>
              </div>
              <div>
                <span className="text-[#4b4f57]">Gearbox</span>
                <div className="font-semibold">{bike.gearbox}</div>
              </div>
              <div>
                <span className="text-[#4b4f57]">100–0 Braking</span>
                <div className="font-semibold tabular-nums">{bike.braking100to0m} m</div>
              </div>
              <div>
                <span className="text-[#4b4f57]">Suspension</span>
                <div className="font-semibold">{bike.suspension}</div>
              </div>
              <div>
                <span className="text-[#4b4f57]">Riding Modes</span>
                <div className="font-semibold">{bike.ridingModes.join(' · ')}</div>
              </div>
            </div>
          </div>

          {/* Right Configurator Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <p className="text-sm text-[#4b4f57] leading-relaxed">{bike.description}</p>

              {/* Paint finish buttons */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4b4f57] mb-2.5">
                  1. Satin Pearl Paint Finish
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedPaintIdx(idx)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                        selectedPaintIdx === idx
                          ? 'border-[#1d222b] bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 border border-black/15"
                        style={{ backgroundColor: s.hex }}
                      />
                      <span className="text-xs font-medium">{s.paintName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aero & Power package buttons */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4b4f57] mb-2.5">
                  2. Aero & Exhaust Package
                </label>
                <div className="space-y-2">
                  {AERO_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setAeroId(pkg.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        aeroId === pkg.id
                          ? 'border-[#1d222b] bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{pkg.label}</div>
                        {pkg.deltaSpeed > 0 && (
                          <div className="text-[11px] text-[#4b4f57] tabular-nums">
                            +{pkg.deltaSpeed} km/h top speed · {pkg.deltaWeight} kg weight
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {pkg.deltaPrice === 0 ? 'Included' : `+$${pkg.deltaPrice.toLocaleString()}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brake kit buttons */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4b4f57] mb-2.5">
                  3. Braking System
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BRAKE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBrakeId(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        brakeId === opt.id
                          ? 'border-[#1d222b] bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[11px] text-[#4b4f57] tabular-nums mt-0.5">
                        {opt.deltaPrice === 0 ? 'Standard' : `+$${opt.deltaPrice.toLocaleString()}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Telemetry options */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4b4f57] mb-2.5">
                  4. Electronics & Telemetry
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TELEMETRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTelId(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        telId === opt.id
                          ? 'border-[#1d222b] bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[11px] text-[#4b4f57] tabular-nums mt-0.5">
                        {opt.deltaPrice === 0 ? 'Standard' : `+$${opt.deltaPrice.toLocaleString()}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Purchase Module Footer */}
            <div className="pt-5 border-t border-neutral-200 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#4b4f57]">Configured Total (MSRP)</span>
                <span className="text-2xl font-semibold tabular-nums text-[#1d222b]">
                  ${finalPrice.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="h-12 px-5 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      Reserve Build <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookTestRide(bike.modelName);
                  }}
                  className="h-12 px-5 rounded-full border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-colors"
                >
                  Book Test Ride
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCompareBike(bike.id);
                }}
                className="w-full py-2 text-xs font-medium text-[#4b4f57] hover:text-[#1d222b] underline underline-offset-4"
              >
                Compare {bike.modelName} speeds & capabilities with other models
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
