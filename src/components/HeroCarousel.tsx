import React, { useEffect, useRef, useState } from 'react';
import { HERO_SLIDES, MotorcycleSpec, SHEET_URL_PNG, SHEET_URL_WEBP } from '../data/catalog';
import {
  BikeRenderer,
  buildBikeTextures,
  computeBackgroundGradient,
  computeHeroGeometry,
  determineTierAndModifiers,
  ease,
  FittedLetter,
  fitRideOutLetters,
  HeroGeometry,
  inverseEase,
  mod4,
  QuadDrawItem,
} from '../engine/heroEngine';

interface HeroCarouselProps {
  onOpenMenu: () => void;
  onOpenContact: () => void;
  onViewSpecs: (bike: MotorcycleSpec) => void;
  onActiveSlideChange?: (bike: MotorcycleSpec) => void;
  onBikePreviewsReady?: (urls: string[]) => void;
  jumpToSlideIndex?: number | null;
}

const MOVE_DURATION = 1400;
const AUTOPLAY_WAIT = 2000;
const INITIAL_AUTOPLAY_DELAY = 1000;
const FAILSAFE_REVEAL_MS = 6000;

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  onOpenMenu,
  onOpenContact,
  onViewSpecs,
  onActiveSlideChange,
  onBikePreviewsReady,
  jumpToSlideIndex,
}) => {
  const heroRef = useRef<HTMLElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLHeadingElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const prevBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const [fittedLetters, setFittedLetters] = useState<FittedLetter[] | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  // Mutable animation & engine state
  const stateRef = useRef({
    pos: 0,
    moving: false,
    moveFrom: 0,
    moveTo: 0,
    moveStart: 0,
    moveUserInitiated: false,
    queuedDir: 0 as -1 | 0 | 1,
    rafId: 0,
    autoplayTimer: 0,
    revealed: false,
    fontSettled: false,
    sheetSettled: false,
    renderer: null as BikeRenderer | null,
    textures: null as HTMLCanvasElement[] | null,
    geom: null as HeroGeometry | null,
    reducedMotion: false,
    // Pointer drag state
    activePointerId: null as number | null,
    downX: 0,
    downY: 0,
    dragging: false,
    dragStartPos: 0,
    interruptedDest: null as number | null,
    trail: [] as { x: number; t: number }[],
    focusPaused: false,
    pointerHeld: false,
  });

  const activeBike = HERO_SLIDES[activeSlideIdx];

  useEffect(() => {
    onActiveSlideChange?.(HERO_SLIDES[activeSlideIdx]);
  }, [activeSlideIdx, onActiveSlideChange]);

  // Helper to apply layout and render a frame
  const layoutAndDrawRef = useRef<() => void>(() => {});
  const startMoveRef = useRef<(from: number, to: number, userInitiated: boolean, customStart?: number) => void>(() => {});
  const scheduleAutoplayRef = useRef<(delayMs?: number) => void>(() => {});

  // Respond to external slide jump requests (e.g. from footer or sub-bar)
  useEffect(() => {
    if (jumpToSlideIndex === null || jumpToSlideIndex === undefined) return;
    const st = stateRef.current;
    if (!st.revealed) return;
    const currentIdx = mod4(Math.round(st.pos));
    let diff = jumpToSlideIndex - currentIdx;
    if (diff > 2) diff -= 4;
    if (diff < -2) diff += 4;
    if (diff === 0) return;
    const base = Math.round(st.pos);
    startMoveRef.current(st.pos, base + diff, true);
  }, [jumpToSlideIndex]);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!hero || !canvas || !panel) return;

    const st = stateRef.current;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    st.reducedMotion = motionQuery.matches;

    const clearAutoplay = () => {
      if (st.autoplayTimer) {
        window.clearTimeout(st.autoplayTimer);
        st.autoplayTimer = 0;
      }
    };

    const drawFrame = () => {
      const geom = st.geom;
      if (!geom) return;

      // Update hero background gradient
      hero.style.backgroundImage = computeBackgroundGradient(
        st.pos,
        geom.wordTop,
        geom.groundY,
        geom.H
      );

      // Update active slide index when settled or crossing midpoint
      const nearestIdx = mod4(Math.round(st.pos));
      setActiveSlideIdx((prev) => (prev === nearestIdx ? prev : nearestIdx));

      const renderer = st.renderer;
      if (!renderer || renderer.lost) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const reach = Math.ceil((geom.W / 2 + 0.4 * geom.bikeWidth) / geom.step) + 1;
      const centerRound = Math.round(st.pos);
      const quads: (QuadDrawItem & { absOffset: number })[] = [];

      for (let i = centerRound - reach; i <= centerRound + reach; i++) {
        const o = i - st.pos;
        const t = Math.min(1, Math.abs(o));
        const s = 1 + (0.596774 - 1) * t;
        const cx = geom.bikeCenterX + o * geom.step;
        const q = (geom.bikeWidth * s) / 1780;
        const left = cx - 1024 * q;
        const top = geom.bikeCenterY - 490.5 * q;
        const width = 2048 * q;
        const height = 1024 * q;
        const sigma = 4.5 * (geom.bikeWidth / 762) * t;

        if (left + width < -20 || left > geom.W + 20) continue;

        quads.push({
          slideIdx: mod4(i),
          left,
          top,
          width,
          height,
          sigma,
          absOffset: Math.abs(o),
        });
      }

      // Draw farthest from centre first so centre bike is on top
      quads.sort((a, b) => b.absOffset - a.absOffset);
      renderer.render(geom.W, geom.H, dpr, quads);
    };

    const layout = () => {
      const W = hero.clientWidth;
      const H = hero.clientHeight;
      if (W <= 0 || H <= 0) return;

      // Set tier classes & --u before measuring panelTop
      const pre = determineTierAndModifiers(W, H);
      hero.classList.remove('wide', 'short', 'tall', 'cols-3', 'narrow', 'roomy', 'tablet');
      hero.classList.add(pre.tier);
      if (pre.cols3) hero.classList.add('cols-3');
      if (pre.narrow) hero.classList.add('narrow');
      if (pre.roomy) hero.classList.add('roomy');
      if (pre.tablet) hero.classList.add('tablet');
      hero.style.setProperty('--u', `${pre.uCss}px`);

      const heroRect = hero.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const panelTop = panelRect.top - heroRect.top;

      const geom = computeHeroGeometry(W, H, panelTop);
      st.geom = geom;

      // Position RIDE OUT word box
      if (wordRef.current) {
        wordRef.current.style.left = `${geom.wordLeft}px`;
        wordRef.current.style.top = `${geom.wordTop}px`;
        wordRef.current.style.width = `${geom.wordWidth}px`;
        wordRef.current.style.height = `${geom.wordHeight}px`;
      }

      // Position arrows
      const placeArrow = (el: HTMLButtonElement | null, pt: { x: number; y: number }) => {
        if (!el) return;
        el.style.left = `${pt.x}px`;
        el.style.top = `${pt.y}px`;
        el.style.width = `${geom.arrowDiameter}px`;
        el.style.height = `${geom.arrowDiameter}px`;
      };
      placeArrow(prevBtnRef.current, geom.prevArrow);
      placeArrow(nextBtnRef.current, geom.nextArrow);

      // Dot grid sizing & alignment (Section 7)
      if (dotsRef.current) {
        const s = geom.bikeWidth / 762;
        const tileW = Math.max(22, 45.4 * s);
        const tileH = Math.max(20, 41 * s);
        const posX = (((W / 2 - tileW / 2) % tileW) + tileW) % tileW;
        const posY = 31 * s - tileH / 2;
        dotsRef.current.style.height = `${geom.wordTop + 0.75 * geom.wordHeight}px`;
        dotsRef.current.style.backgroundSize = `${tileW.toFixed(2)}px ${tileH.toFixed(2)}px`;
        dotsRef.current.style.backgroundPosition = `${posX.toFixed(2)}px ${posY.toFixed(2)}px`;
      }

      // Backing store sizing
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(W * dpr);
      const ch = Math.round(H * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      drawFrame();
    };
    layoutAndDrawRef.current = layout;

    const canAutoplay = () =>
      st.revealed &&
      !st.reducedMotion &&
      Boolean(st.renderer) &&
      !st.renderer?.lost &&
      !document.hidden &&
      !st.pointerHeld &&
      !st.dragging &&
      !st.focusPaused &&
      !st.moving;

    const scheduleAutoplay = (delayMs = AUTOPLAY_WAIT) => {
      clearAutoplay();
      if (!canAutoplay()) return;
      st.autoplayTimer = window.setTimeout(() => {
        st.autoplayTimer = 0;
        if (!canAutoplay()) return;
        const base = Math.round(st.pos);
        startMove(base, base + 1, false);
      }, delayMs);
    };
    scheduleAutoplayRef.current = scheduleAutoplay;

    const tick = (now: number) => {
      if (!st.moving) {
        st.rafId = 0;
        return;
      }
      const x = Math.min(1, Math.max(0, (now - st.moveStart) / MOVE_DURATION));
      st.pos = st.moveFrom + (st.moveTo - st.moveFrom) * ease(x);
      drawFrame();

      if (x >= 1) {
        st.pos = st.moveTo;
        st.moving = false;
        st.rafId = 0;
        drawFrame();

        if (st.moveUserInitiated) {
          const slide = HERO_SLIDES[mod4(Math.round(st.pos))];
          setLiveAnnouncement(`${slide.paintName} — ${slide.modelName}`);
        }

        if (st.queuedDir !== 0) {
          const dir = st.queuedDir;
          st.queuedDir = 0;
          const base = Math.round(st.pos);
          startMove(base, base + dir, true);
        } else {
          scheduleAutoplay(AUTOPLAY_WAIT);
        }
        return;
      }

      st.rafId = window.requestAnimationFrame(tick);
    };

    const startMove = (
      from: number,
      to: number,
      userInitiated: boolean,
      customStart?: number
    ) => {
      clearAutoplay();
      if (st.rafId) {
        window.cancelAnimationFrame(st.rafId);
        st.rafId = 0;
      }

      if (st.reducedMotion) {
        st.pos = to;
        st.moving = false;
        drawFrame();
        if (userInitiated) {
          const slide = HERO_SLIDES[mod4(Math.round(st.pos))];
          setLiveAnnouncement(`${slide.paintName} — ${slide.modelName}`);
        }
        return;
      }

      st.moving = true;
      st.moveFrom = from;
      st.moveTo = to;
      st.moveStart = customStart !== undefined ? customStart : performance.now();
      st.moveUserInitiated = userInitiated;
      st.rafId = window.requestAnimationFrame(tick);
    };
    startMoveRef.current = startMove;

    // Reveal sequence (Section 18)
    const tryReveal = (force = false) => {
      if (st.revealed) return;
      if (!force && (!st.fontSettled || !st.sheetSettled)) return;
      st.revealed = true;

      window.requestAnimationFrame(() => {
        hero.classList.remove('pending');
        if (!st.reducedMotion) {
          const targets: { el: Element | null; delay: number }[] = [
            { el: wordRef.current, delay: 0 },
            { el: canvasRef.current, delay: 60 },
            { el: navRef.current, delay: 120 },
            { el: prevBtnRef.current, delay: 150 },
            { el: nextBtnRef.current, delay: 150 },
            { el: panelRef.current, delay: 150 },
          ];
          for (const { el, delay } of targets) {
            if (!el || typeof el.animate !== 'function') continue;
            el.animate(
              [
                { opacity: 0, translate: '0 16px' },
                { opacity: 1, translate: '0 0' },
              ],
              {
                duration: 850,
                delay,
                easing: 'cubic-bezier(.22, 1, .36, 1)',
                fill: 'backwards',
              }
            );
          }
          scheduleAutoplay(INITIAL_AUTOPLAY_DELAY);
        }
      });
    };

    // 1. Lay out immediately
    layout();

    // 2a. Load font in parallel
    const loadFont = async () => {
      try {
        if (document.fonts && document.fonts.load) {
          await document.fonts.load('450 100px "Albert Sans"');
        }
      } catch {
        // Ignore font load errors; fallback still renders
      }
      const letters = fitRideOutLetters();
      if (letters) setFittedLetters(letters);
      st.fontSettled = true;
      layout();
      tryReveal();
    };
    loadFont();

    // 2b. Load sprite sheet in parallel
    const loadSheet = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let triedFallback = false;

      img.onload = () => {
        try {
          const built = buildBikeTextures(img);
          st.textures = built.textures;
          onBikePreviewsReady?.(built.previewUrls);
          st.renderer = new BikeRenderer(canvas, built.textures);
        } catch {
          // Graceful fallback if canvas tainted
        }
        st.sheetSettled = true;
        layout();
        tryReveal();
      };

      img.onerror = () => {
        if (!triedFallback) {
          triedFallback = true;
          img.src = SHEET_URL_PNG;
        } else {
          st.sheetSettled = true;
          tryReveal();
        }
      };

      img.src = SHEET_URL_WEBP;
    };
    loadSheet();

    const failsafeTimer = window.setTimeout(() => {
      tryReveal(true);
    }, FAILSAFE_REVEAL_MS);

    // ResizeObserver
    const ro = new ResizeObserver(() => layout());
    ro.observe(hero);

    // WebGL context lost / restore (Section 12)
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (st.renderer) st.renderer.lost = true;
      clearAutoplay();
      if (st.rafId) {
        window.cancelAnimationFrame(st.rafId);
        st.rafId = 0;
      }
      st.moving = false;
    };
    const onContextRestored = () => {
      if (st.textures) {
        st.renderer = new BikeRenderer(canvas, st.textures);
        layout();
        scheduleAutoplay(AUTOPLAY_WAIT);
      }
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // Visibility, reduced motion, focus-visible pause (Section 15)
    const onVisibilityChange = () => {
      if (document.hidden) clearAutoplay();
      else scheduleAutoplay(AUTOPLAY_WAIT);
    };
    const onMotionChange = (e: MediaQueryListEvent) => {
      st.reducedMotion = e.matches;
      if (st.reducedMotion) {
        clearAutoplay();
        if (st.moving) {
          st.pos = st.moveTo;
          st.moving = false;
          if (st.rafId) {
            window.cancelAnimationFrame(st.rafId);
            st.rafId = 0;
          }
          drawFrame();
        }
      } else {
        scheduleAutoplay(AUTOPLAY_WAIT);
      }
    };
    const checkFocusPause = () => {
      const active = document.activeElement;
      const isFocusVisible = Boolean(
        active && hero.contains(active) && active.matches(':focus-visible')
      );
      st.focusPaused = isFocusVisible;
      if (isFocusVisible) clearAutoplay();
      else scheduleAutoplay(AUTOPLAY_WAIT);
    };
    const onFocusIn = () => checkFocusPause();
    const onFocusOut = () => window.setTimeout(checkFocusPause, 0);

    document.addEventListener('visibilitychange', onVisibilityChange);
    motionQuery.addEventListener('change', onMotionChange);
    hero.addEventListener('focusin', onFocusIn);
    hero.addEventListener('focusout', onFocusOut);

    return () => {
      window.clearTimeout(failsafeTimer);
      clearAutoplay();
      if (st.rafId) window.cancelAnimationFrame(st.rafId);
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionQuery.removeEventListener('change', onMotionChange);
      hero.removeEventListener('focusin', onFocusIn);
      hero.removeEventListener('focusout', onFocusOut);
      st.renderer?.dispose();
    };
  }, [onBikePreviewsReady]);

  // Arrow Click Behavior (Section 16)
  const handleArrowStep = (dir: -1 | 1) => {
    const st = stateRef.current;
    if (st.dragging) return;
    if (st.moving) {
      st.queuedDir = dir;
      return;
    }
    const base = Math.round(st.pos);
    startMoveRef.current(base, base + dir, true);
  };

  // Drag & Swipe Behavior (Section 17)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const st = stateRef.current;
    if (st.activePointerId !== null) return;

    st.activePointerId = e.pointerId;
    st.pointerHeld = true;
    st.downX = e.clientX;
    st.downY = e.clientY;
    st.dragging = false;
    st.dragStartPos = st.pos;
    st.queuedDir = 0;
    st.trail = [{ x: e.clientX, t: performance.now() }];

    if (st.autoplayTimer) {
      window.clearTimeout(st.autoplayTimer);
      st.autoplayTimer = 0;
    }
    if (st.moving) {
      st.interruptedDest = st.moveTo;
      st.moving = false;
      if (st.rafId) {
        window.cancelAnimationFrame(st.rafId);
        st.rafId = 0;
      }
    } else {
      st.interruptedDest = null;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture error
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = stateRef.current;
    if (st.activePointerId !== e.pointerId || !st.geom) return;

    const dx = e.clientX - st.downX;
    const dy = e.clientY - st.downY;

    if (!st.dragging) {
      if (Math.hypot(dx, dy) >= 5 && Math.abs(dx) > Math.abs(dy)) {
        st.dragging = true;
        setIsDraggingUI(true);
      } else {
        return;
      }
    }

    const now = performance.now();
    st.trail.push({ x: e.clientX, t: now });
    const cutoff = now - 90;
    while (st.trail.length > 1 && st.trail[0].t < cutoff) {
      st.trail.shift();
    }

    st.pos = st.dragStartPos - dx / st.geom.step;
    layoutAndDrawRef.current();
  };

  const finishPointer = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const st = stateRef.current;
    if (st.activePointerId !== e.pointerId) return;
    st.activePointerId = null;
    st.pointerHeld = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    const wasDragging = st.dragging;
    st.dragging = false;
    setIsDraggingUI(false);

    if (!wasDragging) {
      // Tap with no drag: resume interrupted move's destination or stay on nearest bike
      if (st.interruptedDest !== null) {
        const dest = st.interruptedDest;
        st.interruptedDest = null;
        const remaining = Math.min(1, Math.abs(dest - st.pos));
        if (remaining > 0.001) {
          const dir = Math.sign(dest - st.pos) || 1;
          const start = performance.now() - inverseEase(1 - remaining) * MOVE_DURATION;
          startMoveRef.current(dest - dir, dest, true, start);
          return;
        }
      }
      scheduleAutoplayRef.current(AUTOPLAY_WAIT);
      return;
    }

    const now = performance.now();
    const trail = st.trail;
    let speed = 0;
    if (trail.length >= 2 && now - trail[trail.length - 1].t < 90) {
      const first = trail[0];
      const last = trail[trail.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) speed = (last.x - first.x) / dt;
    }

    let target = Math.round(st.pos);
    if (!cancelled && Math.abs(speed) > 0.45) {
      // Flick leftwards (speed < 0) -> ceiling; flick rightwards (speed > 0) -> floor
      target = speed < 0 ? Math.ceil(st.pos) : Math.floor(st.pos);
    }

    if (st.reducedMotion) {
      startMoveRef.current(st.pos, target, true);
      return;
    }

    const remaining = Math.min(1, Math.abs(target - st.pos));
    if (remaining < 0.001) {
      st.pos = target;
      layoutAndDrawRef.current();
      const slide = HERO_SLIDES[mod4(target)];
      setLiveAnnouncement(`${slide.paintName} — ${slide.modelName}`);
      scheduleAutoplayRef.current(AUTOPLAY_WAIT);
      return;
    }

    const dir = Math.sign(target - st.pos);
    const start = now - inverseEase(1 - remaining) * MOVE_DURATION;
    startMoveRef.current(target - dir, target, true, start);
  };

  return (
    <main
      ref={heroRef}
      className="hm-hero wide pending"
      aria-roledescription="carousel"
      aria-label="HalvenMotos paint colours"
    >
      {/* 1. Dot grid (z-index 0) */}
      <div ref={dotsRef} className="hm-dots" aria-hidden="true" />

      {/* 2. Word RIDE OUT (z-index 1) */}
      <h1 ref={wordRef} className="hm-word">
        <span className="hm-visually-hidden">Ride out</span>
        <svg viewBox="0 0 1357 198.5" preserveAspectRatio="none" aria-hidden="true">
          {fittedLetters ? (
            fittedLetters.map((item, idx) => (
              <text
                key={`${item.char}-${idx}`}
                x={0}
                y={0}
                fontSize={item.fontSize}
                transform={item.transform}
              >
                {item.char}
              </text>
            ))
          ) : (
            <text x={0} y={198.5} fontSize={283}>
              RIDE OUT
            </text>
          )}
        </svg>
      </h1>

      {/* 3. WebGL Bikes Canvas (z-index 2) */}
      <canvas ref={canvasRef} className="hm-canvas" aria-hidden="true" />

      {/* 4. Drag Surface (z-index 3) */}
      <div
        ref={dragRef}
        className={`hm-drag ${isDraggingUI ? 'is-dragging' : ''}`}
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finishPointer(e, false)}
        onPointerCancel={(e) => finishPointer(e, true)}
        onLostPointerCapture={(e) => finishPointer(e, false)}
      />

      {/* 5. Nav (z-index 4) */}
      <header ref={navRef} className="hm-nav">
        <button
          type="button"
          className="hm-menu-btn"
          aria-label="Open menu"
          onClick={onOpenMenu}
        >
          <svg viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M0 1.2h12M0 5h12M0 8.8h12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <p className="hm-logo">
          HalvenMotos<sup>®</sup>
        </p>

        <button type="button" className="hm-contact-btn" onClick={onOpenContact}>
          Contact Now
        </button>
      </header>

      {/* 6. Arrow Buttons (z-index 5) */}
      <button
        ref={prevBtnRef}
        type="button"
        className="hm-arrow"
        aria-label="Previous colour"
        onClick={() => handleArrowStep(-1)}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M15 8H1.6M7 2.4 1.4 8 7 13.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </button>

      <button
        ref={nextBtnRef}
        type="button"
        className="hm-arrow"
        aria-label="Next colour"
        onClick={() => handleArrowStep(1)}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M1 8h13.4M9 2.4 14.6 8 9 13.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </button>

      {/* 7. Spec Row (z-index 4) — updates dynamically per motorcycle */}
      <section ref={panelRef} className="hm-spec-panel" aria-labelledby="hm-spec-heading">
        <div className="hm-spec-head">
          <h2 id="hm-spec-heading" className="hm-spec-title">
            {activeSlideIdx === 0
              ? 'Bike Spec Details'
              : `${activeBike.modelName} · ${activeBike.paintName}`}
          </h2>
          <button
            type="button"
            className="hm-spec-cta"
            onClick={() => onViewSpecs(activeBike)}
          >
            View Full Specs
          </button>
        </div>

        <ul className="hm-spec-list">
          {/* Spec 1: Range */}
          <li className="hm-spec-item">
            <span className="hm-spec-icon" aria-hidden="true">
              <svg viewBox="0 0 20 22">
                <path d="M10 20.5S2 13.4 2 8.6a8 8 0 0 1 16 0c0 4.8-8 11.9-8 11.9z" />
                <path d="M10 13.6s-4.2-2.2-4.2-5.2a4.2 4.2 0 0 1 8.4 0c0 3-4.2 5.2-4.2 5.2z" />
                <circle cx="10" cy="8.5" r=".9" />
              </svg>
            </span>
            <dl className="hm-spec-dl">
              <dt className="hm-spec-dt">Range (per tank)</dt>
              <dd className="hm-spec-dd">{activeBike.range}</dd>
            </dl>
          </li>

          {/* Spec 2: Top Speed */}
          <li className="hm-spec-item">
            <span className="hm-spec-icon" aria-hidden="true">
              <svg viewBox="0 0 20 22">
                <path d="M10 11.5V2.8a8.7 8.7 0 1 1-6.6 3z" />
              </svg>
            </span>
            <dl className="hm-spec-dl">
              <dt className="hm-spec-dt">Top Speed</dt>
              <dd className="hm-spec-dd">{activeBike.topSpeed}</dd>
            </dl>
          </li>

          {/* Spec 3: Acceleration */}
          <li className="hm-spec-item">
            <span className="hm-spec-icon" aria-hidden="true">
              <svg viewBox="0 0 20 22">
                <path d="M7.2 2h7.3l-2.4 6.6h5.2L6.8 20.4l2.1-7.8H3.3z" />
              </svg>
            </span>
            <dl className="hm-spec-dl">
              <dt className="hm-spec-dt">Acceleration</dt>
              <dd className="hm-spec-dd">{activeBike.acceleration}</dd>
            </dl>
          </li>

          {/* Spec 4: Cooling */}
          <li className="hm-spec-item">
            <span className="hm-spec-icon" aria-hidden="true">
              <svg viewBox="0 0 20 22">
                <circle cx="10" cy="11" r="2" />
                <path d="M10 9C6 7 6.2 2.6 9.4 2.4c3.4-.2 3.5 4 .6 6.6zM12 11c2-4 6.4-3.8 6.6-.6.2 3.4-4 3.5-6.6.6zM10 13c4 2 3.8 6.4.6 6.6-3.4.2-3.5-4-.6-6.6zM8 11c-2 4-6.4 3.8-6.6.6C1.2 8.2 5.4 8.1 8 11z" />
              </svg>
            </span>
            <dl className="hm-spec-dl">
              <dt className="hm-spec-dt">Cooling</dt>
              <dd className="hm-spec-dd">{activeBike.cooling}</dd>
            </dl>
          </li>

          {/* Spec 5: Engine Layout */}
          <li className="hm-spec-item">
            <span className="hm-spec-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22">
                <path d="m8.6 14.4-6-7.3 4.6-3.8 3.8 4.6 3.8-4.6 4.6 3.8-6 7.3M4.5 9.4l4.6-3.8M17.5 9.4l-4.6-3.8" />
                <circle cx="11" cy="15.8" r="3.6" />
                <circle cx="11" cy="15.8" r=".9" />
              </svg>
            </span>
            <dl className="hm-spec-dl">
              <dt className="hm-spec-dt">Engine Layout</dt>
              <dd className="hm-spec-dd">{activeBike.engineLayout}</dd>
            </dl>
          </li>

          {/* Spec 6: Seat Capacity */}
          <li className="hm-spec-item">
            <span className="hm-spec-icon" aria-hidden="true">
              <svg viewBox="0 0 20 22">
                <path d="M5.4 12.2V5.6A3.6 3.6 0 0 1 9 2h2a3.6 3.6 0 0 1 3.6 3.6v6.6" />
                <path d="M5.4 12.2h9.2l2 3.2a1.5 1.5 0 0 1-1.3 2.3H4.7a1.5 1.5 0 0 1-1.3-2.3zM7.4 17.7v2.6M12.6 17.7v2.6" />
              </svg>
            </span>
            <dl className="hm-spec-dl">
              <dt className="hm-spec-dt">Seat Capacity</dt>
              <dd className="hm-spec-dd">{activeBike.seatCapacity}</dd>
            </dl>
          </li>
        </ul>
      </section>

      {/* 8. Live Status (visually hidden, polite) */}
      <p className="hm-visually-hidden" aria-live="polite">
        {liveAnnouncement}
      </p>
    </main>
  );
};
