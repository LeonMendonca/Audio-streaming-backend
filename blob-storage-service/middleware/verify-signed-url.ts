import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const SECRET = process.env.SIGNED_URL_SECRET!;

export function verifySignedUrl(req: Request, res: Response, next: NextFunction) {
    const { expiresInSeconds, signature } = req.query;
    const trackId = req.params.id;

    if (!expiresInSeconds || !signature) {
        return res.status(403).json({
            error: "Missing signature",
        });
    }

    if (Date.now() / 1000 > Number(expiresInSeconds)) {
        return res.status(403).json({
            error: "URL expired",
        });
    }

    const data = `${trackId}:${expiresInSeconds}`;

    const expected = crypto
        .createHmac("sha256", SECRET)
        .update(data)
        .digest("hex");

    if (expected !== signature) {
        return res.status(403).json({
            error: "Invalid signature",
        });
    }

    next();
}