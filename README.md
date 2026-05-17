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

## Checks

```bash
yarn lint
yarn build
ADV_BASE_URL=http://localhost:6003 yarn probe
```

## Docker

```bash
docker build -t go-nomad-adv:local .
docker volume create go-nomad-adv-data
docker run --rm -p 6003:6003 -v go-nomad-adv-data:/app/.data go-nomad-adv:local
```

The container stores SQLite data at `/app/.data/go-nomad-adv.sqlite`.

## GitHub Actions deployment

The workflow at `.github/workflows/deploy.yml` validates the app, builds a Docker image in GitHub Actions, pushes the image to SWR, copies the production environment file to the server, and restarts the Docker container from the SWR image.

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

Delete the SQLite file to reset local voting data.
