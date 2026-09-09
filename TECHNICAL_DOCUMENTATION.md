# ATILA Frontend Web - Technical Architecture Documentation

## Table of Contents
1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Folder Structure & Purpose](#2-folder-structure--purpose)
3. [File-by-File Technical Explanation](#3-file-by-file-technical-explanation)
4. [Design Patterns Used](#4-design-patterns-used)
5. [Data Flow Architecture](#5-data-flow-architecture)
6. [Security Implementation](#6-security-implementation)
7. [Performance Architecture](#7-performance-architecture)

---

## 1. Project Architecture Overview

### Why Next.js 14 App Router?
| Reason | Explanation |
|--------|-------------|
| **Server Components** | Reduces client-side JavaScript, faster initial load |
| **File-based Routing** | Automatic route generation from folder structure |
| **API Routes** | Full-stack without separate backend |
| **Streaming/SSR** | Server-side rendering for SEO |
| **Layouts** | Persistent layouts across pages (navbar, footer) |
| **Loading States** | Built-in `loading.tsx` for instant feedback |

### Why MongoDB + Mongoose?
| Reason | Explanation |
|--------|-------------|
| **Schema Flexibility** | Dynamic sections without migrations |
| **JSON Native** | Direct mapping to JavaScript objects |
| **Scalability** | Horizontal scaling for enterprise |
| **Mongoose ODM** | Schema validation, middleware, hooks |

### Why Redux Toolkit?
| Reason | Explanation |
|--------|-------------|
| **Predictable State** | Single source of truth |
| **DevTools** | Time-travel debugging |
| **Slices Pattern** | Modular state management |
| **Immer Integration** | Immutable updates made easy |

---

## 2. Folder Structure & Purpose

```
src/
├── app/                    # Next.js App Router - Routes & Pages
│   ├── layout.tsx          # Root layout - Global providers, metadata
│   ├── page.tsx            # Homepage - Server-side data fetching
│   ├── loading.tsx         # Homepage loading skeleton
│   ├── globals.css         # Global styles - Tailwind, animations
│   ├── about/              # About page route
│   │   └── page.tsx        # About page - Contact info, map, form
│   ├── [slug]/             # Dynamic routes - Any page slug
│   │   ├── page.tsx        # Dynamic page renderer
│   │   └── loading.tsx     # Dynamic page skeleton
│   ├── admin/              # Admin panel routes
│   │   ├── page.tsx        # Dashboard
│   │   ├── loading.tsx     # Admin loading spinner
│   │   ├── login/          # Admin login
│   │   ├── pages/          # Page management
│   │   ├── sections/       # Section management
│   │   ├── media/          # Media library
│   │   └── settings/       # Site settings
│   └── api/                # API routes - Backend endpoints
│       ├── auth/           # Authentication endpoints
│       ├── pages/          # Pages CRUD
│       ├── sections/       # Sections CRUD
│       ├── media/          # Media upload/CRUD
│       └── settings/       # Settings CRUD
│
├── components/             # Reusable UI components
│   ├── frontend/           # Public-facing components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── HeroSection.tsx # Hero banner
│   │   ├── ProcurementWheel.tsx # ATILA lifecycle diagram
│   │   ├── MarqueeSection.tsx # Scrolling logos
│   │   ├── AboutSection.tsx # About content
│   │   ├── ServicesSection.tsx # Services list
│   │   ├── FeaturesSection.tsx # Features grid
│   │   ├── CTASection.tsx  # Call-to-action
│   │   ├── ContactSection.tsx # Contact form
│   │   ├── Footer.tsx      # Site footer
│   │   └── DynamicSection.tsx # Dynamic section renderer
│   └── ui/                 # Utility UI components
│       ├── ThemeToggle.tsx  # Dark/Light toggle
│       ├── LanguageSelector.tsx # Language dropdown
│       ├── ContactButton.tsx # WhatsApp/SMS/Call FAB
│       ├── GoogleTranslate.tsx # Google Translate wrapper
│       └── PrefetchLink.tsx # Prefetch-enabled link
│
├── lib/                    # Utilities & services
│   ├── cache.ts           # React cache for data fetching
│   ├── database/          # Database connection
│   │   └── connect.ts     # MongoDB connection singleton
│   └── auth/              # Authentication
│       └── AuthContext.tsx # JWT auth context provider
│
├── models/                 # Mongoose schemas
│   ├── Page.ts            # Page model
│   ├── Section.ts         # Section model
│   ├── Media.ts           # Media/file model
│   ├── Settings.ts        # Settings key-value model
│   └── User.ts            # User model with password hashing
│
├── store/                  # Redux state management
│   ├── StoreProvider.tsx   # Redux provider wrapper
│   ├── store.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   └── slices/            # State slices
│       ├── uiSlice.ts     # UI state (theme, sidebar)
│       ├── pagesSlice.ts  # Pages CRUD state
│       ├── sectionsSlice.ts # Sections CRUD state
│       └── settingsSlice.ts # Settings state
│
└── controllers/           # Business logic
    ├── pageController.ts  # Page operations
    ├── sectionController.ts # Section operations
    ├── mediaController.ts # Media operations
    ├── settingsController.ts # Settings operations
    └── authController.ts  # Auth operations
```

---

## 3. File-by-File Technical Explanation

### 3.1 App Router Files

#### `src/app/layout.tsx`
```
Purpose: Root layout that wraps ALL pages
Why Needed:
  - Provides Redux StoreProvider to entire app
  - Provides AuthProvider for authentication
  - Sets global metadata (title, description, favicon)
  - Loads Google Translate widget (hidden)
  - Adds ContactButton FAB (floating action button)

Technical Details:
  - Server Component (no 'use client')
  - Inter font from Google Fonts
  - Favicon: /png/productLogo.png
  - No <html> tag needed (Next.js adds it)
```

#### `src/app/page.tsx`
```
Purpose: Homepage with all sections
Why Needed:
  - Entry point for the application
  - Server-side data fetching from MongoDB
  - Renders all homepage sections

Technical Details:
  - Server Component (no 'use client')
  - Uses getHomeData() with React cache
  - revalidate = 60 (60s cache)
  - Dynamic imports for below-fold sections
  - Default data fallback if no DB data

Data Flow:
  getHomeData() → Promise.all([Section.find(), Settings.find()])
  → settingsMap → sections → renderSection()
```

#### `src/app/loading.tsx`
```
Purpose: Loading skeleton shown during page load
Why Needed:
  - Instant feedback (no blank screen)
  - Improves perceived performance
  - Matches final layout structure

Technical Details:
  - Client Component (needs animation)
  - Tailwind animate-pulse
  - Mirrors actual page layout
  - White/Dark theme support
```

#### `src/app/globals.css`
```
Purpose: Global styles and animations
Why Needed:
  - Tailwind directives (@tailwind base/components/utilities)
  - Custom animations (marquee)
  - Theme transitions
  - Google Translate hiding
  - Utility classes (gradient-text, glass, shadow-card)

Technical Details:
  - CSS variables for colors
  - @keyframes for marquee animation
  - .theme-transition class for smooth toggles
  - Google Translate banner hiding
```

### 3.2 Frontend Components

#### `Navbar.tsx`
```
Purpose: Main navigation bar
Why Needed:
  - Site navigation
  - Theme toggle
  - Language selector
  - Admin access
  - Mobile responsive menu

Technical Details:
  - Client Component (useState, useEffect)
  - Scroll detection (transparent → solid)
  - Redux for sidebar state
  - Prefetch on hover for speed
  - Mobile hamburger menu

State Management:
  - uiSlice: sidebarOpen
  - Local: scrolled

Dependencies:
  - ThemeToggle, LanguageSelector
  - Link (next/link)
  - useRouter for prefetch
```

#### `HeroSection.tsx`
```
Purpose: Main hero banner with CTA
Why Needed:
  - First impression
  - Value proposition
  - Call-to-action buttons
  - Key statistics

Technical Details:
  - Client Component (though no hooks needed)
  - Gradient backgrounds
  - Responsive grid (lg:grid-cols-2)
  - Decorative blur elements
  - Product logo image

Props:
  - data: { title, subtitle, content, buttonText, buttonLink, ... }
```

#### `ProcurementWheel.tsx`
```
Purpose: ATILA procurement lifecycle diagram
Why Needed:
  - Visual representation of P2P/O2C
  - Shows 8 procurement stages
  - Buyers/Suppliers connection
  - Similar to Coupa's network effect

Technical Details:
  - Client Component (hover effects)
  - SVG-based circular diagram
  - 8 pie segments (45° each)
  - Center: Product logo + ATILA text
  - Outer labels: BUYERS, VALUE EXCHANGE, DATA, INSIGHTS
  - Bottom tags: P2P, O2C, ERP, S2P

Math:
  - Start angle: (i * 45 - 90) * (π/180)
  - End angle: ((i+1) * 45 - 90) * (π/180)
  - Text position: midAngle * radius
```

#### `MarqueeSection.tsx`
```
Purpose: Scrolling partner/client logos
Why Needed:
  - Social proof
  - Partner showcase
  - Visual interest

Technical Details:
  - CSS animation (translateX)
  - 35s linear infinite loop
  - Pause on hover
  - Fade edges (gradient overlays)
  - Duplicate array for seamless loop
  - No grayscale filter

Animation:
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
```

#### `Footer.tsx`
```
Purpose: Site footer
Why Needed:
  - Quick links
  - Contact information
  - Copyright notice
  - Social/legal links

Technical Details:
  - Client Component (for interactivity)
  - 4-column grid (md:grid-cols-4)
  - Icon + text for contact
  - Gold accent color (#d69e2e)
  - Dark background (#111827)
```

### 3.3 UI Components

#### `ThemeToggle.tsx`
```
Purpose: Dark/Light mode switcher
Why Needed:
  - User preference
  - Accessibility
  - Modern UX

Technical Details:
  - Client Component
  - Redux dispatch (toggleTheme)
  - LocalStorage persistence
  - Icon animation (rotate + scale)
  - React.memo for performance
  - theme-transition class on toggle

State Flow:
  Click → dispatch(toggleTheme()) → uiSlice reducer
  → localStorage.setItem('atila-theme')
  → document.documentElement.classList.toggle('dark')
```

#### `LanguageSelector.tsx`
```
Purpose: Language dropdown for translation
Why Needed:
  - Multi-language support
  - Indian market focus (8 languages)

Technical Details:
  - Client Component
  - Click outside to close
  - Calls setLanguage() from GoogleTranslate
  - Retry logic (10 attempts, 500ms interval)
  - Flag emojis for visual appeal

Languages:
  en (English), te (Telugu), hi (Hindi), ta (Tamil),
  kn (Kannada), ml (Malayalam), mr (Marathi), bn (Bengali)
```

#### `ContactButton.tsx`
```
Purpose: Floating contact options FAB
Why Needed:
  - Quick contact access
  - WhatsApp (primary channel in India)
  - SMS fallback
  - Direct call option

Technical Details:
  - Client Component
  - Fixed position (bottom-right)
  - Expandable menu
  - Phone number: 91939258253
  - Pre-filled WhatsApp message
  - Animation on open/close

Links:
  - WhatsApp: wa.me/{phone}?text={message}
  - SMS: sms:{phone}?body={message}
  - Call: tel:{phone}
```

#### `GoogleTranslate.tsx`
```
Purpose: Google Translate integration
Why Needed:
  - Multi-language support without custom translation
  - 8 Indian languages

Technical Details:
  - Client Component
  - Lazy loads Google Translate script
  - Hidden widget (positioned off-screen)
  - Export setLanguage() function
  - Initialization with retry

Script Loading:
  1. Check if script exists
  2. Define window.googleTranslateElementInit
  3. Create <script> element
  4. Append to document.body
  5. Initialize widget when ready
```

### 3.4 Database Models

#### `Page.ts`
```
Purpose: Store website pages
Why Needed:
  - Dynamic page creation
  - CMS-like functionality
  - SEO metadata

Schema:
  slug: String (unique, indexed)
  title: String (required)
  content: String
  isPublished: Boolean (default: true)
  metaTitle: String (SEO)
  metaDescription: String (SEO)
  timestamps: true (createdAt, updatedAt)
```

#### `Section.ts`
```
Purpose: Store page sections
Why Needed:
  - Modular page building
  - Reorderable sections
  - Dynamic content

Schema:
  pageSlug: String (reference to Page)
  sectionType: String (hero, about, services, features, cta, contact)
  title: String
  subtitle: String
  content: String
  order: Number (for sorting)
  isActive: Boolean
  items: Array<{ title, description, icon }> (for lists)
  buttonText: String
  buttonLink: String
  imageUrl: String
```

#### `Media.ts`
```
Purpose: Store uploaded files
Why Needed:
  - Media library
  - File management
  - Track uploads

Schema:
  filename: String (stored name)
  originalName: String (user's filename)
  mimeType: String (image/png, etc.)
  size: Number (bytes)
  path: String (file path)
  alt: String (alt text)
  uploadedBy: ObjectId (User reference)
```

#### `User.ts`
```
Purpose: Admin user accounts
Why Needed:
  - Authentication
  - Role-based access

Schema:
  email: String (unique, indexed)
  password: String (hashed with bcrypt)
  name: String
  role: String (admin, editor)
  refreshToken: String (JWT)

Methods:
  - comparePassword(candidatePassword)
  - Pre-save hook: hash password
```

### 3.5 Redux Store

#### `uiSlice.ts`
```
Purpose: UI state management
Why Needed:
  - Theme persistence
  - Sidebar toggle
  - Modal state

State:
  sidebarOpen: boolean
  modalOpen: boolean
  theme: 'light' | 'dark'

Reducers:
  - toggleSidebar
  - closeSidebar
  - openModal
  - closeModal
  - toggleTheme (with localStorage)
  - setTheme
  - initTheme (from localStorage/system)
```

#### `pagesSlice.ts`
```
Purpose: Pages CRUD state
Why Needed:
  - Admin page management
  - Optimistic updates
  - Loading/error states

State:
  pages: Page[]
  loading: boolean
  error: string | null

Async Thunks:
  - fetchPages
  - addPage
  - updatePage
  - deletePage
```

### 3.6 Library Files

#### `cache.ts`
```
Purpose: React cache for data deduplication
Why Needed:
  - Prevent duplicate DB queries
  - Performance optimization
  - Server-side caching

Functions:
  - getHomeData(): cached homepage data
  - getPageData(slug): cached page data
  - getSettings(): cached settings

Implementation:
  export const getHomeData = cache(async () => {
    // DB queries
  });
```

#### `database/connect.ts`
```
Purpose: MongoDB connection singleton
Why Needed:
  - Reuse connection across requests
  - Prevent connection exhaustion
  - Handle reconnection

Implementation:
  let cached = global.mongoose;
  if (!cached) cached = global.mongoose = { conn: null, promise: null };
  
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(mongoose => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
```

#### `AuthContext.tsx`
```
Purpose: Authentication context provider
Why Needed:
  - Centralized auth state
  - Token management
  - Auto-refresh

Features:
  - Login/Register/Logout
  - Auto-refresh every 14 minutes
  - HttpOnly cookie storage
  - Access token: 15 min
  - Refresh token: 7 days

Implementation:
  - useAuth() hook
  - AuthProvider wrapper
  - ProtectedRoute component
```

---

## 4. Design Patterns Used

### 4.1 Controller-Service-Repository
```
Controller → Service → Repository → Database
    ↓           ↓           ↓
  Routes    Business    Data Access
  (API)     Logic       (Mongoose)
```

Why:
- Separation of concerns
- Testability
- Reusability

### 4.2 Provider Pattern
```
Redux StoreProvider
  └── AuthProvider
      └── GoogleTranslate
          └── {children}
```

Why:
- Global state access
- Context sharing
- Nested providers

### 4.3 Dynamic Imports
```
const AboutSection = dynamic(() => import('@/components/frontend/AboutSection'));
```

Why:
- Code splitting
- Faster initial load
- Below-fold content lazy loaded

### 4.4 React Cache
```
export const getHomeData = cache(async () => { ... });
```

Why:
- Request deduplication
- Performance optimization
- Single DB query per render

### 4.5 Memo Pattern
```
const ThemeToggle = memo(function ThemeToggle() { ... });
```

Why:
- Prevent unnecessary re-renders
- Performance optimization

---

## 5. Data Flow Architecture

### 5.1 Server-Side Flow (Page Load)
```
1. Request → Next.js Server
2. Run Server Component (page.tsx)
3. Call getHomeData() → React Cache
4. If cache miss → MongoDB Query
5. Return { sections, settings }
6. Render components with data
7. Send HTML to client
8. Hydrate on client
```

### 5.2 Client-Side Flow (Navigation)
```
1. User clicks Link
2. Router.prefetch() (on hover)
3. Route change → loading.tsx shown
4. Fetch new page data (cached)
5. Render new page
6. Hide loading skeleton
```

### 5.3 Theme Toggle Flow
```
1. Click ThemeToggle
2. Add theme-transition class
3. Dispatch toggleTheme()
4. uiSlice: state.theme = opposite
5. localStorage.setItem('atila-theme')
6. document.documentElement.classList.toggle('dark')
7. CSS transitions animate (400ms)
8. Remove theme-transition class
```

### 5.4 Auth Flow
```
1. Login → POST /api/auth/login
2. Server validates credentials
3. Generate access (15min) + refresh (7day) tokens
4. Set HttpOnly cookies
5. Client stores user in AuthContext
6. Auto-refresh every 14 minutes
7. Logout → Clear cookies, redirect
```

---

## 6. Security Implementation

### 6.1 Authentication
| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| Token Storage | HttpOnly cookies |
| Access Token | 15 minutes |
| Refresh Token | 7 days |
| Auto-Refresh | Every 14 minutes |
| CORS | Same-origin only |

### 6.2 Data Validation
| Layer | Validation |
|-------|------------|
| Mongoose Schema | Required fields, types, unique |
| API Routes | Input sanitization |
| Client | Form validation (required attributes) |

### 6.3 Headers
| Header | Value | Purpose |
|--------|-------|---------|
| `poweredByHeader` | false | Hide Next.js |
| `Content-Security-Policy` | default-src 'self' | XSS prevention |
| `X-Frame-Options` | DENY | Clickjacking prevention |

---

## 7. Performance Architecture

### 7.1 Caching Strategy
| Layer | TTL | Purpose |
|-------|-----|---------|
| React Cache | Per-request | Deduplication |
| Next.js ISR | 60 seconds | Page cache |
| Browser | Static assets | Hash-based |
| CDN | (if deployed) | Edge caching |

### 7.2 Code Splitting
```
Main Bundle: Navbar, Hero, Footer
Lazy Loaded: About, Services, Features, CTA, Contact
Dynamic: Admin pages
```

### 7.3 Image Optimization
| Technique | Implementation |
|-----------|----------------|
| Lazy Loading | `loading="lazy"` |
| Format | WebP/AVIF (next.config.js) |
| Unoptimized | `unoptimized: true` (for static) |

### 7.4 Animation Performance
| Technique | Implementation |
|-----------|----------------|
| CSS Transitions | Hardware-accelerated |
| Passive Listeners | `{ passive: true }` |
| requestAnimationFrame | For smooth animations |
| will-change | For transform/opacity |

### 7.5 Bundle Optimization
| Technique | Implementation |
|-----------|----------------|
| Tree Shaking | Unused code elimination |
| Minification | Terser |
| Compression | Gzip (compress: true) |
| Package Optimization | `optimizePackageImports: ['react-icons']` |

---

## Appendix: Key Decisions

| Decision | Why |
|----------|-----|
| Next.js App Router | Modern React patterns, SSR, layouts |
| MongoDB | Schema flexibility, JSON native |
| Redux Toolkit | Predictable state, devtools |
| Tailwind CSS | Rapid prototyping, consistency |
| Google Translate | Multi-language without custom i18n |
| HttpOnly Cookies | XSS-safe token storage |
| React Cache | Server-side deduplication |
| Dynamic Imports | Code splitting, performance |

---

*Document Version: 1.0*
*Last Updated: August 2026*
*Author: Aatral Technologies*
