import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Heart, ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatSum } from "@/lib/payment";
import type { Dish } from "@/components/DishCard";
import { toast } from "sonner";

export const Route = createFileRoute("/taom/$id")({
  head: () => ({
    meta: [
      { title: "Taom tafsilotlari — Restaurant Shop" },
      { name: "description", content: "Taom tarkibi, narxi va buyurtma berish imkoniyati." },
      { property: "og:title", content: "Taom tafsilotlari — Restaurant Shop" },
      { property: "og:description", content: "Taom tarkibi, narxi va buyurtma berish imkoniyati." },
    ],
  }),
  component: DishPage,
});

function DishPage() {
  const { id } = Route.useParams();
  const { t, tc } = useI18n();
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const { data: dish, isLoading } = useQuery({
    queryKey: ["dish", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("dishes").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Dish | null;
    },
  });

  const addToWishlist = async () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      return;
    }
    const { error } = await supabase.from("wishlist").insert({ user_id: user.id, dish_id: id });
    if (error) toast.error("Allaqachon saqlangan");
    else toast.success("Saqlanganlarga qo'shildi");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
          <Skeleton className="aspect-4/3 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!dish) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-lg font-semibold">Taom topilmadi</p>
          <Button asChild className="mt-4">
            <Link to="/menyu">{t("view_menu")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Link
          to="/menyu"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t("nav_menu")}
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="surface-card overflow-hidden">
            <div className="aspect-4/3 bg-muted">
              {dish.image_url ? (
                <img src={dish.image_url} alt={dish.title} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center gradient-hero text-primary-foreground/80">
                  <UtensilsCrossed className="size-16" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <Badge variant="secondary">{tc(dish.category)}</Badge>
            <h1 className="text-3xl font-extrabold md:text-4xl">{dish.title}</h1>
            <p className="text-muted-foreground">{dish.description}</p>

            {dish.ingredients?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t("ingredients")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {dish.ingredients.map((ing) => (
                    <span key={ing} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-3xl font-extrabold">
              {formatSum(dish.price)} <span className="text-base font-medium text-muted-foreground">{t("sum")}</span>
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">{t("qty")}</span>
              <div className="flex items-center gap-2 rounded-full border border-border p-1">
                <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setQty((q) => Math.min(50, q + 1))}>
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => void addToWishlist()} aria-label={t("wishlist")}>
                <Heart className="size-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  add({ id: dish.id, title: dish.title, price: dish.price, image_url: dish.image_url }, qty);
                  toast.success("Savatga qo'shildi");
                }}
              >
                <ShoppingBag className="size-5" /> {t("add_to_cart")}
              </Button>
              <Button
                size="lg"
                className="flex-1 shadow-glow"
                onClick={() => {
                  add({ id: dish.id, title: dish.title, price: dish.price, image_url: dish.image_url }, qty);
                  void navigate({ to: "/savat" });
                }}
              >
                {t("order_now")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
