# Starbright Night

## Overview

Starbright Night is a creator hub/landing page application designed as a high-conversion funnel for content creators. It serves as an official link-in-bio style website that directs visitors to external platforms (dFans, Telegram) while maintaining a premium, soft-glam aesthetic. The site features a pink/warm neutral color palette with lifestyle-photo-forward design, optimized for mobile-first experiences and fast load times.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style variant) with Radix UI primitives
- **Build Tool**: Vite with custom plugins for Replit integration

### Page Structure
The application has a simple multi-page structure:
- `/` - Home page (soft pink theme, hero with lifestyle photos, CTAs)
- `/exclusive` - Private access page (dark theme, redirect to external content)
- `/privacy` - Privacy policy page (dark theme)
- `/terms` - Terms of service page (dark theme)

### Theming System
- CSS custom properties define two theme modes:
  - **Light/Home theme**: Soft pink background (#fff5f8), rose accent (#E2558E)
  - **Dark theme**: Deep charcoal/slate (#0f172a), applied to non-home pages
- Typography uses "DM Sans" for body text and "Outfit" for headings
- Theme switching via `.dark-theme` CSS class

### Backend Architecture
- **Runtime**: Node.js with Express
- **Server**: HTTP server with Vite dev middleware in development
- **Static Serving**: Production builds served from `dist/public`
- **API Pattern**: RESTful endpoints prefixed with `/api`

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Schema**: Basic users table (id, username, password)
- **Development Storage**: In-memory storage implementation available (`MemStorage` class)
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Build System
- **Client Build**: Vite produces static assets to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Optimization**: Server dependencies allowlist for bundling to reduce cold start times

## External Dependencies

### Third-Party Services
- **dFans**: External content platform (linked from /exclusive page)
- **Telegram**: Community/updates channel (linked from home page)

### Database
- **PostgreSQL**: Required for production (DATABASE_URL environment variable)
- **Drizzle Kit**: Database migrations in `/migrations` directory

### Key NPM Packages
- **UI Framework**: @radix-ui/* components, class-variance-authority, clsx, tailwind-merge
- **Data Fetching**: @tanstack/react-query
- **Forms**: react-hook-form with @hookform/resolvers, zod for validation
- **Date Handling**: date-fns
- **Build Tools**: Vite, esbuild, TypeScript

### Fonts
- Google Fonts: DM Sans, Outfit (loaded via CDN in index.html)

### Assets
- Hero and grid images stored in `client/src/assets/`
- Teaser video content supported (mp4 format)
- OpenGraph images in `client/public/` for social sharing