// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

const debugMode = process.env.AI_DEBUG_MODE === "true";

/**
 * Verifies incoming x-api-key against INTERNAL_API_KEY from .env
 * Skips validation if AI_DEBUG_MODE is true.
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    if (debugMode) {
        console.log("Debug mode enabled: Skipping token verification.");
        return next();
    }

    const clientToken = req.headers['x-api-key'] as string | undefined;
    const serverToken = process.env.INTERNAL_API_KEY;

    if (!serverToken) {
        console.error("INTERNAL_API_KEY is not set in environment variables.");
        res.status(500).json({ error: "Server misconfigured. Missing auth key." });
        return;
    }

    if (!clientToken) {
        console.warn("Missing x-api-key in request.");
        res.status(400).json({ error: "Missing x-api-key header." });
        return;
    }

    if (clientToken !== serverToken) {
        console.warn("🔐 Invalid API token used.");
        res.status(401).json({ error: "Unauthorized – invalid API token." });
        return;
    }

    return next();
};
