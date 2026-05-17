import { NextResponse } from "next/server";

import { MarketInputError, createMarketSubmission, type MarketSubmissionInput } from "@/lib/market-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: MarketSubmissionInput;

  try {
    payload = (await request.json()) as MarketSubmissionInput;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  try {
    return NextResponse.json(createMarketSubmission(payload));
  } catch (error) {
    if (error instanceof MarketInputError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("go-nomad-adv submit failed", error);
    return NextResponse.json({ message: "Market submission failed" }, { status: 500 });
  }
}
