# Hotel Room Availability Calendar Dashboard

A modern, responsive web app for managing and visualizing hotel room availability. Built with React, Tailwind CSS, and Supabase Edge Functions, and integrates with a live XML-based hotel inventory API.

## Features
- Calendar grid view for 7, 15, 30, or custom date ranges
- Color-coded room availability (green/yellow/red)
- Dynamic room type list and controls
- Date range picker and calendar navigation
- Smart tooltips and accessibility
- Hotel switching, team management, and agent access dialogs
- Sleek, mobile-first UI with Tailwind CSS

## API Integration
- Securely proxies and parses XML inventory data from hotel API via Supabase Edge Function
- Handles authentication, error codes, and transforms XML to JSON for frontend use

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Supabase account (for Edge Functions and database)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Deploy
- Deploy frontend to Vercel/Netlify
- Deploy Edge Functions to Supabase

## Configuration
- Update Supabase project URL and keys in `src/integrations/supabase/client.ts`
- Set hotel API credentials in Edge Function environment variables

## Folder Structure
- `src/` — React components, hooks, and pages
- `supabase/functions/` — Edge Functions for API proxying and business logic
- `public/` — Static assets (including favicon)

## License
MIT

---
_This project is not affiliated with Lovable. All branding and links have been removed._
