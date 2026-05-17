import { MarketVoteClient } from "@/components/market-vote-client";
import {
    BLOCKER_OPTIONS,
    CONTACT_METHOD_OPTIONS,
    FOLLOWUP_OPTIONS,
    MARKET_FEATURES,
    REGION_OPTIONS,
    SEGMENT_OPTIONS,
} from "@/lib/market-data";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <MarketVoteClient
      blockerOptions={BLOCKER_OPTIONS}
      contactMethodOptions={CONTACT_METHOD_OPTIONS}
      features={MARKET_FEATURES}
      followupOptions={FOLLOWUP_OPTIONS}
      regionOptions={REGION_OPTIONS}
      segmentOptions={SEGMENT_OPTIONS}
    />
  );
}
