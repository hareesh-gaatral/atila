# ATILA Frontend Web - Documentation

## Project Overview
ATILA is an Intelligent Procurement platform for Modern Enterprises, built by Aatral Technologies. This is a Next.js 14 full-stack application with MongoDB, Redux state management, and admin panel.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── lib/                    # Utilities, database, auth
├── models/                 # Mongoose models
├── store/                  # Redux state management
└── controllers/            # Business logic
```

---

## 1. App Router (`src/app/`)

### Root Layout (`layout.tsx`)
| Purpose | Description |
|---------|-------------|
| **Metadata** | Sets page title, description, favicon |
| **Providers** | Wraps app with Redux StoreProvider & AuthProvider |
| **Google Translate** | Language translation widget (hidden) |
| **ContactButton** | Floating WhatsApp/Message/Call button |
| **Favicon** | Uses `/png/productLogo.png` |

### Home Page (`page.tsx`)
| Section | Component | Purpose |
|---------|-----------|---------|
| Hero | `HeroSection` | Main banner with CTA buttons |
| Marquee | `MarqueeSection` | Scrolling partner/client logos |
| Wheel | `ProcurementWheel` | ATILA procurement lifecycle diagram |
| About | `AboutSection` | Company information |
| Services | `ServicesSection` | What ATILA offers |
| Features | `FeaturesSection` | Key features |
| CTA | `CTASection` | Call-to-action |
| Contact | `ContactSection` | Contact form |
| Footer | `Footer` | Site footer with links |

**Data Flow**: Server-side fetch from MongoDB → `getHomeData()` → cached with React `cache()` → revalidates every 60s

### About Page (`/about/page.tsx`)
| Section | Purpose |
|---------|---------|
| Hero | Page header with gradient background |
| About Text | Company description |
| Contact Info Cards | Address, Phone, Email with icons |
| Google Maps | Embedded map of HSR Layout, Bangalore |
| Contact Form | Name, Email, Subject, Message |

**Company Details**:
- Address: #225, 1st floor, 13th Cross, 17th B Main Rd, 4th Sector, HSR Layout, Bangalore - 560102
- Phone: 91-8884481234
- Email: atila@aatraltechnologies.com

### Dynamic Pages (`/[slug]/page.tsx`)
| Purpose | Description |
|---------|-------------|
| **Catch-all route** | Handles any page slug (about, services, etc.) |
| **Data Fetching** | `getPageData(slug)` from MongoDB |
| **Sections** | Renders sections based on `sectionType` |
| **Revalidation** | 60s cache |

### Admin Panel (`/admin/`)
| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard overview |
| `/admin/pages` | Manage pages (CRUD) |
| `/admin/pages/new` | Create new page |
| `/admin/pages/edit/[id]` | Edit existing page |
| `/admin/sections` | Manage sections |
| `/admin/media` | Upload & manage images |
| `/admin/settings` | Site configuration |

**Authentication**: Protected with JWT (access + refresh tokens in HttpOnly cookies)

---

## 2. Frontend Components (`src/components/frontend/`)

### Navbar.tsx
| Feature | Description |
|---------|-------------|
| **Logo** | Product logo from `/png/productLogo.png` |
| **Navigation** | Home, About, Services, Contact |
| **LanguageSelector** | 8 Indian languages (Google Translate) |
| **ThemeToggle** | Dark/Light mode switch |
| **Admin Link** | Direct access to admin panel |
| **Scroll Effect** | Transparent → Solid on scroll |
| **Mobile Menu** | Hamburger menu with sidebar |
| **Prefetch** | Links prefetch on hover for speed |

### HeroSection.tsx
| Element | Content |
|---------|---------|
| Badge | "Procurement Platform" |
| Title | "ATILA - Intelligent Procurement for Modern Enterprises" |
| Subtitle | "Built by Aatral Technologies" |
| CTA Buttons | Schedule, Talk to Expert |
| Stats | 500+ Enterprises, 99.9% Uptime, $2B+ Procured |
| Background | Gradient with decorative blurs |
| Product Image | `/png/productLogo.png` |

### ProcurementWheel.tsx
| Element | Description |
|---------|-------------|
| **Center** | Product logo with "ATILA" text overlay |
| **8 Segments** | Design, Source, Procure, Pay, Invoice, Fulfill, Create, Quote |
| **Buyers Card** | Left side - procurement visibility |
| **Suppliers Card** | Right side - sales optimization |
| **Bottom Tags** | P2P, O2C, ERP, S2P |
| **Labels** | BUYERS, VALUE EXCHANGE, DATA, INSIGHTS |

**Purpose**: Visual representation of ATILA's procurement lifecycle (similar to Coupa)

### MarqueeSection.tsx
| Feature | Description |
|---------|-------------|
| **Images** | 22 PNG images from `/png/` folder |
| **Animation** | Infinite scroll (35s loop) |
| **Pause on Hover** | Stops animation |
| **Fade Edges** | Gradient overlays on sides |
| **Cards** | White/Dark with shadows |
| **No Grayscale** | Full color logos |

### AboutSection.tsx
| Content | Description |
|---------|-------------|
| **Title** | "About ATILA" |
| **Subtitle** | "Who We Are" |
| **Items** | Enterprise Grade, Secure Platform, Real-time Analytics |

### ServicesSection.tsx
| Service | Description |
|---------|-------------|
| Purchase Management | Streamlined purchase order workflows |
| Vendor Management | Centralized vendor database |
| Contract Management | Digital contract lifecycle |
| Spend Analytics | Real-time spending insights |
| Approval Workflows | Multi-level approvals |
| Compliance | Procurement policy compliance |

### FeaturesSection.tsx
| Feature | Description |
|---------|-------------|
| Cloud Native | 99.9% uptime SaaS |
| Mobile Ready | Approve on any device |
| API Integration | Connect with ERP systems |
| AI Powered | Smart automation |

### CTASection.tsx
| Element | Content |
|---------|---------|
| Title | "Ready to Transform Your Procurement?" |
| Button | "Schedule a Demo" → /contact |

### ContactSection.tsx
| Field | Type |
|-------|------|
| Full Name | Text input |
| Email Address | Email input |
| Phone Number | Tel input |
| Message | Textarea |
| Submit | "Send Message" button |

### Footer.tsx
| Section | Content |
|---------|---------|
| **Logo** | Product logo |
| **Description** | About ATILA |
| **Quick Links** | Home, About, Services, Contact |
| **Contact** | Email, Phone, Address |
| **Bottom** | Copyright, Privacy Policy, Terms |

---

## 3. UI Components (`src/components/ui/`)

### ThemeToggle.tsx
| Feature | Description |
|---------|-------------|
| **Icons** | Sun (light) / Moon (dark) with rotation animation |
| **Redux** | Dispatches `toggleTheme()` |
| **LocalStorage** | Persists `atila-theme` key |
| **Transition** | 400ms smooth animation |
| **Memo** | Wrapped with `React.memo` for performance |

### LanguageSelector.tsx
| Feature | Description |
|---------|-------------|
| **Languages** | English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali |
| **Icons** | Globe + flag emoji |
| **Dropdown** | Click to open, click outside to close |
| **Google Translate** | Calls `setLanguage()` function |
| **Retry Logic** | Up to 10 attempts if not ready |

### ContactButton.tsx
| Feature | Description |
|---------|-------------|
| **Main Button** | Message icon (bottom-right) |
| **Options** | WhatsApp, Message (SMS), Call |
| **WhatsApp** | Opens `wa.me/91939258253` |
| **Message** | Opens `sms:91939258253` |
| **Call** | Opens `tel:91939258253` |
| **Animation** | Rotate on open, scale on hover |

### GoogleTranslate.tsx
| Feature | Description |
|---------|-------------|
| **Script Loading** | Loads Google Translate API |
| **Initialization** | Creates hidden widget |
| **Languages** | en, te, hi, ta, kn, ml, mr, bn |
| **Export** | `setLanguage()` function |

---

## 4. Database Models (`src/models/`)

### Page.ts
```typescript
{
  slug: string,          // URL-friendly name
  title: string,         // Display title
  content: string,       // Page content
  isPublished: boolean,  // Visibility
  metaTitle: string,     // SEO title
  metaDescription: string // SEO description
}
```

### Section.ts
```typescript
{
  pageSlug: string,      // Parent page
  sectionType: string,   // hero, about, services, features, cta, contact
  title: string,
  subtitle: string,
  content: string,
  order: number,         // Display order
  isActive: boolean,
  items: Array<{         // For lists
    title: string,
    description: string,
    icon: string
  }>,
  buttonText: string,
  buttonLink: string,
  imageUrl: string
}
```

### Media.ts
```typescript
{
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  path: string,          // File path
  alt: string,           // Alt text
  uploadedBy: ObjectId   // User reference
}
```

### Settings.ts
```typescript
{
  key: string,           // Setting name
  value: string,         // Setting value
  description: string    // Help text
}
```

### User.ts
```typescript
{
  email: string,         // Login email
  password: string,      // Hashed password
  name: string,
  role: 'admin' | 'editor',
  refreshToken: string   // JWT refresh token
}
```

---

## 5. State Management (`src/store/`)

### Slices

| Slice | State | Actions |
|-------|-------|---------|
| `uiSlice` | `sidebarOpen`, `modalOpen`, `theme` | `toggleSidebar`, `closeSidebar`, `openModal`, `closeModal`, `toggleTheme`, `setTheme`, `initTheme` |
| `pagesSlice` | `pages[]`, `loading`, `error` | `fetchPages`, `addPage`, `updatePage`, `deletePage` |
| `sectionsSlice` | `sections[]`, `loading`, `error` | `fetchSections`, `addSection`, `updateSection`, `deleteSection` |
| `settingsSlice` | `settings{}`, `loading`, `error` | `fetchSettings`, `updateSettings` |

### Theme Persistence
1. `initTheme()` reads from `localStorage('atila-theme')`
2. Falls back to `prefers-color-scheme: dark`
3. Default: `'light'`
4. Toggles `dark` class on `<html>` element

---

## 6. Authentication (`src/lib/auth/`)

### AuthContext.tsx
| Feature | Description |
|---------|-------------|
| **Token Types** | Access (15min) + Refresh (7 days) |
| **Storage** | HttpOnly cookies |
| **Auto-Refresh** | Every 14 minutes |
| **Login** | POST `/api/auth/login` |
| **Register** | POST `/api/auth/register` |
| **Logout** | Clears cookies, redirects to `/admin/login` |

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | Create account |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Clear tokens |

---

## 7. API Routes (`src/app/api/`)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/pages` | GET, POST | List/Create pages |
| `/api/pages/[id]` | GET, PUT, DELETE | Read/Update/Delete page |
| `/api/sections` | GET, POST | List/Create sections |
| `/api/sections/[id]` | GET, PUT, DELETE | Read/Update/Delete section |
| `/api/media` | GET, POST | List/Upload media |
| `/api/media/[id]` | GET, PUT, DELETE | Read/Update/Delete media |
| `/api/settings` | GET, PUT | Get/Update settings |

---

## 8. Performance Optimizations

### Caching (`src/lib/cache.ts`)
| Function | Purpose |
|----------|---------|
| `getHomeData()` | Cached home page data |
| `getPageData(slug)` | Cached dynamic page data |
| `getSettings()` | Cached settings |

**Strategy**: React `cache()` + 60s revalidation

### Loading States
| File | Purpose |
|------|---------|
| `src/app/loading.tsx` | Homepage skeleton |
| `src/app/[slug]/loading.tsx` | Dynamic page skeleton |
| `src/app/admin/loading.tsx` | Admin spinner |

### Next Config (`next.config.js`)
| Setting | Value | Purpose |
|---------|-------|---------|
| `compress` | `true` | Gzip compression |
| `reactStrictMode` | `true` | React best practices |
| `images.formats` | `['avif', 'webp']` | Modern image formats |
| `poweredByHeader` | `false` | Security |

---

## 9. Styling

### Tailwind Configuration
| Setting | Value |
|---------|-------|
| `darkMode` | `'class'` |
| `primary` | `#1e3a5f` (Navy Blue) |
| `secondary` | `#2c5282` (Blue) |
| `accent` | `#e53e3e` (Red) |
| `gold` | `#d69e2e` (Gold) |

### Theme Transitions
| Class | Duration | Purpose |
|-------|----------|---------|
| `theme-transition` | 400ms | Toggle animation |
| `transition-colors` | 500ms | Background/text changes |

### CSS Classes
| Class | Purpose |
|-------|---------|
| `gradient-text` | ATILA gradient text effect |
| `glass` | Frosted glass effect |
| `shadow-card` | Card shadows |
| `shadow-card-hover` | Hover card shadows |
| `animate-marquee` | Scrolling animation |

---

## 10. Image Assets (`public/png/`)

| File | Usage |
|------|-------|
| `productLogo.png` | Main ATILA logo (navbar, hero, wheel, favicon) |
| `1.png` - `22.png` | Partner/client logos (marquee) |

---

## 11. Environment Variables

Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/atila
JWT_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

---

## 12. Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `node scripts/seed.js` | Seed database with default data |

---

## 13. Key Features Summary

| Feature | Implementation |
|---------|----------------|
| **Dark/Light Theme** | Redux + localStorage + CSS transitions |
| **Language Translation** | Google Translate API + 8 Indian languages |
| **WhatsApp Contact** | Floating button → wa.me link |
| **SMS Contact** | Floating button → sms: link |
| **Phone Contact** | Floating button → tel: link |
| **Procurement Wheel** | SVG circular diagram with 8 stages |
| **Marquee** | Infinite scroll animation |
| **Admin Panel** | CRUD for pages, sections, media, settings |
| **Authentication** | JWT with HttpOnly cookies |
| **Caching** | React cache + 60s revalidation |
| **Loading States** | Skeleton UI for all routes |
| **SEO** | Metadata, meta tags, semantic HTML |

---

## 14. Contact Information

| Channel | Details |
|---------|---------|
| **Address** | #225, 1st floor, 13th Cross, 17th B Main Rd, 4th Sector, HSR Layout, Bangalore - 560102 |
| **Phone** | 91-8884481234 |
| **WhatsApp** | 91939258253 |
| **Email** | atila@aatraltechnologies.com |

---

*Last Updated: August 2026*
*Built by Aatral Technologies*
