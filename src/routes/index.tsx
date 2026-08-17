import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, Clock, Leaf, ArrowRight, Tag, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DishCard, type Dish } from "@/components/DishCard";
import { DailyPromoPopup } from "@/components/DailyPromoPopup";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Restaurant Shop — Milliy taomlar onlayn buyurtma" },
      {
        name: "description",
        content:
          "Osh, kabob, lag'mon va boshqa milliy taomlarni onlayn buyurtma qiling. 30 daqiqada bepul yetkazib berish.",
      },
      { property: "og:title", content: "Restaurant Shop — Milliy taomlar onlayn buyurtma" },
      { property: "og:description", content: "30 daqiqada issiq milliy taomlar eshigingizgacha." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();

  const { data: dishes, isLoading } = useQuery({
    queryKey: ["popular-dishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .eq("is_popular", true)
        .order("created_at", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data as Dish[];
    },
  });

  return (
    <Layout>
      <DailyPromoPopup />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Milliy taomlar dasturxoni" className="size-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/40 dark:from-background dark:via-background/92" />
        </div>
        <div className="relative mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 md:py-28">
          <span className="w-fit rounded-full border border-primary/40 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            #1 Milliy taomlar yetkazib berish
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
            {t("hero_title")} <span className="gradient-text">bir bosishda</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">{t("hero_sub")}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/menyu">
                <ShoppingBag className="size-5" /> {t("order_now")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/chegirmalar">
                <Tag className="size-5" /> {t("nav_discounts")}
              </Link>
            </Button>
          </div>

          <div className="mt-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: t("free_delivery") },
              { icon: Clock, label: t("fast_30") },
              { icon: Leaf, label: t("fresh") },
            ].map((b) => (
              <div key={b.label} className="surface-card flex items-center gap-3 px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <b.icon className="size-4" />
                </span>
                <span className="text-sm font-semibold">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">{t("popular")}</h2>
            <p className="text-sm text-muted-foreground">Mijozlarimiz eng ko'p buyurtma qiladigan taomlar</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/menyu">
              {t("view_menu")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            : dishes?.map((dish) => <DishCard key={dish.id} dish={dish} />)}
        </div>
      </section>
    </Layout>
  );
}
