import { MARKET_FEATURES } from "@/lib/market-data";
import { buildLlmsText } from "@/lib/site";

export function GET() {
  return new Response(buildLlmsText(MARKET_FEATURES), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}