import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { formatSum } from "@/lib/payment";

type Promo = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
};

export const Route = createFileRoute("/chegirmalar")({
  head: () => ({
    meta: [
      { title: "Chegirmalar va promo-kodlar — Restaurant Shop" },
      { name: "description", content: "Kunlik chegirmalar va promo-kodlar bilan tejab buyurtma bering." },
      { property: "og:title", content: "Chegirmalar va promo-kodlar — Restaurant Shop" },
      { property: "og:description", content: "Kunlik maxsus chegirmalardan foydalaning." },
    ],
  }),
  component: DiscountsPage,
});

function DiscountsPage() {
  const { t } = useI18n();

  const { data: promos, isLoading } = useQuery({
    queryKey: ["daily-promos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("id, code, title, description, discount_type, discount_value")
        .eq("is_daily", true)
        .eq("is_active", true);
      if (error) throw error;
      return data as Promo[];
    },
  });

  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">{t("nav_discounts")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Promo-kodni savatda qo'llang va darhol tejang</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
          ) : promos && promos.length > 0 ? (
            promos.map((p) => (
              <div key={p.id} className="surface-card overflow-hidden">
                <div className="gradient-hero px-5 py-6 text-primary-foreground">
                  <Tag className="size-6" />
                  <p className="mt-3 text-2xl font-extrabold">
                    {p.discount_type === "percent"
                      ? `-${p.discount_value}%`
                      : `-${formatSum(p.discount_value)} ${t("sum")}`}
                  </p>
                  <p className="text-sm opacity-90">{p.title}</p>
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/50 bg-accent px-4 py-2.5">
                    <span className="font-mono text-lg font-extrabold text-accent-foreground">{p.code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void navigator.clipboard.writeText(p.code);
                        toast.success(t("copied"));
                      }}
                    >
                      <Copy className="size-4" /> {t("copy")}
                    </Button>
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/menyu">{t("order_now")}</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full py-16 text-center text-muted-foreground">
              Hozircha faol chegirmalar yo'q
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
