"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme === "dark";
  return <button type="button" className="pressable inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}>{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>;
}
