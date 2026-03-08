# POS — People Operating System

## What is this
A quadrant-based web interface for community self-governance. React + Vite SPA with Supabase auth. Early stage — UI scaffolding with four quadrant views.

## Architecture

### Layout
The app uses a 2×2 quadrant grid with a clickable center:
- **UL (Upper Left)** — Capas de Identidad: Identity, Avatars, Roles, Tasks
- **UR (Upper Right)** — Nube de Issues: Topics → Issues → Argument Maps
- **LL (Lower Left)** — Contribuciones: Dar & Recibir, Issues Cloud, Repository
- **LR (Lower Right)** — Vista de Celula: Infrastructure, Guild Kernel, Compounds
- **Center click** → Dashboard (finances/member view)

Each quadrant can expand to full screen. Back button returns to grid.

### File Structure
```
src/
  App.jsx              — Main app, quadrant routing, auth gate
  App.css              — Quadrant grid layout, cross dividers
  main.jsx             — Entry point, wraps with AuthProvider
  supabaseClient.js    — Supabase client singleton
  context/
    AuthContext.jsx     — Supabase auth (Google OAuth)
    SimulationContext.jsx — Shared state (from Rubania integration)
  components/
    Auth.jsx + Auth.css — Login screen
    Dashboard.jsx + Dashboard.css — Member dashboard (center zoom target)
    quadrants/
      index.js          — Re-exports all quadrant components
      UpperLeft.jsx + .css  — Identity layers
      UpperRight.jsx + .css — Issues cloud
      LowerLeft.jsx + .css  — Contributions
      LowerRight.jsx + .css — Cell view
      CellView.jsx      — Detailed cell infrastructure view
```

### Auth
- Supabase Google OAuth
- `useAuth()` hook from AuthContext
- `user` object gates access: no user → Auth screen

### Dependencies
- React 18, Vite 5, Supabase JS v2
- No additional UI libraries

## Commands
```bash
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview build
```

## Notes
- Author: Chaorder Networks
- License: CC-BY-NC-SA-4.0
- Language: Spanish (es) in HTML, mixed Spanish/English in UI
- The LR quadrant (Cell View) connects conceptually to the Rubania simulation
- CellView.jsx is the largest component (~68KB) — likely contains embedded visualization logic
