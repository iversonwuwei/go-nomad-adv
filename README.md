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
