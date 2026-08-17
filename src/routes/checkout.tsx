import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Check, Loader2, CreditCard, Wallet, Banknote } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { PAYMENT, formatCard, formatSum, paymentLink } from "@/lib/payment";
import { validatePromo } from "@/lib/promo.functions";
import { notifyKitchen } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Buyurtmani rasmiylashtirish — Restaurant Shop" },
      { name: "description", content: "Yetkazib berish ma'lumotlari, promo-kod va Click/Payme orqali to'lov." },
      { property: "og:title", content: "Buyurtmani rasmiylashtirish — Restaurant Shop" },
      { property: "og:description", content: "Click va Payme orqali tez to'lov." },
    ],
  }),
  component: CheckoutPage,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Ismni kiriting").max(100),
  phone: z.string().trim().min(7, "Telefon raqamini kiriting").max(30),
  address: z.string().trim().min(5, "Manzilni kiriting").max(300),
  note: z.string().trim().max(500),
});

type Method = "click" | "payme" | "naqd";

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const validate = useServerFn(validatePromo);
  const notify = useServerFn(notifyKitchen);

  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const [method, setMethod] = useState<Method>("click");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: f.name || profile.full_name || "",
        phone: f.phone || profile.phone || "",
        address: f.address || profile.address || "",
      }));
    }
  }, [profile]);

  const discount = promo ? Math.min(promo.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setChecking(true);
    try {
      const res = await validate({ data: { code: promoInput.trim() } });
      if (!res.ok) {
        setPromo(null);
        toast.error(res.error);
        return;
      }
      const value =
        res.discount_type === "percent" ? (subtotal * res.discount_value) / 100 : res.discount_value;
      setPromo({ code: res.code, discount: value });
      toast.success(`${res.code} qo'llandi`);
    } catch {
      toast.error("Promo-kodni tekshirib bo'lmadi");
    } finally {
      setChecking(false);
    }
  };

  const copyCard = async () => {
    await navigator.clipboard.writeText(PAYMENT.cardNumber);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async () => {
    if (!user) {
      toast.error("Buyurtma berish uchun tizimga kiring");
      void navigate({ to: "/auth" });
      return;
    }
    if (items.length === 0) return;
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring");
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({ title: i.title, qty: i.qty, price: i.price }));
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: orderItems,
          subtotal,
          discount,
          total,
          promo_code: promo?.code ?? null,
          customer_name: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          note: parsed.data.note || null,
          payment_method: method,
        })
        .select("id")
        .single();

      if (error || !data) throw error ?? new Error("insert failed");

      await notify({
        data: {
          orderId: data.id,
          items: orderItems,
          subtotal,
          discount,
          total,
          promoCode: promo?.code ?? null,
          customerName: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          note: parsed.data.note || null,
          paymentMethod: method,
        },
      }).catch(() => undefined);

      clear();
      toast.success("Buyurtma qabul qilindi!");

      if (method !== "naqd") {
        window.open(paymentLink(method, total), "_blank", "noopener,noreferrer");
      }
      void navigate({ to: "/profil" });
    } catch {
      toast.error("Buyurtmani yuborib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-lg font-semibold">{t("empty_cart")}</p>
          <Button asChild className="mt-4">
            <Link to="/menyu">{t("view_menu")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const methods: { key: Method; label: string; icon: typeof CreditCard }[] = [
    { key: "click", label: "Click", icon: CreditCard },
    { key: "payme", label: "Payme", icon: Wallet },
    { key: "naqd", label: t("cash"), icon: Banknote },
  ];

  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">{t("checkout")}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="surface-card space-y-4 p-5">
              <h2 className="font-bold">{t("delivery_info")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input id="name" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input id="phone" value={form.phone} maxLength={30} placeholder="+998 90 123 45 67" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">{t("address")}</Label>
                <Input id="address" value={form.address} maxLength={300} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">{t("note")}</Label>
                <Textarea id="note" value={form.note} maxLength={500} rows={3} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </section>

            <section className="surface-card space-y-4 p-5">
              <h2 className="font-bold">{t("payment_method")}</h2>
              <div className="grid grid-cols-3 gap-3">
                {methods.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMethod(m.key)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-bold transition-colors ${
                      method === m.key
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <m.icon className="size-5" />
                    {m.label}
                  </button>
                ))}
              </div>

              {method !== "naqd" && (
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Qabul qiluvchi karta
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-lg font-extrabold tracking-wide">
                      {formatCard(PAYMENT.cardNumber)}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => void copyCard()}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {t("copy")}
                    </Button>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{PAYMENT.cardHolder}</p>
                  <p className="text-sm text-muted-foreground">{PAYMENT.phone}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    "{t("checkout")}" tugmasini bosgach {method === "click" ? "Click" : "Payme"} ilovasi to'lov
                    summasi va karta bilan avtomatik ochiladi.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="surface-card h-fit space-y-4 p-5">
            <div className="flex gap-2">
              <Input
                value={promoInput}
                maxLength={40}
                placeholder={t("promo_ph")}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              />
              <Button variant="secondary" onClick={() => void applyPromo()} disabled={checking}>
                {checking ? <Loader2 className="size-4 animate-spin" /> : t("apply")}
              </Button>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-bold">{formatSum(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span>
                  {t("discount")} {promo ? `(${promo.code})` : ""}
                </span>
                <span className="font-bold">-{formatSum(discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-semibold">{t("total")}</span>
              <span className="text-2xl font-extrabold">
                {formatSum(total)} {t("sum")}
              </span>
            </div>

            <Button size="lg" className="w-full shadow-glow" disabled={submitting} onClick={() => void submit()}>
              {submitting ? <Loader2 className="size-5 animate-spin" /> : method === "naqd" ? t("checkout") : t("pay")}
            </Button>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
