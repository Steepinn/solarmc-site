import { ShopPageClient } from "@/components/shop-page-client";
import { PageShell } from "@/components/page-shell";

export const metadata = { title: "Магазин" };
export const dynamic = "force-static";

export default function ShopPage() {
  return (
    <PageShell
      title="Магазин Solar"
      description="Донат — косметика и удобство, не преимущество в PvE. Оформление покупки подключим позже."
      eyebrow="Магазин"
    >
      <div className="mt-6">
        <ShopPageClient />
      </div>
    </PageShell>
  );
}
