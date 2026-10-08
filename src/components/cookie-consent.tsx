"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "solar-cookie-consent";
const OPEN_CLASS = "cookie-banner-open";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) root.classList.add(OPEN_CLASS);
    else root.classList.remove(OPEN_CLASS);
    return () => root.classList.remove(OPEN_CLASS);
  }, [visible]);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-label="Согласие на cookies"
    >
      <div className="cookie-consent__inner">
        <p className="cookie-consent__text">
          Мы используем cookies для входа через Discord, темы сайта и настроек.
          Подробнее — в{" "}
          <Link href="/cookies" className="cookie-consent__link">
            политике cookies
          </Link>
          .
        </p>
        <button
          type="button"
          className="btn-primary cookie-consent__btn"
          onClick={accept}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
