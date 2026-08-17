import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const KITCHEN_CHAT_ID = "-5162377567";

const schema = z.object({
  orderId: z.string().uuid(),
  items: z
    .array(z.object({ title: z.string().max(120), qty: z.number().int().positive(), price: z.number() }))
    .max(60),
  subtotal: z.number(),
  discount: z.number(),
  total: z.number(),
  promoCode: z.string().max(40).nullable(),
  customerName: z.string().max(120),
  phone: z.string().max(30),
  address: z.string().max(300),
  note: z.string().max(500).nullable(),
  paymentMethod: z.string().max(20),
});

function money(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const notifyKitchen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const token = process.env["TELEGRAM_BOT_TOKEN"];
    if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN sozlanmagan" };

    const lines = data.items
      .map((i) => `• ${escapeHtml(i.title)} × ${i.qty} — ${money(i.price * i.qty)}`)
      .join("\n");

    const text =
      `🍽 <b>YANGI BUYURTMA</b>\n` +
      `<code>#${data.orderId.slice(0, 8)}</code>\n\n` +
      `${lines}\n\n` +
      `Jami: ${money(data.subtotal)}\n` +
      (data.discount > 0
        ? `Chegirma${data.promoCode ? ` (${escapeHtml(data.promoCode)})` : ""}: -${money(data.discount)}\n`
        : "") +
      `<b>To'lov: ${money(data.total)}</b>\n` +
      `To'lov usuli: ${escapeHtml(data.paymentMethod.toUpperCase())}\n\n` +
      `👤 ${escapeHtml(data.customerName)}\n` +
      `📞 ${escapeHtml(data.phone)}\n` +
      `📍 ${escapeHtml(data.address)}` +
      (data.note ? `\n📝 ${escapeHtml(data.note)}` : "");

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: KITCHEN_CHAT_ID,
        text,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Qabul qilish", callback_data: `accept:${data.orderId}` },
              { text: "❌ Rad etish", callback_data: `reject:${data.orderId}` },
            ],
          ],
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Telegram sendMessage failed [${res.status}]: ${body}`);
      return { ok: false, error: `Telegram xatosi (${res.status})` };
    }
    const payload = (await res.json()) as { ok?: boolean; description?: string };
    if (!payload.ok) {
      console.error("Telegram error:", payload.description);
      return { ok: false, error: payload.description ?? "Telegram xatosi" };
    }
    return { ok: true };
  });
