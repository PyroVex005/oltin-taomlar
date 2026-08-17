import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({ code: z.string().trim().min(1).max(40) });

export type PromoResult =
  | { ok: true; code: string; discount_type: "percent" | "fixed"; discount_value: number; title: string }
  | { ok: false; error: string };

export const validatePromo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<PromoResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("code, title, discount_type, discount_value, is_active, valid_until")
      .ilike("code", data.code)
      .maybeSingle();

    if (error) return { ok: false, error: "Promo-kodni tekshirib bo'lmadi" };
    if (!promo || !promo.is_active) return { ok: false, error: "Bunday promo-kod topilmadi" };
    if (promo.valid_until && new Date(promo.valid_until) < new Date())
      return { ok: false, error: "Promo-kod muddati tugagan" };

    return {
      ok: true,
      code: promo.code,
      title: promo.title ?? "",
      discount_type: promo.discount_type === "fixed" ? "fixed" : "percent",
      discount_value: Number(promo.discount_value),
    };
  });
