import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, useI18n } from "@/lib/i18n";
import { formatSum } from "@/lib/payment";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Restaurant Shop" },
      { name: "description", content: "Taomlar, promo-kodlar va buyurtmalarni boshqarish paneli." },
      { property: "og:title", content: "Admin panel — Restaurant Shop" },
      { property: "og:description", content: "Restoran boshqaruv paneli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Dish = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_popular: boolean;
};

type Promo = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  is_daily: boolean;
  is_active: boolean;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: { title: string; qty: number; price: number }[];
};

const STATUSES = ["qabul_qilindi", "tayyorlanmoqda", "yetkazilmoqda", "yakunlandi", "bekor_qilindi"];

const dishSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500),
  price: z.number().nonnegative().max(100000000),
  category: z.string().trim().min(1).max(40),
  image_url: z.string().trim().max(500),
  is_popular: z.boolean(),
});

const promoSchema = z.object({
  code: z.string().trim().min(2).max(40),
  title: z.string().trim().max(120),
  description: z.string().trim().max(300),
  discount_type: z.enum(["percent", "fixed"]),
  discount_value: z.number().nonnegative().max(100000000),
  is_daily: z.boolean(),
  is_active: z.boolean(),
});

const emptyDish = {
  title: "",
  description: "",
  price: 0,
  category: "milliy",
  image_url: "",
  is_popular: false,
};
const emptyPromo = {
  code: "",
  title: "",
  description: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: 10,
  is_daily: false,
  is_active: true,
};

function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const { tc } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"dishes" | "promos" | "orders">("dishes");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) void navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const dishes = useQuery({
    queryKey: ["admin-dishes"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("dishes").select("*").order("created_at");
      if (error) throw error;
      return data as Dish[];
    },
  });

  const promos = useQuery({
    queryKey: ["admin-promos"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("promo_codes").select("*").order("created_at");
      if (error) throw error;
      return data as Promo[];
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const [dishForm, setDishForm] = useState({ ...emptyDish });
  const [dishEditId, setDishEditId] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState({ ...emptyPromo });
  const [promoEditId, setPromoEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading || !isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const saveDish = async () => {
    const parsed = dishSchema.safeParse(dishForm);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring");
      return;
    }
    setBusy(true);
    const payload = { ...parsed.data, image_url: parsed.data.image_url || null };
    const { error } = dishEditId
      ? await supabase.from("dishes").update(payload).eq("id", dishEditId)
      : await supabase.from("dishes").insert(payload);
    setBusy(false);
    if (error) { toast.error("Saqlab bo'lmadi"); return; }
    toast.success("Saqlandi");
    setDishForm({ ...emptyDish });
    setDishEditId(null);
    void qc.invalidateQueries({ queryKey: ["admin-dishes"] });
    void qc.invalidateQueries({ queryKey: ["dishes"] });
    void qc.invalidateQueries({ queryKey: ["popular-dishes"] });
  };

  const deleteDish = async (id: string) => {
    const { error } = await supabase.from("dishes").delete().eq("id", id);
    if (error) { toast.error("O'chirib bo'lmadi"); return; }
    toast.success("O'chirildi");
    void qc.invalidateQueries({ queryKey: ["admin-dishes"] });
  };

  const savePromo = async () => {
    const parsed = promoSchema.safeParse(promoForm);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring");
      return;
    }
    setBusy(true);
    const payload = { ...parsed.data, code: parsed.data.code.toUpperCase() };
    const { error } = promoEditId
      ? await supabase.from("promo_codes").update(payload).eq("id", promoEditId)
      : await supabase.from("promo_codes").insert(payload);
    setBusy(false);
    if (error) { toast.error("Saqlab bo'lmadi (kod takrorlanmasin)"); return; }
    toast.success("Saqlandi");
    setPromoForm({ ...emptyPromo });
    setPromoEditId(null);
    void qc.invalidateQueries({ queryKey: ["admin-promos"] });
    void qc.invalidateQueries({ queryKey: ["daily-promos"] });
  };

  const deletePromo = async (id: string) => {
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) { toast.error("O'chirib bo'lmadi"); return; }
    toast.success("O'chirildi");
    void qc.invalidateQueries({ queryKey: ["admin-promos"] });
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error("Yangilab bo'lmadi"); return; }
    void qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const revenue = (orders.data ?? [])
    .filter((o) => o.status !== "bekor_qilindi")
    .reduce((s, o) => s + Number(o.total), 0);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">Admin panel</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Taomlar", value: String(dishes.data?.length ?? 0) },
            { label: "Buyurtmalar", value: String(orders.data?.length ?? 0) },
            { label: "Tushum", value: `${formatSum(revenue)} so'm` },
          ].map((s) => (
            <div key={s.label} className="surface-card p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto">
          {(
            [
              ["dishes", "Taomlar"],
              ["promos", "Promo-kodlar"],
              ["orders", "Buyurtmalar"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "dishes" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="surface-card h-fit space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{dishEditId ? "Taomni tahrirlash" : "Yangi taom"}</h2>
                {dishEditId && (
                  <Button variant="ghost" size="icon" onClick={() => { setDishEditId(null); setDishForm({ ...emptyDish }); }}>
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Nomi</Label>
                <Input value={dishForm.title} maxLength={120} onChange={(e) => setDishForm({ ...dishForm, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tavsif</Label>
                <Textarea rows={3} value={dishForm.description} maxLength={500} onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Narx (so'm)</Label>
                  <Input type="number" value={dishForm.price} onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategoriya</Label>
                  <Select value={dishForm.category} onValueChange={(v) => setDishForm({ ...dishForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c !== "all").map((c) => (
                        <SelectItem key={c} value={c}>{tc(c)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Rasm URL</Label>
                <Input value={dishForm.image_url} maxLength={500} onChange={(e) => setDishForm({ ...dishForm, image_url: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <Label htmlFor="pop">Mashhur taom</Label>
                <Switch id="pop" checked={dishForm.is_popular} onCheckedChange={(v) => setDishForm({ ...dishForm, is_popular: v })} />
              </div>
              <Button className="w-full" disabled={busy} onClick={() => void saveDish()}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> Saqlash</>}
              </Button>
            </section>

            <section className="space-y-2">
              {dishes.data?.map((d) => (
                <div key={d.id} className="surface-card flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{tc(d.category)} · {formatSum(d.price)} so'm</p>
                  </div>
                  {d.is_popular && <Badge variant="secondary">Mashhur</Badge>}
                  <Button variant="ghost" size="icon" onClick={() => { setDishEditId(d.id); setDishForm({ title: d.title, description: d.description, price: Number(d.price), category: d.category, image_url: d.image_url ?? "", is_popular: d.is_popular }); }}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void deleteDish(d.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "promos" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="surface-card h-fit space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{promoEditId ? "Promo-kodni tahrirlash" : "Yangi promo-kod"}</h2>
                {promoEditId && (
                  <Button variant="ghost" size="icon" onClick={() => { setPromoEditId(null); setPromoForm({ ...emptyPromo }); }}>
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Kod</Label>
                <Input value={promoForm.code} maxLength={40} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-1.5">
                <Label>Sarlavha</Label>
                <Input value={promoForm.title} maxLength={120} onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tavsif</Label>
                <Textarea rows={2} value={promoForm.description} maxLength={300} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Turi</Label>
                  <Select value={promoForm.discount_type} onValueChange={(v) => setPromoForm({ ...promoForm, discount_type: v as "percent" | "fixed" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Foiz (%)</SelectItem>
                      <SelectItem value="fixed">Belgilangan (so'm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Qiymat</Label>
                  <Input type="number" value={promoForm.discount_value} onChange={(e) => setPromoForm({ ...promoForm, discount_value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <Label htmlFor="daily">Kunlik (ommaviy)</Label>
                <Switch id="daily" checked={promoForm.is_daily} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_daily: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <Label htmlFor="active">Faol</Label>
                <Switch id="active" checked={promoForm.is_active} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_active: v })} />
              </div>
              <Button className="w-full" disabled={busy} onClick={() => void savePromo()}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> Saqlash</>}
              </Button>
            </section>

            <section className="space-y-2">
              {promos.data?.map((p) => (
                <div key={p.id} className="surface-card flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-extrabold">{p.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.discount_type === "percent" ? `${p.discount_value}%` : `${formatSum(p.discount_value)} so'm`} · {p.title}
                    </p>
                  </div>
                  {p.is_daily ? <Badge>Kunlik</Badge> : <Badge variant="secondary">Maxfiy</Badge>}
                  {!p.is_active && <Badge variant="outline">Nofaol</Badge>}
                  <Button variant="ghost" size="icon" onClick={() => { setPromoEditId(p.id); setPromoForm({ code: p.code, title: p.title, description: p.description, discount_type: p.discount_type === "fixed" ? "fixed" : "percent", discount_value: Number(p.discount_value), is_daily: p.is_daily, is_active: p.is_active }); }}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void deletePromo(p.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "orders" && (
          <section className="mt-6 space-y-3">
            {orders.data?.map((o) => (
              <div key={o.id} className="surface-card space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{o.customer_name} · {o.phone}</p>
                    <p className="text-xs text-muted-foreground">{o.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold">{formatSum(o.total)} so'm</span>
                    <Select value={o.status} onValueChange={(v) => void setStatus(o.id, v)}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {o.items?.map((i) => `${i.title} × ${i.qty}`).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("uz-UZ")} · {o.payment_method}
                </p>
              </div>
            ))}
            {orders.data?.length === 0 && (
              <p className="py-16 text-center text-muted-foreground">Buyurtmalar yo'q</p>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}
