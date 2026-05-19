import { NextResponse } from "next/server";

import { safeRecordAccessLog } from "@/lib/access-log";
import { getMarketSnapshot } from "@/lib/market-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  safeRecordAccessLog({
    requestPath: new URL(request.url).pathname,
    requestMethod: request.method,
    headers: request.headers,
  });

  return NextResponse.json(getMarketSnapshot());
}
