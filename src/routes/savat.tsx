import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatSum } from "@/lib/payment";

export const Route = createFileRoute("/savat")({
  head: () => ({
    meta: [
      { title: "Savat — Restaurant Shop" },
      { name: "description", content: "Tanlangan taomlaringizni ko'rib chiqing va buyurtmani rasmiylashtiring." },
      { property: "og:title", content: "Savat — Restaurant Shop" },
      { property: "og:description", content: "Buyurtmangizni rasmiylashtiring." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const { t } = useI18n();

  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">{t("nav_cart")}</h1>

        {items.length === 0 ? (
          <div className="surface-card mt-8 flex flex-col items-center gap-4 px-6 py-20 text-center">
            <ShoppingBag className="size-12 text-muted-foreground" />
            <p className="text-lg font-semibold">{t("empty_cart")}</p>
            <Button asChild>
              <Link to="/menyu">{t("view_menu")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="surface-card flex items-center gap-4 p-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {i.image_url ? (
                      <img src={i.image_url} alt={i.title} className="size-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex size-full items-center justify-center gradient-hero text-primary-foreground/80">
                        <UtensilsCrossed className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{i.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSum(i.price)} {t("sum")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-7" onClick={() => setQty(i.id, i.qty - 1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-7 text-center text-sm font-bold">{i.qty}</span>
                      <Button variant="outline" size="icon" className="size-7" onClick={() => setQty(i.id, i.qty + 1)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold">{formatSum(i.price * i.qty)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2 text-destructive"
                      onClick={() => remove(i.id)}
                      aria-label="O'chirish"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="surface-card h-fit space-y-4 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-bold">
                  {formatSum(subtotal)} {t("sum")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("free_delivery")}</span>
                <span className="font-bold text-primary">0</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{t("total")}</span>
                  <span className="text-2xl font-extrabold">
                    {formatSum(subtotal)} {t("sum")}
                  </span>
                </div>
              </div>
              <Button asChild size="lg" className="w-full shadow-glow">
                <Link to="/checkout">{t("checkout")}</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
