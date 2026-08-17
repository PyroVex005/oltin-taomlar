import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function DailyPromoPopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["daily-promo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("code, title, description, discount_type, discount_value")
        .eq("is_daily", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  useEffect(() => {
    if (!data) return;
    const key = `rs-daily-${data.code}-${new Date().toDateString()}`;
    if (localStorage.getItem(key)) return;
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(key, "1");
    }, 1200);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data) return null;

  const label =
    data.discount_type === "fixed"
      ? `${new Intl.NumberFormat("uz-UZ").format(Number(data.discount_value))} so'm`
      : `${Number(data.discount_value)}%`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm overflow-hidden border-0 p-0">
        <div className="gradient-hero px-6 py-8 text-center text-primary-foreground">
          <Gift className="mx-auto size-12" />
          <p className="mt-3 text-5xl font-extrabold">{label}</p>
          <p className="mt-1 text-sm opacity-90">CHEGIRMA</p>
        </div>
        <div className="space-y-4 p-6 pt-4">
          <DialogHeader>
            <DialogTitle className="text-center">{data.title || "Kunlik maxsus chegirma"}</DialogTitle>
            <DialogDescription className="text-center">{data.description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between rounded-xl border border-dashed border-primary bg-accent px-4 py-3">
            <span className="text-lg font-extrabold tracking-widest text-accent-foreground">{data.code}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(data.code);
                setCopied(true);
                toast.success("Promo-kod nusxalandi");
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Nusxalash
            </Button>
          </div>
          <Button className="w-full" onClick={() => setOpen(false)}>
            Buyurtma berish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
