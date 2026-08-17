import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Search,
  ShoppingCart,
  Tag,
  User,
  Moon,
  Sun,
  Menu as MenuIcon,
  UtensilsCrossed,
  LayoutDashboard,
  Globe,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/lib/cart";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAYMENT } from "@/lib/payment";

const LANGS: Lang[] = ["uz", "ru", "en"];

export function Layout({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/menyu", label: t("nav_menu"), icon: MenuIcon },
    { to: "/chegirmalar", label: t("nav_discounts"), icon: Tag },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl gradient-hero text-primary-foreground">
              <UtensilsCrossed className="size-5" />
            </span>
            <span className="hidden text-base font-extrabold tracking-tight sm:block">
              RESTAURANT <span className="gradient-text">SHOP</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
              >
                {t("nav_admin")}
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2 uppercase">
                  <Globe className="size-4" />
                  {lang}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGS.map((l) => (
                  <DropdownMenuItem key={l} onClick={() => setLang(l)} className="uppercase">
                    {l}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggle} aria-label="theme">
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            <Link to="/savat" className="relative">
              <Button variant="ghost" size="icon" aria-label={t("nav_cart")}>
                <ShoppingCart className="size-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("nav_profile")}>
                    <User className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profil">{t("nav_profile")}</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="mr-2 size-4" />
                        {t("nav_admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => void signOut()}>{t("logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="ml-1">
                <Link to="/auth">{t("login")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <footer className="hidden border-t border-border bg-muted/40 py-10 md:block">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-foreground">RESTAURANT SHOP</p>
            <p className="mt-1">Milliy taomlar yetkazib berish xizmati</p>
          </div>
          <div className="space-y-1">
            <p>Tel: {PAYMENT.phone}</p>
            <p>To'lov karta: {PAYMENT.cardNumber}</p>
            <p>{PAYMENT.cardHolder}</p>
          </div>
          <div className="flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md border border-border px-3 py-1 uppercase transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {[
            { to: "/", label: t("nav_home"), icon: Home },
            { to: "/menyu", label: t("nav_search"), icon: Search },
            { to: "/savat", label: t("nav_cart"), icon: ShoppingCart, badge: count },
            { to: "/chegirmalar", label: t("nav_discounts"), icon: Tag },
            { to: "/profil", label: t("nav_profile"), icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                {item.badge ? (
                  <span className="absolute right-[22%] top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
