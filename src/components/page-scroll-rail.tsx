"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
function getScrollEl() {
  return document.documentElement;
}

export function PageScrollRail() {
  const [visible, setVisible] = useState(false);
  const [thumb, setThumb] = useState({ top: 0, height: 48 });
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScroll: number } | null>(null);

  const measure = useCallback(() => {
    const el = getScrollEl();
    const hidden =
      document.body.style.overflow === "hidden" ||
      document.documentElement.classList.contains("menu-open");
    const scrollHeight = el.scrollHeight;
    const viewH = window.innerHeight;
    const maxScroll = scrollHeight - viewH;
    if (hidden || maxScroll < 8) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const track = trackRef.current;
    const trackH = track?.clientHeight ?? viewH * 0.5;
    const minThumb = 40;
    const thumbH = Math.max(minThumb, (viewH / scrollHeight) * trackH);
    const scrollTop = window.scrollY;
    const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const top = ratio * Math.max(0, trackH - thumbH);
    setThumb({ top, height: thumbH });
  }, []);

  useEffect(() => {
    measure();
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const obs = new MutationObserver(measure);
    obs.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      obs.disconnect();
    };
  }, [measure]);

  function scrollByPage(delta: number) {
    window.scrollBy({
      top: delta * window.innerHeight * 0.85,
      behavior: "smooth",
    });
  }

  function scrollToRatio(ratio: number) {
    const el = getScrollEl();
    const maxScroll = el.scrollHeight - window.innerHeight;
    window.scrollTo({ top: ratio * maxScroll, behavior: "auto" });
  }

  function onTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.thumb === "1") return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = y / rect.height;
    scrollToRatio(Math.min(1, Math.max(0, ratio)));
  }

  function onThumbPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { startY: e.clientY, startScroll: window.scrollY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onThumbPointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !trackRef.current) return;
    const trackH = trackRef.current.clientHeight;
    const el = getScrollEl();
    const maxScroll = el.scrollHeight - window.innerHeight;
    const dy = e.clientY - dragRef.current.startY;
    const scrollPerPx = maxScroll / Math.max(1, trackH - thumb.height);
    window.scrollTo({
      top: dragRef.current.startScroll + dy * scrollPerPx,
      behavior: "auto",
    });
  }

  function onThumbPointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div
      className="page-scroll-rail"
      aria-hidden={false}
      role="group"
      aria-label="Прокрутка страницы"
    >
      <button
        type="button"
        className="page-scroll-rail__btn"
        aria-label="Прокрутить вверх"
        onClick={() => scrollByPage(-1)}
      >
        <ChevronUp className="size-4" strokeWidth={2.5} />
      </button>
      <div
        ref={trackRef}
        className="page-scroll-rail__track"
        onPointerDown={onTrackPointerDown}
      >
        <div
          data-thumb="1"
          className="page-scroll-rail__thumb"
          style={{ height: thumb.height, transform: `translateY(${thumb.top}px)` }}
          onPointerDown={onThumbPointerDown}
          onPointerMove={onThumbPointerMove}
          onPointerUp={onThumbPointerUp}
          onPointerCancel={onThumbPointerUp}
          role="button"
          aria-label="Перетащите для прокрутки страницы"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              scrollByPage(-0.15);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              scrollByPage(0.15);
            }
          }}
        />
      </div>
      <button
        type="button"
        className="page-scroll-rail__btn"
        aria-label="Прокрутить вниз"
        onClick={() => scrollByPage(1)}
      >
        <ChevronDown className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
