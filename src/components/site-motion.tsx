"use client";

import { useEffect } from "react";

/** Progressive enhancement: content stays visible when animation is unavailable. */
export function SiteMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    const start = () => {
      stop();
      if (preference.matches || !("IntersectionObserver" in window)) return;
      const selector = ".orbit-heading, .orbit-story, .orbit-invite-art, .orbit-invite-copy, .orbit-steps article, .orbit-faq > div, .orbit-community > h2, .solar-page-heading, .panel-surface, .wiki-sidebar__card, .wiki-shell section[aria-label='Статья вики'] article, .solar-admin-section-heading, .site-footer";
      const watched = new WeakSet<Element>();
      const animations = new Set<Animation>();
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          if (element.closest("dialog") || element.closest("[hidden]")) continue;
          const siblings = element.parentElement ? [...element.parentElement.children] : [];
          const stagger = Math.min(Math.max(0, siblings.indexOf(element)), 3) * 65;
          const animation = element.animate([
            { opacity: 0.2, translate: "0 20px" },
            { opacity: 1, translate: "0 0" },
          ], { duration: 1000, delay: stagger, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
          animations.add(animation);
          animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
        }
      }, { threshold: 0.06 });
      const observe = (root: Element) => {
        const candidates = [...(root.matches(selector) ? [root] : []), ...root.querySelectorAll(selector)];
        for (const element of candidates) {
          if (watched.has(element) || element.parentElement?.closest(selector)) continue;
          watched.add(element);
          observer.observe(element);
        }
      };
      observe(document.body);
      const mutations = new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) observe(node);
        }
      });
      mutations.observe(document.body, { childList: true, subtree: true });
      stop = () => { observer.disconnect(); mutations.disconnect(); animations.forEach(animation => animation.cancel()); animations.clear(); };
    };
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, []);
  return null;
}
