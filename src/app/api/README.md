# API (App Router)

This directory contains Next.js 15 App Router API routes migrated from the legacy `pages/api` implementation.

Conventions:

- Route handlers export `GET`, `POST`, etc. and return `NextResponse` via helpers in `src/lib/api/respond.ts`.
- Use `withErrorHandling()` to ensure consistent 500 handling and logging.
- Prefer `fetch()` instead of `axios` for server-side calls.
- Set `export const dynamic = "force-dynamic"` for routes that must not be cached.

Helpers:

- `json(data, status?)` – respond with JSON.
- `error(message, status?, extras?)` – standardized error shape.
- `badRequest()`, `notFound()`, `methodNotAllowed()` – common responses.

Environment:

- SoundCloud: `SOUNDCLOUD_CLIENT_ID`, `SOUNDCLOUD_API_KEY`
- Apple: `APPLE_AUTH`, `APPLE_MEDIA_USER_TOKEN`
- Genius: `GENIUS_ACCESS_TOKEN`
- Musixmatch: `MUSIX_API_KEY`

Examples:

- `GET /api/soundcloud/search?q=yeat&type=mini|full`
- `GET /api/apple/lyrics/{query}`
- `GET /api/musix/song/info?isrc=USUG12101234`

Add new routes under `src/app/api/<segment>/route.ts` or nested `[param]` segments as needed.
