import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DishCard, type Dish } from "@/components/DishCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/menyu")({
  head: () => ({
    meta: [
      { title: "Menyu — Restaurant Shop" },
      {
        name: "description",
        content: "Milliy taomlar, oshlar, kaboblar, sho'rvalar, salatlar, non va ichimliklar menyusi.",
      },
      { property: "og:title", content: "Menyu — Restaurant Shop" },
      { property: "og:description", content: "Barcha taomlar kategoriyalar bo'yicha." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { t, tc } = useI18n();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: dishes, isLoading } = useQuery({
    queryKey: ["dishes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dishes").select("*").order("created_at");
      if (error) throw error;
      return data as Dish[];
    },
  });

  const filtered = (dishes ?? []).filter(
    (d) =>
      (category === "all" || d.category === category) &&
      d.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Layout>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">{t("nav_menu")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sevimli taomingizni tanlang</p>

        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_ph")}
            className="pl-9"
            maxLength={60}
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          <aside>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t("categories")}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    category === c
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {tc(c)}
                </button>
              ))}
            </div>
          </aside>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            ) : filtered.length === 0 ? (
              <p className="col-span-full py-16 text-center text-muted-foreground">Taom topilmadi</p>
            ) : (
              filtered.map((dish) => <DishCard key={dish.id} dish={dish} />)
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
