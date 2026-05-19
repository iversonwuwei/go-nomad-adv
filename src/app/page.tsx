import { headers } from "next/headers";

import { MarketVoteClient } from "@/components/market-vote-client";
import { safeRecordAccessLog } from "@/lib/access-log";
import {
    BLOCKER_OPTIONS,
    CONTACT_METHOD_OPTIONS,
    FOLLOWUP_OPTIONS,
    MARKET_FEATURES,
    REGION_OPTIONS,
    SEGMENT_OPTIONS,
} from "@/lib/market-data";
import { buildStructuredData } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const requestHeaders = await headers();
  safeRecordAccessLog({
    requestPath: "/",
    requestMethod: "GET",
    headers: requestHeaders,
  });

  const structuredData = buildStructuredData(MARKET_FEATURES);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <MarketVoteClient
        blockerOptions={BLOCKER_OPTIONS}
        contactMethodOptions={CONTACT_METHOD_OPTIONS}
        features={MARKET_FEATURES}
        followupOptions={FOLLOWUP_OPTIONS}
        regionOptions={REGION_OPTIONS}
        segmentOptions={SEGMENT_OPTIONS}
      />
    </>
  );
}
