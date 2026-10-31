# Neelonaut Studio Frontend

The Studio frontend is a greenfield Vite + React + TypeScript application for `studio.neelonaut.com`. It is intentionally separate from the portfolio frontend in `Website/`.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` defaults to `http://localhost:8000/api/v1`. The backend must allow the frontend origin and credentials. Authentication uses the backend's HttpOnly `studio_session` cookie and readable CSRF cookie; the frontend never stores session secrets in local storage.

Set `VITE_ENABLE_DEMO_FIXTURES=true` only for local/demo environments. The editorial cards are explicitly labelled demo fixtures and are not used as production content.

## Structure

- `src/api.ts` — typed fetch client, cookie credentials, CSRF header, and backend response models.
- `src/App.tsx` — route-aware application shell, public discovery, auth, workspace, editor, reading, search, settings, and utility screens.
- `src/styles.css` — Studio visual system: editorial typography, light/dark theme, responsive layouts, focus states, and editor surfaces.

## Backend endpoints consumed

`/auth/me`, `/auth/signup`, `/auth/login`, `/auth/logout`, `/workspaces`, `/documents`, `/documents/{id}`, `/documents/{id}/versions`, `/publications`, `/publications/{slug}`, `/discovery/latest`, and `/ai/generate`.

The backend's current MVP contract does not yet expose profile update, bookmark, collection, notification, comment listing, reaction state, or moderation administration endpoints. Those surfaces are represented with explicit empty/placeholder states rather than fabricated data. The editor uses the backend's structured `content.blocks` format, debounced PATCH autosave, expected-version conflict detection, and a local unsaved draft fallback.

## Build and deployment

```bash
npm run build
npm run preview
```

Deploy `dist/` to a static host configured with SPA fallback to `index.html`. Set `VITE_API_URL` to the deployed backend API URL at build time, configure backend `ALLOWED_ORIGINS` to the Studio origin, and use secure cookies in production.
