# Premium Fashion E-Commerce Website

A premium, high-end, fully responsive e-commerce website for a fashion clothing brand with a comprehensive admin dashboard.

## Features

### Frontend
- **Homepage**: Hero banner with parallax, category tiles, featured products, newsletter
- **Shop Page**: Advanced filtering (category, size, price), sorting, product grid
- **Product Detail**: Image gallery, size selector, quantity selector, related products
- **Cart**: Product management, order summary, checkout flow
- **Checkout**: Customer information form, payment options (UPI/COD), order summary
- **Contact**: Contact form, WhatsApp FAB, contact information
- **Policy Pages**: Refund, Terms & Conditions, Privacy Policy

### Admin Dashboard
- **Dashboard**: Sales overview, daily orders chart, product stock, latest orders
- **Products**: Add/Edit/Delete products with modal form
- **Orders**: Order management with status updates (Pending/Shipped/Delivered)
- **Customers**: Customer list with order history and spending
- **Reports**: Sales charts, top products, revenue summary

## Design System

- **Colors**: Royal blue (#1E3A8A), dark text (#1A1A1A), clean white background
- **Typography**: Inter/Poppins font family
- **Spacing**: 8/16/24/32px system
- **Shadows**: Soft shadows for depth
- **Animations**: Fade-up animations, staggered card appearances, smooth transitions
- **Responsive**: Mobile-first design with breakpoints for tablet and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── checkout/       # Checkout flow
│   ├── contact/        # Contact page
│   ├── policies/       # Policy pages
│   ├── product/        # Product detail pages
│   ├── shop/           # Shop page
│   ├── cart/           # Cart page
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── components/         # Reusable components
├── types/              # TypeScript types
└── public/             # Static assets
```

## Pages

### Frontend Routes
- `/` - Homepage
- `/shop` - Shop page with filters
- `/product/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/checkout/success` - Order success page
- `/contact` - Contact page
- `/policies/refund` - Refund policy
- `/policies/terms` - Terms & conditions
- `/policies/privacy` - Privacy policy

### Admin Routes
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer list
- `/admin/reports` - Reports and analytics

## Components

- `Header` - Sticky navigation with cart icon
- `Footer` - Footer with links and social media
- `ProductCard` - Reusable product card component
- `Button` - Button component with variants
- `Input` - Input component with floating labels

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## License

MIT

# drovia-new
