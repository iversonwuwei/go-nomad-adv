# Go Nomad ADV

Service explanation and demand evaluation web project for Go Nomad's China-market digital nomad service hypotheses.

## What it does

- explains P0, P1, and P2 China-market digital nomad service groups in one sentence each
- lets visitors mark which services they would use or want to learn more about
- collects audience segment, target region, and main blocker
- lets visitors optionally leave contact details or a follow-up preference
- persists service interest, audience signals, optional contact, and participation intent into local SQLite

## Local development

Requires Node.js 22+ because the project uses the built-in `node:sqlite` module. Node may print an experimental SQLite warning during build or runtime; this is expected for the current local MVP.

```bash
yarn dev
```

The app runs on `http://localhost:6003`.

By default, metadata routes use `https://vote.go-nomads.com` as the production canonical URL and `http://localhost:6003` in local development. Override this only when necessary:

```bash
GO_NOMAD_ADV_SITE_URL=https://your-domain.example yarn dev
```

## Checks

```bash
yarn lint
yarn build
ADV_BASE_URL=http://localhost:6003 yarn probe
ADV_DISCOVERY_BASE_URL=https://vote.go-nomads.com yarn discovery-check
```

`discovery-check` is read-only. It fetches the rendered homepage and discovery routes to verify canonical metadata, FAQPage JSON-LD, visible FAQ content, `llms.txt`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, and the Open Graph/Twitter image endpoints.

When you validate a local or temporary server that still renders a different public canonical URL, set both values explicitly:

```bash
ADV_DISCOVERY_BASE_URL=http://127.0.0.1:6106 \
ADV_DISCOVERY_EXPECTED_SITE_URL=https://vote.go-nomads.com \
yarn discovery-check
```

The app also exposes these crawl and AI-discovery routes:

- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`
- `/llms.txt`
- `/opengraph-image`
- `/twitter-image`

After deployment, verify these endpoints on the live domain:

- `https://vote.go-nomads.com/`
- `https://vote.go-nomads.com/robots.txt`
- `https://vote.go-nomads.com/sitemap.xml`
- `https://vote.go-nomads.com/llms.txt`
- `https://vote.go-nomads.com/opengraph-image`
- `https://vote.go-nomads.com/twitter-image`

Recommended post-deploy search steps:

- submit `https://vote.go-nomads.com/sitemap.xml` to Google Search Console
- submit `https://vote.go-nomads.com/sitemap.xml` to Bing Webmaster Tools
- use the live homepage URL in URL Inspection / Fetch tools to confirm canonical, FAQ content, and Open Graph image are visible

## Docker

```bash
docker build -t go-nomad-adv:local .
docker volume create go-nomad-adv-data
docker run --rm -p 6003:6003 -v go-nomad-adv-data:/app/.data go-nomad-adv:local
```

The container stores SQLite data at `/app/.data/go-nomad-adv.sqlite`.

## GitHub Actions deployment

The workflow at `.github/workflows/deploy.yml` validates the app, builds a Docker image in GitHub Actions, pushes the image to SWR, copies the production environment file to the server, and restarts the Docker container from the SWR image.

After the remote container becomes healthy, the workflow also runs `node scripts/discovery-check.mjs` against the live public base URL `https://vote.go-nomads.com` so deployment success includes public-domain discoverability checks.

Configure these repository secrets before deploying:

- `SWR_REGISTRY`: SWR registry host, for example `swr.cn-north-4.myhuaweicloud.com`
- `SWR_USERNAME`: SWR login username
- `SWR_PASSWORD`: SWR login password or access token
- `ADV_DEPLOY_HOST`: server host or IP
- `ADV_DEPLOY_USER`: SSH user on the server
- `ADV_DEPLOY_SSH_KEY`: private SSH key that can log in to the server
- `ADV_ENV_FILE`: full contents of the production `.env` file to copy to the server
- `ADV_DEPLOY_PORT`: optional SSH port, defaults to `22`

Optional repository variables:

- `SWR_IMAGE_NAME`: SWR image name, defaults to `go-nomad-adv`
- `ADV_DEPLOY_PATH`: server directory for `.env` and SQLite data, defaults to `/opt/go-nomad-adv`
- `ADV_APP_PORT`: host port exposed by the container, defaults to `6003`
- `ADV_CONTAINER_NAME`: Docker container name, defaults to `go-nomad-adv-app`

The server must have Docker installed and the SSH user must be able to run Docker commands. Push to `main` or run the workflow manually from GitHub Actions to deploy.

The SWR namespace is fixed to `go-nomads-v2` in the workflow.

The deployment workflow mounts server data at `/app/.data` and repairs that mount's ownership before starting the app, so SQLite can create the database, WAL, and journal files while the container runs as the non-root `nextjs` user.

## Data

The default SQLite database path is:

```text
.data/go-nomad-adv.sqlite
```

Override it with:

```bash
GO_NOMAD_ADV_DB_PATH=/absolute/path/to/go-nomad-adv.sqlite yarn dev
```

The same SQLite file stores both market-vote data and additive access logs for the homepage plus `/api/market-vote/*` requests. Access logs keep request path, method, request time, normalized IP, and selected headers only; request bodies are not stored.

Delete the SQLite file to reset local voting data and access logs.
