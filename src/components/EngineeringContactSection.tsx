import React, { useEffect, useState } from 'react';
import { ALL_MOTORCYCLES } from '../data/catalog';
import { PageId } from './TopNavAndDrawer';
import { CheckCircle2, MapPin, Calendar, Gauge } from 'lucide-react';

interface EngineeringSectionProps {
  onNavigate: (page: PageId) => void;
}

export const EngineeringSection: React.FC<EngineeringSectionProps> = ({ onNavigate }) => {
  return (
    <section
      id="engineering"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f6f6f7] text-[#1d222b] border-t border-neutral-200"
    >
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-neutral-900 min-h-[320px]">
          <img
            src="/src/assets/images/studio_dyno_workshop_1795375162145.jpg"
            alt="HalvenMotos dyno testing and chassis engineering atelier"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <div>
            <p className="text-xs font-medium text-[#4b4f57] uppercase tracking-wider">
              04. Dyno & Wind-Tunnel Atelier
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2 text-balance">
              Individually Dyno-Certified Before Dispatch
            </h2>
            <p className="text-sm text-[#4b4f57] mt-3 leading-relaxed">
              Every HalvenMotos chassis is laser-aligned to 0.05 mm tolerance, fitted with bespoke
              satin pearl bodywork, and run through a 45-minute full-load chassis dynamometer
              verification curve before leaving the assembly bay.
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-neutral-200">
              <div>
                <dt className="text-xs text-[#4b4f57]">Peak Engine Speed</dt>
                <dd className="text-xl font-semibold tabular-nums mt-0.5">16,500 RPM</dd>
              </div>
              <div>
                <dt className="text-xs text-[#4b4f57]">Aero Downforce</dt>
                <dd className="text-xl font-semibold tabular-nums mt-0.5">34 kg @ 290 km/h</dd>
              </div>
              <div>
                <dt className="text-xs text-[#4b4f57]">Chassis Tolerance</dt>
                <dd className="text-xl font-semibold tabular-nums mt-0.5">±0.05 mm</dd>
              </div>
              <div>
                <dt className="text-xs text-[#4b4f57]">Factory Warranty</dt>
                <dd className="text-xl font-semibold tabular-nums mt-0.5">3 Years / Unlimited</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('compare')}
              className="h-11 px-5 rounded-full bg-[#1d222b] text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
            >
              Open Speed & Dyno Lab
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="h-11 px-5 rounded-full border border-neutral-300 text-xs font-medium hover:bg-neutral-50 transition-colors"
            >
              Schedule Atelier Visit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ContactSectionProps {
  preselectedModel?: string;
}

const CIRCUITS = [
  'Zurich Alpine Proving Ground',
  'Milan Monza Paddock Lounge',
  'Munich Autobahn Experience Center',
  'Laguna Private Track Bay',
];

export const ContactBookingSection: React.FC<ContactSectionProps> = ({ preselectedModel }) => {
  const [selectedModel, setSelectedModel] = useState(
    preselectedModel || ALL_MOTORCYCLES[0].modelName
  );
  const [circuit, setCircuit] = useState(CIRCUITS[0]);
  const [sessionType, setSessionType] = useState<'Track Session' | 'Road Demo' | 'Bespoke Order'>(
    'Track Session'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('2026-12-05');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (preselectedModel) setSelectedModel(preselectedModel);
  }, [preselectedModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@')) {
      setError('Please enter your full name and a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section
      id="contact-booking"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-white text-[#1d222b] border-t border-neutral-200"
    >
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-5">
          <p className="text-xs font-medium text-[#4b4f57] uppercase tracking-wider">
            05. Private Sessions & Consultation
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Book a Private Track Session or Custom Build
          </h2>
          <p className="text-sm text-[#4b4f57] leading-relaxed">
            Experience the difference between our 268 km/h twin-cylinder tourer, 299 km/h V4
            superbike, 315 km/h electric axial-flux hyperbike, and 342 km/h track prototype with a
            dedicated HalvenMotos race engineer.
          </p>

          <div className="space-y-3 pt-4 border-t border-neutral-200 text-xs text-[#4b4f57]">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#1d222b]" />
              <span>Atelier Locations: Zurich · Milan · Munich · Monterey</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-[#1d222b]" />
              <span>Full telemetry debrief and suspension setup included</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#1d222b]" />
              <span>Private 90-minute track or alpine road appointments</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {submitted ? (
            <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-700" />
              <h3 className="text-xl font-semibold">Appointment Requested</h3>
              <p className="text-sm text-[#4b4f57]">
                Thank you, {name}. Your {sessionType.toLowerCase()} for the{' '}
                <strong className="text-[#1d222b]">{selectedModel}</strong> at{' '}
                <strong className="text-[#1d222b]">{circuit}</strong> on{' '}
                <strong className="text-[#1d222b] tabular-nums">{date}</strong> has been logged.
                Confirmation sent to {email}.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="h-10 px-5 rounded-full border border-neutral-300 bg-white text-xs font-medium hover:bg-neutral-100"
              >
                Book Another Session
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-2xl border border-neutral-200 bg-[#fafafa] space-y-5"
            >
              <div>
                <span className="block text-xs font-semibold mb-2">Session Type</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Track Session', 'Road Demo', 'Bespoke Order'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSessionType(t)}
                      className={`h-10 px-3 rounded-xl text-xs font-medium border transition-colors ${
                        sessionType === t
                          ? 'bg-[#1d222b] text-white border-[#1d222b]'
                          : 'bg-white text-[#1d222b] border-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Motorcycle Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:border-[#1d222b]"
                  >
                    {ALL_MOTORCYCLES.map((m) => (
                      <option key={m.id} value={m.modelName}>
                        {m.modelName} ({m.topSpeed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">Preferred Atelier</label>
                  <select
                    value={circuit}
                    onChange={(e) => setCircuit(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:border-[#1d222b]"
                  >
                    {CIRCUITS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Vance"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:border-[#1d222b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@domain.com"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:border-[#1d222b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Preferred Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs tabular-nums focus:outline-none focus:border-[#1d222b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Rider Weight / Ergonomics Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spring rate preference, helmet size, or titanium exhaust inquiry"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:border-[#1d222b]"
                />
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}

              <button
                type="submit"
                className="w-full sm:w-auto h-11 px-8 rounded-full bg-[#1d222b] hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
              >
                Request Private Appointment
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export const SiteFooter: React.FC<{ onNavigate: (page: PageId) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#14171d] text-white py-12 px-4 sm:px-6 border-t border-neutral-800">
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="text-lg font-medium tracking-[0.03em]">
            HalvenMotos<sup className="text-[0.7em]">®</sup>
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            Four satin pearl superbikes · Precision parts, helmets, leathers & telemetry.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-xs text-neutral-300">
          {(
            [
              ['home', 'Showroom'],
              ['motorcycles', 'Motorcycles'],
              ['products', 'All Products'],
              ['compare', 'Speed Lab'],
              ['engineering', 'Engineering'],
              ['contact', 'Contact & Ride'],
            ] as [PageId, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="text-xs text-neutral-500">
          © 2026 HalvenMotos Engineering. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
