import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const SECRET = process.env.SIGNED_URL_SECRET!;

export function verifySignedUrl(req: Request, res: Response, next: NextFunction) {
    const { expires, signature } = req.query;
    const key = req.params.key;

    if (!expires || !signature) {
        return res.status(403).json({
            error: "Missing signature",
        });
    }

    if (Date.now() / 1000 > Number(expires)) {
        return res.status(403).json({
            error: "URL expired",
        });
    }

    const data = `${key}:${expires}`;

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