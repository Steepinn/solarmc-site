"use client";

import { useEffect } from "react";

/**
 * Лёгкие CSS-курсоры без canvas/RAF — не едят FPS всей страницы.
 */
export function CursorTrail() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    document.documentElement.classList.add("solar-cursor");

    const onMapEnter = () =>
      document.documentElement.classList.add("solar-cursor-map");
    const onMapLeave = () =>
      document.documentElement.classList.remove("solar-cursor-map");

    window.addEventListener("solar-map-cursor-enter", onMapEnter);
    window.addEventListener("solar-map-cursor-leave", onMapLeave);
    return () => {
      document.documentElement.classList.remove(
        "solar-cursor",
        "solar-cursor-map",
      );
      window.removeEventListener("solar-map-cursor-enter", onMapEnter);
      window.removeEventListener("solar-map-cursor-leave", onMapLeave);
    };
  }, []);

  return null;
}
