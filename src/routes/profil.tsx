import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Loader2, Package, Heart } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatSum } from "@/lib/payment";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil va buyurtmalarim — Restaurant Shop" },
      { name: "description", content: "Shaxsiy ma'lumotlaringizni tahrirlang va buyurtmalar tarixini ko'ring." },
      { property: "og:title", content: "Profil — Restaurant Shop" },
      { property: "og:description", content: "Buyurtmalar tarixi va shaxsiy ma'lumotlar." },
    ],
  }),
  component: ProfilePage,
});

type Order = {
  id: string;
  items: { title: string; qty: number; price: number }[];
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  qabul_qilindi: "Qabul qilindi",
  tayyorlanmoqda: "Tayyorlanmoqda",
  yetkazilmoqda: "Yetkazilmoqda",
  yakunlandi: "Yakunlandi",
  bekor_qilindi: "Bekor qilindi",
};

const profileSchema = z.object({
  full_name: z.string().trim().max(100),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(300),
});

function ProfilePage() {
  const { user, profile, loading, refresh, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile)
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
  }, [profile]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, items, total, status, payment_method, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const save = async () => {
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success || !user) {
      toast.error("Ma'lumotlarni tekshiring");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Saqlab bo'lmadi");
    else {
      toast.success("Saqlandi");
      await refresh();
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">{t("nav_profile")}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void signOut().then(() => navigate({ to: "/" }));
            }}
          >
            <LogOut className="size-4" /> {t("logout")}
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="surface-card h-fit space-y-4 p-5">
            <h2 className="font-bold">{t("edit_profile")}</h2>
            <div className="space-y-1.5">
              <Label htmlFor="fn">{t("name")}</Label>
              <Input id="fn" value={form.full_name} maxLength={100} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph">{t("phone")}</Label>
              <Input id="ph" value={form.phone} maxLength={30} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad">{t("address")}</Label>
              <Input id="ad" value={form.address} maxLength={300} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <Button className="w-full" disabled={saving} onClick={() => void save()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : t("save")}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/menyu">
                <Heart className="size-4" /> {t("view_menu")}
              </Link>
            </Button>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold">{t("my_orders")}</h2>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : orders && orders.length > 0 ? (
              orders.map((o) => (
                <div key={o.id} className="surface-card space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                    <Badge variant="secondary">{STATUS_LABEL[o.status] ?? o.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {o.items.map((i) => `${i.title} × ${i.qty}`).join(", ")}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("uz-UZ")} · {o.payment_method}
                    </span>
                    <span className="font-extrabold">
                      {formatSum(o.total)} {t("sum")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
                <Package className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground">Hozircha buyurtmalar yo'q</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
