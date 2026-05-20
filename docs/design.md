# Go Nomad ADV design

## Experience Model

The first screen is a service explanation and interest capture workspace. It should help a visitor quickly answer: "Would I use this if Go Nomad launched it?"

The experience combines:

- a compact service promise and market signal summary
- one-sentence service descriptions
- P0, P1, and P2 service groups
- one binary decision card: interested or not interested

The page should feel simpler than a research survey. The visitor should understand the offer before deciding whether to participate.

## Information Architecture

1. Service promise band
   - total homepage page views
   - total responses
   - interested responses
   - not-interested responses
   - interested share
   - machine-readable page summary for search and AI assistants
2. Three explanation cards
   - see what Go Nomad can help with
   - make a yes or no decision in one click
   - understand that services launch by stage
3. Decision card
   - interested action
   - not-interested action
   - inline success and error state
4. Semantic summary block
   - what this page is
   - who it is for
   - what happens after a submission
5. FAQ block
   - is this a paid flow or booking workflow
   - who should use this page
   - what a submission changes for the product roadmap
6. Service groups
   - P0 near-term service group
   - P1 audience-specific expansion group
   - P2 network and tool group

## Interaction Rules

- A submission is one binary signal: interested or not interested.
- A submission must not require selecting services, leaving profile fields, or leaving contact details.
- Service rows are informational in this version of the page.
- After submit, the page refreshes aggregate signals and shows the saved submission id.
- Access logging is best-effort only; if log persistence fails, page render and market-vote API behavior must continue and the failure should stay in server logs only.
- Search optimization must not depend on client-side interaction; the essential page summary, service stages, and brand identity need to exist in server-rendered metadata.
- AI search optimization must expose stable entity hints through structured data and concise explanatory copy, not hidden keyword stuffing.
- The page body should contain a short visible summary block with direct answers to likely search and AI questions, instead of relying only on `<head>` metadata.
- FAQ answers must stay short, literal, and business-accurate so they can be safely quoted by search engines or AI answer systems without changing meaning.

## Responsive Rules

- Use mobile-first layout: hero summary, explanation cards, decision card, semantic blocks, then service rows.
- Keep the primary interested / not-interested actions visible without requiring the visitor to reach a side panel.
- Keep all form controls and service actions at stable heights so dynamic counts do not shift the layout.
- Avoid viewport-based font scaling; use fixed base sizes with breakpoint adjustments.
- Long Chinese labels, service titles, and generated ids must wrap inside cards and controls.

## Visual Direction

- Use the existing workspace front-end stack: Next.js, React, TypeScript, and Tailwind CSS.
- Keep cards to repeated service rows and form panels only.
- Use restrained color with teal, red-orange, ink, leaf, gold, and light green-gray accents; avoid a one-hue dashboard.
- Use a real remote-work/city visual treatment in the service promise band while keeping the form immediately usable.
- Keep controls fixed in size where dynamic values could otherwise shift the layout.
- Social/share preview imagery should use a wide composition with the Go Nomad ADV icon as a brand anchor, not a centered square asset on a blank background.

## Runtime Boundaries

- `go-nomad-adv` owns its own SQLite database and does not call `go-nomad-api`.
- Server route handlers initialize the SQLite schema lazily on first access.
- Docker runtime stores SQLite under `/app/.data`; the mounted directory must be writable by the non-root app user before health checks run.
- The UI talks only to local API routes under `/api/market-vote/*`.
- Homepage SSR requests and `/api/market-vote/*` requests should write an additive access-log row into the same SQLite database with request path, method, normalized IP, selected headers, and a database timestamp.
- Static assets, discovery routes, and request bodies stay out of the access-log scope for this MVP to avoid noisy storage and accidental persistence of user-provided payloads.
- No secrets are required for local development.
- Brand icon assets should be served from the app shell and must not alter any persistence or API behavior.
- SEO routes such as robots, sitemap, and manifest must be generated inside the Next.js app layer and remain deploy-safe with or without an explicit site URL environment variable.
- Post-deploy discovery validation should use a read-only script that fetches the live domain and checks rendered outputs rather than mutating any runtime state.
- Production deployment should not be considered complete until the read-only discovery validation succeeds against the public domain or configured public base URL.

## Acceptance Gates

- TypeScript and production build must pass with `yarn build` or the root `build:adv` script.
- Lint must pass with `yarn lint` or the root `lint:adv` script.
- The probe check must confirm that the SQLite-backed submit endpoint records both interested and not-interested signals and returns updated aggregate data.
- A request to the homepage or market-vote API must append an access-log row containing request path, method, IP, and selected header fields without changing the user-facing response contract.
- The homepage summary band must show a browser-visible page-view count derived from logged `GET /` requests.
- Production deployment must verify the SQLite data mount is writable before the container is expected to become healthy.
- The built page head must emit canonical, robots, Open Graph, and icon metadata.
- The app must expose a sitemap, robots route, and web manifest.
- Structured data must describe the page as a Go Nomad digital nomad service explanation and interest capture experience for both classic search engines and AI answer engines.
- The site must expose a readable wide-format Open Graph/Twitter preview image.
- The rendered page body must include a concise semantic summary section that reinforces what the product is, who it serves, and what submission means.
- The page should expose FAQPage-compatible question-answer pairs that match the visible FAQ copy.
- A repeatable discovery validation command must confirm the live base URL returns canonical metadata, FAQPage JSON-LD, llms FAQ text, robots, sitemap, and image responses for share previews.
- The deployment workflow should execute that discovery validation after the remote container is healthy, with a short retry window for the public reverse proxy path.
