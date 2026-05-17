# Go Nomad ADV design

## Experience Model

The first screen is a service explanation and interest capture workspace. It should help a visitor quickly answer: "Would I use this if Go Nomad launched it?"

The experience combines:

- a compact service promise and market signal summary
- one-sentence service descriptions
- P0, P1, and P2 service groups
- a lightweight audience profile
- optional contact and follow-up preference

The page should feel simpler than a research survey. The visitor should understand the offer before deciding whether to participate.

## Information Architecture

1. Service promise band
   - total interest submissions
   - contactable submissions
   - most requested service
   - primary audience segment
   - primary concern
2. Three explanation cards
   - see what Go Nomad can help with
   - mark willingness only when interested
   - understand that services launch by stage
3. Service groups
   - P0 near-term service group
   - P1 audience-specific expansion group
   - P2 network and tool group
4. Audience profile
   - segment
   - target region
   - biggest blocker
5. Optional contact
   - follow-up preference
   - contact method
   - contact value
   - note
   - consent flag

## Interaction Rules

- A submission requires at least one selected service interest.
- Service rows use one simple action: willing to use or learn more.
- Contact fields are optional and must not block interest persistence.
- The follow-up preference is a research signal, not a scheduling workflow.
- After submit, the page refreshes aggregate signals and shows the saved submission id.

## Responsive Rules

- Use mobile-first layout: hero summary, explanation cards, service rows, then profile/contact panels.
- Use a two-column desktop layout only when there is enough width; keep the right panel sticky on desktop and normal-flow on mobile.
- Keep all form controls and service actions at stable heights so dynamic counts do not shift the layout.
- Avoid viewport-based font scaling; use fixed base sizes with breakpoint adjustments.
- Long Chinese labels, service titles, and generated ids must wrap inside cards and controls.

## Visual Direction

- Use the existing workspace front-end stack: Next.js, React, TypeScript, and Tailwind CSS.
- Keep cards to repeated service rows and form panels only.
- Use restrained color with teal, red-orange, ink, leaf, gold, and light green-gray accents; avoid a one-hue dashboard.
- Use a real remote-work/city visual treatment in the service promise band while keeping the form immediately usable.
- Keep controls fixed in size where dynamic values could otherwise shift the layout.

## Runtime Boundaries

- `go-nomad-adv` owns its own SQLite database and does not call `go-nomad-api`.
- Server route handlers initialize the SQLite schema lazily on first access.
- Docker runtime stores SQLite under `/app/.data`; the mounted directory must be writable by the non-root app user before health checks run.
- The UI talks only to local API routes under `/api/market-vote/*`.
- No secrets are required for local development.

## Acceptance Gates

- TypeScript and production build must pass with `yarn build` or the root `build:adv` script.
- Lint must pass with `yarn lint` or the root `lint:adv` script.
- The probe check must confirm that the SQLite-backed submit endpoint records service interest and returns updated aggregate data.
- Production deployment must verify the SQLite data mount is writable before the container is expected to become healthy.
