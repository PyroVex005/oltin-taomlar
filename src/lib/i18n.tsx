import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "uz" | "ru" | "en";

type Dict = Record<string, [string, string, string]>;

// [uz, ru, en]
const DICT: Dict = {
  brand: ["RESTAURANT SHOP", "RESTAURANT SHOP", "RESTAURANT SHOP"],
  nav_home: ["Asosiy", "Главная", "Home"],
  nav_menu: ["Menyu", "Меню", "Menu"],
  nav_search: ["Qidiruv", "Поиск", "Search"],
  nav_cart: ["Savat", "Корзина", "Cart"],
  nav_discounts: ["Chegirmalar", "Скидки", "Discounts"],
  nav_profile: ["Profil", "Профиль", "Profile"],
  nav_admin: ["Admin panel", "Админ панель", "Admin panel"],
  login: ["Kirish", "Войти", "Sign in"],
  logout: ["Chiqish", "Выйти", "Sign out"],
  hero_title: ["Eng mazali milliy taomlar", "Самые вкусные блюда", "The tastiest national dishes"],
  hero_sub: [
    "Issiq, yangi va tez yetkazib beriladigan taomlar. 30 daqiqada eshigingizgacha.",
    "Горячие и свежие блюда с доставкой за 30 минут.",
    "Hot, fresh dishes delivered to your door in 30 minutes.",
  ],
  order_now: ["HOZIR BUYURTMA BERISH", "ЗАКАЗАТЬ СЕЙЧАС", "ORDER NOW"],
  view_menu: ["MENYUNI KO'RISH", "СМОТРЕТЬ МЕНЮ", "VIEW MENU"],
  add_to_cart: ["SAVATGA QO'SHISH", "В КОРЗИНУ", "ADD TO CART"],
  popular: ["Mashhur taomlar", "Популярные блюда", "Popular dishes"],
  all: ["Barchasi", "Все", "All"],
  categories: ["Kategoriyalar", "Категории", "Categories"],
  search_ph: ["Taom qidirish...", "Поиск блюда...", "Search dish..."],
  empty_cart: ["Savat bo'sh", "Корзина пуста", "Your cart is empty"],
  subtotal: ["Jami", "Сумма", "Subtotal"],
  discount: ["Chegirma", "Скидка", "Discount"],
  total: ["Umumiy to'lov", "Итого", "Total"],
  promo_ph: ["Promo-kod kiriting", "Введите промокод", "Enter promo code"],
  apply: ["Qo'llash", "Применить", "Apply"],
  checkout: ["BUYURTMA TASDIQLASH", "ПОДТВЕРДИТЬ ЗАКАЗ", "CONFIRM ORDER"],
  pay: ["TO'LOV QILISH", "ОПЛАТИТЬ", "PAY NOW"],
  copy: ["Nusxalash", "Копировать", "Copy"],
  copied: ["Nusxalandi", "Скопировано", "Copied"],
  ingredients: ["Tarkibi", "Состав", "Ingredients"],
  qty: ["Miqdor", "Количество", "Quantity"],
  my_orders: ["Buyurtmalarim", "Мои заказы", "My orders"],
  wishlist: ["Saqlanganlar", "Избранное", "Wishlist"],
  edit_profile: ["Profilni tahrirlash", "Редактировать профиль", "Edit profile"],
  save: ["Saqlash", "Сохранить", "Save"],
  cancel: ["Bekor qilish", "Отмена", "Cancel"],
  delivery_info: ["Yetkazib berish ma'lumotlari", "Данные доставки", "Delivery details"],
  name: ["Ism", "Имя", "Name"],
  phone: ["Telefon", "Телефон", "Phone"],
  address: ["Manzil", "Адрес", "Address"],
  note: ["Izoh", "Комментарий", "Note"],
  payment_method: ["To'lov usuli", "Способ оплаты", "Payment method"],
  cash: ["Naqd pul", "Наличные", "Cash"],
  free_delivery: ["Bepul yetkazib berish", "Бесплатная доставка", "Free delivery"],
  fast_30: ["30 daqiqada", "За 30 минут", "In 30 minutes"],
  fresh: ["Yangi mahsulotlar", "Свежие продукты", "Fresh products"],
  daily_promo: ["Kunlik maxsus chegirma", "Скидка дня", "Daily special discount"],
  use_code: ["Promo-kod", "Промокод", "Promo code"],
  sum: ["so'm", "сум", "UZS"],
};

const CATEGORY_LABELS: Record<string, [string, string, string]> = {
  all: ["Barchasi", "Все", "All"],
  milliy: ["Milliy taomlar", "Национальные блюда", "National dishes"],
  oshlar: ["Oshlar", "Плов", "Pilaf"],
  kaboblar: ["Kaboblar", "Шашлыки", "Kebabs"],
  shorvalar: ["Sho'rvalar", "Супы", "Soups"],
  salatlar: ["Salatlar", "Салаты", "Salads"],
  non: ["Non", "Хлеб", "Bread"],
  ichimliklar: ["Ichimliklar", "Напитки", "Drinks"],
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);

const IDX: Record<Lang, 0 | 1 | 2> = { uz: 0, ru: 1, en: 2 };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; tc: (k: string) => string };

const LangContext = createContext<Ctx>({ lang: "uz", setLang: () => {}, t: (k) => k, tc: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("rs-lang") as Lang | null;
    if (saved && ["uz", "ru", "en"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("rs-lang", l);
  }, []);

  const t = useCallback((k: string) => DICT[k]?.[IDX[lang]] ?? k, [lang]);
  const tc = useCallback((k: string) => CATEGORY_LABELS[k]?.[IDX[lang]] ?? k, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t, tc }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
