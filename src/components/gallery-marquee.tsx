import Image from "next/image";
import { galleryImages } from "@/config/site";

function GalleryItem({ src, alt, index }: { src: string; alt: string; index: number }) {
  return (
    <figure className="gallery-item-glow pressable relative h-64 w-[20rem] shrink-0 overflow-hidden rounded-3xl border border-border/80 sm:h-72 sm:w-[26rem]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition duration-500 hover:scale-[1.03]"
        sizes="(max-width: 640px) 320px, 416px"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
        <span className="font-display rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-bold tracking-widest text-solar-yellow">
          SOLARMC
        </span>
        <span className="text-sm text-white/80">Скрин #{index}</span>
      </div>
    </figure>
  );
}

export function GalleryMarquee() {
  return (
    <section className="relative z-[1] overflow-hidden py-16">
      <div className="mx-auto max-w-[1400px] px-4">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-solar-gold">
          Галерея сервера
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Живые кадры SolarMC
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Реальные скриншоты с сервера — атмосфера мира и построек.
        </p>
      </div>

      <div className="server-gallery-marquee mt-10">
        <div className="server-gallery-track">
          <div className="server-gallery-group">
            {galleryImages.map((img) => (
              <GalleryItem key={img.id} src={img.src} alt={img.alt} index={img.id} />
            ))}
          </div>
          <div className="server-gallery-group" aria-hidden>
            {galleryImages.map((img) => (
              <GalleryItem key={`dup-${img.id}`} src={img.src} alt="" index={img.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
