"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { SLIDES } from "./slides";

const W = 1920;
const H = 1080;

/**
 * Full-screen 16:9 slide viewer. Keys: → / Space / PageDown next, ← / PageUp
 * back, Home / End, F fullscreen. Tap the left/right third or swipe on phones.
 * The slide number is kept in the URL hash (#3) so a link opens that slide.
 */
export function SlideDeck() {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChrome, setShowChrome] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const total = SLIDES.length;

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(total - 1, next)));
  }, [total]);

  // The hash (#3) mirrors the current slide; a changed hash moves the deck.
  // `hashRead` stops the mirror from overwriting the hash before it is read.
  const [hashRead, setHashRead] = useState(false);
  useEffect(() => {
    const fromHash = () => {
      const n = Number(window.location.hash.replace("#", ""));
      if (Number.isInteger(n) && n >= 1 && n <= total) setIndex(n - 1);
    };
    fromHash();
    setHashRead(true);
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [total]);
  useEffect(() => {
    if (hashRead && window.location.hash !== `#${index + 1}`) window.history.replaceState(null, "", `#${index + 1}`);
  }, [index, hashRead]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) { event.preventDefault(); go(index + 1); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) { event.preventDefault(); go(index - 1); }
      else if (event.key === "Home") go(0);
      else if (event.key === "End") go(total - 1);
      else if (event.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total, toggleFullscreen]);

  // Controls fade out while presenting and come back on mouse move.
  const wake = () => {
    setShowChrome(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowChrome(false), 2500);
  };

  const Slide = SLIDES[index].Component;

  return (
    <div
      ref={rootRef}
      onMouseMove={wake}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      className="fixed inset-0 z-[200] flex select-none items-center justify-center overflow-hidden bg-[#0B1528]"
      style={{ fontFamily: "var(--font-slide-body), Tahoma, sans-serif" }}
    >
      <style>{DECK_CSS}</style>

      {/* The 1920×1080 stage, scaled to fit. Keyed by slide so animations replay. */}
      <div
        className="relative shrink-0 overflow-hidden shadow-2xl"
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "center center" }}
        role="region"
        aria-roledescription="slide"
        aria-label={`สไลด์ ${index + 1} จาก ${total}: ${SLIDES[index].title}`}
      >
        <div key={index} className="absolute inset-0 sl-slide">
          <Slide />
        </div>
        {/* Tap zones: left third = back, right two thirds = next. */}
        <button type="button" aria-label="สไลด์ก่อนหน้า" onClick={() => go(index - 1)} className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize opacity-0" />
        <button type="button" aria-label="สไลด์ถัดไป" onClick={() => go(index + 1)} className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize opacity-0" />
      </div>

      {/* Progress */}
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
        <div className="h-full bg-[#2563EB] transition-all duration-500" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {/* Controls */}
      <div className={`absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/50 p-1 text-white backdrop-blur transition-opacity duration-300 ${showChrome ? "opacity-100" : "opacity-0"}`}>
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="rounded-full p-2 hover:bg-white/15 disabled:opacity-30" aria-label="ก่อนหน้า"><ChevronLeft size={20} /></button>
        <span className="min-w-[64px] text-center text-sm tabular-nums">{index + 1} / {total}</span>
        <button type="button" onClick={() => go(index + 1)} disabled={index === total - 1} className="rounded-full p-2 hover:bg-white/15 disabled:opacity-30" aria-label="ถัดไป"><ChevronRight size={20} /></button>
        <button type="button" onClick={toggleFullscreen} className="rounded-full p-2 hover:bg-white/15" aria-label={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}>
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </div>
  );
}

/* Animation vocabulary used by the slides. */
const DECK_CSS = `
.sl-slide { animation: slFade .45s ease both; }
@keyframes slFade { from { opacity: 0 } to { opacity: 1 } }
.sl-in { opacity: 0; animation: slIn .7s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes slIn { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: none } }
.sl-left { opacity: 0; animation: slLeft .7s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes slLeft { from { opacity: 0; transform: translateX(-48px) } to { opacity: 1; transform: none } }
.sl-pop { opacity: 0; animation: slPop .6s cubic-bezier(.3,1.5,.5,1) forwards; }
@keyframes slPop { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: none } }
.sl-grow { width: 0; animation: slGrow 1.2s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes slGrow { to { width: var(--sl-w, 100%) } }
.sl-draw { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: slDraw 2.2s ease forwards; }
@keyframes slDraw { to { stroke-dashoffset: 0 } }
.sl-pulse { animation: slPulse 1.6s ease-in-out infinite; }
@keyframes slPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,.45) } 50% { box-shadow: 0 0 0 18px rgba(37,99,235,0) } }
.sl-float { animation: slFloat 4s ease-in-out infinite; }
@keyframes slFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
.sl-type { overflow: hidden; white-space: nowrap; border-right: 3px solid #2563EB; width: 0; animation: slType 2.2s steps(30) forwards, slCaret .8s step-end infinite; }
@keyframes slType { to { width: 100% } }
@keyframes slCaret { 50% { border-color: transparent } }
/* Workflow: a clip travelling through the five stages. */
.sl-node { animation: slNode 10s infinite; }
@keyframes slNode { 0%,18% { border-color: #2563EB; box-shadow: 0 16px 40px rgba(37,99,235,.28); transform: translateY(-8px) } 22%,100% { border-color: #DCE3EE; box-shadow: none; transform: none } }
.sl-dot { animation: slDot 10s linear infinite; }
@keyframes slDot { 0% { left: 130px } 20% { left: 482px } 40% { left: 834px } 60% { left: 1186px } 80% { left: 1538px } 95% { left: 1538px; opacity: 1 } 100% { left: 1538px; opacity: 0 } }
.sl-back { opacity: 0; animation: slBack 10s linear infinite; }
@keyframes slBack { 0%,44% { opacity: 0; left: 1060px; top: 600px } 48% { opacity: 1; left: 1060px; top: 600px } 60% { left: 800px; top: 612px; opacity: 1 } 70% { left: 520px; top: 560px; opacity: 1 } 74%,100% { opacity: 0; left: 500px; top: 540px } }
@media (prefers-reduced-motion: reduce) {
  .sl-slide, .sl-in, .sl-left, .sl-pop, .sl-grow, .sl-draw, .sl-type { animation: none !important; opacity: 1 !important; transform: none !important; width: var(--sl-w, 100%); stroke-dashoffset: 0 !important; }
  .sl-pulse, .sl-float, .sl-node, .sl-dot, .sl-back { animation: none !important; }
}
`;
