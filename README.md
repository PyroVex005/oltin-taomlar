# Oltin Taomlar

ROLE & GOAL:
You are an Elite Senior UI/UX Designer and Full-Stack React Architect. Build a 100% exact replica of the "RESTAURANT SHOP" e-commerce web platform with dual mode support (Light/Dark mode), full responsive design, 100% Uzbek interface, Role-Based Auth (Admin/User), Admin Dashboard, Advanced Promo-code engine, and Automated Payment Deep Links (Click & Payme).

1. PAYMENT INTEGRATION (CLICK & PAYME AUTO-FILL)
Hardcode the following recipient payment details across the system:

Card Number: 9860160620271637

Card Holder Name: Ro'zimuhammad Tohirov

Phone Number: +998883393339

Behavior during Checkout:

When user selects Click or Payme and inputs the final checkout amount (after promo-code discount), clicking "TO'LOV QILISH" should generate a dynamic payment link/deep-link pre-filling the destination Card Number (9860160620271637), Recipient Name (Ro'zimuhammad Tohirov), and the exact order total amount.

Display a payment modal/card showing the Card Number with a "Nusxalash" (Copy) button, Card Holder Name, and direct payment button redirecting to Click/Payme apps.

2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL
Login & Signup Page (/auth):

Dual authentication toggle: Foydalanuvchi sifatida kirish (User Login/Register) and Admin sifatida kirish (Admin Login).

User Roles:

user: Access to storefront, cart, profile, and daily discounts.

admin: Access to exclusive Admin Dashboard (/admin).

3. ADMIN DASHBOARD (/admin)
Build a full-featured standalone Admin Panel with sidebar navigation:

Taomlar Boshqaruvi (Dish Management): CRUD operations for dishes (Upload Image, Title, Description, Price, Category selector).

Promo-kodlar & Chegirmalar Boshqaruvi (Promo & Discount Engine):

Yashirin Promo-kodlar (Secret Promo Codes): Create promo codes with custom percentage discounts (e.g., Osh20 for 20% off) or fixed amount discounts.

Kunlik Maxsus Chegirmalar (Daily Discounts Banner): Admin can post 1-time daily automatic promo codes that pop up as a promo banner on the user dashboard once per day.

Buyurtmalar Paneli (Order Analytics): Real-time order tracking with status updates (Qabul qilindi, Tayyorlanmoqda, Yo'lda, Yetkazildi).

4. USER DISCOUNT & PROMO CODE ENGINE
Checkout Promo Code Integration: Enter Promo Code in Cart/Checkout page to dynamically deduct discount percentage/amount from subtotal instantly before total price display.

Chegirmalar Menusi & Daily Popup: Dedicated "Chegirmalar" tab/menu + automatic daily popup banner for special discounts.

5. LANGUAGE & DESIGN SYSTEM
Default Language: 100% Uzbek (O'zbek tili). Include Language Switcher (UZ, RU, EN) in header/footer.

Typography: Use clean Sans-Serif fonts (Inter or Plus Jakarta Sans). NO serif/Playfair fonts.

Color Palette:

Light Theme: Crisp white background (#FFFFFF), light gray surfaces (#F8FAFC), dark text (#0F172A).

Dark Theme: Deep sleek dark background (#0B0C10 / #0D0E15), dark slate cards (#151821).

Primary Accent Color: Vivid Electric Purple / Violet (#8B5CF6 / #7C3AED).

6. CORE PAGES & NAVIGATION
Asosiy Sahifa (Home): Hero banner, Quick Action buttons, Benefit Badges, "Mashhur taomlar" grid, and Daily Discount Popup trigger.

Menyu Sahifasi: Left Sidebar Categories (Barchasi, Milliy taomlar, Oshlar, Kaboblar, Sho'rvalar, Salatlar, Non, Ichimliklar) + Dish Grid.

Mahsulot Sahifasi (Detail View): Gallery, details, ingredient tags, quantity selector, "SAVATGA QO'SHISH" & "HOZIR BUYURTMA BERISH".

Savat & Buyurtma Berish (Cart & Checkout): Address form, Promo Code input field with live deduction, Payment selector (CLICK, Payme, Naqd) linked to 9860160620271637.

Chegirmalar Sahifasi: Active admin discounts and daily promo codes.

Profil va Profilni Tahrirlash (Profile & Edit Profile): User stats, Edit Profile Modal (Avatar, Name, Phone +998883393339, Address, Password), My Orders history, Saved Wishlist.

Mobile Bottom Navigation (Sticky): Asosiy, Qidiruv, Savat, Chegirmalar, Profil.

7. HARDCODED TELEGRAM CREDENTIALS & BACKEND INTEGRATION
Use the following pre-configured secrets for Telegram notifications:

TELEGRAM_BOT_TOKEN: @secret:TELEGRAM_BOT_TOKEN 

TELEGRAM_KITCHEN_CHAT_ID: -5162377567

Whenever a user completes checkout ("BUYURTMA TASDIQLASH"), trigger a Supabase Edge Function to send structured order details (items, applied promo code discount, final total, address, phone) to the Telegram kitchen group with inline action buttons (Qabul qilish / Rad etish).

Generate the entire application step-by-step with zero placeholder errors, 100% clean TypeScript code, and exact design match.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9fa4e0ce-54f8-4dbf-99b4-24ef3a9a3b4c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
