import crypto from "crypto";

const SECRET = process.env.SIGNED_URL_SECRET!;

export function generateSignedUrl(trackId: string) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 5;

  const data = `${trackId}:${expires}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  return `/stream/${trackId}?expires=${expires}&signature=${signature}`;
}