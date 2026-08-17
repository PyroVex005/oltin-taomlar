export const PAYMENT = {
  cardNumber: "9860160620271637",
  cardHolder: "Ro'zimuhammad Tohirov",
  phone: "+998883393339",
} as const;

export function formatCard(card: string) {
  return card.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatSum(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(value));
}

/** Click deep link with pre-filled destination card and amount (amount in so'm). */
export function clickLink(amount: number) {
  const params = new URLSearchParams({
    card: PAYMENT.cardNumber,
    amount: String(Math.round(amount)),
    receiver: PAYMENT.cardHolder,
  });
  return `https://my.click.uz/app/transfer?${params.toString()}`;
}

/** Payme deep link with pre-filled destination card and amount (Payme uses tiyin). */
export function paymeLink(amount: number) {
  const params = new URLSearchParams({
    card: PAYMENT.cardNumber,
    amount: String(Math.round(amount) * 100),
    receiver: PAYMENT.cardHolder,
  });
  return `https://payme.uz/transfer?${params.toString()}`;
}

export function paymentLink(method: "click" | "payme", amount: number) {
  return method === "click" ? clickLink(amount) : paymeLink(amount);
}
