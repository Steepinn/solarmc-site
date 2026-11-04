import { ArrowUpRight, BookOpen, Compass, Download, Map, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const features = [
  { n: "01", icon: Compass, title: "Мир, который хочется исследовать", text: "Древние крепости, океанские глубины и данжи. Собирай друзей и отправляйся за своей историей.", href: "/docs/mods/dungeons-pve", image: "/gallery/screenshot-2.png", tag: "Исследование" },
  { n: "02", icon: Sparkles, title: "Твой персонаж. Твой путь.", text: "Развивай навыки, находи артефакты и выбирай свой стиль. Здесь всегда есть к чему стремиться.", href: "/docs/mods/levelz", image: "/gallery/solar-flight.jpg", tag: "Развитие" },
  { n: "03", icon: Map, title: "Место для своих", text: "Основывай города, строй вместе и наполняй мир жизнью. Большие проекты начинаются с маленькой идеи.", href: "/cities", image: "/gallery/solar-campfire-ai.png", tag: "Сообщество" },
];
export function HeroSection() {
  return <section className="solar-hero">
    <Image src="/gallery/screenshot-1.png" alt="Мир сервера Solar" fill priority sizes="100vw" className="solar-hero-image" />
    <div className="solar-hero-shade" />
    <div className="solar-hero-content">
      <div className="solar-eyebrow"><span /> MINECRAFT 1.21.1 <i /> СЕЗОН 03</div>
      <h1>Твоя история.<br />Под солнцем <em>Solar.</em></h1>
      <p>Уютное выживание с большим миром возможностей.<br className="hidden sm:block" /> Исследуй, создавай и находи своих.</p>
      <div className="solar-hero-actions"><Link href="/applications" className="btn-primary">Начать приключение <ArrowUpRight size={18} /></Link><Link href="/launcher" className="solar-button-secondary"><Download size={18} /> Скачать лаунчер</Link></div>
      <div className="solar-hero-note"><ShieldCheck size={15} /> Вход по заявке <span>·</span> Своя атмосфера <span>·</span> Общий мир</div>
    </div>
    <div className="solar-hero-caption"><span>НОВАЯ ГЛАВА ТВОЕГО ВЫЖИВАНИЯ</span><span>Листай и открывай мир ↓</span></div>
  </section>;
}
export function LinksSection() {
  return <section className="solar-explore">
    <div className="solar-section-heading"><div><p className="solar-kicker">БОЛЬШЕ, ЧЕМ ВЫЖИВАНИЕ</p><h2>Найди своё приключение</h2></div><Link href="/docs/mods/obzor">Всё о сервере <ArrowUpRight size={17} /></Link></div>
    <div className="solar-feature-grid">{features.map(({icon: Icon, ...f}) => <Link key={f.n} href={f.href} className="solar-feature-card"><div className="solar-feature-image"><Image src={f.image} alt={f.tag} fill sizes="(max-width: 767px) 100vw, 33vw" /><span>{f.tag}</span></div><div className="solar-feature-copy"><div><Icon size={20} /><span>{f.n}</span></div><h3>{f.title}</h3><p>{f.text}</p><span className="solar-feature-arrow"><ArrowUpRight size={20} /></span></div></Link>)}</div>
    <div className="solar-community"><div><p className="solar-kicker">НА СВЯЗИ</p><h2>Хорошие истории начинаются вместе.</h2><p>Знакомься с игроками, делись постройками и следи за новостями.</p></div><Link href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="solar-button-secondary">Наш Discord <ArrowUpRight size={18} /></Link></div>
    <div className="solar-quick-links"><Link href="/docs/informaciya/home"><BookOpen size={19} /><span>База знаний<small>Гайды и ответы на вопросы</small></span><ArrowUpRight size={18} /></Link><Link href="/map"><Map size={19} /><span>Карта мира<small>Найди своё место на Solar</small></span><ArrowUpRight size={18} /></Link><Link href="/support"><ShieldCheck size={19} /><span>Мы рядом<small>Помощь и техподдержка</small></span><ArrowUpRight size={18} /></Link></div>
  </section>;
}
export function HomePage() { return <><HeroSection /><LinksSection /></>; }
