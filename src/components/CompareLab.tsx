import React, { useState } from 'react';
import { ALL_MOTORCYCLES, MotorcycleSpec } from '../data/catalog';
import { Gauge, Zap, Shield, SlidersHorizontal, ArrowUpRight } from 'lucide-react';

interface CompareLabProps {
  bikePreviews: string[];
  initialSelectedIds?: string[];
  onSelectBike: (bike: MotorcycleSpec) => void;
}

type RideMode = 'Rain' | 'Street' | 'Sport' | 'Track';

const MODE_FACTOR: Record<RideMode, { speedCap: number; torqueMap: string; absLevel: string; tcLevel: string }> = {
  Rain: { speedCap: 0.72, torqueMap: '65% Soft Linear', absLevel: 'Level 4 Cornering', tcLevel: 'High (TC 7/8)' },
  Street: { speedCap: 0.88, torqueMap: '85% Balanced', absLevel: 'Level 3 Road', tcLevel: 'Medium (TC 4/8)' },
  Sport: { speedCap: 0.96, torqueMap: '100% Dynamic', absLevel: 'Level 2 Sport', tcLevel: 'Low (TC 2/8)' },
  Track: { speedCap: 1.0, torqueMap: '100% Direct Race', absLevel: 'Track Front-Only', tcLevel: 'Slip-Permissive (TC 1/8)' },
};

export const CompareLab: React.FC<CompareLabProps> = ({
  bikePreviews,
  initialSelectedIds,
  onSelectBike,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds && initialSelectedIds.length >= 2
      ? initialSelectedIds.slice(0, 3)
      : ['hm-r1-magenta', 'hm-gt-sapphire', 'hm-z-violet']
  );
  const [rideMode, setRideMode] = useState<RideMode>('Track');
  const [selectedGear, setSelectedGear] = useState<number>(6);

  const toggleBike = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const comparedBikes = selectedIds
    .map((id) => ALL_MOTORCYCLES.find((b) => b.id === id))
    .filter((b): b is MotorcycleSpec => Boolean(b));

  const modeCfg = MODE_FACTOR[rideMode];

  return (
    <section
      id="compare-lab"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-white text-[#1d222b] border-t border-neutral-200"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <p className="text-xs font-medium text-[#4b4f57] uppercase tracking-wider">
              03. Speed & Capability Comparison Lab
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2 text-balance">
              Every Motorcycle, Calibrated to Different Speeds & Missions
            </h2>
            <p className="text-sm sm:text-base text-[#4b4f57] mt-2 max-w-2xl">
              Select 2 or 3 models below to compare terminal velocity, 6-speed gear ratios,
              cooling architecture, weight, braking performance, and electronic riding modes.
            </p>
          </div>

          {/* Interactive Ride Mode Buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-xs font-medium text-[#4b4f57] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Telemetry Ride Mode
            </span>
            <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200 gap-1">
              {(['Rain', 'Street', 'Sport', 'Track'] as RideMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRideMode(mode)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    rideMode === mode
                      ? 'bg-[#1d222b] text-white'
                      : 'text-[#4b4f57] hover:text-[#1d222b]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Selector Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-medium text-[#4b4f57] mr-2">
            Compare Models ({comparedBikes.length}/3):
          </span>
          {ALL_MOTORCYCLES.map((bike) => {
            const active = selectedIds.includes(bike.id);
            return (
              <button
                key={bike.id}
                type="button"
                onClick={() => toggleBike(bike.id)}
                className={`h-10 px-4 rounded-full text-xs font-medium border flex items-center gap-2 transition-colors ${
                  active
                    ? 'bg-[#1d222b] text-white border-[#1d222b]'
                    : 'bg-white text-[#1d222b] border-neutral-300 hover:border-neutral-500'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: bike.hex }}
                />
                <span>{bike.modelName.replace('HalvenMotos ', '')}</span>
                <span className="opacity-70 tabular-nums">{bike.topSpeed}</span>
              </button>
            );
          })}
        </div>

        {/* Gear Selector Bar */}
        <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#4b4f57]">
            <span className="font-semibold text-[#1d222b]">Active Mode Calibration:</span>{' '}
            {modeCfg.torqueMap} · ABS {modeCfg.absLevel} · {modeCfg.tcLevel}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-[#4b4f57] mr-2">Gear Ceiling:</span>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGear(g)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold tabular-nums border transition-colors ${
                  selectedGear === g
                    ? 'bg-[#ffe100] text-[#16140a] border-[#ffe100]'
                    : 'bg-white text-[#1d222b] border-neutral-300 hover:border-neutral-500'
                }`}
              >
                G{g}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div
          className={`mt-8 grid gap-6 ${
            comparedBikes.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {comparedBikes.map((bike) => {
            const gearRaw = bike.gearSpeeds[selectedGear - 1] ?? bike.topSpeedNum;
            const effectiveSpeed = Math.round(gearRaw * modeCfg.speedCap);
            const speedPct = Math.min(100, Math.round((effectiveSpeed / 345) * 100));
            const previewSrc = bikePreviews[bike.slideIndex] || '';

            return (
              <div
                key={bike.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="rounded-xl p-4 h-44 flex items-center justify-center mb-5"
                    style={{
                      background: `linear-gradient(180deg, ${bike.hex}22 0%, #f8f8fa 100%)`,
                    }}
                  >
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={bike.modelName}
                        className="max-h-36 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-sm font-medium text-[#4b4f57]">{bike.modelName}</span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-[#4b4f57]">
                        {bike.category} · {bike.paintName}
                      </div>
                      <h3 className="text-lg font-semibold text-[#1d222b] mt-0.5">
                        {bike.modelName}
                      </h3>
                    </div>
                    <span className="text-base font-semibold tabular-nums">
                      ${bike.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Live Gear + Mode Speed Bar */}
                  <div className="mt-5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4b4f57] flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5" /> Gear {selectedGear} ({rideMode})
                      </span>
                      <span className="text-base font-semibold tabular-nums text-[#1d222b]">
                        {effectiveSpeed} km/h
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-200 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${speedPct}%`, backgroundColor: bike.hex }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#4b4f57] mt-1.5 tabular-nums">
                      <span>Peak Potential: {bike.topSpeed}</span>
                      <span>0–100: {bike.acceleration}</span>
                    </div>
                  </div>

                  {/* Technical Specs Table */}
                  <dl className="mt-5 divide-y divide-neutral-100 text-xs">
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-[#4b4f57]">Engine & Power</dt>
                      <dd className="font-semibold tabular-nums text-right">
                        {bike.engineLayout} · {bike.horsepower} HP
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-[#4b4f57]">Peak Torque</dt>
                      <dd className="font-semibold tabular-nums">{bike.torqueNm} Nm</dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-[#4b4f57]">0–200 km/h</dt>
                      <dd className="font-semibold tabular-nums">{bike.zeroToTwoHundred}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-[#4b4f57]">Cooling System</dt>
                      <dd className="font-semibold text-right">{bike.cooling}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-[#4b4f57]">Dry Weight / Range</dt>
                      <dd className="font-semibold tabular-nums">
                        {bike.dryWeightKg} kg · {bike.range}
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-[#4b4f57]">100–0 Braking</dt>
                      <dd className="font-semibold tabular-nums">{bike.braking100to0m} m</dd>
                    </div>
                  </dl>

                  {/* Distinct Capabilities */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="text-xs font-semibold text-[#1d222b] mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Distinct Capabilities
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#4b4f57]">
                      {bike.capabilities.slice(0, 3).map((cap) => (
                        <li key={cap} className="flex items-start gap-1.5">
                          <Shield className="w-3 h-3 mt-0.5 shrink-0 text-[#1d222b]" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectBike(bike)}
                  className="mt-6 w-full h-11 px-4 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Configure {bike.modelName.replace('HalvenMotos ', '')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
