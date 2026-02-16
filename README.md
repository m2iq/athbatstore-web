# 🏪 Athbat Store

**Athbat Store** is a simplified digital marketplace mobile app built with Expo (React Native) and a Next.js admin panel. The app displays categories and products with WhatsApp-based ordering - no authentication, no cart, just catalog browsing and direct WhatsApp contact.

---

## 📱 Features

### Mobile App

- **Categories & Products**: Browse digital services by category
- **Iraqi Dinar Pricing**: All prices displayed in IQD (د.ع)
- **WhatsApp Ordering**: Direct order placement via WhatsApp
- **Bilingual**: Full Arabic + English support (i18next)
- **Featured Products**: Highlight special offers with discount badges
- **No Authentication**: Public catalog, no user accounts needed

### Admin Panel

- **Categories Management**: Add/edit categories
- **Products Management**: Add/edit products with IQD pricing
- **Featured Toggle**: Mark products as featured
- **Simple Dashboard**: View total categories and products

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier works)

### 1. Mobile App Setup

```bash
# Install dependencies
npm install

# Configure Supabase
# Create .env file with:
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Run Supabase migrations (in Supabase SQL Editor)
# 1. Run supabase/schema.sql
# 2. Run supabase/seed.sql

# Start development server
npx expo start
```

Choose your platform:

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app

### 2. Admin Panel Setup

```bash
cd admin

# Install dependencies
npm install

# Configure environment
# Create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Start development server
npm run dev
```

Admin panel will be available at `http://localhost:3000`

---

## 🗂️ Project Structure

```
athbat-store/
├── app/                      # Expo Router pages
│   ├── (tabs)/               # Bottom tabs (Home, Categories, Profile)
│   ├── product/[id].tsx      # Product detail page
│   └── category/[id].tsx     # Category products page
├── components/               # React components
│   ├── category-card.tsx     # Category grid item
│   ├── product-card.tsx      # Product grid item
│   └── ui/                   # Reusable UI components
├── services/                 # API services
│   ├── catalog.ts            # Category/product queries
│   └── supabase.ts           # Supabase client
├── i18n/                     # Translations
│   ├── ar.json               # Arabic translations
│   └── en.json               # English translations
├── types/                    # TypeScript types
├── constants/                # Theme & layout constants
├── supabase/                 # Database schema & seed
│   ├── schema.sql            # Database structure
│   └── seed.sql              # Sample data (IQD prices)
└── admin/                    # Next.js admin panel
    └── src/
        ├── app/              # Next.js 15 App Router
        ├── components/       # Admin components
        └── lib/              # Utilities
```

---

## 🗄️ Database Schema

**Simplified schema** (no users, orders, or authentication):

### Tables

- **categories**: Product categories with AR/EN names
- **products**: Products with IQD pricing, stock, featured flag

### Key Fields

- `price`: Current price in IQD
- `original_price`: Original price (for discount display)
- `is_featured`: Show featured badge
- `stock`: Inventory count (0 = out of stock)

---

## 💬 WhatsApp Integration

Update the phone number in `app/product/[id].tsx`:

```typescript
const WHATSAPP_NUMBER = "9647XXXXXXXXX"; // Your Iraqi number
```

Order messages are formatted as:

```
مرحباً، أريد طلب:
[Product Name]
السعر: XXX د.ع
```

---

## 🎨 Customization

### Change App Theme

Edit `constants/theme.ts`:

```typescript
export const Theme = {
  light: {
    primary: "#008B9E", // Lagoon teal
    background: "#FFFFFF",
    // ...
  },
};
```

### Update Translations

Edit `i18n/ar.json` and `i18n/en.json`

### Modify Pricing Format

Prices use Iraqi Dinar formatting:

```typescript
new Intl.NumberFormat("ar-IQ", {
  maximumFractionDigits: 0,
}).format(price);
```

---

## 📦 Tech Stack

**Mobile App**

- React Native 0.81.5 (via Expo SDK 54)
- Expo Router v6 (file-based routing)
- Supabase Client
- i18next (internationalization)
- TypeScript (strict mode)

**Admin Panel**

- Next.js 15.3 (App Router)
- Tailwind CSS v4
- Supabase Client
- TypeScript

---

## 🔄 Deployment

### Mobile App

```bash
# Build for production
eas build --platform android
eas build --platform ios
```

### Admin Panel

Deploy to Vercel:

```bash
cd admin
vercel --prod
```

---

## 📄 License

MIT License - feel free to use for your own projects!

---

## 🤝 Contributing

This is a simplified template. Key simplifications made:

- ❌ No user authentication
- ❌ No shopping cart
- ❌ No checkout/payment processing
- ❌ No order management
- ✅ Catalog browsing only
- ✅ WhatsApp-based ordering
- ✅ Admin panel for content management

Perfect for small digital services businesses using manual order processing via WhatsApp.
