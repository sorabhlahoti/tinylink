import { Router } from 'express';
import healthRouter from './health';
import linksRouter from './links';
import redirectRouter from './redirect';

const router = Router();

router.use('/api/links', linksRouter);
router.use('/healthz', healthRouter);

// NOTE: redirect must be after API routes so /api/* are not captured.
router.use('/', redirectRouter);

export default router;
