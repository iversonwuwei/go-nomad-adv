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

const beforeStats = snapshot.stats ?? {};

const interestedResult = await requestJson("/api/market-vote/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    interestDecision: "interested",
  }),
});

if (!interestedResult.submissionId || interestedResult.interestDecision !== "interested") {
  throw new Error(`unexpected interested submit result: ${JSON.stringify(interestedResult)}`);
}

const notInterestedResult = await requestJson("/api/market-vote/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    interestDecision: "not_interested",
  }),
});

if (!notInterestedResult.submissionId || notInterestedResult.interestDecision !== "not_interested") {
  throw new Error(`unexpected not-interested submit result: ${JSON.stringify(notInterestedResult)}`);
}

const expectedTotal = (beforeStats.totalSubmissions ?? 0) + 2;
const expectedInterested = (beforeStats.interestedSubmissions ?? 0) + 1;
const expectedNotInterested = (beforeStats.notInterestedSubmissions ?? 0) + 1;

if (notInterestedResult.stats.totalSubmissions < expectedTotal) {
  throw new Error(`totalSubmissions did not increase as expected: ${JSON.stringify(notInterestedResult.stats)}`);
}

if (notInterestedResult.stats.interestedSubmissions < expectedInterested) {
  throw new Error(`interestedSubmissions did not increase as expected: ${JSON.stringify(notInterestedResult.stats)}`);
}

if (notInterestedResult.stats.notInterestedSubmissions < expectedNotInterested) {
  throw new Error(`notInterestedSubmissions did not increase as expected: ${JSON.stringify(notInterestedResult.stats)}`);
}

console.log(
  `probe ok: interested=${interestedResult.submissionId} not_interested=${notInterestedResult.submissionId} total=${notInterestedResult.stats.totalSubmissions}`,
);
