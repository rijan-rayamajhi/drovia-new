# Premium E-Commerce Design System

## Color Palette

### Primary Colors
- **Ivory Background**: `#FAF9F7` - Main background color
- **White Surface**: `#FFFFFF` - Card and surface backgrounds
- **Deep Blue Accent**: `#0F4C81` - Primary brand color
- **Deep Blue Light**: `#1769A7` - Hover states
- **Deep Blue Dark**: `#0A3A66` - Active states
- **Gold Accent**: `#D4AF37` - CTAs and highlights (sparingly)

### Text Colors
- **Primary Text**: `#111827` - Main content
- **Muted Text**: `#6B7280` - Secondary content
- **Light Text**: `#9CA3AF` - Tertiary content

### Status Colors
- **Success**: `#16A34A`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

## Typography

### Display Font (Headlines)
- **Font**: Playfair Display
- **Weights**: 400, 500, 600, 700
- **Usage**: Hero headlines, section titles, product names
- **Letter Spacing**: -0.02em

### Body Font
- **Font**: Inter / Poppins
- **Weights**: 300, 400, 500, 600, 700
- **Usage**: Body text, descriptions, UI elements
- **Size**: 15px base, 14px small

## Spacing System

### Scale
- **4px** - Micro spacing
- **8px** - Small spacing
- **16px** - Base spacing
- **24px** - Medium spacing
- **32px** - Large spacing
- **48px** - Extra large spacing
- **64px** - Section spacing

### Section Padding
- **Mobile**: `px-4 py-16`
- **Tablet**: `px-6 py-24`
- **Desktop**: `px-8 py-32`
- **Large Desktop**: `px-20 py-32`

## Border Radius

- **Small**: `8px` (rounded-lg)
- **Medium**: `12px` (rounded-xl)
- **Large**: `16px` (rounded-2xl)
- **Extra Large**: `24px` (rounded-3xl)

## Shadows

- **Soft**: `0 2px 8px rgba(0, 0, 0, 0.04)`
- **Medium**: `0 4px 16px rgba(0, 0, 0, 0.08)`
- **Luxury**: `0 10px 30px rgba(16, 24, 40, 0.06)`
- **Luxury Large**: `0 20px 40px rgba(16, 24, 40, 0.12)`
- **Glass**: `0 8px 32px rgba(0, 0, 0, 0.08)`

## Animation System

### Timing
- **Duration**: 520ms (primary)
- **Easing**: `cubic-bezier(0.2, 0.9, 0.12, 1)`
- **Stagger Delay**: 60ms between items

### Transitions
- **Fast**: 350ms
- **Standard**: 520ms
- **Slow**: 700ms

### Key Animations
- **Fade Up**: Opacity 0→1, translateY 30px→0
- **Scale**: Scale 0.95→1
- **Slide Up**: translateY 20px→0
- **Parallax**: Scroll-driven Y transform

## Component Library

### Button/Primary
- **Padding**: `px-8 py-4`
- **Border Radius**: `12px` (rounded-xl)
- **Font Size**: `15px`
- **Hover**: Lift `-translate-y-0.5`, shadow increase
- **Gold Border**: On hover (subtle)

### ProductCard
- **Aspect Ratio**: 2:3
- **Border Radius**: `16px` (rounded-2xl)
- **Hover**: Scale 1.03, shadow lift
- **Quick Actions**: Glass-blur overlay on hover
- **Badges**: New (gold), Limited (red), Discount (accent)

### Modal
- **Backdrop**: Black/60 with blur
- **Border Radius**: `24px` (rounded-3xl)
- **Animation**: Scale 0.95→1, fade in
- **Max Width**: `5xl` (1280px)

### Input
- **Padding**: `px-5 py-4`
- **Border Radius**: `12px` (rounded-xl)
- **Floating Labels**: Animated on focus
- **Focus**: Accent ring, soft shadow

### TableRow
- **Padding**: `py-4 px-6`
- **Hover**: Background change, subtle lift
- **Actions**: Kebab menu on hover

## Responsive Breakpoints

- **Mobile**: 375px
- **Tablet**: 768px
- **Desktop**: 1440px

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

## Motion Guidelines

### Scroll-Driven Animations
- **Parallax**: 10-20px shift on scroll
- **Reveal**: Fade-up on scroll into viewport
- **Stagger**: 60ms delay between items

### Micro-interactions
- **Hover**: 350ms transition
- **Click**: Scale feedback (0.95)
- **Loading**: Skeleton loaders with shimmer
- **Toast**: Slide-up from bottom-right

## Design Principles

1. **Restraint**: Less is more - generous whitespace
2. **Motion**: Smooth, intentional, never jarring
3. **Clarity**: Clear hierarchy, readable typography
4. **Consistency**: Unified design language throughout
5. **Premium**: Quality through details, not decoration

