import { SOCIAL_IMAGE_ALT } from "@/lib/site";
import { createSocialImage } from "@/lib/social-image";

export const runtime = "nodejs";
export const alt = SOCIAL_IMAGE_ALT;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage() {
  return createSocialImage();
}