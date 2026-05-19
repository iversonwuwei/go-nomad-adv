# Go Nomad ADV service interest PRD

## Objective

`go-nomad-adv` is a standalone service explanation and audience evaluation web project for deciding which China-market digital nomad services Go Nomad should build first.

The first release should help a visitor complete three simple actions in one session:

1. understand what services Go Nomad may provide from one-sentence descriptions
2. mark which services they would use or want to learn more about
3. optionally leave audience profile and contact details so Go Nomad can estimate real audience size

All submissions are persisted to a local SQLite database in the app runtime data volume so this workflow can run independently from `go-nomad-api`.

## Product Direction

- The page should not feel like a long research questionnaire.
- The visitor should first understand the service offer, then decide whether to participate.
- Service options should be grouped by stage: P0 for near-term services, P1 for later audience-specific services, and P2 for long-term network or product capabilities.
- The useful signal is service interest plus audience/contact volume, not a complex ranking exercise.

## Service Groups

### P0: first possible services

- departure readiness and destination decision support
- visa stay and tax-risk reminders
- remote work approval and communication pack

### P1: audience-specific expansion

- income and cross-border payment structure
- family digital nomad route planning

### P2: network and tool capabilities

- trusted local resource and city partner network
- personal digital nomad planning workspace

## Target Users

- Chinese freelancers and creators preparing to work from overseas
- remote employees employed by Chinese or cross-border companies
- founders and small teams exploring lower-tax or multi-country operating setups
- families considering school, insurance, healthcare, and residence options
- consultants, local partners, coworking operators, and city-node resource owners
- HR, finance, or operations managers evaluating remote-work compliance support

## MVP Scope

- one public responsive page with one-sentence service descriptions
- service groups split by P0, P1, and P2 stage
- lightweight service interest selection
- audience fields limited to segment, target region, and main blocker
- optional contact method, contact value, note, consent, and follow-up preference
- aggregate interest and audience counts visible after load and after submission
- homepage should surface total page views from the local access-log workflow so operators can compare traffic volume with expressed interest volume
- server-side input checks with no dependency on existing API services
- best-effort access logging for homepage and market-vote API requests, storing request path, method, request time, normalized client IP, and selected request headers in local SQLite
- branded browser icon and app manifest so the site no longer falls back to the browser default icon
- crawlable metadata including canonical URL, Open Graph, Twitter card, robots policy, and sitemap output
- AI-search-readable structured summaries so search agents can identify the product as a China-market digital nomad service research and onboarding page
- a landscape share preview image so social cards and search previews do not stretch or crop the square logo awkwardly
- visible semantic explanation blocks on the page so search engines and AI answer systems can extract the core value, audience, and action model from page body content as well as metadata
- a concise FAQ section answering the highest-probability search and AI questions about what this page is, whether it is a paid flow, and what happens after submission
- FAQPage-compatible structured data so answer engines can reuse those questions and answers directly when the query intent matches
- an automated post-deploy discovery check so the live domain can be validated for canonical, metadata, FAQ, llms, robots, sitemap, and share-image outputs without manual page inspection every time
- deployment gating that runs the discovery check against the live public domain after the container becomes healthy, so release success is tied to actual discoverability rather than container status alone

## Non-Goals

- real payment collection
- identity login or account creation
- lead deduplication across existing Go Nomad backend tables
- CRM export or admin dashboard
- third-party analytics, cross-site tracking, or a full access-log review UI
- legal, tax, immigration, or employment advice delivery
- booking, scheduling, or claiming that a service request has been accepted

## Success Signals

- visitors select at least one service they would use or want to learn more about
- contactable sample count grows enough to validate a real audience pool
- audience segment distribution shows which group is large enough to prioritize
- blocker distribution shows which problem deserves the first product workflow
- P0/P1/P2 service interest distribution shows which stage should receive resources first
- search snippets consistently show a branded title, description, and icon instead of generic browser defaults
- AI search assistants can extract the page purpose, audience, service stages, and action model from structured content without relying on fragile visual parsing
- social and preview cards show a readable wide-format Go Nomad ADV image rather than a generic cropped square icon
- search and AI systems can answer common intent-led questions from the page without reconstructing the answer from scattered paragraphs
- each deployment can be quickly validated with one repeatable command instead of relying on ad-hoc manual checks
- production release success includes live discoverability checks, not only Docker health success

## Delivery And Rollback

- The project is additive under `go-nomad-adv` and does not alter existing Go Nomad runtime services.
- The SQLite file is local runtime state under `.data/` and can be deleted to reset the data.
- Docker production deployments must provide a writable `/app/.data` mount for the app user because the public snapshot endpoint initializes SQLite during the health gate.
- Rollback is removing the `go-nomad-adv` route/process or hiding links to it; collected SQLite data can be archived separately.
- Access logging must stay additive and best-effort; rollback is removing the logging calls or dropping the access-log table without changing market-vote persistence behavior.
- SEO and AI-search changes must remain additive at the document shell level only; rollback is removing metadata routes, manifest output, JSON-LD blocks, and branded icons without touching form persistence.
- Share preview and semantic summary changes must stay additive to the page shell and copy layer only; rollback is removing preview image routes and summary blocks without changing data collection behavior.
- FAQ changes must remain additive to copy and structured data only; rollback is removing the FAQ block and FAQPage schema without affecting service selection or submission persistence.
- discovery-check tooling must remain additive and read-only; rollback is removing the validation script and script entry without touching user-facing runtime behavior.
- workflow-level discovery gating must stay read-only and post-deploy; rollback is removing that gate without altering the app runtime or collected data.
