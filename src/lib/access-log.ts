import { randomUUID } from "node:crypto";

import { getDatabase } from "./sqlite";

type HeaderReader = {
  get: (name: string) => string | null;
};

export type AccessLogInput = {
  requestPath: string;
  requestMethod: string;
  headers: HeaderReader;
};

function createAccessLogId() {
  return `access_${randomUUID().replaceAll("-", "")}`;
}

function trimValue(value: string | null | undefined, maxLength: number) {
  return (value ?? "").trim().slice(0, maxLength);
}

function normalizeIpAddress(forwardedFor: string, realIp: string, cfConnectingIp: string) {
  const forwardedIp = forwardedFor.split(",")[0]?.trim() ?? "";
  return forwardedIp || realIp || cfConnectingIp || "unknown";
}

function buildHeaderSnapshot(headers: HeaderReader) {
  return {
    host: trimValue(headers.get("host"), 255),
    xForwardedProto: trimValue(headers.get("x-forwarded-proto"), 40),
    xRealIp: trimValue(headers.get("x-real-ip"), 128),
    cfConnectingIp: trimValue(headers.get("cf-connecting-ip"), 128),
  };
}

export function recordAccessLog(input: AccessLogInput) {
  const database = getDatabase();
  const forwardedFor = trimValue(input.headers.get("x-forwarded-for"), 512);
  const headerSnapshot = buildHeaderSnapshot(input.headers);
  const ipAddress = normalizeIpAddress(forwardedFor, headerSnapshot.xRealIp, headerSnapshot.cfConnectingIp);

  database
    .prepare(
      `INSERT INTO access_logs (
        id,
        request_path,
        request_method,
        ip_address,
        user_agent,
        referer,
        accept_language,
        forwarded_for,
        header_snapshot
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      createAccessLogId(),
      trimValue(input.requestPath, 255) || "/",
      trimValue(input.requestMethod, 16).toUpperCase() || "GET",
      ipAddress,
      trimValue(input.headers.get("user-agent"), 512),
      trimValue(input.headers.get("referer"), 512),
      trimValue(input.headers.get("accept-language"), 255),
      forwardedFor,
      JSON.stringify(headerSnapshot),
    );
}

export function safeRecordAccessLog(input: AccessLogInput) {
  try {
    recordAccessLog(input);
  } catch (error) {
    console.error("go-nomad-adv access log failed", input.requestMethod, input.requestPath, error);
  }
}