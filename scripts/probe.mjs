const baseUrl = process.env.ADV_BASE_URL ?? "http://localhost:6003";

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.text();
  let parsedBody = null;

  if (body) {
    parsedBody = JSON.parse(body);
  }

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${body}`);
  }

  return parsedBody;
}

const snapshot = await requestJson("/api/market-vote/snapshot");

if (!Array.isArray(snapshot.features) || snapshot.features.length < 6) {
  throw new Error("snapshot did not return feature definitions");
}

const result = await requestJson("/api/market-vote/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    selectedFeatureIds: ["p0-readiness-destination-check", "p0-stay-tax-risk-check"],
    priorityFeatureId: "p0-readiness-destination-check",
    profile: {
      segment: "remote_employee",
      city: "probe-run",
      workMode: "remote_in_china",
      decisionTimeline: "90_days",
      budgetLevel: "small_paid_report",
      targetRegion: "southeast_asia",
      biggestBlocker: "employer_permission",
      followupPreference: "receive_result",
    },
    contact: {
      method: "none",
      consentToContact: false,
      note: "probe signal",
    },
  }),
});

if (!result.submissionId || result.recordedVotes !== 2) {
  throw new Error(`unexpected submit result: ${JSON.stringify(result)}`);
}

console.log(`probe ok: ${result.submissionId} votes=${result.recordedVotes}`);
