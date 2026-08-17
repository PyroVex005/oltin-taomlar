import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Kirish va ro'yxatdan o'tish — Restaurant Shop" },
      { name: "description", content: "Hisobingizga kiring yoki yangi hisob yarating va buyurtma bering." },
      { property: "og:title", content: "Kirish — Restaurant Shop" },
      { property: "og:description", content: "Hisobingizga kiring va buyurtma bering." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Email noto'g'ri").max(255),
  password: z.string().min(6, "Parol kamida 6 ta belgi").max(72),
  fullName: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (session) void navigate({ to: "/" });
  }, [session, navigate]);

  const submit = async () => {
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password });
        if (error) throw error;
        toast.success("Xush kelibsiz!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName ?? "" },
          },
        });
        if (error) throw error;
        toast.success("Hisob yaratildi!");
      }
      void navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google orqali kirib bo'lmadi");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl gradient-hero text-primary-foreground">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">RESTAURANT SHOP</span>
        </Link>

        <div className="surface-card space-y-5 p-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 text-sm font-bold transition-colors ${
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? t("login") : "Ro'yxatdan o'tish"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t("name")}</Label>
              <Input id="fullName" value={fullName} maxLength={100} onChange={(e) => setFullName(e.target.value)} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Parol</Label>
            <Input
              id="password"
              type="password"
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
            />
          </div>

          <Button className="w-full shadow-glow" size="lg" disabled={loading} onClick={() => void submit()}>
            {loading ? <Loader2 className="size-5 animate-spin" /> : mode === "login" ? t("login") : "Ro'yxatdan o'tish"}
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">yoki</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" size="lg" onClick={() => void google()}>
            Google orqali davom etish
          </Button>
        </div>
      </div>
    </div>
  );
}
