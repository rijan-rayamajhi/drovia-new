# DROVIA Design System

## Brand Identity

**Brand Name**: DROVIA  
**Tagline**: Premium Fashion  
**Visual Style**: Modern, Luxurious, Minimalist

---

## Color Palette

### Primary Colors
```css
/* Backgrounds */
--color-ivory: #FAF9F7;        /* Main background */
--color-surface: #FFFFFF;      /* Cards, surfaces */

/* Accent Colors */
--color-accent: #0F4C81;       /* Deep Blue - Primary brand */
--color-accent-dark: #0A3A66; /* Dark variant */
--color-accent-light: #1769A7; /* Light variant */

/* Gold Accents */
--color-gold: #D4AF37;         /* CTAs, highlights */
--color-gold-light: #E5C866;
--color-gold-dark: #B8941F;

/* Text Colors */
--color-text-primary: #111827;  /* Main content */
--color-text-muted: #6B7280;    /* Secondary */
--color-text-light: #9CA3AF;     /* Tertiary */

/* Status Colors */
--color-success: #16A34A;
--color-warning: #F59E0B;
--color-error: #EF4444;
```

### Usage Guidelines
- **Ivory**: Primary background for all pages
- **Deep Blue**: Primary actions, links, brand elements
- **Gold**: Sparingly used for CTAs, highlights, premium badges
- **White**: Cards, modals, elevated surfaces

---

## Typography

### Display Font (Headlines)
- **Font Family**: Playfair Display
- **Weights**: 400, 500, 600, 700
- **Usage**: Hero headlines, section titles, product names, brand name
- **Letter Spacing**: -0.02em
- **Sizes**: 
  - Hero: 5xl (3rem) → 8xl (6rem)
  - Section: 4xl (2.25rem) → 6xl (3.75rem)
  - Card Titles: 2xl (1.5rem)

### Body Font
- **Font Family**: Inter / Poppins
- **Weights**: 300, 400, 500, 600, 700
- **Usage**: Body text, descriptions, UI elements
- **Base Size**: 15px
- **Line Height**: 1.6 (relaxed)

### Typography Scale
```
Display: 3rem - 6rem (48px - 96px)
H1: 2.25rem - 3.75rem (36px - 60px)
H2: 1.875rem - 2.25rem (30px - 36px)
H3: 1.5rem - 1.875rem (24px - 30px)
Body: 0.9375rem (15px)
Small: 0.875rem (14px)
```

---

## Spacing System

### Scale (8px base)
- **4px** - Micro spacing (0.25rem)
- **8px** - Small spacing (0.5rem)
- **16px** - Base spacing (1rem)
- **24px** - Medium spacing (1.5rem)
- **32px** - Large spacing (2rem)
- **48px** - Extra large (3rem)
- **64px** - Section spacing (4rem)

### Section Padding
```css
/* Mobile */
padding: 4rem 1rem;

/* Tablet */
padding: 6rem 1.5rem;

/* Desktop */
padding: 8rem 2rem;

/* Large Desktop */
padding: 8rem 5rem;
```

---

## Border Radius

- **Small**: 8px (rounded-lg)
- **Medium**: 12px (rounded-xl) - **Standard**
- **Large**: 16px (rounded-2xl) - Cards
- **Extra Large**: 24px (rounded-3xl) - Modals

---

## Shadows

```css
/* Soft */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

/* Medium */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

/* Luxury */
box-shadow: 0 10px 30px rgba(16, 24, 40, 0.06);

/* Luxury Large */
box-shadow: 0 20px 40px rgba(16, 24, 40, 0.12);

/* Glass */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
```

---

## Animation System

### Timing
- **Primary Duration**: 520ms
- **Fast**: 300ms
- **Slow**: 700ms
- **Stagger Delay**: 60ms between items

### Easing Function
```css
cubic-bezier(0.2, 0.9, 0.12, 1)
```

### Key Animations

#### Fade Up
```css
from: { opacity: 0, transform: translateY(30px) }
to: { opacity: 1, transform: translateY(0) }
duration: 520ms
```

#### Scale
```css
from: { scale: 0.95 }
to: { scale: 1 }
duration: 520ms
```

#### Parallax
```css
Scroll-driven Y transform: 0% → 20%
```

#### Staggered Reveal
```css
delay: index * 60ms
duration: 520ms
```

---

## Component Library

### Navigation Bar (DroviaHeader)

#### Features
- **Glassmorphism**: `backdrop-blur-xl`, `bg-surface/80`
- **Gold Animated Underline**: Smooth scale animation on hover
- **Spotlight Glow**: Radial gradient follows cursor
- **Scroll Shrink**: Logo scales, padding reduces
- **MegaMenu**: Thin drawer with category tiles

#### Structure
```
Logo (Left) | Center Navigation | Icons (Right)
```

#### Navigation Categories
- Men
- Women
- Collections
- New Arrivals
- Sale

#### Right Icons
- Search
- Wallet/Points (if logged in)
- Wishlist
- Cart
- Account Avatar

### Button/Primary

```tsx
<Button variant="primary">
  Primary Action
</Button>
```

**Styles**:
- Background: Deep Blue (#0F4C81)
- Padding: `px-8 py-4`
- Border Radius: 12px
- Font Size: 15px
- Hover: Lift `-translate-y-0.5`, gold border glow
- Transition: 520ms

### ProductCard

**Features**:
- Aspect Ratio: 2:3
- Border Radius: 16px
- Hover: Scale 1.03, shadow lift
- Quick Actions: Glass-blur overlay
- Badges: New (gold), Limited (red), Discount (accent)

**Structure**:
```
[Image with badges]
[Title]
[Fabric Tag]
[Price: Original + Sale]
```

### Modal

**Features**:
- Backdrop: Black/60 with blur
- Border Radius: 24px
- Animation: Scale 0.95→1, fade in
- Max Width: 1280px (5xl)

### Input

**Features**:
- Floating Labels
- Glass-like background
- Inner shadow
- Border Radius: 12px
- Focus: Accent ring, soft shadow

### TableRow

**Features**:
- Padding: `py-4 px-6`
- Hover: Background change, subtle lift
- Actions: Kebab menu on hover

---

## Responsive Breakpoints

- **Mobile**: 375px
- **Tablet**: 768px
- **Desktop**: 1440px

---

## Motion Guidelines

### Scroll-Driven Animations
- **Parallax**: 10-20px shift on scroll
- **Reveal**: Fade-up on scroll into viewport
- **Stagger**: 60ms delay between items

### Micro-interactions
- **Hover**: 300ms transition
- **Click**: Scale feedback (0.95)
- **Loading**: Skeleton loaders with shimmer
- **Toast**: Slide-up from bottom-right

### Card Hover Effects
```css
transform: scale(1.03);
box-shadow: 0 20px 40px rgba(16, 24, 40, 0.12);
```

---

## Glassmorphism

### Implementation
```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Usage
- Navigation bar
- Modals
- Dropdowns
- Cards (optional)

---

## Gold Accent Guidelines

### When to Use Gold
- ✅ Primary CTAs
- ✅ Premium badges (New, Limited)
- ✅ Navigation hover underlines
- ✅ Spotlight glow effect
- ✅ Wallet balance display
- ✅ "Powered by SPOTWEBS" link

### When NOT to Use Gold
- ❌ Body text
- ❌ Secondary buttons
- ❌ Error states
- ❌ Overuse (max 2-3 instances per page)

---

## Accessibility

### WCAG AA Compliance
- **Text Contrast**: Minimum 4.5:1
- **Focus States**: Visible ring (2px accent)
- **Keyboard Navigation**: Full support
- **Reduced Motion**: Respects `prefers-reduced-motion`

### ARIA Labels
- All interactive elements have aria-labels
- Modal dialogs properly announced
- Form fields properly labeled

---

## Developer Handoff

### CSS Variables (Recommended)
```css
:root {
  --color-ivory: #FAF9F7;
  --color-surface: #FFFFFF;
  --color-accent: #0F4C81;
  --color-gold: #D4AF37;
  --color-text-primary: #111827;
  --color-text-muted: #6B7280;
  
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */
  --spacing-3xl: 4rem;    /* 64px */
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --duration-fast: 300ms;
  --duration-base: 520ms;
  --duration-slow: 700ms;
  
  --easing-luxury: cubic-bezier(0.2, 0.9, 0.12, 1);
}
```

### Tailwind Classes
```js
// Colors
bg-ivory, bg-surface, bg-accent, text-gold
text-text-primary, text-text-muted

// Spacing
px-4, py-8, gap-6, space-y-4

// Radius
rounded-xl (12px), rounded-2xl (16px), rounded-3xl (24px)

// Shadows
shadow-soft, shadow-medium, shadow-luxury, shadow-luxury-lg

// Animations
duration-300, duration-[520ms], ease-luxury
```

---

## Design Principles

1. **Restraint**: Less is more - generous whitespace
2. **Motion**: Smooth, intentional, never jarring
3. **Clarity**: Clear hierarchy, readable typography
4. **Consistency**: Unified design language throughout
5. **Premium**: Quality through details, not decoration
6. **Accessibility**: WCAG AA minimum compliance

---

## Component Specifications

### Navigation Bar
- **Height**: 80px (desktop), shrinks to 64px on scroll
- **Background**: Glassmorphism (80% opacity, 20px blur)
- **Border**: Bottom border, 50% opacity
- **Logo**: Scales from 3xl → 2xl on scroll
- **Menu Items**: 15px font, gold underline on hover
- **Icons**: 20px (5x5), rounded-xl hover state

### Product Card
- **Dimensions**: Aspect ratio 2:3
- **Padding**: 20px (p-5) → 24px (p-6) on desktop
- **Image**: Scale 1.03 on hover, 700ms transition
- **Badges**: Top-left, stacked vertically
- **Quick Actions**: Center overlay, glass-blur background

### Button Primary
- **Padding**: `px-8 py-4`
- **Font**: 15px, medium weight
- **Border Radius**: 12px
- **Hover**: Lift 2px, shadow increase, gold border glow

---

## Page Layouts

### Homepage
- Hero: Full-bleed, parallax background
- Auto-scrolling banner: Top of page
- Categories: 4-column grid, rounded-2xl
- Featured Products: 3-column grid, staggered reveal
- Newsletter: Bottom section

### Shop/Collection
- Filters: Sidebar (desktop), pills (mobile)
- Products: 3-column grid, staggered reveal
- Sort: Dropdown top-right

### Product Detail
- Image Gallery: Left, sticky
- Product Info: Right, pinned on scroll
- Related Products: Carousel bottom

### Cart
- Items List: Left column
- Order Summary: Right, sticky
- Actions: Update quantity, remove

### Checkout
- Form: Left column
- Order Summary: Right, sticky
- Payment: Radio cards

### Account Dashboard
- Profile Card: Top
- Wallet Card: Gold accent
- Orders: List with status badges
- Actions: Cancel, Return buttons

---

## Implementation Status

✅ **Completed**:
- Glassmorphism Navigation Bar
- Gold Animated Underlines
- MegaMenu Component
- Spotlight Hover Glow
- Scroll Shrink Effect
- Brand Name Update (DROVIA)
- Design System Documentation

🔄 **In Progress**:
- Product Detail Pinned Scroll
- Admin Dashboard Premium Styling

📋 **Pending**:
- Enhanced Product Listing Page
- Cart/Checkout Premium Styling
- Wallet Display Enhancement

---

## Usage Examples

### Navigation Bar
```tsx
import DroviaHeader from '@/components/DroviaHeader';

<DroviaHeader />
```

### Product Card
```tsx
<ProductCard product={product} index={index} />
```

### Button
```tsx
<Button variant="primary">Shop Now</Button>
```

### Modal
```tsx
<QuickViewModal 
  product={product} 
  isOpen={isOpen} 
  onClose={onClose} 
/>
```

---

## Notes

- All animations respect `prefers-reduced-motion`
- Gold accents used sparingly for premium feel
- Glassmorphism creates depth without clutter
- 520ms timing creates luxurious, comfortable motion
- Staggered animations (60ms) create elegant reveals

