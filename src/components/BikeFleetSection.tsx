import React, { useState } from 'react';
import { ALL_MOTORCYCLES, MotorcycleSpec } from '../data/catalog';
import { Gauge, Zap, ArrowUpRight, Sliders, Scale } from 'lucide-react';

interface BikeFleetSectionProps {
  bikePreviews: string[];
  onConfigureBike: (bike: MotorcycleSpec) => void;
  onQuickAddBike: (bike: MotorcycleSpec) => void;
  onCompareBike: (bikeId: string) => void;
  onBookTestRide: (bikeName: string) => void;
}

const CATEGORIES = [
  'All',
  'Superbike',
  'Hyper-GT',
  'Track Prototype',
  'Scrambler',
  'Electric',
  'Hyper-Naked',
] as const;

type SortKey = 'speed-desc' | 'accel-asc' | 'price-asc' | 'price-desc';

export const BikeFleetSection: React.FC<BikeFleetSectionProps> = ({
  bikePreviews,
  onConfigureBike,
  onQuickAddBike,
  onCompareBike,
  onBookTestRide,
}) => {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [sortBy, setSortBy] = useState<SortKey>('speed-desc');

  const filtered = ALL_MOTORCYCLES.filter((b) =>
    category === 'All' ? true : b.category === category
  ).sort((a, b) => {
    if (sortBy === 'speed-desc') return b.topSpeedNum - a.topSpeedNum;
    if (sortBy === 'accel-asc') return a.accelNum - b.accelNum;
    if (sortBy === 'price-asc') return a.price - b.price;
    return b.price - a.price;
  });

  return (
    <section
      id="fleet"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f6f6f7] text-[#1d222b] border-t border-neutral-200"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <p className="text-xs font-medium text-[#4b4f57] uppercase tracking-wider">
              01. Complete Motorcycle Lineup
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2 text-balance">
              Six Engineered Machines · 268 to 342 km/h
            </h2>
            <p className="text-sm sm:text-base text-[#4b4f57] mt-2 max-w-2xl">
              From alpine torque twins and supercharged grand tourers to 900V axial-flux electric
              hyperbikes and carbon-monocoque track prototypes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#4b4f57] mr-1">Sort by:</span>
            {[
              { id: 'speed-desc', label: 'Fastest Top Speed' },
              { id: 'accel-asc', label: 'Quickest 0–100' },
              { id: 'price-asc', label: 'Price: Low–High' },
              { id: 'price-desc', label: 'Price: High–Low' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSortBy(s.id as SortKey)}
                className={`h-9 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
                  sortBy === s.id
                    ? 'bg-[#1d222b] text-white border-[#1d222b]'
                    : 'bg-white text-[#1d222b] border-neutral-300 hover:border-neutral-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`h-10 px-4 rounded-full text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                category === cat
                  ? 'bg-[#1d222b] text-white border-[#1d222b]'
                  : 'bg-white text-[#4b4f57] border-neutral-200 hover:text-[#1d222b] hover:border-neutral-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3-Column Uniform Product Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bike) => {
            const previewSrc = bikePreviews[bike.slideIndex] || '';
            return (
              <article
                key={bike.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Bike Visual */}
                  <div
                    className="h-56 p-6 flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(180deg, ${bike.hex}20 0%, #f5f5f7 100%)`,
                    }}
                  >
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={`${bike.modelName} side profile`}
                        className="max-h-44 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-sm font-medium text-[#4b4f57]">{bike.modelName}</span>
                    )}
                  </div>

                  {/* Clean Metadata + Title + Price */}
                  <div className="p-6">
                    <div className="text-xs text-[#4b4f57] flex items-center gap-1.5">
                      <span>{bike.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{bike.paintName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{bike.engineLayout}</span>
                    </div>

                    <div className="mt-1.5 flex items-baseline justify-between gap-3">
                      <h3 className="text-lg font-semibold text-[#1d222b]">{bike.modelName}</h3>
                      <span className="text-base font-semibold tabular-nums text-[#1d222b]">
                        ${bike.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#4b4f57] mt-2 leading-relaxed">{bike.tagline}</p>

                    {/* Distinct Speed & Capability Grid */}
                    <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-[11px] text-[#4b4f57] flex items-center gap-1">
                          <Gauge className="w-3 h-3" /> Top Speed
                        </div>
                        <div className="font-semibold tabular-nums mt-0.5">{bike.topSpeed}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#4b4f57] flex items-center gap-1">
                          <Zap className="w-3 h-3" /> 0–100
                        </div>
                        <div className="font-semibold tabular-nums mt-0.5">{bike.acceleration}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#4b4f57]">Output</div>
                        <div className="font-semibold tabular-nums mt-0.5">
                          {bike.horsepower} HP
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 text-[11px] text-[#4b4f57] space-y-1">
                      <div>
                        <span className="font-medium text-[#1d222b]">Cooling:</span> {bike.cooling}{' '}
                        · <span className="font-medium text-[#1d222b]">Range:</span> {bike.range}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-[#1d222b]">Highlight:</span>{' '}
                        {bike.capabilities[0]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onConfigureBike(bike)}
                      className="h-10 px-3 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAddBike(bike)}
                      className="h-10 px-3 rounded-full border border-neutral-300 hover:bg-neutral-50 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Reserve</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onCompareBike(bike.id)}
                      className="h-9 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Scale className="w-3 h-3" />
                      <span>Compare Speeds</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookTestRide(bike.modelName)}
                      className="h-9 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium flex items-center justify-center transition-colors"
                    >
                      Test Ride
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
