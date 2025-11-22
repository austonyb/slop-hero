# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Slop Hero is a Next.js game where users attempt to distinguish between real and AI-generated images. Players are presented with pairs of images and must identify which one is AI-generated within a time limit, earning points for correct guesses with bonuses for speed and streaks.

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Authentication**: Boho Auth 1.1.2 (lightweight JWT-based password protection)
- **Styling**: Tailwind CSS 4.1.9 with custom theme using OKLCH color space
- **UI Components**: Radix UI primitives with custom shadcn/ui-style components
- **Database**: Supabase (using @supabase/ssr for Next.js integration)
- **Image Optimization**: Next.js built-in Image component with Sharp
- **Analytics**: Vercel Analytics
- **Form Handling**: react-hook-form with zod validation

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
  - `page.tsx` - Main game page
  - `layout.tsx` - Root layout with metadata, fonts (Geist), and analytics
  - `globals.css` - Global styles with Tailwind v4 syntax and custom CSS variables
  - `login/page.tsx` - Password entry page for Boho Auth
  - `api/login/route.ts` - Boho Auth login endpoint (POST handler)
- `middleware.ts` - Boho Auth middleware (protects all routes except /login)
- `components/` - React components
  - `ui/` - Reusable UI primitives (button, card, badge, dialog, etc.)
  - `game-container.tsx` - Main game state management and UI orchestration
  - `image-comparison.tsx` - Side-by-side image display component
  - `game-stats.tsx` - Score, streak, and timer display
  - `result-modal.tsx` - Post-guess feedback modal
- `lib/` - Utility functions and data access
  - `utils.ts` - cn() helper for merging Tailwind classes
  - `db-stub.ts` - Database interface layer for Supabase
  - `boho.ts` - Boho Auth configuration and middleware setup
- `utils/supabase/` - Supabase client configuration
  - `client.ts` - Browser client factory
  - `server.ts` - Server-side client (for Server Components/Actions)
  - `middleware.ts` - Auth middleware helpers

### Game Flow

1. **Menu State** (`game-container.tsx:111-172`): Shows game instructions and starts game on button click
2. **Playing State** (`game-container.tsx:232-260`):
   - Loads image pairs from Supabase via `fetchImagePairs()` in `lib/db-stub.ts`
   - Displays current pair in `ImageComparison` component
   - Tracks score, streak, and 30-second countdown timer
   - Shows result modal after each guess
3. **Result State** (`game-container.tsx:174-215`): Displays final score, accuracy percentage, and play again option

### Scoring System

Implemented in `game-container.tsx:68-85`:
- Base score: 100 points per correct guess
- Time bonus: `Math.floor(timeLeft / 3)` points
- Streak bonus: `streak * 10` points
- Incorrect guesses reset streak to 0

### Authentication

Uses **Boho Auth** for lightweight password-based route protection:

**Architecture**:
- JWT-based stateless authentication (single dependency: jose library)
- Password protection (not user accounts - single shared password)
- Middleware intercepts requests to protected routes before reaching application logic

**Configuration** (`lib/boho.ts`):
- Password: `process.env.BOHO_PASSWORD`
- Secret: `process.env.BOHO_SECRET` (for JWT signing)
- Token expiration: 1 hour
- Login path: `/login` (where unauthenticated users are redirected)
- Protected paths: `["/"]` (entire site requires authentication)
- Redirect path: `/` (users land at game homepage after successful login)

**Flow**:
1. User submits password via login form (POST to `/api/login`)
2. `app/api/login/route.ts` exports Boho's POST handler
3. On successful auth, JWT cookie is set with 1-hour expiration
4. Next.js middleware (if configured) checks JWT on protected route requests
5. Invalid/missing token → redirect to `/login`
6. Valid token → request proceeds to protected route

**Implementation Files**:
- `lib/boho.ts` - Configuration and boho instance export
- `app/api/login/route.ts` - Login API route (exports `{ POST }` from boho.handlers)
- `middleware.ts` - Exports boho.middleware to intercept all requests
- `app/login/page.tsx` - Password entry form with error handling

### Data Layer

`lib/db-stub.ts` provides the database interface:
- `fetchImagePairs()`: Queries Supabase `images` table, separates real/AI images, pairs them randomly, and assigns random side positioning
- `saveScore()`: Stub for leaderboard functionality (not yet implemented)
- `fetchLeaderboard()`: Stub for leaderboard retrieval (not yet implemented)

Database schema expects an `images` table with:
- `id` (string)
- `url` (string)
- `is_ai` (boolean)
- `source` (string, nullable) - used for category extraction
- `created_at` (timestamp)

### Styling Approach

- Uses Tailwind CSS v4 with `@import "tailwindcss"` in globals.css
- Custom theme using OKLCH color space for better perceptual uniformity
- CSS variables defined in `:root` and `.dark` for theming
- Component variants use `class-variance-authority` (CVA) pattern
- `cn()` utility combines clsx + tailwind-merge for conditional classes

### Image Configuration

Remote image patterns configured in `next.config.ts:4-15`:
- `images.unsplash.com` - for real images
- `placehold.co` - for placeholder images

To add new image sources, update the `remotePatterns` array.

### Environment Variables

Required (set in `.env.local`):

**Supabase**:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Boho Auth**:
- `BOHO_PASSWORD` - Shared password for accessing protected routes
- `BOHO_SECRET` - Secret key for JWT signing (should be a long random string)

### TypeScript Configuration

Path alias configured in `tsconfig.json:25-29`:
- `@/*` maps to project root, allowing imports like `@/components/ui/button`

### State Management

Game state is managed locally in `game-container.tsx` using React hooks:
- No global state management library (Redux/Zustand) is used
- Component-level state with useState for game logic
- useEffect for timer and image loading side effects

## Key Implementation Details

- **Client Components**: Most game components use `"use client"` directive for interactivity
- **Image Pairing Logic**: Randomizes which side (left/right) the AI image appears on for each round
- **Category Extraction**: Simple keyword matching in `db-stub.ts:93-113` to categorize images (Landscape, Portrait, Animal, Food, Architecture)
- **Timer Behavior**: 30-second countdown per round, handled in `game-container.tsx:42-56`
- **Responsive Design**: Mobile-first with grid layouts that adapt at `md:` breakpoint
- **Authentication Pattern**: Boho Auth uses minimalist approach - single shared password, JWT cookies, no user database required. Entire site is password-protected at the middleware level; unauthenticated visitors are redirected to `/login`
