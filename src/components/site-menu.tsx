"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, Compass, Menu, MessageCircle, X } from "lucide-react";
import { siteConfig } from "@/config/site";

const groups = [
  { title: "Исследуй мир", icon: Compass, links: [{ href: "/launcher", label: "Лаунчер", hint: "Всё для первого входа" }, { href: "/map", label: "Карта мира", hint: "Найди свой уголок" }, { href: "/cities", label: "Города", hint: "Места, созданные игроками" }, { href: "/events", label: "События", hint: "Встречаемся в игре" }] },
  { title: "Осваивайся", icon: BookOpen, links: [{ href: "/docs/informaciya/home", label: "Вики проекта", hint: "Правила, механики и гайды" }, { href: "/applications", label: "Заявка на проходку", hint: "Начни свою историю" }, { href: "/shop", label: "Магазин", hint: "Поддержи любимый мир" }, { href: "/status", label: "Статус сервера", hint: "Что происходит прямо сейчас" }] },
  { title: "Будь на связи", icon: MessageCircle, links: [{ href: "/support", label: "Поддержка", hint: "Поможем разобраться" }, { href: "/team", label: "Команда", hint: "Люди за проектом" }, { href: "/courts", label: "Суды", hint: "Разбираемся по правилам" }, { href: siteConfig.links.discord, label: "Наш Discord", hint: "Общение продолжается здесь" }] },
];
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    const activeDialog = dialog.current;
    const opener = trigger.current;
    activeDialog?.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      activeDialog?.close();
      document.documentElement.style.overflow = previous;
      opener?.focus({ preventScroll: true });
    };
  }, [open]);
  return <>
    <button ref={trigger} type="button" className="solar-menu-trigger" aria-label="Открыть меню" aria-expanded={open} aria-controls="solar-navigation-dialog" onClick={() => setOpen(true)}><Menu size={20} /></button>
    {open && createPortal(<dialog ref={dialog} id="solar-navigation-dialog" className="solar-navigation-dialog" aria-labelledby="solar-navigation-title" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false); } }}>
      <div className="solar-menu-top"><Link href="/" onClick={() => setOpen(false)}><Image src="/logo.png" alt="Solar" width={661} height={168} className="solar-shared-logo" /></Link><span>ТВОЙ МИР НАЧИНАЕТСЯ ЗДЕСЬ</span><button type="button" className="solar-menu-trigger" aria-label="Закрыть меню" onClick={() => setOpen(false)}><X size={22} /></button></div>
      <div className="solar-menu-intro"><p>НАВИГАЦИЯ / SOLARMC</p><h2 id="solar-navigation-title">Куда отправимся?</h2></div>
      <nav aria-label="Навигация" className="solar-menu-groups">{groups.map(({ title, icon: Icon, links }) => <section key={title}><h3><Icon size={16} />{title}</h3>{links.map(item => {
        const external = item.href.startsWith("https:");
        const active = !external && (pathname === item.href || (item.href.startsWith("/docs") && pathname.startsWith("/docs")));
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} onClick={() => setOpen(false)}><span>{item.label}<small>{item.hint}</small></span><ArrowUpRight size={16} /></Link>;
      })}</section>)}</nav>
      <div className="solar-menu-bottom"><span>Сезон 03 <i /> Minecraft 1.21.1</span><Link href="/applications" onClick={() => setOpen(false)}>Стать частью Solar <ArrowUpRight size={16} /></Link></div>
    </dialog>, document.body)}
  </>;
}
