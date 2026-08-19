import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/health
 * Simple health check endpoint returning { status: "ok" }
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
