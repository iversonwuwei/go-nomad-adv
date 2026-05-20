import { headers } from "next/headers";

import { MarketVoteClient } from "@/components/market-vote-client";
import { safeRecordAccessLog } from "@/lib/access-log";
import { MARKET_FEATURES } from "@/lib/market-data";
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
      <MarketVoteClient features={MARKET_FEATURES} />
    </>
  );
}
