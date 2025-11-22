# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Slop Hero is a Next.js game where users attempt to distinguish between real and AI-generated images. Players are presented with pairs of images and must identify which one is AI-generated within a time limit, earning points for correct guesses with bonuses for speed and streaks.

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
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
- `components/` - React components
  - `ui/` - Reusable UI primitives (button, card, badge, dialog, etc.)
  - `game-container.tsx` - Main game state management and UI orchestration
  - `image-comparison.tsx` - Side-by-side image display component
  - `game-stats.tsx` - Score, streak, and timer display
  - `result-modal.tsx` - Post-guess feedback modal
- `lib/` - Utility functions and data access
  - `utils.ts` - cn() helper for merging Tailwind classes
  - `db-stub.ts` - Database interface layer for Supabase
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

Required for Supabase integration (set in `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

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
