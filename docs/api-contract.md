# Go Nomad ADV API contract

## Storage

SQLite database path:

- default: `.data/go-nomad-adv.sqlite`
- Docker default: `/app/.data/go-nomad-adv.sqlite`
- override: `GO_NOMAD_ADV_DB_PATH`

The schema is initialized by the application on first request. The application creates the parent directory when possible, but the runtime directory must already be writable by the app process; otherwise SQLite returns `unable to open database file` and the snapshot health check fails.

Current public-page behavior writes the overall interest decision into `interest_decision` and leaves the older profile/contact columns on safe defaults. Those legacy columns remain in the table so historical rows continue to read correctly.

## Tables

### `survey_submissions`

- `id`
- `interest_decision`
- `segment`
- `city`
- `work_mode`
- `decision_timeline`
- `budget_level`
- `target_region`
- `biggest_blocker`
- `followup_preference`
- `followup_note`
- `contact_name`
- `contact_method`
- `contact_value`
- `consent_to_contact`
- `created_at`

### `feature_votes`

- `id`
- `submission_id`
- `feature_id`
- `feature_status`
- `feature_title`
- `vote_weight`
- `is_priority`
- `created_at`

### `access_logs`

- `id`
- `request_path`
- `request_method`
- `ip_address`
- `user_agent`
- `referer`
- `accept_language`
- `forwarded_for`
- `header_snapshot`
- `created_at`

## Access Logging Workflow

The application records access logs for these request surfaces:

- `GET /`
- `GET /api/market-vote/snapshot`
- `POST /api/market-vote/submit`

Access-log rules:

- logging is best-effort and must not change the primary response on write failure
- request time is taken from the SQLite `created_at` timestamp
- `ip_address` is normalized from proxy headers when available, preferring the first `x-forwarded-for` value and then `x-real-ip` or `cf-connecting-ip`
- `header_snapshot` stores a JSON object of selected infrastructure headers so deploy-level request context can be inspected later without storing the full raw request
- request bodies, cookies, and authorization material are out of scope for this workflow

## `GET /api/market-vote/snapshot`

Returns service definitions plus aggregate market signals.

Response shape:

```json
{
  "features": [],
  "stats": {
    "pageViewCount": 0,
    "totalSubmissions": 0,
    "interestedSubmissions": 0,
    "notInterestedSubmissions": 0,
    "interestRate": 0
  }
}
```

Field notes:

- `pageViewCount` is the cumulative count of logged `GET /` homepage requests.
- `interestRate` is the interested-response share as a decimal between `0` and `1`.
- The snapshot may still include additional legacy aggregate keys for backward compatibility, but the public page depends on the overall response counters above.

## `POST /api/market-vote/submit`

Request shape:

```json
{
  "interestDecision": "interested"
}
```

Input rules:

- `interestDecision` is required.
- allowed values are `interested` and `not_interested`.
- the current public page does not require profile, contact, or service-level selection fields.
- the server may still accept legacy feature-selection payloads as `interested` submissions during the transition period.

Response shape:

```json
{
  "submissionId": "sub_...",
  "interestDecision": "interested",
  "stats": {}
}
```

## Privacy Notes

- The current public interaction does not ask for contact data.
- Aggregate snapshot responses expose only counts and never expose personal contact values.
- Access logging stores only selected request metadata; it does not persist request bodies or session cookies.
- This MVP does not implement deletion or export workflows; if this voting workflow is used beyond local demand evaluation, those controls should be added before public launch.
