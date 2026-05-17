import { NextResponse } from "next/server";

import { getMarketSnapshot } from "@/lib/market-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getMarketSnapshot());
}
