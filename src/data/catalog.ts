export interface TankMark {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  half: number;
}

export interface MotorcycleSpec {
  id: string;
  slideIndex: number; // 0..3 for the 4 sprite sheet bikes (and mapped preview for extra models)
  paintName: string;
  modelName: string;
  tagline: string;
  category: 'Superbike' | 'Hyper-GT' | 'Scrambler' | 'Track Prototype' | 'Hyper-Naked' | 'Electric';
  hex: string;
  rgb: [number, number, number];
  price: number;
  bounds: { left: number; top: number; right: number; bottom: number };
  marks: [TankMark, TankMark];
  // Hero 6-spec row values (Slide 0 matches exact prompt defaults on initial load)
  range: string;
  topSpeed: string;
  topSpeedNum: number; // km/h for sorting & comparison
  acceleration: string;
  accelNum: number; // 0-100s
  zeroToTwoHundred: string;
  cooling: string;
  engineLayout: string;
  seatCapacity: string;
  // Extended distinct motorcycle capabilities
  horsepower: number;
  torqueNm: number;
  dryWeightKg: number;
  gearbox: string;
  brakes: string;
  suspension: string;
  braking100to0m: number;
  ridingModes: string[];
  capabilities: string[];
  gearSpeeds: [number, number, number, number, number, number]; // Max km/h per gear 1..6
  description: string;
  inStock: boolean;
}

export interface StoreProduct {
  id: string;
  sku: string;
  name: string;
  category:
    | 'Helmets & Protection'
    | 'Riding Apparel'
    | 'Exhaust & Engine'
    | 'Brakes & Suspension'
    | 'Electronics & Telemetry'
    | 'Track & Maintenance';
  price: number;
  image: string;
  fitment: string;
  weight: string;
  specHighlight: string;
  variants: string[];
  description: string;
  specs: { label: string; value: string }[];
  inStock: boolean;
}

export const SHEET_URL_WEBP =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261122_131809_0c1477f1-f13a-4b07-84e4-6ad1f33c15c5.png&w=3840&q=85';

export const SHEET_URL_PNG =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261122_131809_0c1477f1-f13a-4b07-84e4-6ad1f33c15c5.png';

export const HERO_SLIDES: MotorcycleSpec[] = [
  {
    id: 'hm-r1-magenta',
    slideIndex: 0,
    paintName: 'Magenta satin',
    modelName: 'HalvenMotos R1 Apex',
    tagline: 'Pure 1200 cc V4 superbike calibrated for apex precision and canyon velocity.',
    category: 'Superbike',
    hex: '#782956',
    rgb: [120, 41, 86],
    price: 28900,
    bounds: { left: 92, top: 122, right: 1749, bottom: 992 },
    marks: [
      { x0: 1041, y0: 265.5, x1: 1120, y1: 294.5, half: 7.5 },
      { x0: 1053, y0: 255, x1: 1109, y1: 275.5, half: 3.6 },
    ],
    range: '310 km',
    topSpeed: '299 km/h',
    topSpeedNum: 299,
    acceleration: '2.9 seconds',
    accelNum: 2.9,
    zeroToTwoHundred: '6.9 seconds',
    cooling: 'Liquid',
    engineLayout: '1200 cc V4',
    seatCapacity: '2 seats',
    horsepower: 214,
    torqueNm: 124,
    dryWeightKg: 174,
    gearbox: '6-speed bi-directional quickshifter',
    brakes: 'Dual 330 mm radial monoblock ABS Pro',
    suspension: 'Öhlins NIX 30 pressurized fork / TTX GP shock',
    braking100to0m: 36.2,
    ridingModes: ['Rain', 'Street', 'Sport', 'Race A', 'Race B'],
    capabilities: [
      '6-axis IMU cornering traction & slide control',
      'Integrated carbon aero winglets (28 kg downforce at 260 km/h)',
      'Auto-blipper seamless downshift quickshifter',
      'Forged magnesium 10-spoke wheels',
    ],
    gearSpeeds: [128, 174, 216, 252, 281, 299],
    description:
      'Flagship road-legal superbike pairing a counter-rotating 1200 cc V4 with wind-tunnel satin fairings and surgical chassis feedback.',
    inStock: true,
  },
  {
    id: 'hm-gt-sapphire',
    slideIndex: 1,
    paintName: 'Deep sapphire',
    modelName: 'HalvenMotos GT Velocity',
    tagline: 'Supercharged 1390 cc hypersport grand tourer built for transcontinental speed.',
    category: 'Hyper-GT',
    hex: '#033878',
    rgb: [3, 56, 120],
    price: 34500,
    bounds: { left: 1972, top: 121, right: 3636, bottom: 996 },
    marks: [
      { x0: 2921, y0: 266, x1: 3002, y1: 294.5, half: 7.5 },
      { x0: 2940, y0: 257.5, x1: 2984, y1: 275, half: 3.6 },
    ],
    range: '420 km',
    topSpeed: '328 km/h',
    topSpeedNum: 328,
    acceleration: '2.6 seconds',
    accelNum: 2.6,
    zeroToTwoHundred: '6.1 seconds',
    cooling: 'Dual-Loop Liquid',
    engineLayout: '1390 cc Supercharged',
    seatCapacity: '2 seats',
    horsepower: 248,
    torqueNm: 148,
    dryWeightKg: 192,
    gearbox: '6-speed dog-ring overdrive',
    brakes: '330 mm semi-floating ceramic discs + linked ABS',
    suspension: 'Electronic semi-active Skyhook EC 2.0',
    braking100to0m: 35.4,
    ridingModes: ['Tour', 'Autobahn', 'Sport+', 'Velocity'],
    capabilities: [
      'Centrifugal supercharger with intercooled ram-air plenum',
      'Millimeter-wave adaptive cruise & blind-spot radar',
      '22 L long-range composite fuel cell (420 km range)',
      'Heated ergonomic grips & keyless smart fob',
    ],
    gearSpeeds: [139, 188, 234, 276, 306, 328],
    description:
      'Engineered to cover 420 km between stops while holding 328 km/h terminal velocity via a balanced centrifugal supercharger.',
    inStock: true,
  },
  {
    id: 'hm-x-cocoa',
    slideIndex: 2,
    paintName: 'Cocoa copper',
    modelName: 'HalvenMotos X Tourer',
    tagline: 'High-torque 1050 cc V-Twin all-road sport machine tuned for mountain passes.',
    category: 'Scrambler',
    hex: '#593429',
    rgb: [89, 52, 41],
    price: 23400,
    bounds: { left: 91, top: 1113, right: 1748, bottom: 1992 },
    marks: [
      { x0: 1035, y0: 1258.5, x1: 1118, y1: 1288.5, half: 7.5 },
      { x0: 1058, y0: 1249.5, x1: 1114, y1: 1271.5, half: 3.6 },
    ],
    range: '385 km',
    topSpeed: '268 km/h',
    topSpeedNum: 268,
    acceleration: '3.4 seconds',
    accelNum: 3.4,
    zeroToTwoHundred: '9.2 seconds',
    cooling: 'Oil + Liquid',
    engineLayout: '1050 cc Twin',
    seatCapacity: '2 seats',
    horsepower: 158,
    torqueNm: 118,
    dryWeightKg: 181,
    gearbox: '6-speed wide-ratio slipper clutch',
    brakes: '320 mm dual Brembo Stylema + switchable rear ABS',
    suspension: 'Long-travel 150 mm inverted TiN-coated forks',
    braking100to0m: 37.8,
    ridingModes: ['Gravel', 'Urban', 'Alpine', 'Dynamic'],
    capabilities: [
      'Low-RPM torque curve (90% torque available at 4,200 RPM)',
      'Automatic hill-hold & gravel traction intervention',
      'Dual-compound endurance tyres & titanium skid guard',
      'Quick-detach touring pannier mounting rails',
    ],
    gearSpeeds: [108, 149, 187, 222, 249, 268],
    description:
      'Built for relentless alpine switchbacks and uneven tarmac, delivering massive mid-range pull and all-day rider comfort.',
    inStock: true,
  },
  {
    id: 'hm-z-violet',
    slideIndex: 3,
    paintName: 'Violet pearl',
    modelName: 'HalvenMotos Z Hypertrack',
    tagline: 'Homologation carbon-monocoque track weapon pushing 342 km/h.',
    category: 'Track Prototype',
    hex: '#5b44a7',
    rgb: [91, 68, 167],
    price: 46800,
    bounds: { left: 1970, top: 1111, right: 3636, bottom: 1991 },
    marks: [
      { x0: 2921, y0: 1260.5, x1: 3002, y1: 1289, half: 7.5 },
      { x0: 2939, y0: 1252, x1: 2995, y1: 1272.5, half: 3.6 },
    ],
    range: '270 km',
    topSpeed: '342 km/h',
    topSpeedNum: 342,
    acceleration: '2.4 seconds',
    accelNum: 2.4,
    zeroToTwoHundred: '5.5 seconds',
    cooling: 'Cryo-Liquid Carbon',
    engineLayout: '1280 cc V4-R',
    seatCapacity: '1 seat',
    horsepower: 262,
    torqueNm: 136,
    dryWeightKg: 158,
    gearbox: '6-speed seamless cassette gearbox',
    brakes: '340 mm carbon-ceramic race rotors + thumb rear brake',
    suspension: 'Öhlins WSBK FGR 400 gas-charged fork',
    braking100to0m: 33.6,
    ridingModes: ['Wet Track', 'Qualify', 'Sprint', 'Endurance'],
    capabilities: [
      'Full autoclave carbon-fiber monocoque frame & swingarm',
      'GPS pit-wall telemetry logger with lean-angle & brake pressure traces',
      'Pneumatic valve-train revving to 16,500 RPM',
      'Bi-plane active downforce wings + dry clutch',
    ],
    gearSpeeds: [145, 198, 246, 289, 319, 342],
    description:
      'Our highest-spec production superbike: 158 kg dry weight, 262 HP pneumatic V4-R, and 342 km/h straightaway speed.',
    inStock: true,
  },
];

export const EXTRA_MOTORCYCLES: MotorcycleSpec[] = [
  {
    id: 'hm-e-pulse',
    slideIndex: 1,
    paintName: 'Sapphire Stealth',
    modelName: 'HalvenMotos E-Pulse EV',
    tagline: 'Solid-state 900V axial-flux electric hyperbike with instant torque vectoring.',
    category: 'Electric',
    hex: '#033878',
    rgb: [3, 56, 120],
    price: 39200,
    bounds: { left: 1972, top: 121, right: 3636, bottom: 996 },
    marks: [
      { x0: 2921, y0: 266, x1: 3002, y1: 294.5, half: 7.5 },
      { x0: 2940, y0: 257.5, x1: 2984, y1: 275, half: 3.6 },
    ],
    range: '360 km',
    topSpeed: '315 km/h',
    topSpeedNum: 315,
    acceleration: '2.3 seconds',
    accelNum: 2.3,
    zeroToTwoHundred: '5.8 seconds',
    cooling: 'Dielectric Immersion',
    engineLayout: '200 kW Axial-Flux EV',
    seatCapacity: '1 seat',
    horsepower: 268,
    torqueNm: 240,
    dryWeightKg: 186,
    gearbox: 'Direct-drive single-speed carbon belt',
    brakes: '330 mm Brembo + 65 kW regenerative engine braking',
    suspension: 'Electronic WP Apex Pro active damping',
    braking100to0m: 34.9,
    ridingModes: ['Eco Range', 'City', 'Hyper', 'Drag Launch'],
    capabilities: [
      '240 Nm instantaneous torque from 0 RPM',
      '18-minute 10–80% 350 kW DC fast charging',
      'Zero-shift seamless linear acceleration to 315 km/h',
      'Customizable regenerative braking curve per corner',
    ],
    gearSpeeds: [315, 315, 315, 315, 315, 315],
    description:
      'Silent 900-volt fury: 240 Nm instant torque launches the E-Pulse from 0 to 100 km/h in 2.3 seconds with zero gear shifts.',
    inStock: true,
  },
  {
    id: 'hm-s900-fighter',
    slideIndex: 0,
    paintName: 'Magenta Raw',
    modelName: 'HalvenMotos S-900 Fighter',
    tagline: 'Stripped hyper-naked V3 streetfighter built for agile urban dominance.',
    category: 'Hyper-Naked',
    hex: '#782956',
    rgb: [120, 41, 86],
    price: 19800,
    bounds: { left: 92, top: 122, right: 1749, bottom: 992 },
    marks: [
      { x0: 1041, y0: 265.5, x1: 1120, y1: 294.5, half: 7.5 },
      { x0: 1053, y0: 255, x1: 1109, y1: 275.5, half: 3.6 },
    ],
    range: '330 km',
    topSpeed: '282 km/h',
    topSpeedNum: 282,
    acceleration: '3.1 seconds',
    accelNum: 3.1,
    zeroToTwoHundred: '7.8 seconds',
    cooling: 'Liquid + Oil Cooler',
    engineLayout: '940 cc Inline-3',
    seatCapacity: '2 seats',
    horsepower: 176,
    torqueNm: 108,
    dryWeightKg: 166,
    gearbox: '6-speed short-ratio streetfighter box',
    brakes: 'Dual 320 mm radial Stylema calipers',
    suspension: 'Marzocchi 43 mm fully adjustable USD fork',
    braking100to0m: 36.8,
    ridingModes: ['Rain', 'Street', 'Attack', 'Stunt'],
    capabilities: [
      'Wide tapered aluminum bars for razor-sharp city agility',
      'Wheelie-control multi-level lift limiter',
      'Ultra-light 166 kg dry weight with exposed trellis frame',
      'Bluetooth turn-by-turn TFT cockpit integration',
    ],
    gearSpeeds: [118, 162, 198, 232, 261, 282],
    description:
      'Lightweight 166 kg hyper-naked tuned for explosive roll-on punch, upright ergonomics, and raw triple-cylinder acoustics.',
    inStock: true,
  },
];

export const ALL_MOTORCYCLES: MotorcycleSpec[] = [...HERO_SLIDES, ...EXTRA_MOTORCYCLES];

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-helmet-forged',
    sku: 'HM-HLM-01',
    name: 'HalvenMotos Aero Forged Carbon Helmet',
    category: 'Helmets & Protection',
    price: 1290,
    image: '/src/assets/images/gear_carbon_helmet_1795375161499.jpg',
    fitment: 'Universal · FIM Homologated',
    weight: '1,240 g',
    specHighlight: 'ECE 22.06 & FIM Racing Spec',
    variants: ['S (55–56 cm)', 'M (57–58 cm)', 'L (59–60 cm)', 'XL (61–62 cm)'],
    description:
      'Autoclave forged carbon-kevlar shell engineered at 340 km/h in our wind tunnel to eliminate buffeting and neck lift.',
    specs: [
      { label: 'Shell Material', value: 'Forged T1000 Carbon' },
      { label: 'Visor Optics', value: 'Class-1 Photochromic Iridium' },
      { label: 'Retention', value: 'Titanium Double-D Ring' },
      { label: 'Weight', value: '1,240 g ± 30 g' },
    ],
    inStock: true,
  },
  {
    id: 'prod-helmet-visor',
    sku: 'HM-HLM-02',
    name: 'OpticShield Smoked Tear-Off Visor Kit',
    category: 'Helmets & Protection',
    price: 185,
    image: '/src/assets/images/gear_carbon_helmet_1795375161499.jpg',
    fitment: 'Fits Aero Forged Carbon Helmet',
    weight: '145 g',
    specHighlight: 'Pinlock 120 Anti-Fog Included',
    variants: ['Gold Iridium', 'Deep Smoke', 'Clear Race'],
    description:
      'Distortion-free 3 mm polycarbonate race shield with quick-release locking posts and 10 laminated tear-off films.',
    specs: [
      { label: 'Thickness', value: '3.0 mm Optical Grade' },
      { label: 'UV Protection', value: '100% UV400' },
      { label: 'Tear-Offs', value: '10-Pack Laminated' },
      { label: 'Anti-Fog', value: 'Pinlock 120 Max' },
    ],
    inStock: true,
  },
  {
    id: 'prod-jacket-leather',
    sku: 'HM-APP-01',
    name: 'HalvenMotos Satin Crimson Pro Jacket & Gloves',
    category: 'Riding Apparel',
    price: 1640,
    image: '/src/assets/images/gear_racing_jacket_1795375165640.jpg',
    fitment: 'Full-Zip Track Suit Compatible',
    weight: '2.4 kg',
    specHighlight: 'AAA CE Level-2 + Kangaroo Palm Gloves',
    variants: ['EU 48 / S', 'EU 50 / M', 'EU 52 / L', 'EU 54 / XL'],
    description:
      '1.3 mm full-grain cowhide paired with carbon-titanium shoulder sliders, airbag-ready stretch panels, and matching race gloves.',
    specs: [
      { label: 'Safety Rating', value: 'EN 17092 Class AAA' },
      { label: 'Armor', value: 'D3O Level 2 Elbows / Shoulders / Back' },
      { label: 'Airbag Ready', value: 'Internal In&motion Zip Bay' },
      { label: 'Glove Palm', value: '0.8 mm Kangaroo Leather' },
    ],
    inStock: true,
  },
  {
    id: 'prod-apparel-undersuit',
    sku: 'HM-APP-02',
    name: 'CryoWeave Seamless Track Base Layer',
    category: 'Riding Apparel',
    price: 220,
    image: '/src/assets/images/gear_racing_jacket_1795375165640.jpg',
    fitment: 'Unisex Compression Fit',
    weight: '310 g',
    specHighlight: 'Moisture-Wicking Phase-Change Yarn',
    variants: ['Size S/M', 'Size L/XL'],
    description:
      'One-piece frictionless base suit designed to slide cleanly inside tight race leathers while regulating core body temperature.',
    specs: [
      { label: 'Fabric', value: 'Dryarn Polypropylene + Carbon' },
      { label: 'Construction', value: 'Zero-Seam Tubular Knit' },
      { label: 'Thumb Loops', value: 'Reinforced Ankle & Wrist Stirrups' },
      { label: 'Care', value: 'Machine Washable 30°C' },
    ],
    inStock: true,
  },
  {
    id: 'prod-exhaust-ti',
    sku: 'HM-EXH-01',
    name: 'HalvenMotos Full Titanium Evo Exhaust System',
    category: 'Exhaust & Engine',
    price: 3890,
    image: '/src/assets/images/parts_titanium_exhaust_1795375177286.jpg',
    fitment: 'R1 Apex · Z Hypertrack · GT Velocity',
    weight: '3.9 kg (-5.4 kg vs stock)',
    specHighlight: '+14 HP Gain · +9 Nm Midrange',
    variants: ['R1 Apex 1200 V4', 'Z Hypertrack 1280', 'GT Velocity 1390'],
    description:
      'Hand-TIG welded Grade-5 titanium headers with hydroformed collector and twin autoclave carbon-fiber end cans.',
    specs: [
      { label: 'Alloy', value: '0.8 mm Thin-Wall Grade-5 Ti' },
      { label: 'Power Gain', value: '+14.2 HP at 13,800 RPM' },
      { label: 'Weight Saving', value: '5.4 kg Lighter Than OEM' },
      { label: 'Sound', value: '104 dB (98 dB w/ dB Killer)' },
    ],
    inStock: true,
  },
  {
    id: 'prod-engine-velocity-stacks',
    sku: 'HM-ENG-02',
    name: 'Variable CNC Ram-Air Velocity Stacks & ECU Map',
    category: 'Exhaust & Engine',
    price: 1120,
    image: '/src/assets/images/parts_titanium_exhaust_1795375177286.jpg',
    fitment: 'R1 Apex & Z Hypertrack V4',
    weight: '420 g',
    specHighlight: '+600 RPM Over-Rev Ceiling',
    variants: ['Track Map (Race Fuel)', 'Street 98 RON Map'],
    description:
      'Dual-height actuated intake trumpets paired with an unlocked HalvenMotos race ignition/fueling calibration key.',
    specs: [
      { label: 'Material', value: '7075-T6 Billet Anodized' },
      { label: 'Rev Limit', value: '+600 RPM Extended' },
      { label: 'Throttle', value: '1:1 Linear Ride-by-Wire' },
      { label: 'Installation', value: 'Plug-and-Play OBD Flash' },
    ],
    inStock: true,
  },
  {
    id: 'prod-brakes-ceramic',
    sku: 'HM-BRK-01',
    name: 'Billet Monoblock Caliper & 330 mm Carbon-Ceramic Kit',
    category: 'Brakes & Suspension',
    price: 4450,
    image: '/src/assets/images/parts_ceramic_brakes_1795375161026.jpg',
    fitment: 'All HalvenMotos 100 mm Radial Forks',
    weight: '2.1 kg Unsprung Savings',
    specHighlight: 'Zero Fade at 900°C Rotor Temp',
    variants: ['330 mm Street/Track', '340 mm Endurance Spec'],
    description:
      'CNC-carved 4-piston ventilated titanium-piston monoblock calipers matched with drilled carbon-ceramic floating discs.',
    specs: [
      { label: 'Piston Size', value: '32 / 36 mm Ventilated Ti' },
      { label: 'Rotor Diameter', value: '330 mm × 6.5 mm Ceramic' },
      { label: 'Peak Temp', value: '920°C Continuous' },
      { label: 'Stopping Delta', value: '-2.1 m from 100 km/h' },
    ],
    inStock: true,
  },
  {
    id: 'prod-susp-ohlins',
    sku: 'HM-SUS-02',
    name: 'Pressurized Cartridge Fork & Rear Link Kit',
    category: 'Brakes & Suspension',
    price: 2790,
    image: '/src/assets/images/parts_ceramic_brakes_1795375161026.jpg',
    fitment: 'R1 Apex · X Tourer · S-900',
    weight: '6.8 kg',
    specHighlight: '25-Click Compression & Rebound',
    variants: ['75–85 kg Rider Spring', '85–95 kg Rider Spring', '95+ kg Rider Spring'],
    description:
      'Closed-cartridge nitrogen-pressurized damping inserts and CNC progressive rear linkage for unmatched mid-corner stability.',
    specs: [
      { label: 'Damping', value: 'Twin-Tube Gas Pressurized' },
      { label: 'Adjustability', value: 'Preload, Comp, Rebound' },
      { label: 'Coatings', value: 'DLC Black Stanchion Finish' },
      { label: 'Service Interval', value: '20,000 km / 40 Track Hours' },
    ],
    inStock: true,
  },
  {
    id: 'prod-elec-telemetry',
    sku: 'HM-ELC-01',
    name: 'HalvenMotos 50 Hz GPS Lap & Lean Telemetry Box',
    category: 'Electronics & Telemetry',
    price: 890,
    image: '/src/assets/images/studio_dyno_workshop_1795375162145.jpg',
    fitment: 'CAN-Bus Plug & Play (All Models)',
    weight: '115 g',
    specHighlight: '50 Hz Multi-GNSS + Brake Pressure Trace',
    variants: ['Standard CAN Module', 'Pro w/ Suspension Potentiometers'],
    description:
      'Direct CAN-bus data acquisition logging lean angle, throttle position, gear, wheel slip, and 50 Hz GPS sector splits.',
    specs: [
      { label: 'Sample Rate', value: '50 Hz GNSS / 200 Hz IMU' },
      { label: 'Storage', value: '64 GB Internal (200+ Sessions)' },
      { label: 'Connectivity', value: 'Wi-Fi 6 + USB-C Export' },
      { label: 'Waterproofing', value: 'IP67 Paddock Rated' },
    ],
    inStock: true,
  },
  {
    id: 'prod-track-stand',
    sku: 'HM-TRK-01',
    name: 'Carbon-Alloy Paddock Stand & Tyre Warmer Bundle',
    category: 'Track & Maintenance',
    price: 940,
    image: '/src/assets/images/studio_dyno_workshop_1795375162145.jpg',
    fitment: 'Single & Dual Sided Swingarms',
    weight: '5.2 kg',
    specHighlight: '85°C Digital Dual-Zone Warmers',
    variants: ['Single-Sided Pin (R1/Z/GT)', 'Dual Fork Bobbins (X/S900)'],
    description:
      'Billet aluminum front/rear race stands bundled with Nomex-lined digital tyre blankets pre-heating slicks to 85°C in 25 minutes.',
    specs: [
      { label: 'Max Temperature', value: '85°C Regulated +/- 1°C' },
      { label: 'Tyre Sizes', value: '120/70 Front · 190–200 Rear' },
      { label: 'Stand Load', value: '350 kg Rated' },
      { label: 'Power', value: '110V–240V Universal' },
    ],
    inStock: true,
  },
];
