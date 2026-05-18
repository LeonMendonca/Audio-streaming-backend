import crypto from "crypto";

const SECRET = process.env.SIGNED_URL_SECRET!;

export function generateSignedUrl(key: string) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 5;

  const data = `${key}:${expires}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  return `/stream/${key}?expires=${expires}&signature=${signature}`;
}