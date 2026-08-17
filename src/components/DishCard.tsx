import { Link } from "@tanstack/react-router";
import { Plus, Flame, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatSum } from "@/lib/payment";
import { toast } from "sonner";

export type Dish = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  ingredients: string[];
  is_popular: boolean;
};

export function DishCard({ dish }: { dish: Dish }) {
  const { add } = useCart();
  const { t, tc } = useI18n();

  return (
    <div className="group surface-card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow">
      <Link to="/taom/$id" params={{ id: dish.id }} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {dish.image_url ? (
            <img
              src={dish.image_url}
              alt={dish.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center gradient-hero text-primary-foreground/80">
              <UtensilsCrossed className="size-10" />
            </div>
          )}
          {dish.is_popular && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
              <Flame className="size-3" /> TOP
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {tc(dish.category)}
        </p>
        <Link to="/taom/$id" params={{ id: dish.id }}>
          <h3 className="line-clamp-1 text-base font-bold">{dish.title}</h3>
        </Link>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{dish.description}</p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-lg font-extrabold">
            {formatSum(dish.price)} <span className="text-xs font-medium text-muted-foreground">{t("sum")}</span>
          </p>
          <Button
            size="icon"
            className="rounded-full"
            onClick={() => {
              add({ id: dish.id, title: dish.title, price: dish.price, image_url: dish.image_url });
              toast.success(`${dish.title} savatga qo'shildi`);
            }}
            aria-label={t("add_to_cart")}
          >
            <Plus className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
