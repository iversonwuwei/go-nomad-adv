# Go Nomad ADV API contract

## Storage

SQLite database path:

- default: `.data/go-nomad-adv.sqlite`
- override: `GO_NOMAD_ADV_DB_PATH`

The schema is initialized by the application on first request.

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

## `GET /api/market-vote/snapshot`

Returns service definitions plus aggregate market signals.

Response shape:

```json
{
  "features": [],
  "stats": {
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
- This MVP does not implement deletion or export workflows; if this voting workflow is used beyond local demand evaluation, those controls should be added before public launch.
