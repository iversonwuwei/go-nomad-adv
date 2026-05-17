import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { SITE_NAME, SOCIAL_IMAGE_ALT } from "@/lib/site";

export const runtime = "nodejs";
export const alt = SOCIAL_IMAGE_ALT;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadLogoDataUrl() {
  const logoBuffer = await readFile(path.join(process.cwd(), "public", "icon-512.png"));
  return `data:image/png;base64,${logoBuffer.toString("base64")}`;
}

export async function createSocialImage() {
  const logoDataUrl = await loadLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "48px",
          color: "#f8fbfa",
          background: "linear-gradient(135deg, #081a22 0%, #123643 52%, #0f766d 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "32px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            padding: "42px",
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "28px", maxWidth: "760px" }}>
              <div
                style={{
                  display: "flex",
                  borderRadius: "32px",
                  padding: "16px",
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <img alt="Go Nomad ADV logo" height={128} src={logoDataUrl} width={128} />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    letterSpacing: "6px",
                    textTransform: "uppercase",
                    color: "#ccf6ef",
                  }}
                >
                  {SITE_NAME}
                </div>
                <div style={{ display: "flex", marginTop: "16px", fontSize: "68px", fontWeight: 700, lineHeight: 1.04 }}>
                  China-Market Digital Nomad Services
                </div>
                <div style={{ display: "flex", marginTop: "18px", fontSize: "28px", lineHeight: 1.35, color: "#d5ece8" }}>
                  Research, validation, and first-step planning for remote cross-border work.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
              {[
                "P0 Departure checks",
                "P1 Audience expansion",
                "P2 Network and tools",
              ].map((badge) => (
                <div
                  key={badge}
                  style={{
                    display: "flex",
                    borderRadius: "999px",
                    padding: "12px 18px",
                    background: "rgba(255,255,255,0.12)",
                    fontSize: "20px",
                    color: "#effcf8",
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", maxWidth: "790px" }}>
              {[
                "Visa and tax risk",
                "Remote-work approval",
                "Cross-border payment",
                "Family route planning",
              ].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    padding: "11px 16px",
                    fontSize: "19px",
                    color: "#dff7f1",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", color: "#d5ece8" }}>
              <div style={{ display: "flex", fontSize: "24px", fontWeight: 600 }}>vote.go-nomads.com</div>
              <div style={{ display: "flex", marginTop: "8px", fontSize: "18px" }}>Validate what Go Nomad should launch first</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}