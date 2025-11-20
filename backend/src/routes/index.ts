import { Router } from 'express';
import healthRouter from './health';

const router = Router();
router.use('/healthz', healthRouter);

// routes for later (links/redirect) will be mounted in future commits
export default router;
