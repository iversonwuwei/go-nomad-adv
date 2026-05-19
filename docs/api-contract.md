# Go Nomad ADV API contract

## Storage

SQLite database path:

- default: `.data/go-nomad-adv.sqlite`
- Docker default: `/app/.data/go-nomad-adv.sqlite`
- override: `GO_NOMAD_ADV_DB_PATH`

The schema is initialized by the application on first request. The application creates the parent directory when possible, but the runtime directory must already be writable by the app process; otherwise SQLite returns `unable to open database file` and the snapshot health check fails.

## Tables

### `survey_submissions`

- `id`
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
    "contactableSubmissions": 0,
    "topFeatureId": null,
    "primarySegment": null,
    "topBlocker": null,
    "votesByFeature": {},
    "segmentsByAudience": {},
    "blockersByIssue": {},
    "regionsByInterest": {},
    "followupsByPreference": {},
    "recentSignals": []
  }
}
```

Field notes:

- `pageViewCount` is the cumulative count of logged `GET /` homepage requests.

## `POST /api/market-vote/submit`

Request shape:

```json
{
  "selectedFeatureIds": ["p0-readiness-destination-check"],
  "profile": {
    "segment": "remote_employee",
    "city": "",
    "workMode": "not_remote_yet",
    "decisionTimeline": "researching",
    "budgetLevel": "free_research",
    "targetRegion": "southeast_asia",
    "biggestBlocker": "employer_permission",
    "followupPreference": "receive_result"
  },
  "contact": {
    "name": "optional",
    "method": "wechat",
    "value": "optional",
    "consentToContact": true,
    "note": "optional"
  }
}
```

Input rules:

- `selectedFeatureIds` must include at least one known service id.
- unknown service ids are rejected.
- option fields fall back to safe defaults when omitted or unknown.
- free-text fields are trimmed and length-limited server-side.
- contact fields are optional.

Response shape:

```json
{
  "submissionId": "sub_...",
  "recordedVotes": 1,
  "stats": {}
}
```

## Privacy Notes

- Contact data is optional and stored locally only.
- Aggregate snapshot responses do not expose contact values.
- Access logging stores only selected request metadata; it does not persist request bodies or session cookies.
- This MVP does not implement deletion or export workflows; if this voting workflow is used beyond local demand evaluation, those controls should be added before public launch.
